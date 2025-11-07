"""
Fichier: backend/app/routers/voice.py
Routes pour Text-to-Speech et Speech-to-Text avec ElevenLabs
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import requests
import io
from typing import Optional

router = APIRouter(prefix="/api/ai", tags=["voice"])

# Configuration ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "hgZie8MSRBRgVn6w8BzP")
ELEVENLABS_VOICE_NAME = os.getenv("ELEVENLABS_VOICE_NAME", "Anicet")

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    model_id: str = "eleven_multilingual_v2"
    voice_settings: Optional[dict] = None


@router.post("/speak")
async def text_to_speech(request: TTSRequest):
    """
    Convertit du texte en audio avec ElevenLabs
    Optimisé pour voix francophone (Anicet)
    """
    if not ELEVENLABS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Service vocal non configuré. Ajoutez ELEVENLABS_API_KEY."
        )
    
    voice_id = request.voice_id or ELEVENLABS_VOICE_ID
    
    # Configuration optimale pour français
    voice_settings = request.voice_settings or {
        "stability": 0.5,           # Stabilité voix (0-1)
        "similarity_boost": 0.75,   # Fidélité à la voix (0-1)
        "style": 0.3,               # Expressivité (0-1)
        "use_speaker_boost": True   # Boost qualité
    }
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    payload = {
        "text": request.text,
        "model_id": request.model_id,
        "voice_settings": voice_settings
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, stream=True)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs API error: {response.text}"
            )
        
        # Stream audio directement au client
        return StreamingResponse(
            io.BytesIO(response.content),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=speech.mp3"
            }
        )
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur connexion ElevenLabs: {str(e)}"
        )


@router.post("/transcribe")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Transcrit l'audio en texte
    Utilise Whisper API (OpenAI) ou autre service
    """
    if not audio.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400,
            detail="Le fichier doit être un fichier audio"
        )
    
    try:
        # Option 1: Utiliser OpenAI Whisper
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        
        if OPENAI_API_KEY:
            # Transcription avec Whisper
            audio_content = await audio.read()
            
            response = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files={"file": ("audio.webm", audio_content, audio.content_type)},
                data={
                    "model": "whisper-1",
                    "language": "fr",  # Français
                    "response_format": "json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Whisper API error: {response.text}"
                )
            
            result = response.json()
            return {"text": result.get("text", "")}
        
        else:
            # Fallback: Utiliser un service alternatif ou retourner erreur
            raise HTTPException(
                status_code=503,
                detail="Service de transcription non configuré. Ajoutez OPENAI_API_KEY."
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur transcription: {str(e)}"
        )


@router.get("/voices")
async def list_available_voices():
    """
    Liste toutes les voix ElevenLabs disponibles
    """
    if not ELEVENLABS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Service vocal non configuré"
        )
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/voices",
            headers={"xi-api-key": ELEVENLABS_API_KEY}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Erreur récupération des voix"
            )
        
        voices = response.json()
        
        # Filtre et retourne infos simplifiées
        return {
            "current_voice": {
                "id": ELEVENLABS_VOICE_ID,
                "name": ELEVENLABS_VOICE_NAME
            },
            "available_voices": [
                {
                    "voice_id": v["voice_id"],
                    "name": v["name"],
                    "labels": v.get("labels", {}),
                    "preview_url": v.get("preview_url")
                }
                for v in voices.get("voices", [])
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur: {str(e)}"
        )


@router.get("/voice/quota")
async def get_voice_quota():
    """
    Vérifie le quota restant ElevenLabs
    """
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="Service non configuré")
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/user",
            headers={"xi-api-key": ELEVENLABS_API_KEY}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Erreur vérification quota"
            )
        
        user_data = response.json()
        subscription = user_data.get("subscription", {})
        
        return {
            "character_count": subscription.get("character_count", 0),
            "character_limit": subscription.get("character_limit", 0),
            "characters_remaining": subscription.get("character_limit", 0) - subscription.get("character_count", 0),
            "tier": subscription.get("tier", "free"),
            "status": subscription.get("status", "active")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur: {str(e)}"
        )


