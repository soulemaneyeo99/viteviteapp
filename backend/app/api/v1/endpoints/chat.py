"""
ViteviteApp - Chat Endpoint
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.ai.gemini_service import gemini_service

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = None

@router.post("")
async def chat(request: ChatRequest):
    """
    Endpoint de chat avec l'IA Gemini
    """
    if not gemini_service.enabled:
        return {
            "response": "Le service IA est temporairement indisponible.",
            "status": "disabled"
        }
    
    # Construction du contexte pour le service
    context = request.context or {}
    if request.history:
        context['previous_messages'] = [msg.model_dump() for msg in request.history]
    
    response = await gemini_service.get_chatbot_response(
        user_message=request.message,
        context=context
    )
    
    return {
        "response": response,
        "status": "success"
    }
