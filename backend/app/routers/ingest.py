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

from app.services.vector_store import (
    list_stored_documents,
    delete_document_by_filename,
    clear_all_documents,
)

@router.get("/documents", status_code=status.HTTP_200_OK)
async def get_documents():
    """
    Returns a list of all currently stored PDF documents in Supabase vector store with chunk counts.
    """
    try:
        documents = list_stored_documents()
        return {"status": "success", "documents": documents}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch document list: {str(e)}"
        )

@router.delete("/documents/{filename:path}", status_code=status.HTTP_200_OK)
async def delete_document_endpoint(filename: str):
    """
    Deletes vector records associated with a specific filename from Supabase memory.
    """
    try:
        deleted_count = delete_document_by_filename(filename)
        return {
            "status": "success",
            "message": f"Successfully deleted '{filename}' from vector memory.",
            "filename": filename,
            "deleted_records_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document '{filename}': {str(e)}"
        )

@router.delete("/documents", status_code=status.HTTP_200_OK)
async def clear_all_documents_endpoint():
    """
    Deletes all document vector records from Supabase memory.
    """
    try:
        deleted_count = clear_all_documents()
        return {
            "status": "success",
            "message": "Successfully cleared all documents from vector memory.",
            "deleted_records_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear documents: {str(e)}"
        )

