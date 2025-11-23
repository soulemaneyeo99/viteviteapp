"""
ViteviteApp - Chat Endpoint (Enhanced)
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.ai.gemini_service import gemini_service

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = None

@router.post("")
async def chat(request: ChatRequest):
    """
    🤖 **Endpoint de chat avec l'IA Gemini (Enhanced)**
    
    Fournit des réponses contextuelles basées sur:
    - L'état des services
    - L'historique de conversation
    - La localisation de l'utilisateur
    - Les données en temps réel
    """
    if not gemini_service.enabled:
        return {
            "response": "😔 Le service IA est temporairement indisponible. Veuillez réessayer plus tard ou consulter notre FAQ.",
            "status": "disabled"
        }
    
    # Construction du contexte enrichi
    enriched_context = request.context or {}
    
    # Ajouter l'historique de conversation
    if request.history:
        enriched_context['previous_messages'] = [
            {
                'role': msg.role,
                'content': msg.content[:200]  # Limiter pour éviter tokens excessifs
            }
            for msg in request.history[-5:]  # Garder seulement les 5 derniers messages
        ]
    
    # Ajouter timestamp
    enriched_context['current_time'] = datetime.now().strftime("%H:%M")
    enriched_context['current_date'] = datetime.now().strftime("%Y-%m-%d")
    
    # Ajouter info sur les services si disponible
    if 'services' in enriched_context and enriched_context['services']:
        services_summary = []
        for service in enriched_context['services'][:3]:  # Top 3 services
            services_summary.append({
                'name': service.get('name'),
                'status': service.get('status'),
                'queue': service.get('queue_size', 0),
                'wait': service.get('wait_time', 0)
            })
        enriched_context['top_services'] = services_summary
    
    try:
        response = await gemini_service.get_chatbot_response(
            user_message=request.message,
            context=enriched_context
        )
        
        return {
            "response": response,
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return {
            "response": "😔 Une erreur s'est produite. Veuillez reformuler votre question ou réessayer.",
            "status": "error"
        }

