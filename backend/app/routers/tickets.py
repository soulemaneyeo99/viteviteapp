from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Ticket, TicketCreate, TicketUpdate, TicketStatus
from app.database import db

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

@router.post("", response_model=Ticket)
async def create_ticket(ticket_data: TicketCreate):
    """Crée un nouveau ticket virtuel"""
    # Vérifie que le service existe
    service = db.get_service(ticket_data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Vérifie que le service est ouvert
    if service["status"] != "ouvert":
        raise HTTPException(status_code=400, detail="Le service est actuellement fermé")
    
    # Crée le ticket
    ticket = db.create_ticket({
        "service_id": ticket_data.service_id,
        "user_name": ticket_data.user_name,
        "user_phone": ticket_data.user_phone,
        "status": TicketStatus.WAITING,
        "estimated_wait_time": service["estimated_wait_time"],
        "notes": ticket_data.notes
    })
    
    return ticket

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Récupère un ticket par son ID"""
    ticket = db.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Recalcule la position dans la file
    service_tickets = db.get_active_tickets_for_service(ticket["service_id"])
    active_before = [t for t in service_tickets 
                     if t["created_at"] < ticket["created_at"] 
                     and t["status"] in ["en_attente", "appelé"]]
    ticket["position_in_queue"] = len(active_before) + 1
    
    return ticket

@router.patch("/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, updates: TicketUpdate):
    """Met à jour un ticket (pour admin)"""
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune mise à jour fournie")
    
    ticket = db.update_ticket(ticket_id, update_data)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    return ticket

@router.delete("/{ticket_id}")
async def cancel_ticket(ticket_id: str):
    """Annule un ticket"""
    ticket = db.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket["status"] in ["terminé", "annulé"]:
        raise HTTPException(status_code=400, detail="Le ticket ne peut plus être annulé")
    
    updated_ticket = db.update_ticket(ticket_id, {"status": TicketStatus.CANCELLED})
    
    return {"message": "Ticket annulé avec succès", "ticket": updated_ticket}

@router.get("")
async def get_all_tickets():
    """Récupère tous les tickets (pour admin)"""
    tickets = db.get_all_tickets()
    return tickets