"""
ViteviteApp - API v1 Router
Regroupe tous les endpoints de la version 1 de l'API
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, services, tickets, predictions


# ========== API V1 ROUTER ==========
api_router = APIRouter()

# Inclure tous les routers
api_router.include_router(auth.router)
api_router.include_router(services.router)
api_router.include_router(tickets.router)
api_router.include_router(predictions.router)


# ========== HEALTH CHECK ==========
@api_router.get("/health", tags=["Health"])
async def health_check():
    """
    ❤️ **Health check de l'API**
    
    Vérifie que l'API fonctionne correctement.
    
    Returns:
        - Status: healthy
        - Version de l'API
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "api": "ViteviteApp API"
    }