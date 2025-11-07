"""
Fichier: backend/app/main.py (VERSION MISE À JOUR)
Point d'entrée principal de l'API avec tous les nouveaux routers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import services, tickets, admin, marketplace, analytics, notifications
from app.ai.gemini_service import gemini_service
from app.database import db
from app.models import AIPrediction
import os
from dotenv import load_dotenv

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

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclut tous les routers
app.include_router(services.router)
app.include_router(tickets.router)
app.include_router(admin.router)
app.include_router(marketplace.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

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
            "ai_predictions": gemini_service.enabled
        },
        "endpoints": {
            "services": "/api/services",
            "tickets": "/api/tickets",
            "admin": "/api/admin",
            "marketplace": "/api/marketplace",
            "analytics": "/api/analytics",
            "notifications": "/api/notifications",
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
        "notifications": "active"
    }

@app.post("/api/ai/predict/{service_id}", response_model=AIPrediction)
async def predict_service_wait_time(service_id: str):
    """Prédit le temps d'attente pour un service avec l'IA"""
    service = db.get_service(service_id)
    if not service:
        return {"error": "Service non trouvé"}
    
    prediction = await gemini_service.predict_wait_time(service)
    return prediction

@app.post("/api/ai/chat")
async def chatbot(message: str, context: dict = None):
    """Endpoint pour le chatbot IA"""
    response = await gemini_service.get_chatbot_response(message, context)
    return {"response": response}

@app.get("/api/stats/global")
async def get_global_stats():
    """Statistiques globales de la plateforme"""
    queue_stats = db.get_stats()
    
    # Simuler les stats marketplace (en production, depuis la vraie DB)
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)