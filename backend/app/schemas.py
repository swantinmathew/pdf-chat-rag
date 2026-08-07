from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

# Ingest Models
class IngestRequest(BaseModel):
    title: Optional[str] = Field(None, description="Title or source name of the content")
    content: str = Field(..., description="Text content to be ingested into the knowledge base")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata key-value pairs")

class IngestResponse(BaseModel):
    status: str = Field("success", description="Status of the ingestion process")
    message: str = Field(..., description="Detailed result message")
    document_id: Optional[str] = Field(None, description="Assigned ID for ingested document")

# Chat Models
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender, e.g., 'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User prompt or query string")
    history: Optional[list[ChatMessage]] = Field(default_factory=list, description="Previous conversation messages")
    system_prompt: Optional[str] = Field(None, description="Optional custom system instructions")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Generated assistant response")
    sources: Optional[list[Dict[str, Any]]] = Field(default_factory=list, description="Retrieved source document references")
