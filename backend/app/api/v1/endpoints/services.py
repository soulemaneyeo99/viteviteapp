"""
ViteviteApp - Services Endpoints
CRUD et gestion des services (mairies, banques, hôpitaux, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.crud.service import service_crud
from app.crud.ticket import ticket_crud
from app.schemas.service import (
    ServicePublic,
    ServiceCreate,
    ServiceUpdate,
    ServicesListResponse,
    QueueInfo,
    QueueInfoResponse
)
from app.utils.dependencies import get_current_admin, get_optional_user
from app.models.user import User


router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=ServicesListResponse)
async def get_all_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    📋 **Lister tous les services**
    
    Paramètres de pagination et filtrage:
    - **skip**: Nombre d'éléments à ignorer (pagination)
    - **limit**: Nombre maximum d'éléments (max 100)
    - **category**: Filtrer par catégorie (optionnel)
    - **status**: Filtrer par statut (optionnel)
    
    Returns:
        - Liste des services disponibles
    """
    filters = {}
    if category:
        filters["category"] = category
    if status:
        filters["status"] = status
    
    services = await service_crud.get_multi(
        db,
        skip=skip,
        limit=limit,
        filters=filters if filters else None
    )
    
    total = await service_crud.count(db, filters=filters if filters else None)
    
    return ServicesListResponse(
        success=True,
        total=total,
        services=[ServicePublic.model_validate(s) for s in services]
    )


@router.get("/open", response_model=List[ServicePublic])
async def get_open_services(
    db: AsyncSession = Depends(get_db)
):
    """
    🟢 **Lister uniquement les services ouverts**
    
    Utile pour afficher les services disponibles en ce moment.
    
    Returns:
        - Liste des services avec status="ouvert"
    """
    services = await service_crud.get_open_services(db)
    return [ServicePublic.model_validate(s) for s in services]


@router.get("/{service_id}", response_model=ServicePublic)
async def get_service(
    service_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🔍 **Obtenir un service par ID**
    
    - **service_id**: ID unique du service
    
    Returns:
        - Détails complets du service
    """
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    return ServicePublic.model_validate(service)


@router.get("/{service_id}/queue", response_model=QueueInfoResponse)
async def get_service_queue_info(
    service_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    📊 **Obtenir les informations de la file d'attente**
    
    - **service_id**: ID du service
    
    Returns:
        - Taille de la file
        - Temps d'attente estimé
        - Niveau d'affluence
        - Statut du service
    """
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    queue_info = QueueInfo(
        service_id=service.id,
        service_name=service.name,
        status=service.status,
        queue_size=service.current_queue_size,
        estimated_wait_time=service.estimated_wait_time,
        affluence_level=service.affluence_level,
        is_accepting_tickets=service.is_open and not service.queue_is_full
    )
    
    return QueueInfoResponse(
        success=True,
        queue_info=queue_info
    )


@router.get("/slug/{slug}", response_model=ServicePublic)
async def get_service_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🔗 **Obtenir un service par slug**
    
    - **slug**: Slug unique du service (ex: "mairie-cocody")
    
    Returns:
        - Détails du service
    """
    service = await service_crud.get_by_slug(db, slug=slug)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    return ServicePublic.model_validate(service)


# ========== ADMIN ENDPOINTS ==========

@router.post("", response_model=ServicePublic, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_in: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    ➕ **Créer un nouveau service** (Admin only)
    
    Nécessite des permissions administrateur.
    
    Returns:
        - Service créé
    """
    # Vérifier si slug existe déjà
    existing = await service_crud.get_by_slug(db, slug=service_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un service avec ce slug existe déjà"
        )
    
    service = await service_crud.create(db, obj_in=service_in)
    await db.commit()
    
    return ServicePublic.model_validate(service)


@router.patch("/{service_id}", response_model=ServicePublic)
async def update_service(
    service_id: str,
    service_in: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    ✏️ **Mettre à jour un service** (Admin only)
    
    - **service_id**: ID du service à modifier
    
    Nécessite des permissions administrateur.
    
    Returns:
        - Service mis à jour
    """
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    service = await service_crud.update(db, db_obj=service, obj_in=service_in)
    await db.commit()
    
    return ServicePublic.model_validate(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    🗑️ **Supprimer un service** (Admin only)
    
    - **service_id**: ID du service à supprimer
    
    ⚠️ Supprime aussi tous les tickets associés (cascade).
    
    Nécessite des permissions administrateur.
    """
    service = await service_crud.remove(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    await db.commit()
    return None