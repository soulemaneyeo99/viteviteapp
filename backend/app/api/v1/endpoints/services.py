"""
ViteviteApp - Services Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.service import Service
from app.schemas.service import ServicePublic, ServicesListResponse

router = APIRouter()


@router.get("", response_model=ServicesListResponse)
async def get_services(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Récupère tous les services"""
    
    query = select(Service)
    
    if category:
        query = query.where(Service.category == category)
    
    if status:
        query = query.where(Service.status == status)
    
    result = await db.execute(query)
    services = result.scalars().all()
    
    return ServicesListResponse(
        success=True,
        total=len(services),
        services=[ServicePublic.model_validate(s) for s in services]
    )


@router.get("/{service_id}", response_model=dict)
async def get_service(service_id: str, db: AsyncSession = Depends(get_db)):
    """Récupère un service par ID"""
    
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    return {
        "success": True,
        "service": ServicePublic.model_validate(service)
    }