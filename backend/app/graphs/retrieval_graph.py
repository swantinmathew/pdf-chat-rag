import os
from typing import TypedDict, Optional, List, Dict, Any
from openai import OpenAI
from langgraph.graph import StateGraph, END
from app.config import settings
from app.services.vector_store import get_supabase_client, generate_embeddings

class RetrievalState(TypedDict, total=False):
    question: str
    query_embedding: Optional[List[float]]
    context_documents: Optional[List[Dict[str, Any]]]
    context_text: Optional[str]
    answer: Optional[str]

def embed_query_node(state: RetrievalState) -> RetrievalState:
    """Node 1: Generates vector embedding for the user question string."""
    question = state["question"]
    embeddings = generate_embeddings([question])
    query_vector = embeddings[0] if embeddings else []
    return {"query_embedding": query_vector}

def retrieve_documents_node(state: RetrievalState) -> RetrievalState:
    """Node 2: Queries Supabase match_documents RPC with the vector embedding to retrieve top-k documents."""
    query_vector = state.get("query_embedding", [])
    if not query_vector:
        return {"context_documents": [], "context_text": ""}

    supabase = get_supabase_client()
    response = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_vector,
            "match_count": 5,
            "filter": {}
        }
    ).execute()

    docs = response.data or []
    context_parts = []
    for doc in docs:
        content = doc.get("content", "").strip()
        if content:
            context_parts.append(content)

    context_text = "\n\n---\n\n".join(context_parts)
    return {"context_documents": docs, "context_text": context_text}

def generate_answer_node(state: RetrievalState) -> RetrievalState:
    """Node 3: Generates answer using LLM given retrieved context and user question with fallback model support."""
    question = state["question"]
    context_text = state.get("context_text", "")

    api_key = settings.OPENROUTER_API_KEY or os.getenv("OPENAI_API_KEY", "")
    base_url = settings.OPENROUTER_BASE_URL if settings.OPENROUTER_API_KEY else None

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY or OPENAI_API_KEY must be set to generate answers.")

    client = OpenAI(api_key=api_key, base_url=base_url)

    system_prompt = (
        "You are an AI assistant answering questions based on retrieved document context.\n"
        "Use the provided context to answer the user's question accurately.\n"
        "If the context doesn't contain enough information, state that clearly."
    )

    user_content = f"Context:\n{context_text}\n\nQuestion: {question}"

    # Fallback free model candidates for high availability
    models_to_try = [
        settings.LLM_MODEL,
        "poolside/laguna-s-2.1:free",
        "poolside/laguna-xs-2.1:free",
        "inclusionai/ling-3.0-tiny:free",
        "cohere/north-mini-code:free",
        "google/gemma-4-26b-a4b-it:free"
    ]

    answer = ""
    last_error = None

    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2
            )
            answer = response.choices[0].message.content or ""
            if answer:
                break
        except Exception as e:
            last_error = e
            continue

    if not answer and last_error:
        raise RuntimeError(f"Failed to generate answer across all candidate models: {str(last_error)}")

    return {"answer": answer}

# Build LangGraph StateGraph pipeline for retrieval
builder = StateGraph(RetrievalState)
builder.add_node("embed_query", embed_query_node)
builder.add_node("retrieve", retrieve_documents_node)
builder.add_node("generate_answer", generate_answer_node)

builder.set_entry_point("embed_query")
builder.add_edge("embed_query", "retrieve")
builder.add_edge("retrieve", "generate_answer")
builder.add_edge("generate_answer", END)

retrieval_graph = builder.compile()
