"""
ViteviteApp - Administrations API Endpoints
Gestion des administrations (mairies, préfectures, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models import Administration, Service
from app.api.v1.deps import get_current_admin
from app.models.user import User

router = APIRouter()


# ========== SCHEMAS ==========
class AdministrationBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    main_image_url: Optional[str] = None
    location: Optional[dict] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    operating_hours: Optional[dict] = None
    facilities: Optional[dict] = None


class AdministrationCreate(AdministrationBase):
    slug: str


class AdministrationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    main_image_url: Optional[str] = None
    location: Optional[dict] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    operating_hours: Optional[dict] = None
    is_open: Optional[bool] = None
    facilities: Optional[dict] = None


class AdministrationResponse(AdministrationBase):
    id: str
    slug: str
    is_open: bool
    image_gallery: List[str]
    service_ids: List[str]
    total_queue_size: int
    average_wait_time: int
    total_active_counters: int
    rating: Optional[int]
    total_ratings: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== ENDPOINTS ==========

@router.get("/", response_model=dict)
async def get_administrations(
    db: AsyncSession = Depends(get_db),
    type: Optional[str] = Query(None, description="Filter by type (mairie, prefecture, etc.)"),
    is_open: Optional[bool] = Query(None, description="Filter by open status"),
    search: Optional[str] = Query(None, description="Search by name"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Récupère la liste des administrations avec filtres
    """
    query = select(Administration)
    
    # Filtres
    if type:
        query = query.filter(Administration.type == type)
    if is_open is not None:
        query = query.filter(Administration.is_open == is_open)
    if search:
        query = query.filter(Administration.name.ilike(f"%{search}%"))
    
    # Pagination
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Get items
    result = await db.execute(query.offset(offset).limit(limit))
    administrations = result.scalars().all()
    
    return {
        "success": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "administrations": [AdministrationResponse.model_validate(admin) for admin in administrations]
    }


@router.get("/{administration_id}", response_model=dict)
async def get_administration(
    administration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère les détails d'une administration
    """
    result = await db.execute(select(Administration).filter(Administration.id == administration_id))
    administration = result.scalars().first()
    
    if not administration:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    
    # Récupérer les services associés
    services = []
    if administration.service_ids:
        services_result = await db.execute(select(Service).filter(Service.id.in_(administration.service_ids)))
        services = services_result.scalars().all()
    
    return {
        "success": True,
        "administration": administration,
        "services": services
    }


@router.get("/{administration_id}/services", response_model=dict)
async def get_administration_services(
    administration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère tous les services d'une administration
    """
    result = await db.execute(select(Administration).filter(Administration.id == administration_id))
    administration = result.scalars().first()
    
    if not administration:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    
    services = []
    if administration.service_ids:
        services_result = await db.execute(select(Service).filter(Service.id.in_(administration.service_ids)))
        services = services_result.scalars().all()
    
    return {
        "success": True,
        "administration_id": administration_id,
        "administration_name": administration.name,
        "total_services": len(services),
        "services": services
    }


from app.services.smart_prediction import smart_prediction_service

@router.get("/{administration_id}/queue-status", response_model=dict)
async def get_administration_queue_status(
    administration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère le statut en temps réel des files d'attente d'une administration
    """
    result = await db.execute(select(Administration).filter(Administration.id == administration_id))
    administration = result.scalars().first()
    
    if not administration:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    
    # Récupérer les services avec leurs files d'attente
    services = []
    if administration.service_ids:
        services_result = await db.execute(select(Service).filter(Service.id.in_(administration.service_ids)))
        services = services_result.scalars().all()
    
    queue_details = []
    for service in services:
        # Préparer les données pour la prédiction intelligente
        service_data = {
            "id": service.id,
            "name": service.name,
            "type": service.category,
            "total_queue_size": service.current_queue_size,
            "total_active_counters": service.active_counters,
            "is_open": service.status.value == "ouvert"
        }
        
        # Obtenir la prédiction
        prediction = smart_prediction_service.predict_wait_time(service_data)
        
        queue_details.append({
            "service_id": service.id,
            "service_name": service.name,
            "status": service.status.value,
            "queue_size": service.current_queue_size,
            "wait_time": prediction["predicted_wait_time"], # Utiliser la prédiction intelligente
            "active_counters": service.active_counters,
            "current_ticket": service.current_ticket_number,
            "counters_detail": service.active_counters_detail,
            "prediction": prediction # Ajouter les détails complets (recommandations, facteurs, etc.)
        })
    
    return {
        "success": True,
        "administration_id": administration_id,
        "administration_name": administration.name,
        "is_open": administration.is_open,
        "total_queue_size": administration.total_queue_size,
        "average_wait_time": administration.average_wait_time,
        "total_active_counters": administration.total_active_counters,
        "queue_details": queue_details
    }


@router.post("/", response_model=dict)
async def create_administration(
    data: AdministrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Crée une nouvelle administration (admin only)
    """
    # Vérifier si le slug existe déjà
    result = await db.execute(select(Administration).filter(Administration.slug == data.slug))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Une administration avec ce slug existe déjà")
    
    administration = Administration(
        name=data.name,
        slug=data.slug,
        type=data.type,
        description=data.description,
        main_image_url=data.main_image_url,
        location=data.location,
        phone=data.phone,
        email=data.email,
        website=data.website,
        operating_hours=data.operating_hours,
        facilities=data.facilities or {}
    )
    
    db.add(administration)
    await db.commit()
    await db.refresh(administration)
    
    return {
        "success": True,
        "message": "Administration créée avec succès",
        "administration": administration
    }


@router.put("/{administration_id}", response_model=dict)
async def update_administration(
    administration_id: str,
    data: AdministrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Met à jour une administration (admin only)
    """
    result = await db.execute(select(Administration).filter(Administration.id == administration_id))
    administration = result.scalars().first()
    
    if not administration:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    
    # Mettre à jour les champs fournis
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(administration, field, value)
    
    await db.commit()
    await db.refresh(administration)
    
    return {
        "success": True,
        "message": "Administration mise à jour",
        "administration": administration
    }


@router.delete("/{administration_id}", response_model=dict)
async def delete_administration(
    administration_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Supprime une administration (admin only)
    """
    result = await db.execute(select(Administration).filter(Administration.id == administration_id))
    administration = result.scalars().first()
    
    if not administration:
        raise HTTPException(status_code=404, detail="Administration non trouvée")
    
    await db.delete(administration)
    await db.commit()
    
    return {
        "success": True,
        "message": "Administration supprimée"
    }
