"""
ViteviteApp - Tickets Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.core.database import get_db
from app.models.ticket import Ticket, TicketStatus
from app.models.service import Service
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketPublic, TicketResponse
from app.api.v1.deps import get_current_user, get_current_admin

router = APIRouter()


@router.post("", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouveau ticket"""
    
    # Vérifier que le service existe
    result = await db.execute(select(Service).where(Service.id == ticket_data.service_id))
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    if service.status != "ouvert":
        raise HTTPException(status_code=400, detail="Service fermé")
    
    # Compter les tickets actifs
    count_result = await db.execute(
        select(func.count(Ticket.id))
        .where(Ticket.service_id == service.id)
        .where(Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED, TicketStatus.SERVING]))
    )
    position = count_result.scalar() + 1
    
    # Générer le numéro de ticket
    ticket_number = f"N-{position:03d}"
    
    # Créer le ticket
    new_ticket = Ticket(
        service_id=service.id,
        user_id=current_user.id,
        ticket_number=ticket_number,
        position_in_queue=position,
        status=TicketStatus.PENDING_VALIDATION,  # Nouveau: nécessite validation admin
        user_name=ticket_data.user_name or current_user.full_name,
        user_phone=ticket_data.user_phone or current_user.phone,
        estimated_wait_time=service.estimated_wait_time,
        notes=ticket_data.notes
    )
    
    db.add(new_ticket)
    
    # Mettre à jour le service
    service.current_queue_size += 1
    
    await db.commit()
    await db.refresh(new_ticket)
    
    return TicketResponse(
        success=True,
        message="Ticket créé avec succès",
        ticket=TicketPublic.model_validate(new_ticket)
    )


@router.get("/{ticket_id}", response_model=dict)
async def get_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    """Récupère un ticket par ID"""
    
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    return {
        "success": True,
        "ticket": TicketPublic.model_validate(ticket)
    }


@router.get("/user/me", response_model=dict)
async def get_my_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les tickets de l'utilisateur connecté (sauf ceux en attente de validation)"""
    
    result = await db.execute(
        select(Ticket)
        .where(Ticket.user_id == current_user.id)
        .where(Ticket.status != TicketStatus.PENDING_VALIDATION)  # Filtrer les tickets non validés
        .order_by(Ticket.created_at.desc())
    )
    tickets = result.scalars().all()
    
    return {
        "success": True,
        "total": len(tickets),
        "tickets": [TicketPublic.model_validate(t) for t in tickets]
    }


@router.delete("/{ticket_id}")
async def cancel_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Annuler un ticket"""
    
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    if ticket.status in [TicketStatus.COMPLETED, TicketStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Ticket déjà terminé")
    
    ticket.status = TicketStatus.CANCELLED
    ticket.completed_at = datetime.utcnow().isoformat()
    
    # Mettre à jour le service
    service_result = await db.execute(select(Service).where(Service.id == ticket.service_id))
    service = service_result.scalar_one_or_none()
    if service:
        service.current_queue_size = max(0, service.current_queue_size - 1)
    
    await db.commit()
    
    return {"success": True, "message": "Ticket annulé"}


@router.get("")
async def get_all_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Récupère tous les tickets (admin only)"""
    
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    tickets = result.scalars().all()
    
    return {
        "success": True,
        "total": len(tickets),
        "tickets": [TicketPublic.model_validate(t) for t in tickets]
    }


@router.post("/call-next/{service_id}")
async def call_next_ticket(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Appeler le prochain ticket (admin only)"""
    
    result = await db.execute(
        select(Ticket)
        .where(Ticket.service_id == service_id)
        .where(Ticket.status == TicketStatus.WAITING)
        .order_by(Ticket.created_at)
    )
    ticket = result.scalars().first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Aucun ticket en attente")
    
    ticket.status = TicketStatus.CALLED
    ticket.called_at = datetime.utcnow().isoformat()
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": "Ticket appelé",
        "ticket": TicketPublic.model_validate(ticket)
    }


@router.post("/{ticket_id}/complete")
async def complete_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Marquer un ticket comme terminé (admin only)"""
    
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    ticket.status = TicketStatus.COMPLETED
    ticket.completed_at = datetime.utcnow().isoformat()
    
    # Mettre à jour le service
    service_result = await db.execute(select(Service).where(Service.id == ticket.service_id))
    service = service_result.scalar_one_or_none()
    if service:
        service.current_queue_size = max(0, service.current_queue_size - 1)
        service.total_tickets_served += 1
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": "Ticket terminé",
        "ticket": TicketPublic.model_validate(ticket)
    }


@router.get("/stats/today")
async def get_today_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Statistiques du jour (admin only)"""
    
    today = datetime.utcnow().date()
    
    # Total tickets aujourd'hui
    total_result = await db.execute(
        select(func.count(Ticket.id))
        .where(func.date(Ticket.created_at) == today)
    )
    total_tickets = total_result.scalar()
    
    # Tickets actifs
    active_result = await db.execute(
        select(func.count(Ticket.id))
        .where(Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED, TicketStatus.SERVING]))
    )
    active_tickets = active_result.scalar()
    
    # Tickets terminés
    completed_result = await db.execute(
        select(func.count(Ticket.id))
        .where(Ticket.status == TicketStatus.COMPLETED)
        .where(func.date(Ticket.created_at) == today)
    )
    completed_tickets = completed_result.scalar()
    
    # Services ouverts
    services_result = await db.execute(
        select(func.count(Service.id))
        .where(Service.status == "ouvert")
    )
    services_open = services_result.scalar()
    
    return {
        "total_tickets_today": total_tickets,
        "active_tickets": active_tickets,
        "completed_tickets": completed_tickets,
        "average_wait_time": 25,
        "services_open": services_open
    }


@router.get("/pending-validation")
async def get_pending_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Récupère tous les tickets en attente de validation (admin only)"""
    
    result = await db.execute(
        select(Ticket)
        .where(Ticket.status == TicketStatus.PENDING_VALIDATION)
        .order_by(Ticket.created_at.asc())
    )
    tickets = result.scalars().all()
    
    return {
        "success": True,
        "total": len(tickets),
        "tickets": [TicketPublic.model_validate(t) for t in tickets]
    }


@router.post("/{ticket_id}/validate")
async def validate_ticket(
    ticket_id: str,
    action: str,  # "confirm" ou "reject"
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Valider ou rejeter un ticket (admin only)"""
    
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.status != TicketStatus.PENDING_VALIDATION:
        raise HTTPException(status_code=400, detail="Ce ticket n'est pas en attente de validation")
    
    if action == "confirm":
        ticket.status = TicketStatus.WAITING
        message = "Ticket confirmé et ajouté à la file d'attente"
    elif action == "reject":
        ticket.status = TicketStatus.REJECTED
        ticket.completed_at = datetime.utcnow().isoformat()
        # Mettre à jour le service
        service_result = await db.execute(select(Service).where(Service.id == ticket.service_id))
        service = service_result.scalar_one_or_none()
        if service:
            service.current_queue_size = max(0, service.current_queue_size - 1)
        message = "Ticket refusé"
    else:
        raise HTTPException(status_code=400, detail="Action invalide. Utilisez 'confirm' ou 'reject'")
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": message,
        "ticket": TicketPublic.model_validate(ticket)
    }