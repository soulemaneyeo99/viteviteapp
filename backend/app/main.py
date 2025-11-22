"""
ViteviteApp - Main Application
Point d'entrée FastAPI avec configuration production-ready
"""
from app.core.database import Base, engine
from app.api.v1.endpoints import auth, services, tickets, predictions, admin

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.core.config import settings
from app.core.database import init_db, close_db, check_db_connection
from app.api.v1.api import api_router


# ========== LOGGING ==========
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ========== LIFESPAN EVENTS ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Événements de cycle de vie de l'application
    - startup: Initialisation DB, validation config
    - shutdown: Fermeture propre des connexions
    """
    # ========== STARTUP ==========
    logger.info("🚀 Démarrage de ViteviteApp API...")
    
    # Valider la configuration
   
    
    # Initialiser la base de données (dev only)
    if settings.is_development:
        try:
            await init_db()
        except Exception as e:
            logger.error(f"❌ Erreur initialisation DB: {e}")
    
    # Vérifier la connexion DB
    db_ok = await check_db_connection()
    if not db_ok:
        logger.error("❌ Impossible de se connecter à la base de données")
    else:
        logger.info("✅ Connexion DB établie")
    
    # Auto-seed de la base de données (production-ready)
    try:
        from app.core.auto_seed import auto_seed_database
        await auto_seed_database()
    except Exception as e:
        logger.warning(f"⚠️ Erreur lors du seeding automatique: {e}")
    
    logger.info(f"✅ ViteviteApp API démarrée ({settings.ENVIRONMENT})")
    
    yield
    
    # ========== SHUTDOWN ==========
    logger.info("🔒 Arrêt de l'application...")
    await close_db()
    logger.info("✅ Connexions fermées proprement")


# ========== APPLICATION ==========
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de gestion intelligente des files d'attente en Côte d'Ivoire",
    docs_url="/docs" if not settings.is_production else None,  # Désactiver docs en prod
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
# ========== MIDDLEWARES ==========

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Compression GZIP
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Ajoute le temps de traitement dans les headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Error handling middleware
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    """Gestion globale des erreurs"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Erreur non gérée: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": "Erreur interne du serveur",
                "error": str(e) if settings.DEBUG else "Internal server error"
            }
        )


# ========== ROUTERS ==========
# Routers are now included via api_router below to avoid duplicates

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ========== ROOT ENDPOINT ==========
@app.get("/")
async def root():
    """
    🏠 **Page d'accueil de l'API**
    
    Informations générales sur l'API ViteviteApp.
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "operational",
        "endpoints": {
            "docs": "/docs" if not settings.is_production else "disabled",
            "health": f"{settings.API_V1_PREFIX}/health",
            "auth": f"{settings.API_V1_PREFIX}/auth",
            "services": f"{settings.API_V1_PREFIX}/services",
            "tickets": f"{settings.API_V1_PREFIX}/tickets"
        },
        "features": {
            "authentication": True,
            "queue_management": True,
            "ml_predictions": settings.gemini_enabled,
            "notifications": settings.ENABLE_NOTIFICATIONS,
            "analytics": settings.ENABLE_ANALYTICS
        },
        "contact": {
            "email": "contact@viteviteapp.ci",
            "website": "https://viteviteapp.ci"
        }
    }


# ========== EXCEPTION HANDLERS ==========

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handler personnalisé pour 404"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "detail": "Endpoint non trouvé",
            "path": str(request.url.path),
            "method": request.method,
            "docs": "/docs" if not settings.is_production else None
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handler personnalisé pour 500"""
    logger.error(f"Erreur 500: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "Erreur interne du serveur",
            "error": str(exc) if settings.DEBUG else None
        }
    )


# ========== MAIN ENTRY POINT ==========
if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🚀 Démarrage du serveur sur {settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        workers=1 if settings.DEBUG else settings.WORKERS,
        log_level=settings.LOG_LEVEL.lower()
    )