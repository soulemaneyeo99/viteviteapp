import json
import secrets
from typing import Optional, List
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator, ValidationInfo


class Settings(BaseSettings):
    """
    Configuration centrale pour ViteviteApp.
    - Support PostgreSQL & SQLite
    - CORS dynamique
    - Production / Dev flags
    """

    # ---------------------------------------------------------
    # Configuration env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ---------------------------------------------------------
    # Application
    APP_NAME: str = "ViteviteApp"
    APP_VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"

    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    WORKERS: int = 1

    # ---------------------------------------------------------
    # CORS
    CORS_ORIGINS_RAW: Optional[str] = None
    ALLOW_ALL_ORIGINS: bool = False  # Autoriser toutes les origines (dev/test uniquement)
    CORS_ORIGINS_DEFAULT: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://viteviteapp.vercel.app",
        "https://viteviteapp.onrender.com",
    ]

    # ---------------------------------------------------------
    # Security / Auth
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 jours (pour "remember me")
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 jours

    # ---------------------------------------------------------
    # Base de données : SQLite par défaut
    DATABASE_URL: Optional[str] = "sqlite+aiosqlite:///./vitevite.db"

    # Champs PostgreSQL optionnels
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[int] = 5432
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    # ---------------------------------------------------------
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_EXPIRE_SECONDS: int = 300

    # ---------------------------------------------------------
    # AI / Voice
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: str = "hgZie8MSRBRgVn6w8BzP"

    ENABLE_AI: bool = True
    ENABLE_VOICE: bool = False
    ENABLE_MARKETPLACE: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_NOTIFICATIONS: bool = True

    # ---------------------------------------------------------
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100

    # ---------------------------------------------------------
    # Logs
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/viteviteapp.log"

    # ---------------------------------------------------------
    # Optional services
    SENTRY_DSN: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    ORANGE_MONEY_API_KEY: Optional[str] = None
    MTN_MONEY_API_KEY: Optional[str] = None

    # ---------------------------------------------------------
    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ---------------------------------------------------------
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "ViteviteApp"

    # ---------------------------------------------------------
    # VALIDATEURS
    @model_validator(mode="after")
    def assemble_database_url(cls, model):
        """
        Si l'utilisateur configure PostgreSQL -> remplacer SQLite automatiquement.
        Sinon SQLite reste la base par défaut.
        """
        if (
            model.POSTGRES_SERVER and
            model.POSTGRES_USER and
            model.POSTGRES_PASSWORD and
            model.POSTGRES_DB
        ):
            user = quote_plus(model.POSTGRES_USER)
            pwd = quote_plus(model.POSTGRES_PASSWORD)

            model.DATABASE_URL = (
                f"postgresql+asyncpg://{user}:{pwd}@"
                f"{model.POSTGRES_SERVER}:{model.POSTGRES_PORT}/"
                f"{model.POSTGRES_DB}"
            )

        return model

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Gère trois formats possibles : liste brute, string séparée, JSON."""
        # Si ALLOW_ALL_ORIGINS est activé, autoriser toutes les origines
        if self.ALLOW_ALL_ORIGINS:
            return ["*"]
        
        raw = self.CORS_ORIGINS_RAW

        if not raw:
            return self.CORS_ORIGINS_DEFAULT

        raw = raw.strip()

        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed]
            except Exception:
                pass

        return [p.strip() for p in raw.split(",") if p.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() in ["development", "dev"]

    @property
    def gemini_enabled(self) -> bool:
        return self.ENABLE_AI and bool(self.GEMINI_API_KEY)

    @property
    def voice_enabled(self) -> bool:
        return self.ENABLE_VOICE and bool(self.ELEVENLABS_API_KEY)


# ============================================================
# INSTANCE GLOBALE
# ============================================================
settings = Settings()
