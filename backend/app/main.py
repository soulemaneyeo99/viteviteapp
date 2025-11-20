"""
ViteviteApp - Main Application
Backend FastAPI production-ready
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings, validate_settings
from app.core.database import init_db, close_db, check_db_connection
from app.api.v1.api import api_router

# Configuration logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    logger.info(f"🚀 Démarrage {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Validation config
    try:
        validate_settings()
    except ValueError as e:
        logger.error(f"❌ Configuration invalide: {e}")
        raise
    
    # Init database
    if settings.is_development:
        logger.warning("🔧 Mode développement - Base recréée")
        await init_db()
    
    # Check DB connection
    if not await check_db_connection():
        logger.error("❌ Impossible de se connecter à la base")
        raise RuntimeError("Database connection failed")
    
    logger.info("✅ Application prête")
    
    yield
    
    # Shutdown
    logger.info("🛑 Arrêt application")
    await close_db()


# Application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de gestion de files d'attente intelligente",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX
)


# Root endpoint
@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs" if settings.DEBUG else None
    }


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_ok = await check_db_connection()
    
    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler d'erreur global"""
    logger.error(f"Erreur non gérée: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erreur interne du serveur" if settings.is_production else str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        workers=1 if settings.RELOAD else settings.WORKERS,
        log_level=settings.LOG_LEVEL.lower()
    )