import uuid
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Query
from app.schemas import IngestRequest, IngestResponse, PDFIngestResponse
from app.services.pdf_service import extract_text_from_pdf_bytes
from app.services.chunker import chunk_document_pages

router = APIRouter(tags=["Ingestion"])

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_raw_text(payload: IngestRequest):
    """
    Ingest raw text content into the system.
    """
    if not payload.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content cannot be empty."
        )

    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    
    return IngestResponse(
        status="success",
        message=f"Successfully ingested raw text ({len(payload.content)} characters)",
        document_id=doc_id
    )

@router.post("/ingest/pdf", response_model=PDFIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_pdf_document(
    file: UploadFile = File(..., description="PDF document file to upload and ingest"),
    chunk_size: int = Query(500, ge=100, le=2000, description="Character size for each text chunk"),
    chunk_overlap: int = Query(50, ge=0, le=500, description="Overlapping characters between chunks")
):
    """
    Upload a PDF document, extract text page-by-page, and chunk it for vector embedding.
    """
    # 1. Validate file extension
    filename = file.filename or "uploaded_document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files (.pdf) are allowed."
        )

    # 2. Read file bytes
    try:
        pdf_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file stream: {str(e)}"
        )

    # 3. Extract text from PDF bytes
    pages_text = extract_text_from_pdf_bytes(pdf_bytes)
    total_pages = len(pages_text)

    # Check if any readable text was extracted
    total_chars = sum(len(text) for text in pages_text.values())
    if total_chars == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text could be extracted from the PDF (file may be scanned/image-only)."
        )

    # 4. Chunk document pages
    chunks = chunk_document_pages(
        pages_text=pages_text,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        filename=filename
    )

    doc_id = f"doc_pdf_{uuid.uuid4().hex[:12]}"

    return PDFIngestResponse(
        status="success",
        message=f"Successfully extracted {total_pages} page(s) and generated {len(chunks)} chunk(s) from '{filename}'",
        document_id=doc_id,
        filename=filename,
        total_pages=total_pages,
        total_chunks=len(chunks),
        chunks=chunks
    )
