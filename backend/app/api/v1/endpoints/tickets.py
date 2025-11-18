"""
ViteviteApp - Tickets Endpoints
Gestion complète des tickets virtuels (création, suivi, annulation)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.crud.ticket import ticket_crud
from app.crud.service import service_crud
from app.schemas.ticket import (
    TicketPublic,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketsListResponse,
    TicketStatsResponse
)
from app.utils.dependencies import get_current_admin, get_optional_user
from app.models.user import User
from app.models.ticket import TicketStatus


router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_in: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    🎫 **Créer un ticket virtuel**
    
    Prend un ticket dans la file d'attente d'un service.
    
    - **service_id**: ID du service (requis)
    - **user_name**: Nom (optionnel)
    - **user_phone**: Téléphone (optionnel)
    - **notes**: Notes additionnelles (optionnel)
    
    Returns:
        - Ticket créé avec numéro, position, temps d'attente estimé
    """
    # Vérifier que le service existe
    service = await service_crud.get(db, id=ticket_in.service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    # Vérifier que le service est ouvert
    if not service.is_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Le service est actuellement {service.status}. Réessayez plus tard."
        )
    
    # Vérifier que la file n'est pas pleine
    if service.queue_is_full:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La file d'attente est pleine. Réessayez plus tard."
        )
    
    # Créer le ticket
    user_id = current_user.id if current_user else None
    ticket = await ticket_crud.create_with_service(
        db,
        obj_in=ticket_in,
        user_id=user_id,
        service=service
    )
    
    # Incrémenter la file du service
    await service_crud.increment_queue(db, service=service)
    
    # Mettre à jour le temps d'attente estimé
    await service_crud.update_estimated_wait_time(db, service=service)
    
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        success=True,
        message=f"Ticket {ticket.ticket_number} créé avec succès",
        ticket=TicketPublic.model_validate(ticket)
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🔍 **Obtenir un ticket par ID**
    
    - **ticket_id**: ID unique du ticket
    
    Returns:
        - Détails complets du ticket (statut, position, etc.)
    """
    ticket = await ticket_crud.get(db, id=ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trouvé"
        )
    
    return TicketResponse(
        success=True,
        message="Ticket trouvé",
        ticket=TicketPublic.model_validate(ticket)
    )


@router.get("/service/{service_id}", response_model=TicketsListResponse)
async def get_tickets_by_service(
    service_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """
    📋 **Lister les tickets d'un service**
    
    - **service_id**: ID du service
    - **skip**: Pagination (offset)
    - **limit**: Nombre max de résultats
    - **active_only**: Ne retourner que les tickets actifs (en attente/appelés)
    
    Returns:
        - Liste des tickets du service
    """
    # Vérifier que le service existe
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    if active_only:
        tickets = await ticket_crud.get_active_by_service(db, service_id=service_id)
    else:
        tickets = await ticket_crud.get_by_service(
            db,
            service_id=service_id,
            skip=skip,
            limit=limit
        )
    
    total = await ticket_crud.count_for_service(db, service_id=service_id)
    
    return TicketsListResponse(
        success=True,
        total=total,
        tickets=[TicketPublic.model_validate(t) for t in tickets]
    )


@router.get("/user/me", response_model=TicketsListResponse)
async def get_my_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """
    👤 **Obtenir mes tickets**
    
    Nécessite une authentification.
    
    Returns:
        - Liste des tickets de l'utilisateur connecté
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise pour voir vos tickets"
        )
    
    tickets = await ticket_crud.get_by_user(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    return TicketsListResponse(
        success=True,
        total=len(tickets),
        tickets=[TicketPublic.model_validate(t) for t in tickets]
    )


@router.delete("/{ticket_id}", response_model=TicketResponse)
async def cancel_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    ❌ **Annuler un ticket**
    
    - **ticket_id**: ID du ticket à annuler
    
    Un utilisateur ne peut annuler que ses propres tickets.
    Les admins peuvent annuler n'importe quel ticket.
    
    Returns:
        - Ticket annulé
    """
    ticket = await ticket_crud.get(db, id=ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trouvé"
        )
    
    # Vérifier les permissions
    if current_user:
        if ticket.user_id and ticket.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez annuler que vos propres tickets"
            )
    
    # Vérifier que le ticket peut être annulé
    if ticket.status not in [TicketStatus.WAITING, TicketStatus.CALLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce ticket ne peut plus être annulé"
        )
    
    # Annuler le ticket
    ticket.mark_as_cancelled()
    db.add(ticket)
    
    # Décrémenter la file du service
    service = await service_crud.get(db, id=ticket.service_id)
    if service:
        await service_crud.decrement_queue(db, service=service)
        await service_crud.update_estimated_wait_time(db, service=service)
    
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        success=True,
        message="Ticket annulé avec succès",
        ticket=TicketPublic.model_validate(ticket)
    )


# ========== ADMIN ENDPOINTS ==========

@router.post("/call-next/{service_id}", response_model=TicketResponse)
async def call_next_ticket(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    🔔 **Appeler le prochain ticket** (Admin only)
    
    - **service_id**: ID du service
    
    Appelle le prochain ticket en attente dans la file.
    
    Returns:
        - Ticket appelé
    """
    # Vérifier que le service existe
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    # Trouver le prochain ticket en attente
    next_ticket = await ticket_crud.get_next_waiting(db, service_id=service_id)
    
    if not next_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun ticket en attente"
        )
    
    # Appeler le ticket
    next_ticket.mark_as_called()
    db.add(next_ticket)
    
    await db.commit()
    await db.refresh(next_ticket)
    
    return TicketResponse(
        success=True,
        message=f"Ticket {next_ticket.ticket_number} appelé",
        ticket=TicketPublic.model_validate(next_ticket)
    )


@router.post("/{ticket_id}/complete", response_model=TicketResponse)
async def complete_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    ✅ **Marquer un ticket comme complété** (Admin only)
    
    - **ticket_id**: ID du ticket
    
    Returns:
        - Ticket complété
    """
    ticket = await ticket_crud.get(db, id=ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trouvé"
        )
    
    # Marquer comme complété
    ticket.mark_as_completed()
    db.add(ticket)
    
    # Décrémenter la file et incrémenter tickets servis
    service = await service_crud.get(db, id=ticket.service_id)
    if service:
        await service_crud.decrement_queue(db, service=service)
        await service_crud.update_estimated_wait_time(db, service=service)
        await service_crud.increment_tickets_served(db, service=service)
    
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        success=True,
        message="Ticket marqué comme complété",
        ticket=TicketPublic.model_validate(ticket)
    )


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_in: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    ✏️ **Mettre à jour un ticket** (Admin only)
    
    - **ticket_id**: ID du ticket
    
    Returns:
        - Ticket mis à jour
    """
    ticket = await ticket_crud.get(db, id=ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trouvé"
        )
    
    ticket = await ticket_crud.update(db, db_obj=ticket, obj_in=ticket_in)
    await db.commit()
    
    return TicketResponse(
        success=True,
        message="Ticket mis à jour",
        ticket=TicketPublic.model_validate(ticket)
    )


@router.get("/stats/today", response_model=TicketStatsResponse)
async def get_today_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    📊 **Statistiques du jour** (Admin only)
    
    Returns:
        - Nombre de tickets aujourd'hui
        - Tickets actifs
        - Tickets complétés
        - Temps d'attente moyen
        - Services ouverts
        - Service le plus occupé
    """
    total_today = await ticket_crud.count_today(db)
    completed = await ticket_crud.count_completed_today(db)
    avg_wait = await ticket_crud.get_average_wait_time(db)
    
    # Compter tickets actifs (tous services)
    all_tickets = await ticket_crud.get_multi(db, limit=1000)
    active = len([t for t in all_tickets if t.is_active])
    
    # Services ouverts
    services_open = await service_crud.count_open_services(db)
    
    # Service le plus occupé
    busiest = await service_crud.get_busiest_service(db)
    busiest_name = busiest.name if busiest else None
    
    return TicketStatsResponse(
        success=True,
        total_tickets_today=total_today,
        active_tickets=active,
        completed_tickets=completed,
        average_wait_time=avg_wait,
        services_open=services_open,
        busiest_service=busiest_name
    )