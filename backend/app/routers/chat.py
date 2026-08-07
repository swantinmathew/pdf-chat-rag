import json
import asyncio
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.schemas import ChatRequest
from app.graphs.retrieval_graph import retrieval_graph

router = APIRouter(tags=["Chat"])

async def sse_stream_generator(question: str):
    """
    Step 9 SSE Generator: Runs retrieval_graph to fetch relevant context & generate answer,
    then streams token events to the client in Server-Sent Events (SSE) standard format.
    """
    try:
        # Run retrieval_graph in thread pool to prevent blocking event loop
        result_state = await asyncio.to_thread(
            retrieval_graph.invoke, {"question": question}
        )
    except Exception as e:
        error_event = f"data: {json.dumps({'error': str(e)})}\n\n"
        yield error_event
        return

    answer = result_state.get("answer", "")
    docs = result_state.get("context_documents", [])

    sources = []
    for doc in docs:
        sources.append({
            "content": doc.get("content", ""),
            "metadata": doc.get("metadata", {}),
            "similarity": doc.get("similarity", 0.0)
        })

    # Stream answer tokens in real-time SSE format
    words = answer.split(" ")
    for i, word in enumerate(words):
        chunk_text = word + (" " if i < len(words) - 1 else "")
        sse_event = f"data: {json.dumps({'token': chunk_text})}\n\n"
        yield sse_event
        await asyncio.sleep(0.02)  # Smooth token pacing

    # Final event delivering source citations and completion signal
    done_event = f"data: {json.dumps({'event': 'done', 'sources': sources})}\n\n"
    yield done_event

@router.post("/chat")
async def chat_sse_endpoint(payload: ChatRequest):
    """
    Step 9 Endpoint: SSE stream from retrieval_graph output.
    Accepts JSON payload {'message': '...'} and streams response as text/event-stream.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    return StreamingResponse(
        sse_stream_generator(payload.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
