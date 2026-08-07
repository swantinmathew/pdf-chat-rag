from fastapi import APIRouter, HTTPException, status
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_interaction(payload: ChatRequest):
    """
    Process a chat message and return an AI assistant response.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    # Placeholder response logic
    echo_reply = f"Echo response to your message: '{payload.message}'"

    return ChatResponse(
        reply=echo_reply,
        sources=[]
    )
