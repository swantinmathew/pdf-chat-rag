from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# Chunk Models
class DocumentChunk(BaseModel):
    chunk_id: str = Field(..., description="Unique identifier for the text chunk")
    chunk_index: int = Field(..., description="Zero-based sequence index of the chunk in the document")
    text: str = Field(..., description="Extracted text chunk content")
    page_number: int = Field(..., description="1-based PDF page number from which chunk originated")
    char_count: int = Field(..., description="Length of text chunk in characters")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Chunk provenance metadata")

# Text Ingest Models
class IngestRequest(BaseModel):
    title: Optional[str] = Field(None, description="Title or source name of the content")
    content: str = Field(..., description="Text content to be ingested into the knowledge base")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata key-value pairs")

class IngestResponse(BaseModel):
    status: str = Field("success", description="Status of the ingestion process")
    message: str = Field(..., description="Detailed result message")
    document_id: Optional[str] = Field(None, description="Assigned ID for ingested document")

# PDF Ingest Models
class PDFIngestResponse(BaseModel):
    status: str = Field("success", description="Status of the PDF ingestion process")
    message: str = Field(..., description="Human-readable result summary")
    document_id: str = Field(..., description="Assigned ID for ingested PDF document")
    filename: str = Field(..., description="Original filename of the uploaded PDF")
    total_pages: int = Field(..., description="Total pages extracted from the PDF")
    total_chunks: int = Field(..., description="Total text chunks generated from the PDF")
    chunks: List[DocumentChunk] = Field(..., description="List of generated document chunks")

# Chat Models
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender, e.g., 'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User prompt or query string")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous conversation messages")
    system_prompt: Optional[str] = Field(None, description="Optional custom system instructions")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Generated assistant response")
    sources: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Retrieved source document references")
