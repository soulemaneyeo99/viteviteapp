"""
ViteviteApp - Queue Management Endpoints
API pour la gestion dynamique des files d'attente
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.ticket import Ticket, TicketStatus
from app.models.counter import Counter
from app.models.service import Service

router = APIRouter()


# ========== SCHEMAS ==========
class TicketMove(BaseModel):
    """Déplacer un ticket vers un autre guichet"""
    ticket_id: str
    target_counter_id: str


class TicketPrioritize(BaseModel):
    """Prioriser un ticket"""
    ticket_id: str
    new_position: int


class QueueMerge(BaseModel):
    """Fusionner deux files"""
    source_counter_id: str
    target_counter_id: str


class QueueReorganize(BaseModel):
    """Réorganiser la file"""
    service_id: str
    ticket_order: List[str]  # Liste des IDs de tickets dans le nouvel ordre


# ========== MOVE TICKET TO ANOTHER COUNTER ==========
@router.post("/move")
async def move_ticket_to_counter(
    move_data: TicketMove,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Déplacer un usager vers un autre guichet
    """
    # Récupérer le ticket
    stmt = select(Ticket).where(Ticket.id == move_data.ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.status not in [TicketStatus.WAITING, TicketStatus.CALLED]:
        raise HTTPException(
            status_code=400,
            detail="Seuls les tickets en attente ou appelés peuvent être déplacés"
        )
    
    # Récupérer le guichet cible
    stmt = select(Counter).where(Counter.id == move_data.target_counter_id)
    result = await db.execute(stmt)
    target_counter = result.scalar_one_or_none()
    
    if not target_counter:
        raise HTTPException(status_code=404, detail="Guichet cible non trouvé")
    
    if not target_counter.is_open:
        raise HTTPException(status_code=400, detail="Le guichet cible n'est pas ouvert")
    
    # Vérifier que le guichet cible est du même service
    if target_counter.service_id != ticket.service_id:
        raise HTTPException(
            status_code=400,
            detail="Le guichet cible doit appartenir au même service"
        )
    
    # Déplacer le ticket
    old_counter_id = ticket.counter_id
    ticket.counter_id = move_data.target_counter_id
    ticket.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": f"Ticket {ticket.ticket_number} déplacé vers le guichet {target_counter.counter_number}",
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "old_counter_id": old_counter_id,
            "new_counter_id": ticket.counter_id
        }
    }


# ========== PRIORITIZE TICKET ==========
@router.post("/prioritize")
async def prioritize_ticket(
    prioritize_data: TicketPrioritize,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Prioriser un ticket urgent (femme enceinte, handicapé, etc.)
    """
    # Récupérer le ticket
    stmt = select(Ticket).where(Ticket.id == prioritize_data.ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.status != TicketStatus.WAITING:
        raise HTTPException(
            status_code=400,
            detail="Seuls les tickets en attente peuvent être priorisés"
        )
    
    # Récupérer tous les tickets en attente du même service
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == ticket.service_id,
            Ticket.status == TicketStatus.WAITING
        )
    ).order_by(Ticket.position_in_queue)
    result = await db.execute(stmt)
    waiting_tickets = result.scalars().all()
    
    if prioritize_data.new_position < 1 or prioritize_data.new_position > len(waiting_tickets):
        raise HTTPException(
            status_code=400,
            detail=f"Position invalide. Doit être entre 1 et {len(waiting_tickets)}"
        )
    
    # Réorganiser les positions
    old_position = ticket.position_in_queue
    new_position = prioritize_data.new_position
    
    # Mettre à jour les positions
    for t in waiting_tickets:
        if t.id == ticket.id:
            t.position_in_queue = new_position
        elif old_position < new_position:
            # Déplacer vers le bas
            if old_position < t.position_in_queue <= new_position:
                t.position_in_queue -= 1
        else:
            # Déplacer vers le haut
            if new_position <= t.position_in_queue < old_position:
                t.position_in_queue += 1
        
        t.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"Ticket {ticket.ticket_number} priorisé à la position {new_position}",
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "old_position": old_position,
            "new_position": new_position
        }
    }


# ========== MERGE QUEUES ==========
@router.post("/merge")
async def merge_queues(
    merge_data: QueueMerge,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Fusionner deux files d'attente (déplacer tous les tickets d'un guichet vers un autre)
    """
    # Récupérer les guichets
    stmt = select(Counter).where(Counter.id == merge_data.source_counter_id)
    result = await db.execute(stmt)
    source_counter = result.scalar_one_or_none()
    
    if not source_counter:
        raise HTTPException(status_code=404, detail="Guichet source non trouvé")
    
    stmt = select(Counter).where(Counter.id == merge_data.target_counter_id)
    result = await db.execute(stmt)
    target_counter = result.scalar_one_or_none()
    
    if not target_counter:
        raise HTTPException(status_code=404, detail="Guichet cible non trouvé")
    
    # Vérifier que les guichets sont du même service
    if source_counter.service_id != target_counter.service_id:
        raise HTTPException(
            status_code=400,
            detail="Les guichets doivent appartenir au même service"
        )
    
    # Récupérer tous les tickets en attente du guichet source
    stmt = select(Ticket).where(
        and_(
            Ticket.counter_id == merge_data.source_counter_id,
            Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED])
        )
    )
    result = await db.execute(stmt)
    tickets_to_move = result.scalars().all()
    
    if not tickets_to_move:
        return {
            "success": True,
            "message": "Aucun ticket à déplacer",
            "tickets_moved": 0
        }
    
    # Déplacer tous les tickets vers le guichet cible
    tickets_moved = 0
    for ticket in tickets_to_move:
        ticket.counter_id = merge_data.target_counter_id
        ticket.updated_at = datetime.utcnow()
        tickets_moved += 1
    
    # Fermer le guichet source
    source_counter.status = "fermé"
    source_counter.updated_at = datetime.utcnow()
    
    # Mettre à jour le service
    stmt = select(Service).where(Service.id == source_counter.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    if service:
        service.active_counters = max(0, service.active_counters - 1)
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"{tickets_moved} tickets déplacés du guichet {source_counter.counter_number} vers le guichet {target_counter.counter_number}",
        "tickets_moved": tickets_moved,
        "source_counter": {
            "id": source_counter.id,
            "number": source_counter.counter_number,
            "status": source_counter.status
        },
        "target_counter": {
            "id": target_counter.id,
            "number": target_counter.counter_number
        }
    }


# ========== REORGANIZE QUEUE ==========
@router.post("/reorganize")
async def reorganize_queue(
    reorganize_data: QueueReorganize,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Réorganiser complètement la file d'attente d'un service
    """
    # Vérifier que le service existe
    stmt = select(Service).where(Service.id == reorganize_data.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Récupérer tous les tickets en attente
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == reorganize_data.service_id,
            Ticket.status == TicketStatus.WAITING
        )
    )
    result = await db.execute(stmt)
    waiting_tickets = result.scalars().all()
    
    # Créer un dictionnaire pour un accès rapide
    tickets_dict = {str(t.id): t for t in waiting_tickets}
    
    # Vérifier que tous les IDs sont valides
    for ticket_id in reorganize_data.ticket_order:
        if ticket_id not in tickets_dict:
            raise HTTPException(
                status_code=400,
                detail=f"Ticket {ticket_id} non trouvé ou pas en attente"
            )
    
    # Vérifier que tous les tickets sont inclus
    if len(reorganize_data.ticket_order) != len(waiting_tickets):
        raise HTTPException(
            status_code=400,
            detail="Tous les tickets en attente doivent être inclus dans le nouvel ordre"
        )
    
    # Réorganiser les positions
    for new_position, ticket_id in enumerate(reorganize_data.ticket_order, start=1):
        ticket = tickets_dict[ticket_id]
        ticket.position_in_queue = new_position
        ticket.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"File d'attente réorganisée pour le service {service.name}",
        "total_tickets": len(reorganize_data.ticket_order)
    }


# ========== GET QUEUE STATUS ==========
@router.get("/status/{service_id}")
async def get_queue_status(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer l'état actuel de la file d'attente d'un service
    """
    # Récupérer le service
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Récupérer tous les tickets actifs
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == service_id,
            Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED, TicketStatus.SERVING])
        )
    ).order_by(Ticket.position_in_queue)
    result = await db.execute(stmt)
    active_tickets = result.scalars().all()
    
    # Récupérer les guichets
    stmt = select(Counter).where(Counter.service_id == service_id)
    result = await db.execute(stmt)
    counters = result.scalars().all()
    
    return {
        "success": True,
        "service": {
            "id": service.id,
            "name": service.name,
            "status": service.status,
            "current_queue_size": service.current_queue_size
        },
        "counters": [
            {
                "id": c.id,
                "number": c.counter_number,
                "status": c.status,
                "agent_id": c.agent_id,
                "current_ticket_id": c.current_ticket_id
            }
            for c in counters
        ],
        "active_tickets": [
            {
                "id": t.id,
                "ticket_number": t.ticket_number,
                "user_name": t.user_name,
                "status": t.status,
                "position_in_queue": t.position_in_queue,
                "counter_id": t.counter_id,
                "estimated_wait_time": t.estimated_wait_time
            }
            for t in active_tickets
        ],
        "total_active_tickets": len(active_tickets)
    }
