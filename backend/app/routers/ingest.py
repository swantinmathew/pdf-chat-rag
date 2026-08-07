import uuid
from fastapi import APIRouter, HTTPException, status
from app.schemas import IngestRequest, IngestResponse

router = APIRouter(tags=["Ingestion"])

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_document(payload: IngestRequest):
    """
    Ingest text content into the system.
    """
    if not payload.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content cannot be empty."
        )

    doc_id = str(uuid.uuid4())
    
    # Placeholder for actual indexing/processing logic
    return IngestResponse(
        status="success",
        message=f"Successfully ingested content ({len(payload.content)} characters)",
        document_id=doc_id
    )
