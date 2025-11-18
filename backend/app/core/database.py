"""
ViteviteApp - Database Configuration
SQLAlchemy 2.0 avec AsyncIO pour PostgreSQL
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# ========== BASE MODEL ==========
Base = declarative_base()

# ========== ENGINE ==========
if settings.is_development:
    engine: AsyncEngine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,  # Log SQL queries en dev
        future=True,
        pool_pre_ping=True,  # Vérifie connexions avant usage
        poolclass=NullPool,  # No pool en dev pour hot reload
    )
else:
    engine: AsyncEngine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,  # Log SQL queries en dev
        future=True,
        pool_pre_ping=True,  # Vérifie connexions avant usage
        # En prod, pas de NullPool => pool par défaut
    )

# ========== SESSION FACTORY ==========
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ========== DEPENDENCY ==========
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency pour obtenir une session DB
    Usage dans FastAPI:
        @app.get("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


# ========== INIT DB ==========
async def init_db() -> None:
    """
    Initialise la base de données (crée les tables)
    À utiliser uniquement en dev ou pour tests
    En production, utiliser Alembic migrations
    """
    async with engine.begin() as conn:
        # Import tous les models pour que SQLAlchemy les connaisse
        from app.models import user, service, ticket  # noqa
        
        if settings.is_development:
            # Drop et recrée en dev
            await conn.run_sync(Base.metadata.drop_all)
            logger.warning("🗑️  Tables dropped (dev mode)")
        
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created")


async def close_db() -> None:
    """Ferme proprement la connexion DB"""
    await engine.dispose()
    logger.info("🔒 Database connection closed")


# ========== HEALTH CHECK ==========
async def check_db_connection() -> bool:
    """
    Vérifie que la connexion DB est active
    
    Returns:
        True si connexion OK
    """
    from sqlalchemy import text

    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))  # <-- text() autour de "SELECT 1"
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# ========== TRANSACTION HELPER ==========
class transaction:
    """
    Context manager pour transactions manuelles
    
    Usage:
        async with transaction(db) as tx:
            # operations
            await tx.commit()  # ou rollback automatique si erreur
    """
    
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