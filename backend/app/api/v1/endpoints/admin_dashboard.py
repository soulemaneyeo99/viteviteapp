"""
ViteviteApp - Admin Dashboard Endpoints
API pour le panneau d'administration avec statistiques en temps réel
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.ticket import Ticket, TicketStatus
from app.models.counter import Counter
from app.models.service import Service

router = APIRouter()


# ========== SCHEMAS ==========
class WalkInTicketCreate(BaseModel):
    """Créer un ticket pour un usager qui arrive sur place"""
    service_id: str
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    notes: Optional[str] = None
    priority: int = 0  # 0=normal, 1=prioritaire


class AssignCounter(BaseModel):
    """Assigner un ticket à un guichet"""
    ticket_id: str
    counter_id: str


class CompleteTicket(BaseModel):
    """Marquer un ticket comme terminé"""
    ticket_id: str
    service_duration: Optional[int] = None  # En minutes
    notes: Optional[str] = None


# ========== DASHBOARD OVERVIEW ==========
@router.get("/overview")
async def get_dashboard_overview(
    service_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Vue d'ensemble du dashboard admin
    Statistiques globales ou par service
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Base query
    base_query = select(Ticket)
    if service_id:
        base_query = base_query.where(Ticket.service_id == service_id)
    
    # Total en attente
    waiting_query = base_query.where(Ticket.status == TicketStatus.WAITING)
    result = await db.execute(waiting_query)
    total_waiting = len(result.scalars().all())
    
    # Servis aujourd'hui
    served_today_query = base_query.where(
        and_(
            Ticket.status == TicketStatus.COMPLETED,
            Ticket.completed_at >= today_start
        )
    )
    result = await db.execute(served_today_query)
    served_today = len(result.scalars().all())
    
    # Temps d'attente moyen
    completed_today_query = base_query.where(
        and_(
            Ticket.status == TicketStatus.COMPLETED,
            Ticket.completed_at >= today_start,
            Ticket.estimated_wait_time.isnot(None)
        )
    )
    result = await db.execute(completed_today_query)
    completed_tickets = result.scalars().all()
    
    avg_wait_time = 0
    if completed_tickets:
        total_wait = sum(t.estimated_wait_time or 0 for t in completed_tickets)
        avg_wait_time = total_wait // len(completed_tickets)
    
    # Guichets actifs
    counters_query = select(Counter)
    if service_id:
        counters_query = counters_query.where(Counter.service_id == service_id)
    
    result = await db.execute(counters_query)
    all_counters = result.scalars().all()
    active_counters = len([c for c in all_counters if c.is_open])
    
    # Statistiques par service
    services_query = select(Service)
    if service_id:
        services_query = services_query.where(Service.id == service_id)
    
    result = await db.execute(services_query)
    services = result.scalars().all()
    
    service_stats = []
    for service in services:
        # Tickets en attente pour ce service
        waiting_stmt = select(Ticket).where(
            and_(
                Ticket.service_id == service.id,
                Ticket.status == TicketStatus.WAITING
            )
        )
        result = await db.execute(waiting_stmt)
        service_waiting = len(result.scalars().all())
        
        # Servis aujourd'hui pour ce service
        served_stmt = select(Ticket).where(
            and_(
                Ticket.service_id == service.id,
                Ticket.status == TicketStatus.COMPLETED,
                Ticket.completed_at >= today_start
            )
        )
        result = await db.execute(served_stmt)
        service_served = len(result.scalars().all())
        
        service_stats.append({
            "service_id": service.id,
            "service_name": service.name,
            "waiting": service_waiting,
            "served_today": service_served,
            "avg_wait_time": service.estimated_wait_time or 0,
            "active_counters": service.active_counters or 0
        })
    
    return {
        "success": True,
        "overview": {
            "total_waiting": total_waiting,
            "served_today": served_today,
            "avg_wait_time": avg_wait_time,
            "active_counters": active_counters,
            "total_counters": len(all_counters)
        },
        "services": service_stats,
        "timestamp": datetime.utcnow().isoformat()
    }


# ========== CREATE WALK-IN TICKET ==========
@router.post("/walk-in")
async def create_walkin_ticket(
    ticket_data: WalkInTicketCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Créer un ticket pour un usager qui arrive sur place
    L'agent sélectionne le service et ajoute l'usager dans la file
    """
    # Vérifier que le service existe
    stmt = select(Service).where(Service.id == ticket_data.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    if service.status != "ouvert":
        raise HTTPException(status_code=400, detail="Le service est fermé")
    
    # Générer le numéro de ticket
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.count(Ticket.id)).where(
        and_(
            Ticket.service_id == ticket_data.service_id,
            Ticket.created_at >= today_start
        )
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0
    
    ticket_number = f"{service.name[:3].upper()}{count + 1:03d}"
    
    # Calculer la position dans la file
    stmt = select(func.count(Ticket.id)).where(
        and_(
            Ticket.service_id == ticket_data.service_id,
            Ticket.status == TicketStatus.WAITING
        )
    )
    result = await db.execute(stmt)
    position = (result.scalar() or 0) + 1
    
    # Créer le ticket
    new_ticket = Ticket(
        service_id=ticket_data.service_id,
        ticket_number=ticket_number,
        user_name=ticket_data.user_name or "Usager sur place",
        user_phone=ticket_data.user_phone,
        status=TicketStatus.WAITING,
        position_in_queue=position,
        estimated_wait_time=service.estimated_wait_time or 15,
        reservation_type="on_site",
        notes=ticket_data.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_ticket)
    
    # Mettre à jour le service
    service.current_queue_size = (service.current_queue_size or 0) + 1
    service.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(new_ticket)
    
    return {
        "success": True,
        "message": f"Ticket {ticket_number} créé avec succès",
        "ticket": {
            "id": new_ticket.id,
            "ticket_number": new_ticket.ticket_number,
            "position_in_queue": new_ticket.position_in_queue,
            "estimated_wait_time": new_ticket.estimated_wait_time,
            "service_name": service.name,
            "created_at": new_ticket.created_at.isoformat()
        }
    }


# ========== CALL NEXT TICKET ==========
@router.post("/call-next/{counter_id}")
async def call_next_ticket(
    counter_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Appeler automatiquement le prochain ticket dans la file
    Utilisé quand un agent termine un dossier
    """
    # Récupérer le guichet
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    if not counter.is_open:
        raise HTTPException(status_code=400, detail="Le guichet est fermé")
    
    # Trouver le prochain ticket en attente
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == counter.service_id,
            Ticket.status == TicketStatus.WAITING
        )
    ).order_by(Ticket.position_in_queue).limit(1)
    
    result = await db.execute(stmt)
    next_ticket = result.scalar_one_or_none()
    
    if not next_ticket:
        return {
            "success": True,
            "message": "Aucun ticket en attente",
            "ticket": None
        }
    
    # Marquer le ticket comme appelé
    next_ticket.status = TicketStatus.CALLED
    next_ticket.counter_id = counter_id
    next_ticket.called_at = datetime.utcnow()
    next_ticket.updated_at = datetime.utcnow()
    
    # Mettre à jour le guichet
    counter.current_ticket_id = next_ticket.id
    counter.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(next_ticket)
    
    return {
        "success": True,
        "message": f"Ticket {next_ticket.ticket_number} appelé",
        "ticket": {
            "id": next_ticket.id,
            "ticket_number": next_ticket.ticket_number,
            "user_name": next_ticket.user_name,
            "counter_number": counter.counter_number,
            "called_at": next_ticket.called_at.isoformat()
        }
    }


# ========== COMPLETE TICKET ==========
@router.post("/complete")
async def complete_ticket(
    complete_data: CompleteTicket,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Marquer un ticket comme terminé
    Déclenche automatiquement l'appel du prochain ticket
    """
    # Récupérer le ticket
    stmt = select(Ticket).where(Ticket.id == complete_data.ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket.status not in [TicketStatus.CALLED, TicketStatus.SERVING]:
        raise HTTPException(
            status_code=400,
            detail="Seuls les tickets appelés ou en service peuvent être complétés"
        )
    
    # Marquer comme terminé
    ticket.status = TicketStatus.COMPLETED
    ticket.completed_at = datetime.utcnow()
    ticket.updated_at = datetime.utcnow()
    
    if complete_data.notes:
        ticket.notes = (ticket.notes or "") + f"\nAgent: {complete_data.notes}"
    
    # Mettre à jour le service
    stmt = select(Service).where(Service.id == ticket.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if service:
        service.current_queue_size = max(0, (service.current_queue_size or 0) - 1)
        service.updated_at = datetime.utcnow()
    
    # Libérer le guichet
    if ticket.counter_id:
        stmt = select(Counter).where(Counter.id == ticket.counter_id)
        result = await db.execute(stmt)
        counter = result.scalar_one_or_none()
        
        if counter:
            counter.current_ticket_id = None
            counter.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"Ticket {ticket.ticket_number} terminé",
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "completed_at": ticket.completed_at.isoformat()
        }
    }


# ========== DAILY STATISTICS ==========
@router.get("/stats/daily")
async def get_daily_statistics(
    service_id: Optional[str] = None,
    date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Statistiques détaillées de la journée
    Pour le rapport de fin de journée
    """
    # Parse date ou utiliser aujourd'hui
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.utcnow()
    
    day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    
    # Base query
    base_query = select(Ticket).where(
        and_(
            Ticket.created_at >= day_start,
            Ticket.created_at < day_end
        )
    )
    
    if service_id:
        base_query = base_query.where(Ticket.service_id == service_id)
    
    result = await db.execute(base_query)
    all_tickets = result.scalars().all()
    
    # Calculer les statistiques
    total_tickets = len(all_tickets)
    completed = len([t for t in all_tickets if t.status == TicketStatus.COMPLETED])
    cancelled = len([t for t in all_tickets if t.status == TicketStatus.CANCELLED])
    no_show = len([t for t in all_tickets if t.status == TicketStatus.NO_SHOW])
    
    # Temps d'attente moyen
    completed_tickets = [t for t in all_tickets if t.status == TicketStatus.COMPLETED and t.estimated_wait_time]
    avg_wait = 0
    if completed_tickets:
        avg_wait = sum(t.estimated_wait_time for t in completed_tickets) // len(completed_tickets)
    
    # Distribution par heure
    hourly_distribution = {}
    for ticket in all_tickets:
        hour = ticket.created_at.hour
        hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
    
    # Heure de pointe
    peak_hour = max(hourly_distribution.items(), key=lambda x: x[1])[0] if hourly_distribution else 0
    
    return {
        "success": True,
        "date": day_start.date().isoformat(),
        "statistics": {
            "total_tickets": total_tickets,
            "completed": completed,
            "cancelled": cancelled,
            "no_show": no_show,
            "completion_rate": round((completed / total_tickets * 100) if total_tickets > 0 else 0, 2),
            "avg_wait_time": avg_wait,
            "peak_hour": f"{peak_hour}:00",
            "peak_count": hourly_distribution.get(peak_hour, 0)
        },
        "hourly_distribution": hourly_distribution
    }


# ========== AGENT PERFORMANCE ==========
@router.get("/agents/performance")
async def get_agent_performance(
    date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Performance des agents/guichets
    Nombre de tickets traités, temps moyen, etc.
    """
    # Parse date ou utiliser aujourd'hui
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.utcnow()
    
    day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    
    # Récupérer tous les guichets
    stmt = select(Counter)
    result = await db.execute(stmt)
    counters = result.scalars().all()
    
    agent_stats = []
    for counter in counters:
        # Tickets traités par ce guichet aujourd'hui
        stmt = select(Ticket).where(
            and_(
                Ticket.counter_id == counter.id,
                Ticket.status == TicketStatus.COMPLETED,
                Ticket.completed_at >= day_start,
                Ticket.completed_at < day_end
            )
        )
        result = await db.execute(stmt)
        tickets_served = result.scalars().all()
        
        # Calculer temps moyen
        avg_service_time = 0
        if tickets_served:
            total_time = sum(
                (t.completed_at - t.called_at).total_seconds() / 60
                for t in tickets_served
                if t.called_at and t.completed_at
            )
            avg_service_time = round(total_time / len(tickets_served), 2) if tickets_served else 0
        
        agent_stats.append({
            "counter_id": counter.id,
            "counter_number": counter.counter_number,
            "agent_name": counter.agent_id or "Non assigné",
            "tickets_served": len(tickets_served),
            "avg_service_time": avg_service_time,
            "status": counter.status
        })
    
    # Trier par performance (nombre de tickets traités)
    agent_stats.sort(key=lambda x: x["tickets_served"], reverse=True)
    
    return {
        "success": True,
        "date": day_start.date().isoformat(),
        "agents": agent_stats,
        "total_agents": len(agent_stats),
        "active_agents": len([a for a in agent_stats if a["status"] == "ouvert"])
    }
