"""
ViteviteApp - Service Configuration Endpoints
API pour le paramétrage détaillé des services
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.service import Service
from app.models.service_config import ServiceConfig
from app.schemas.service_config import (
    ServiceConfigCreate,
    ServiceConfigUpdate,
    ServiceConfigResponse,
    DocumentRequired
)

router = APIRouter()


# ========== CREATE OR UPDATE SERVICE CONFIG ==========
@router.post("/{service_id}/config", response_model=ServiceConfigResponse)
async def create_or_update_service_config(
    service_id: str,
    config_data: ServiceConfigCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Créer ou mettre à jour la configuration d'un service
    """
    # Vérifier que le service existe
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Vérifier si une config existe déjà
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    existing_config = result.scalar_one_or_none()
    
    if existing_config:
        # Mettre à jour la config existante
        for key, value in config_data.dict(exclude_unset=True).items():
            if key != "service_id":  # Ne pas changer le service_id
                setattr(existing_config, key, value)
        
        existing_config.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_config)
        
        return existing_config
    else:
        # Créer une nouvelle config
        new_config = ServiceConfig(**config_data.dict())
        db.add(new_config)
        await db.commit()
        await db.refresh(new_config)
        
        return new_config


# ========== GET SERVICE CONFIG ==========
@router.get("/{service_id}/config", response_model=ServiceConfigResponse)
async def get_service_config(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer la configuration d'un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    return config


# ========== UPDATE SERVICE CONFIG ==========
@router.patch("/{service_id}/config", response_model=ServiceConfigResponse)
async def update_service_config(
    service_id: str,
    config_data: ServiceConfigUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Mettre à jour partiellement la configuration d'un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    # Mettre à jour les champs fournis
    for key, value in config_data.dict(exclude_unset=True).items():
        setattr(config, key, value)
    
    config.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(config)
    
    return config


# ========== MANAGE REQUIRED DOCUMENTS ==========
@router.patch("/{service_id}/documents")
async def manage_required_documents(
    service_id: str,
    documents: List[DocumentRequired],
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Gérer les documents requis pour un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    # Convertir les documents en dict
    documents_list = [doc.dict() for doc in documents]
    
    config.required_documents = documents_list
    config.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "success": True,
        "message": f"{len(documents_list)} documents requis mis à jour",
        "required_documents": config.required_documents
    }


# ========== MANAGE OPENING HOURS ==========
@router.patch("/{service_id}/hours")
async def manage_opening_hours(
    service_id: str,
    opening_hours: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Gérer les horaires d'ouverture d'un service
    Format attendu:
    {
        "lundi": {"open": "08:00", "close": "17:00", "is_open": true},
        "mardi": {"open": "08:00", "close": "17:00", "is_open": true},
        ...
    }
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    # Valider les jours
    valid_days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    for day in opening_hours.keys():
        if day not in valid_days:
            raise HTTPException(
                status_code=400,
                detail=f"Jour invalide: {day}. Jours acceptés: {valid_days}"
            )
    
    config.opening_hours = opening_hours
    config.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "success": True,
        "message": "Horaires d'ouverture mis à jour",
        "opening_hours": config.opening_hours
    }


# ========== MANAGE PRICING ==========
@router.patch("/{service_id}/pricing")
async def manage_pricing(
    service_id: str,
    is_paid_service: bool,
    price: float = 0.0,
    currency: str = "FCFA",
    payment_methods: List[str] = [],
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Gérer les tarifs d'un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    config.is_paid_service = is_paid_service
    config.price = price
    config.currency = currency
    config.payment_methods = payment_methods
    config.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "success": True,
        "message": "Tarification mise à jour",
        "pricing": {
            "is_paid_service": config.is_paid_service,
            "price": config.price,
            "currency": config.currency,
            "payment_methods": config.payment_methods
        }
    }


# ========== MANAGE PROCESSING TIME ==========
@router.patch("/{service_id}/processing-time")
async def manage_processing_time(
    service_id: str,
    average_processing_time: int,
    min_processing_time: int = None,
    max_processing_time: int = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Définir les temps de traitement pour un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    config.average_processing_time = average_processing_time
    
    if min_processing_time is not None:
        config.min_processing_time = min_processing_time
    
    if max_processing_time is not None:
        config.max_processing_time = max_processing_time
    
    config.updated_at = datetime.utcnow()
    
    # Mettre à jour aussi le service
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    if service:
        service.average_service_time = average_processing_time
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "success": True,
        "message": "Temps de traitement mis à jour",
        "processing_time": {
            "average": config.average_processing_time,
            "min": config.min_processing_time,
            "max": config.max_processing_time
        }
    }


# ========== DELETE SERVICE CONFIG ==========
@router.delete("/{service_id}/config")
async def delete_service_config(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Supprimer la configuration d'un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration non trouvée")
    
    await db.delete(config)
    await db.commit()
    
    return {
        "success": True,
        "message": "Configuration supprimée"
    }
