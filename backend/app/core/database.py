"""
ViteviteApp - Database Configuration
SQLAlchemy 2.0 avec AsyncIO pour SQLite (par défaut)
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# ========== BASE MODEL ==========
Base = declarative_base()

# ========== ENGINE ==========

# Forcer SQLite si DATABASE_URL n'est pas PostgreSQL
DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    # SQLite = pas de pool
    engine: AsyncEngine = create_async_engine(
        DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=NullPool,
    )

else:
    # PostgreSQL (optionnel - mais désactivé tant que tu n'es pas prêt)
    engine: AsyncEngine = create_async_engine(
        DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        pool_pre_ping=True,
    )


# ========== SESSION FACTORY ==========
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ========== DEPENDENCY FASTAPI ==========
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


# ========== INIT DB (DEV ONLY) ==========
async def init_db() -> None:
    """
    Initialise la base de données (crée les tables)
    À utiliser uniquement en dev ou pour tests.
    """
    async with engine.begin() as conn:
        from app.models import user, service, ticket  # noqa

        if settings.is_development:
            await conn.run_sync(Base.metadata.drop_all)
            logger.warning("🗑️  Tables dropped (dev mode)")

        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created")


# ========== CLOSE DB ==========
async def close_db() -> None:
    await engine.dispose()
    logger.info("🔒 Database connection closed")


# ========== HEALTH CHECK ==========
async def check_db_connection() -> bool:
    from sqlalchemy import text

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# ========== TRANSACTION HELPER ==========
class transaction:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def __aenter__(self):
        await self.db.begin()
        return self.db
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.db.rollback()
        else:
            await self.db.commit()
