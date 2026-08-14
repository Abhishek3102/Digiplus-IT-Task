from fastapi import APIRouter, Request
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from core.security import verify_token
from ai.chatbot import chat_endpoint_logic

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(msg: ChatMessage, request: Request):
    user_id = await verify_token(request)
    
    stream_gen = await chat_endpoint_logic(msg.message, user_id)
    return StreamingResponse(stream_gen, media_type="text/event-stream")
