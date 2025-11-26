"""
Simple API endpoint to seed production database
Call this endpoint once after deployment to populate the database
GET /api/v1/seed-production
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models import Administration, Service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/seed-production")
async def seed_production_data(db: AsyncSession = Depends(get_db)):
    """
    Seed production database with initial data
    This endpoint can be called via browser or curl to populate the database
    Safe to call multiple times - checks for existing data
    """
    try:
        results = {
            "services": 0,
            "administrations": 0,
            "message": "Seeding completed"
        }
        
        # Check if services already exist
        service_result = await db.execute(select(Service))
        existing_services = service_result.scalars().first()
        
        if not existing_services:
            # Import and run service seeding
            from seed_data import seed_services
            await seed_services()
            results["services"] = 11
            logger.info("✅ Services seeded")
        else:
            results["message"] += " (Services already exist)"
        
        # Check if administrations already exist
        admin_result = await db.execute(select(Administration))
        existing_admins = admin_result.scalars().first()
        
        if not existing_admins:
            # Import and run administration seeding
            from seed_administrations import seed_administrations
            await seed_administrations()
            results["administrations"] = 11
            logger.info("✅ Administrations seeded")
        else:
            results["message"] += " (Administrations already exist)"
        
        return {
            "success": True,
            "data": results,
            "message": "Database seeded successfully! Visit /administrations to see the data."
        }
        
    except Exception as e:
        logger.error(f"Seeding error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Seeding failed: {str(e)}"
        )
