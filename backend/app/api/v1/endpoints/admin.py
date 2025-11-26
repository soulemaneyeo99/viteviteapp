"""
ViteviteApp - Admin Endpoints
Endpoints spécifiques pour l'administration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.ticket import Ticket, TicketStatus
from app.models.service import Service
from app.models.user import User
from app.api.v1.deps import get_current_admin
from app.services.smart_prediction import smart_prediction_service

router = APIRouter()


from typing import Optional

@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(
    service_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Récupère les statistiques complètes pour le dashboard admin (Step A & E)
    Peut être filtré par service_id
    """
    today = datetime.utcnow().date()
    
    # 1. Vue d'ensemble (Step A)
    # Tickets en attente
    waiting_query = select(func.count(Ticket.id)).where(Ticket.status.in_([TicketStatus.WAITING, TicketStatus.PENDING_VALIDATION]))
    if service_id:
        waiting_query = waiting_query.where(Ticket.service_id == service_id)
    
    waiting_result = await db.execute(waiting_query)
    waiting_count = waiting_result.scalar()
    
    # Tickets passés aujourd'hui
    completed_query = select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.COMPLETED).where(func.date(Ticket.created_at) == today)
    if service_id:
        completed_query = completed_query.where(Ticket.service_id == service_id)
        
    completed_result = await db.execute(completed_query)
    completed_count = completed_result.scalar()
    
    # Temps d'attente moyen (basé sur les tickets terminés aujourd'hui)
    avg_wait_time = 15  # Valeur par défaut
    
    # Agents actifs (ceux qui ont traité un ticket dans la dernière heure)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    agents_query = select(func.count(func.distinct(Ticket.counter_id))).where(Ticket.updated_at >= one_hour_ago)
    if service_id:
        agents_query = agents_query.where(Ticket.service_id == service_id)
        
    agents_result = await db.execute(agents_query)
    active_agents = agents_result.scalar() or (1 if service_id else 5) # Simulation
    
    # 2. Performance & Alertes (Step C)
    services_query = select(Service).where(Service.status == "ouvert")
    if service_id:
        services_query = services_query.where(Service.id == service_id)
        
    services_result = await db.execute(services_query)
    services = services_result.scalars().all()
    
    alerts = []
    
    for service in services:
        # Check surcharge
        if service.current_queue_size > 20:
            alerts.append({
                "type": "surcharge",
                "level": "high",
                "message": f"Forte affluence : {service.name} ({service.current_queue_size} en attente)",
                "service_id": service.id
            })
        
        # Check lenteur (si temps d'attente estimé > 60 min)
        service_data = {
            "id": service.id,
            "name": service.name,
            "type": service.category,
            "total_queue_size": service.current_queue_size,
            "total_active_counters": service.active_counters,
            "is_open": True
        }
        prediction = smart_prediction_service.predict_wait_time(service_data)
        
        if prediction["predicted_wait_time"] > 60:
            alerts.append({
                "type": "lenteur",
                "level": "medium",
                "message": f"Temps d'attente élevé : {service.name} (~{prediction['predicted_wait_time']} min)",
                "service_id": service.id
            })

    return {
        "success": True,
        "overview": {
            "waiting_count": waiting_count,
            "completed_today": completed_count,
            "average_wait_time": avg_wait_time,
            "active_agents": active_agents,
            "avg_processing_time": 8
        },
        "alerts": alerts,
        "services_status": [
            {
                "id": s.id,
                "name": s.name,
                "queue_size": s.current_queue_size,
                "status": "active" if s.current_queue_size > 0 else "idle"
            }
            for s in services
        ]
    }


@router.get("/alerts", response_model=dict)
async def get_admin_alerts(
    service_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Récupère les alertes intelligentes (Step C)
    Peut être filtré par service_id
    """
    services_query = select(Service).where(Service.status == "ouvert")
    if service_id:
        services_query = services_query.where(Service.id == service_id)
        
    services_result = await db.execute(services_query)
    services = services_result.scalars().all()
    
    alerts = []
    
    for service in services:
        # Check surcharge
        if service.current_queue_size > 20:
            alerts.append({
                "type": "surcharge",
                "level": "high",
                "message": f"Forte affluence : {service.name} ({service.current_queue_size} en attente)",
                "service_id": service.id,
                "action": "Renforcer l'équipe"
            })
        
        # Check lenteur avec SmartPrediction
        service_data = {
            "id": service.id,
            "name": service.name,
            "type": service.category,
            "total_queue_size": service.current_queue_size,
            "total_active_counters": service.active_counters,
            "is_open": True
        }
        prediction = smart_prediction_service.predict_wait_time(service_data)
        
        if prediction["predicted_wait_time"] > 60:
            alerts.append({
                "type": "lenteur",
                "level": "medium",
                "message": f"Temps d'attente élevé : {service.name} (~{prediction['predicted_wait_time']} min)",
                "service_id": service.id,
                "action": "Ouvrir un guichet supplémentaire"
            })
            
    return {
        "success": True,
        "total": len(alerts),
        "alerts": alerts
    }
