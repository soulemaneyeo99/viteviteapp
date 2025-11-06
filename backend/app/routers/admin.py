from fastapi import APIRouter
from app.models import AdminStats
from app.database import db

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStats)
async def get_statistics():
    """Récupère les statistiques globales du système"""
    stats = db.get_stats()
    return stats

@router.get("/dashboard")
async def get_dashboard_data():
    """Récupère toutes les données pour le dashboard admin"""
    services = db.get_all_services()
    tickets = db.get_all_tickets()
    stats = db.get_stats()
    
    # Statistiques par service
    service_stats = []
    for service in services:
        active_tickets = db.get_active_tickets_for_service(service["id"])
        service_stats.append({
            "service_id": service["id"],
            "service_name": service["name"],
            "status": service["status"],
            "active_tickets": len(active_tickets),
            "affluence_level": service["affluence_level"],
            "estimated_wait_time": service["estimated_wait_time"]
        })
    
    return {
        "stats": stats,
        "services": services,
        "service_stats": service_stats,
        "recent_tickets": sorted(tickets, key=lambda t: t["created_at"], reverse=True)[:10]
    }

@router.post("/call-next/{service_id}")
async def call_next_ticket(service_id: str):
    """Appelle le prochain ticket dans la file d'attente"""
    service = db.get_service(service_id)
    if not service:
        return {"error": "Service non trouvé"}
    
    # Trouve le prochain ticket en attente
    active_tickets = db.get_active_tickets_for_service(service_id)
    waiting_tickets = [t for t in active_tickets if t["status"] == "en_attente"]
    
    if not waiting_tickets:
        return {"message": "Aucun ticket en attente"}
    
    # Appelle le premier ticket
    next_ticket = sorted(waiting_tickets, key=lambda t: t["created_at"])[0]
    updated_ticket = db.update_ticket(next_ticket["id"], {"status": "appelé"})
    
    return {
        "message": "Ticket appelé",
        "ticket": updated_ticket
    }

@router.post("/complete-ticket/{ticket_id}")
async def complete_ticket(ticket_id: str):
    """Marque un ticket comme terminé"""
    ticket = db.get_ticket(ticket_id)
    if not ticket:
        return {"error": "Ticket non trouvé"}
    
    updated_ticket = db.update_ticket(ticket_id, {"status": "terminé"})
    
    return {
        "message": "Ticket terminé",
        "ticket": updated_ticket
    }