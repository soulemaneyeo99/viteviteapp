"""
ViteviteApp - Counters Endpoints
API pour la gestion des guichets
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.counter import Counter, CounterStatus
from app.models.service import Service
from app.schemas.counter import (
    CounterCreate,
    CounterUpdate,
    CounterStatusUpdate,
    CounterAgentAssign,
    CounterResponse,
    CounterWithAgent,
    CounterStats
)

router = APIRouter()


# ========== CREATE COUNTER ==========
@router.post("/", response_model=CounterResponse, status_code=status.HTTP_201_CREATED)
async def create_counter(
    counter_data: CounterCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Créer un nouveau guichet pour un service
    """
    # Vérifier que le service existe
    stmt = select(Service).where(Service.id == counter_data.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Vérifier que le numéro de guichet n'existe pas déjà pour ce service
    stmt = select(Counter).where(
        Counter.service_id == counter_data.service_id,
        Counter.counter_number == counter_data.counter_number
    )
    result = await db.execute(stmt)
    existing_counter = result.scalar_one_or_none()
    
    if existing_counter:
        raise HTTPException(
            status_code=400,
            detail=f"Le guichet numéro {counter_data.counter_number} existe déjà pour ce service"
        )
    
    # Créer le guichet
    new_counter = Counter(
        service_id=counter_data.service_id,
        counter_number=counter_data.counter_number,
        name=counter_data.name or f"Guichet {counter_data.counter_number}",
        priority_type=counter_data.priority_type,
        max_tickets_per_day=counter_data.max_tickets_per_day,
        status=CounterStatus.CLOSED  # Fermé par défaut
    )
    
    db.add(new_counter)
    
    # Mettre à jour le service
    service.total_counters += 1
    
    await db.commit()
    await db.refresh(new_counter)
    
    return new_counter


# ========== GET ALL COUNTERS FOR A SERVICE ==========
@router.get("/service/{service_id}", response_model=List[CounterWithAgent])
async def get_service_counters(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer tous les guichets d'un service
    """
    stmt = select(Counter).where(Counter.service_id == service_id).order_by(Counter.counter_number)
    result = await db.execute(stmt)
    counters = result.scalars().all()
    
    # Enrichir avec les informations de l'agent
    counters_with_agents = []
    for counter in counters:
        counter_dict = {
            "id": counter.id,
            "service_id": counter.service_id,
            "agent_id": counter.agent_id,
            "current_ticket_id": counter.current_ticket_id,
            "counter_number": counter.counter_number,
            "name": counter.name,
            "status": counter.status,
            "priority_type": counter.priority_type,
            "tickets_processed_today": counter.tickets_processed_today,
            "total_tickets_processed": counter.total_tickets_processed,
            "average_service_time": counter.average_service_time,
            "is_active": counter.is_active,
            "max_tickets_per_day": counter.max_tickets_per_day,
            "created_at": counter.created_at.isoformat(),
            "updated_at": counter.updated_at.isoformat(),
            "agent_name": None,
            "agent_email": None
        }
        
        # Récupérer les infos de l'agent si assigné
        if counter.agent_id:
            stmt = select(User).where(User.id == counter.agent_id)
            result = await db.execute(stmt)
            agent = result.scalar_one_or_none()
            if agent:
                counter_dict["agent_name"] = agent.full_name
                counter_dict["agent_email"] = agent.email
        
        counters_with_agents.append(counter_dict)
    
    return counters_with_agents


# ========== GET COUNTER BY ID ==========
@router.get("/{counter_id}", response_model=CounterWithAgent)
async def get_counter(
    counter_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer un guichet par son ID
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    counter_dict = {
        "id": counter.id,
        "service_id": counter.service_id,
        "agent_id": counter.agent_id,
        "current_ticket_id": counter.current_ticket_id,
        "counter_number": counter.counter_number,
        "name": counter.name,
        "status": counter.status,
        "priority_type": counter.priority_type,
        "tickets_processed_today": counter.tickets_processed_today,
        "total_tickets_processed": counter.total_tickets_processed,
        "average_service_time": counter.average_service_time,
        "is_active": counter.is_active,
        "max_tickets_per_day": counter.max_tickets_per_day,
        "created_at": counter.created_at.isoformat(),
        "updated_at": counter.updated_at.isoformat(),
        "agent_name": None,
        "agent_email": None
    }
    
    # Récupérer les infos de l'agent
    if counter.agent_id:
        stmt = select(User).where(User.id == counter.agent_id)
        result = await db.execute(stmt)
        agent = result.scalar_one_or_none()
        if agent:
            counter_dict["agent_name"] = agent.full_name
            counter_dict["agent_email"] = agent.email
    
    return counter_dict


# ========== UPDATE COUNTER STATUS ==========
@router.patch("/{counter_id}/status")
async def update_counter_status(
    counter_id: str,
    status_data: CounterStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Ouvrir/Fermer/Mettre en pause un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    # Valider le statut
    valid_statuses = ["ouvert", "fermé", "en_pause"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}")
    
    # Vérifier qu'un agent est assigné pour ouvrir
    if status_data.status == "ouvert" and not counter.agent_id:
        raise HTTPException(status_code=400, detail="Impossible d'ouvrir un guichet sans agent assigné")
    
    old_status = counter.status
    counter.status = status_data.status
    counter.updated_at = datetime.utcnow()
    
    # Mettre à jour le compteur de guichets actifs du service
    if old_status != "ouvert" and status_data.status == "ouvert":
        stmt = select(Service).where(Service.id == counter.service_id)
        result = await db.execute(stmt)
        service = result.scalar_one_or_none()
        if service:
            service.active_counters += 1
    elif old_status == "ouvert" and status_data.status != "ouvert":
        stmt = select(Service).where(Service.id == counter.service_id)
        result = await db.execute(stmt)
        service = result.scalar_one_or_none()
        if service:
            service.active_counters = max(0, service.active_counters - 1)
    
    await db.commit()
    await db.refresh(counter)
    
    return {
        "success": True,
        "message": f"Guichet {counter.counter_number} {status_data.status}",
        "counter": {
            "id": counter.id,
            "counter_number": counter.counter_number,
            "status": counter.status
        }
    }


# ========== ASSIGN AGENT TO COUNTER ==========
@router.patch("/{counter_id}/assign")
async def assign_agent_to_counter(
    counter_id: str,
    agent_data: CounterAgentAssign,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Assigner un agent à un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    # Vérifier que l'agent existe et a le rôle approprié
    stmt = select(User).where(User.id == agent_data.agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent non trouvé")
    
    if agent.role not in ["admin", "agent"]:
        raise HTTPException(status_code=400, detail="L'utilisateur doit avoir le rôle 'admin' ou 'agent'")
    
    # Vérifier que l'agent n'est pas déjà assigné à un autre guichet ouvert
    stmt = select(Counter).where(
        Counter.agent_id == agent_data.agent_id,
        Counter.status == CounterStatus.OPEN,
        Counter.id != counter_id
    )
    result = await db.execute(stmt)
    other_counter = result.scalar_one_or_none()
    
    if other_counter:
        raise HTTPException(
            status_code=400,
            detail=f"Cet agent est déjà assigné au guichet {other_counter.counter_number} qui est ouvert"
        )
    
    counter.agent_id = agent_data.agent_id
    counter.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(counter)
    
    return {
        "success": True,
        "message": f"Agent {agent.full_name} assigné au guichet {counter.counter_number}",
        "counter": {
            "id": counter.id,
            "counter_number": counter.counter_number,
            "agent_id": counter.agent_id,
            "agent_name": agent.full_name
        }
    }


# ========== REMOVE AGENT FROM COUNTER ==========
@router.patch("/{counter_id}/remove-agent")
async def remove_agent_from_counter(
    counter_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Retirer l'agent d'un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    if not counter.agent_id:
        raise HTTPException(status_code=400, detail="Aucun agent assigné à ce guichet")
    
    # Fermer le guichet automatiquement
    if counter.status == CounterStatus.OPEN:
        counter.status = CounterStatus.CLOSED
        # Mettre à jour le compteur de guichets actifs
        stmt = select(Service).where(Service.id == counter.service_id)
        result = await db.execute(stmt)
        service = result.scalar_one_or_none()
        if service:
            service.active_counters = max(0, service.active_counters - 1)
    
    counter.agent_id = None
    counter.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(counter)
    
    return {
        "success": True,
        "message": f"Agent retiré du guichet {counter.counter_number}",
        "counter": {
            "id": counter.id,
            "counter_number": counter.counter_number,
            "status": counter.status
        }
    }


# ========== UPDATE COUNTER ==========
@router.put("/{counter_id}", response_model=CounterResponse)
async def update_counter(
    counter_id: str,
    counter_data: CounterUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Mettre à jour un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    # Mettre à jour les champs
    if counter_data.name is not None:
        counter.name = counter_data.name
    if counter_data.priority_type is not None:
        counter.priority_type = counter_data.priority_type
    if counter_data.max_tickets_per_day is not None:
        counter.max_tickets_per_day = counter_data.max_tickets_per_day
    if counter_data.is_active is not None:
        counter.is_active = counter_data.is_active
    
    counter.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(counter)
    
    return counter


# ========== DELETE COUNTER ==========
@router.delete("/{counter_id}")
async def delete_counter(
    counter_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Supprimer un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    # Vérifier qu'il n'y a pas de ticket en cours
    if counter.current_ticket_id:
        raise HTTPException(
            status_code=400,
            detail="Impossible de supprimer un guichet avec un ticket en cours"
        )
    
    service_id = counter.service_id
    
    await db.delete(counter)
    
    # Mettre à jour le service
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    if service:
        service.total_counters = max(0, service.total_counters - 1)
        if counter.status == CounterStatus.OPEN:
            service.active_counters = max(0, service.active_counters - 1)
    
    await db.commit()
    
    return {
        "success": True,
        "message": f"Guichet {counter.counter_number} supprimé"
    }


# ========== GET COUNTER STATS ==========
@router.get("/{counter_id}/stats", response_model=CounterStats)
async def get_counter_stats(
    counter_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les statistiques d'un guichet
    """
    stmt = select(Counter).where(Counter.id == counter_id)
    result = await db.execute(stmt)
    counter = result.scalar_one_or_none()
    
    if not counter:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    
    # Calculer le score d'efficacité
    efficiency_score = 0.0
    if counter.total_tickets_processed > 0:
        # Score basé sur le nombre de tickets traités et le temps moyen
        tickets_score = min(counter.tickets_processed_today / 20 * 50, 50)  # Max 50 points
        time_score = max(0, 50 - (counter.average_service_time - 10) * 2)  # Max 50 points
        efficiency_score = tickets_score + time_score
    
    agent_name = None
    if counter.agent_id:
        stmt = select(User).where(User.id == counter.agent_id)
        result = await db.execute(stmt)
        agent = result.scalar_one_or_none()
        if agent:
            agent_name = agent.full_name
    
    return {
        "counter_id": counter.id,
        "counter_number": counter.counter_number,
        "tickets_processed_today": counter.tickets_processed_today,
        "total_tickets_processed": counter.total_tickets_processed,
        "average_service_time": counter.average_service_time,
        "current_status": counter.status,
        "agent_name": agent_name,
        "efficiency_score": efficiency_score
    }
