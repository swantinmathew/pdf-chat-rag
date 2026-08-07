from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from app.services.pdf_service import load_pdf
from app.services.chunker import chunk_text
from app.services.vector_store import embed_and_store

class IngestState(TypedDict, total=False):
    file_path: str
    filename: Optional[str]
    raw_text: Optional[str]
    chunks: Optional[List[str]]
    records: Optional[List[Dict[str, Any]]]

def load_pdf_step(state: IngestState) -> IngestState:
    """Node 1: Loads PDF from local path and extracts raw text string."""
    file_path = state["file_path"]
    text = load_pdf(file_path)
    return {"raw_text": text}

def chunk_text_step(state: IngestState) -> IngestState:
    """Node 2: Splits raw text into 500-char chunks with 50-char overlap."""
    raw_text = state.get("raw_text", "")
    chunks = chunk_text(raw_text, chunk_size=500, chunk_overlap=50)
    return {"chunks": chunks}

def embed_and_store_step(state: IngestState) -> IngestState:
    """Node 3: Embeds chunks via OpenAI and stores vector records in Supabase."""
    chunks = state.get("chunks", [])
    filename = state.get("filename", "document.pdf")
    metadata = {"source": filename}
    records = embed_and_store(chunks, metadata=metadata)
    return {"records": records}

# Build LangGraph StateGraph pipeline
builder = StateGraph(IngestState)
builder.add_node("load_pdf", load_pdf_step)
builder.add_node("chunk_text", chunk_text_step)
builder.add_node("embed_and_store", embed_and_store_step)

builder.set_entry_point("load_pdf")
builder.add_edge("load_pdf", "chunk_text")
builder.add_edge("chunk_text", "embed_and_store")
builder.add_edge("embed_and_store", END)

ingest_graph = builder.compile()
