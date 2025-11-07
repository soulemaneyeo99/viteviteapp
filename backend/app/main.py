"""
Fichier: backend/app/main.py (VERSION CORRIGÉE)
Point d'entrée principal de l'API avec CORS et gestion d'erreurs améliorés
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import services, tickets, admin, marketplace, analytics, notifications
from app.ai.gemini_service import gemini_service
from app.database import db
from app.models import AIPrediction
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging
from app.routers import voice

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Charge les variables d'environnement
load_dotenv()

# Initialise FastAPI
app = FastAPI(
    title="ViteviteApp API",
    description="API de gestion intelligente des files d'attente avec Marketplace et Analytics IA",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS - CRITIQUE pour le déploiement
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://*.vercel.app",
        "*"  # En production, remplacer par les domaines spécifiques
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Middleware de gestion d'erreurs globales
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Erreur non gérée: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Erreur interne: {str(e)}"}
        )

# Inclut tous les routers

app.include_router(voice.router)
app.include_router(services.router)
app.include_router(tickets.router)
app.include_router(admin.router)
app.include_router(marketplace.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

# Modèles pour le chatbot
class ChatRequest(BaseModel):
    message: str
    context: dict = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str = None

@app.get("/")
async def root():
    """Point d'entrée de l'API"""
    return {
        "app": "ViteviteApp API",
        "version": "2.0.0",
        "status": "operational",
        "ai_enabled": gemini_service.enabled,
        "features": {
            "queue_management": True,
            "marketplace": True,
            "analytics": True,
            "notifications": True,
            "ai_predictions": gemini_service.enabled,
            "chatbot": gemini_service.enabled
        },
        "endpoints": {
            "services": "/api/services",
            "tickets": "/api/tickets",
            "admin": "/api/admin",
            "marketplace": "/api/marketplace",
            "analytics": "/api/analytics",
            "notifications": "/api/notifications",
            "chatbot": "/api/ai/chat",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "active" if gemini_service.enabled else "disabled",
        "marketplace": "active",
        "analytics": "active",
        "notifications": "active",
        "chatbot": "active" if gemini_service.enabled else "disabled"
    }

@app.post("/api/ai/predict/{service_id}", response_model=AIPrediction)
async def predict_service_wait_time(service_id: str):
    """Prédit le temps d'attente pour un service avec l'IA"""
    try:
        service = db.get_service(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        prediction = await gemini_service.predict_wait_time(service)
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chatbot(request: ChatRequest):
    """
    Endpoint pour le chatbot IA - CRITIQUE
    Gère les conversations avec l'assistant Gemini
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message vide")
        
        # Enrichit le contexte avec des informations système
        context = request.context or {}
        context['services'] = [
            {
                "name": s["name"],
                "category": s["category"],
                "status": s["status"]
            } 
            for s in db.get_all_services()[:3]
        ]
        
        # Appelle Gemini
        response_text = await gemini_service.get_chatbot_response(
            request.message.strip(), 
            context
        )
        
        from datetime import datetime
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur chatbot: {str(e)}")
        # Retourne une réponse de secours au lieu d'une erreur
        return ChatResponse(
            response="Je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
            timestamp=None
        )

@app.get("/api/stats/global")
async def get_global_stats():
    """Statistiques globales de la plateforme"""
    try:
        queue_stats = db.get_stats()
        
        # Stats marketplace (simulées)
        marketplace_stats = {
            "total_products": 50,
            "total_orders": 124,
            "revenue_today": 450000
        }
        
        # Stats analytics
        analytics_stats = {
            "ai_predictions_made": 1847,
            "accuracy": 91.0
        }
        
        return {
            "queue_management": queue_stats,
            "marketplace": marketplace_stats,
            "analytics": analytics_stats,
            "total_users": 18450,
            "services_partners": 24
        }
    except Exception as e:
        logger.error(f"Erreur stats globales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Gestion des erreurs 404
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint non trouvé",
            "path": str(request.url.path),
            "available_docs": "/docs"
        }
    )

# Gestion des erreurs 500
@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Erreur 500: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Démarrage de l'API sur le port {port}")
    logger.info(f"🤖 Gemini AI: {'Activé' if gemini_service.enabled else 'Désactivé'}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)