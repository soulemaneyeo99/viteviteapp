"""
Fichier: backend/app/routers/voice.py (VERSION CORRIGÉE)
Routes Text-to-Speech et Speech-to-Text avec ElevenLabs
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import os
import requests
import io
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["voice"])

# ✅ CORRECTION: Configuration ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "hgZie8MSRBRgVn6w8BzP")  # Anicet
ELEVENLABS_VOICE_NAME = os.getenv("ELEVENLABS_VOICE_NAME", "Anicet")

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    model_id: str = "eleven_multilingual_v2"
    voice_settings: Optional[dict] = None


@router.post("/speak")
async def text_to_speech(request: TTSRequest):
    """
    ✅ CORRIGÉ: Convertit texte en audio avec ElevenLabs
    Optimisé pour voix francophone (Anicet)
    """
    if not ELEVENLABS_API_KEY:
        logger.error("ELEVENLABS_API_KEY manquante")
        raise HTTPException(
            status_code=503,
            detail="Service vocal non configuré. Ajoutez ELEVENLABS_API_KEY dans .env"
        )
    
    # ✅ AMÉLIORATION: Validation longueur texte
    if len(request.text) > 5000:
        raise HTTPException(
            status_code=400,
            detail="Texte trop long (max 5000 caractères)"
        )
    
    voice_id = request.voice_id or ELEVENLABS_VOICE_ID
    
    # ✅ Configuration optimale français
    voice_settings = request.voice_settings or {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0.3,
        "use_speaker_boost": True
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
        logger.info(f"TTS request pour {len(request.text)} caractères")
        
        response = requests.post(url, json=payload, headers=headers, stream=True, timeout=30)
        
        if response.status_code != 200:
            error_msg = response.text
            logger.error(f"ElevenLabs API error: {error_msg}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs API error: {error_msg}"
            )
        
        # ✅ Stream audio directement
        return StreamingResponse(
            io.BytesIO(response.content),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache"
            }
        )
        
    except requests.exceptions.Timeout:
        logger.error("Timeout ElevenLabs")
        raise HTTPException(status_code=504, detail="Timeout lors de la génération audio")
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur connexion ElevenLabs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur connexion: {str(e)}")


@router.post("/transcribe")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    ✅ AMÉLIORATION: Transcription audio avec gestion fallback
    Note: Nécessite API externe (Whisper/AssemblyAI/etc.)
    """
    # ✅ Validation type fichier
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400,
            detail="Le fichier doit être un fichier audio (audio/webm, audio/mp3, etc.)"
        )
    
    # ✅ Validation taille (max 25MB)
    audio_content = await audio.read()
    if len(audio_content) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Fichier audio trop volumineux (max 25MB)"
        )
    
    try:
        # ✅ OPTION 1: OpenAI Whisper (payant mais efficace)
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        
        if OPENAI_API_KEY:
            logger.info("Utilisation Whisper pour transcription")
            
            response = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files={"file": ("audio.webm", audio_content, audio.content_type)},
                data={
                    "model": "whisper-1",
                    "language": "fr",
                    "response_format": "json"
                },
                timeout=60
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Whisper API error: {response.text}"
                )
            
            result = response.json()
            return {"text": result.get("text", "")}
        
        # ✅ OPTION 2: AssemblyAI (gratuit pour dev)
        ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
        
        if ASSEMBLYAI_API_KEY:
            logger.info("Utilisation AssemblyAI pour transcription")
            
            # Upload audio
            upload_response = requests.post(
                "https://api.assemblyai.com/v2/upload",
                headers={"authorization": ASSEMBLYAI_API_KEY},
                data=audio_content,
                timeout=60
            )
            
            if upload_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Erreur upload audio")
            
            audio_url = upload_response.json()["upload_url"]
            
            # Transcription
            transcript_response = requests.post(
                "https://api.assemblyai.com/v2/transcript",
                headers={"authorization": ASSEMBLYAI_API_KEY},
                json={"audio_url": audio_url, "language_code": "fr"},
                timeout=10
            )
            
            if transcript_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Erreur transcription")
            
            transcript_id = transcript_response.json()["id"]
            
            # Polling résultat (simplifié)
            import time
            max_retries = 30
            for _ in range(max_retries):
                result_response = requests.get(
                    f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                    headers={"authorization": ASSEMBLYAI_API_KEY},
                    timeout=10
                )
                
                result = result_response.json()
                if result["status"] == "completed":
                    return {"text": result.get("text", "")}
                elif result["status"] == "error":
                    raise HTTPException(status_code=500, detail="Erreur transcription")
                
                time.sleep(2)
            
            raise HTTPException(status_code=504, detail="Timeout transcription")
        
        # ✅ FALLBACK: Service non configuré
        raise HTTPException(
            status_code=503,
            detail="Service de transcription non configuré. Ajoutez OPENAI_API_KEY ou ASSEMBLYAI_API_KEY dans .env"
        )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur transcription: {str(e)}")


@router.get("/voices")
async def list_available_voices():
    """Liste toutes les voix ElevenLabs disponibles"""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="Service vocal non configuré")
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/voices",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            timeout=10
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Erreur récupération voix"
            )
        
        voices = response.json()
        
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
        logger.error(f"Erreur liste voix: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/voice/quota")
async def get_voice_quota():
    """Vérifie le quota restant ElevenLabs"""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="Service non configuré")
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/user",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            timeout=10
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
        logger.error(f"Erreur quota: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# ✅ AJOUT: Health check pour le service vocal
@router.get("/voice/health")
async def voice_health_check():
    """Vérifie l'état du service vocal"""
    status = {
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY),
        "voice_id": ELEVENLABS_VOICE_ID,
        "voice_name": ELEVENLABS_VOICE_NAME,
        "transcription_available": bool(os.getenv("OPENAI_API_KEY") or os.getenv("ASSEMBLYAI_API_KEY"))
    }
    
    return status