#!/usr/bin/env python3
"""
Production Seed Script - ViteviteApp
Consolidated script to seed all production data in the correct order.
Idempotent - can be run multiple times safely.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal, engine, Base
from sqlalchemy import select, text
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def check_table_exists(table_name: str) -> bool:
    """Check if a table exists in the database"""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            )
            return result.scalar() is not None
        except Exception as e:
            logger.error(f"Error checking table {table_name}: {e}")
            return False


async def create_tables():
    """Create all database tables"""
    logger.info("📋 Creating database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False


async def seed_services():
    """Seed services data"""
    logger.info("\n🌱 Seeding services...")
    try:
        from app.models.service import Service
        
        async with AsyncSessionLocal() as db:
            # Check if services already exist
            result = await db.execute(select(Service))
            existing = result.scalars().first()
            
            if existing:
                logger.info("⚠️  Services already exist. Skipping.")
                return True
            
            # Import and run seed_data
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from seed_data import seed_services as run_seed_services
            
            await run_seed_services()
            logger.info("✅ Services seeded successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error seeding services: {e}")
        return False


async def seed_administrations():
    """Seed administrations data"""
    logger.info("\n🏛️  Seeding administrations...")
    try:
        from app.models import Administration
        
        async with AsyncSessionLocal() as db:
            # Check if administrations already exist
            result = await db.execute(select(Administration))
            existing = result.scalars().first()
            
            if existing:
                logger.info("⚠️  Administrations already exist. Skipping.")
                return True
            
            # Import and run seed_administrations
            from seed_administrations import seed_administrations as run_seed_admins
            
            await run_seed_admins()
            logger.info("✅ Administrations seeded successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error seeding administrations: {e}")
        return False


async def seed_transport():
    """Seed transport data"""
    logger.info("\n🚌 Seeding transport data...")
    try:
        from app.models.transport import TransportCompany
        
        async with AsyncSessionLocal() as db:
            # Check if transport data already exists
            result = await db.execute(select(TransportCompany))
            existing = result.scalars().first()
            
            if existing:
                logger.info("⚠️  Transport data already exists. Skipping.")
                return True
            
            # Import and run seed_transport
            from app.core.seed_transport import seed_transport_data
            
            await seed_transport_data()
            logger.info("✅ Transport data seeded successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error seeding transport: {e}")
        return False


async def seed_pharmacies():
    """Seed pharmacies data"""
    logger.info("\n💊 Seeding pharmacies...")
    try:
        from app.models.pharmacy import Pharmacy
        
        async with AsyncSessionLocal() as db:
            # Check if pharmacies already exist
            result = await db.execute(select(Pharmacy))
            existing = result.scalars().first()
            
            if existing:
                logger.info("⚠️  Pharmacies already exist. Skipping.")
                return True
            
            # Import and run seed_pharmacies
            from app.core.seed_pharmacies import seed_pharmacies_data
            
            await seed_pharmacies_data()
            logger.info("✅ Pharmacies seeded successfully")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error seeding pharmacies: {e}")
        return False


async def main():
    """Main seeding function"""
    logger.info("=" * 70)
    logger.info("🚀 VITEVITEAPP - PRODUCTION DATA SEEDING")
    logger.info("=" * 70)
    
    success = True
    
    # Step 1: Create tables
    if not await create_tables():
        logger.error("Failed to create tables. Aborting.")
        return False
    
    # Step 2: Seed in order (respecting dependencies)
    steps = [
        ("Services", seed_services),
        ("Administrations", seed_administrations),
        ("Transport", seed_transport),
        ("Pharmacies", seed_pharmacies),
    ]
    
    for step_name, step_func in steps:
        try:
            if not await step_func():
                logger.warning(f"⚠️  {step_name} seeding had issues, but continuing...")
                success = False
        except Exception as e:
            logger.error(f"❌ Critical error in {step_name}: {e}")
            success = False
    
    logger.info("\n" + "=" * 70)
    if success:
        logger.info("✅ ALL DATA SEEDED SUCCESSFULLY!")
    else:
        logger.warning("⚠️  SEEDING COMPLETED WITH SOME WARNINGS")
    logger.info("=" * 70)
    
    return success


if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        logger.info("\n⚠️  Seeding interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {e}")
        sys.exit(1)
