import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    """
    Initializes and returns a Supabase client authenticated with the service role key.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings for a list of text strings using OpenAI/OpenRouter embedding API.
    """
    if not texts:
        return []

    # Use OpenRouter or OpenAI client depending on configured API key
    api_key = settings.OPENROUTER_API_KEY or os.getenv("OPENAI_API_KEY", "")
    base_url = settings.OPENROUTER_BASE_URL if settings.OPENROUTER_API_KEY else None

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY or OPENAI_API_KEY must be set to generate embeddings.")

    client = OpenAI(api_key=api_key, base_url=base_url)
    
    # Use text-embedding-3-small (1536 dimensions)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    
    return [data.embedding for data in response.data]

def embed_and_store(
    chunks: List[str],
    metadata: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Step 5 Node: Takes a list of text chunks, generates vector embeddings for each chunk,
    and inserts rows into the Supabase 'documents' table (content + embedding + metadata).
    Returns list of inserted document records.
    """
    if not chunks:
        return []

    base_metadata = metadata or {}
    
    # 1. Generate embeddings for all text chunks
    embeddings = generate_embeddings(chunks)
    
    # 2. Prepare database payload records
    records = []
    for chunk_text, embedding_vector in zip(chunks, embeddings):
        records.append({
            "content": chunk_text,
            "embedding": embedding_vector,
            "metadata": base_metadata
        })

    # 3. Batch insert records into Supabase 'documents' table
    supabase = get_supabase_client()
    response = supabase.table("documents").insert(records).execute()
    
    return response.data
