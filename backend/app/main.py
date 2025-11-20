"""
ViteviteApp - Main Application
FastAPI avec tous les routers et configurations
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings, validate_settings
from app.core.database import check_db_connection
from app.api.v1 import api as api_v1

# Configuration logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== APPLICATION FASTAPI ==========
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de gestion intelligente des files d'attente avec IA",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ========== CORS MIDDLEWARE ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== ROUTERS ==========
# Inclure tous les routers API v1
app.include_router(
    api_v1.router,
    prefix=settings.API_V1_PREFIX
)

# ========== HEALTH CHECK ==========
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Vérifie l'état de l'API et de la base de données
    """
    db_ok = await check_db_connection()
    
    return JSONResponse(
        status_code=200 if db_ok else 503,
        content={
            "status": "healthy" if db_ok else "unhealthy",
            "version": settings.APP_VERSION,
            "database": "connected" if db_ok else "disconnected",
            "environment": settings.ENVIRONMENT
        }
    )

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint avec informations API
    """
    return {
        "message": "ViteviteApp API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_PREFIX
    }

# ========== STARTUP EVENT ==========
@app.on_event("startup")
async def startup_event():
    """Actions au démarrage de l'application"""
    logger.info("🚀 Starting ViteviteApp...")
    
    # Validation configuration
    try:
        validate_settings()
    except Exception as e:
        logger.error(f"❌ Configuration error: {e}")
        raise
    
    # Test connexion database
    db_ok = await check_db_connection()
    if db_ok:
        logger.info("✅ Database connection OK")
    else:
        logger.warning("⚠️ Database connection failed")
    
    logger.info(f"✅ ViteviteApp started on {settings.HOST}:{settings.PORT}")
    logger.info(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")

# ========== SHUTDOWN EVENT ==========
@app.on_event("shutdown")
async def shutdown_event():
    """Actions à l'arrêt de l'application"""
    logger.info("🛑 Shutting down ViteviteApp...")
    
    from app.core.database import close_db
    await close_db()
    
    logger.info("✅ ViteviteApp stopped")

# ========== EXCEPTION HANDLERS ==========
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handler pour 404 Not Found"""
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Route non trouvée",
            "path": str(request.url.path),
            "method": request.method
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handler pour 500 Internal Server Error"""
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erreur interne du serveur",
            "type": type(exc).__name__
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )