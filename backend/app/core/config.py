import json
import secrets
from typing import Optional, List
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator, ValidationInfo


class Settings(BaseSettings):
    """
    Configuration centrale pour ViteviteApp.
    - CORS flexible
    - DB URL encodée
    - Flags production/dev
    """

    # -------------------------
    # Raw CORS pour override depuis .env
    CORS_ORIGINS_RAW: Optional[str] = None
    CORS_ORIGINS_DEFAULT: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # -------------------------
    # Configuration Pydantic
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # -------------------------
    # Application
    APP_NAME: str = "ViteviteApp"
    APP_VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"

    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False
    WORKERS: int = 4

    # -------------------------
    # Security / Auth
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # -------------------------
    # PostgreSQL
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "dev"
    POSTGRES_PASSWORD: str = "&é\""
    POSTGRES_DB: str = "vitevite_db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # -------------------------
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_EXPIRE_SECONDS: int = 300

    # -------------------------
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

    # -------------------------
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100

    # -------------------------
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/viteviteapp.log"

    # -------------------------
    # Optional services
    SENTRY_DSN: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    ORANGE_MONEY_API_KEY: Optional[str] = None
    MTN_MONEY_API_KEY: Optional[str] = None

    # -------------------------
    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # -------------------------
    # Email / SMTP
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "ViteviteApp"

    # -------------------------
    # VALIDATORS
    @model_validator(mode="after")
    def check_required_fields(cls, model):
        required = ["POSTGRES_SERVER", "POSTGRES_PORT", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"]
        for f in required:
            if not getattr(model, f, None):
                raise ValueError(f"Missing required config: {f}")
        return model

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> str:
        """Si DATABASE_URL fourni -> utiliser. Sinon composer en encodant user/pass."""
        if v:
            return v
        data = info.data
        user = quote_plus(str(data.get("POSTGRES_USER") or ""))
        pwd = quote_plus(str(data.get("POSTGRES_PASSWORD") or ""))
        server = data.get("POSTGRES_SERVER") or "localhost"
        port = data.get("POSTGRES_PORT") or 5432
        db = data.get("POSTGRES_DB") or "postgres"
        return f"postgresql+asyncpg://{user}:{pwd}@{server}:{port}/{db}"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        raw = self.CORS_ORIGINS_RAW
        if not raw:
            return self.CORS_ORIGINS_DEFAULT
        raw = raw.strip()
        if raw.startswith("["):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if x]
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
