"""
ViteviteApp - API v1 Router
Regroupe tous les endpoints de la version 1 de l'API
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, services, tickets, predictions


# ========== API V1 ROUTER ==========
router = APIRouter()

# Inclure tous les routers avec leurs préfixes
router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

router.include_router(
    services.router,
    prefix="/services",
    tags=["Services"]
)

router.include_router(
    tickets.router,
    prefix="/tickets",
    tags=["Tickets"]
)

router.include_router(
    predictions.router,
    prefix="/predictions",
    tags=["ML Predictions"]
)


# ========== HEALTH CHECK V1 ==========
@router.get("/health", tags=["Health"])
async def api_v1_health_check():
    """
    ❤️ **Health check de l'API v1**
    
    Vérifie que l'API v1 fonctionne correctement.
    
    Returns:
        - Status: healthy
        - Version de l'API
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "api": "ViteviteApp API v1",
        "endpoints": {
            "auth": "/api/v1/auth",
            "services": "/api/v1/services",
            "tickets": "/api/v1/tickets",
            "predictions": "/api/v1/predictions"
        }
    }