import asyncio
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.service import Service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def verify_services():
    async with AsyncSessionLocal() as session:
        logger.info("🔍 Verifying services...")
        result = await session.execute(select(Service))
        services = result.scalars().all()
        
        logger.info(f"📊 Total services found: {len(services)}")
        for service in services:
            logger.info(f" - {service.name} ({service.slug})")

if __name__ == "__main__":
    asyncio.run(verify_services())
