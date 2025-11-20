"""
======================================================
    ViteviteApp - Configuration Professionnelle
    Chargement automatique via .env + Validation
    Compatible Pydantic v2 et production-ready
======================================================
"""

import secrets
from typing import Optional, List

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuration centrale de toute l'application.
    - Chargement depuis .env
    - Validation stricte
    - Construction automatique de DATABASE_URL
    - Parse intelligent des CORS origins
    """
    
    # -------------------------------------------------
    # BASE Pydantic Config
    # -------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # -------------------------------------------------
    # APPLICATION
    # -------------------------------------------------
    APP_NAME: str = "ViteviteApp"
    APP_VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"

    ENVIRONMENT: str = "development"  # production | development | staging
    DEBUG: bool = True

    # -------------------------------------------------
    # SERVER
    # -------------------------------------------------
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    WORKERS: int = 1  # 1 en dev, 4 en prod

    # -------------------------------------------------
    # SECURITY / AUTH
    # -------------------------------------------------
    SECRET_KEY: str = "cTJ5PjKuCXe_P5VxVPQODKkb6SVGwL4bFl1QS5ezGeo"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # -------------------------------------------------
    # DATABASE
    # -------------------------------------------------
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "dev"
    POSTGRES_PASSWORD: str = "&é\""
    POSTGRES_DB: str = "vitevite_db"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: Optional[str] = None  # Auto-générée si absente

    @model_validator(mode='after')
    def assemble_db_connection(self):
        """Construit DATABASE_URL si non fournie"""
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:"
                f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    # -------------------------------------------------
    # CORS - FIX CRITIQUE
    # -------------------------------------------------
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        """Parse CORS_ORIGINS depuis string ou list"""
        if isinstance(v, str):
            # Split par virgule et nettoie les espaces
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # -------------------------------------------------
    # REDIS (CACHE)
    # -------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_EXPIRE_SECONDS: int = 300

    # -------------------------------------------------
    # AI SERVICES
    # -------------------------------------------------
    GEMINI_API_KEY: Optional[str] = "AIzaSyBTgUsWLxRwNITfy4EtoFeWYkYVzy7Yk7o"
    OPENAI_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = "sk_48c42deff40314a49a55fa0fca7b1a3b0777ef935b91caf"
    ELEVENLABS_VOICE_ID: str = "hgZie8MSRBRgVn6w8BzP"

    # -------------------------------------------------
    # FEATURE FLAGS
    # -------------------------------------------------
    ENABLE_AI: bool = True
    ENABLE_VOICE: bool = False
    ENABLE_MARKETPLACE: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_NOTIFICATIONS: bool = False

    # -------------------------------------------------
    # RATE LIMITING
    # -------------------------------------------------
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100

    # -------------------------------------------------
    # LOGGING
    # -------------------------------------------------
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/viteviteapp.log"

    # -------------------------------------------------
    # MONITORING
    # -------------------------------------------------
    SENTRY_DSN: Optional[str] = None

    # -------------------------------------------------
    # PAYMENT (future)
    # -------------------------------------------------
    STRIPE_SECRET_KEY: Optional[str] = None
    ORANGE_MONEY_API_KEY: Optional[str] = None
    MTN_MONEY_API_KEY: Optional[str] = None

    # -------------------------------------------------
    # UPLOADS
    # -------------------------------------------------
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # -------------------------------------------------
    # EMAILING
    # -------------------------------------------------
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "ViteviteApp"

    # -------------------------------------------------
    # PROPERTIES UTILITAIRES
    # -------------------------------------------------
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @property
    def gemini_enabled(self) -> bool:
        return self.ENABLE_AI and bool(self.GEMINI_API_KEY)

    @property
    def voice_enabled(self) -> bool:
        return self.ENABLE_VOICE and bool(self.ELEVENLABS_API_KEY)


# ---------------------------------------------------------
# INSTANCE UNIQUE GLOBALE
# ---------------------------------------------------------
settings = Settings()


# ---------------------------------------------------------
# VALIDATION AU DÉMARRAGE
# ---------------------------------------------------------
def validate_settings() -> None:
    """Vérifie toutes les configurations critiques au démarrage."""
    critical_errors = []
    warnings = []

    # Database
    if not settings.DATABASE_URL:
        critical_errors.append("❌ DATABASE_URL non configurée.")

    # Secret Key
    if len(settings.SECRET_KEY) < 32:
        critical_errors.append("❌ SECRET_KEY trop courte (32+ recommandé).")

    # Debug Mode
    if settings.is_production and settings.DEBUG:
        critical_errors.append("❌ DEBUG=True en production - interdit.")

    # Reload Mode
    if settings.is_production and settings.RELOAD:
        warnings.append("⚠️ RELOAD activé en production (déconseillé).")

    # AI
    if settings.ENABLE_AI and not settings.GEMINI_API_KEY:
        warnings.append("⚠️ AI activée mais GEMINI_API_KEY manquante.")

    # Monitoring
    if settings.is_production and not settings.SENTRY_DSN:
        warnings.append("⚠️ SENTRY_DSN manquant (monitoring conseillé).")

    # Résultats
    if critical_errors:
        print("\n🚨 ERREURS CRITIQUES DE CONFIGURATION")
        for err in critical_errors:
            print("  -", err)
        raise ValueError("Configuration invalide. Corrigez les erreurs critiques.")

    if warnings:
        print("\n⚠️ AVERTISSEMENTS")
        for warn in warnings:
            print("  -", warn)

    print(f"\n✅ Configuration OK ({settings.ENVIRONMENT})")
    print(f"🔗 Database : {settings.DATABASE_URL}")
    print(f"🧠 AI : {'ON' if settings.gemini_enabled else 'OFF'}")
    print(f"🎤 Voix : {'ON' if settings.voice_enabled else 'OFF'}")
    print(f"🌐 CORS Origins : {settings.CORS_ORIGINS}")