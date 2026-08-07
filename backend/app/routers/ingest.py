import tempfile
import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, File, UploadFile
from app.graphs.ingest_graph import ingest_graph

router = APIRouter(tags=["Ingestion"])

@router.post("/ingest", status_code=status.HTTP_200_OK)
async def ingest_pdf_file(
    file: UploadFile = File(..., description="PDF file to upload and process through ingest_graph")
):
    """
    Step 7 Endpoint: Accepts PDF upload, streams file to temporary disk,
    invokes ingest_graph (load_pdf -> chunk_text -> embed_and_store),
    and returns processing confirmation.
    """
    filename = file.filename or "uploaded_document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files (.pdf) are accepted."
        )

    # Save uploaded PDF to a temporary file for graph processing
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Invoke LangGraph StateGraph pipeline end-to-end
        result_state = ingest_graph.invoke({
            "file_path": tmp_path,
            "filename": filename
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion pipeline failed: {str(e)}"
        )
    finally:
        # Cleanup temporary file
        Path(tmp_path).unlink(missing_ok=True)

    chunks = result_state.get("chunks", [])
    records = result_state.get("records", [])

    return {
        "status": "success",
        "message": f"Successfully processed '{filename}' through LangGraph ingestion pipeline.",
        "filename": filename,
        "chunks_count": len(chunks),
        "inserted_records_count": len(records)
    }
