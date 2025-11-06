from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Service, ServiceUpdate
from app.database import db

router = APIRouter(prefix="/api/services", tags=["services"])

@router.get("", response_model=List[Service])
async def get_all_services():
    """Récupère tous les services disponibles"""
    services = db.get_all_services()
    return services

@router.get("/{service_id}", response_model=Service)
async def get_service(service_id: str):
    """Récupère un service spécifique par son ID"""
    service = db.get_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return service

@router.patch("/{service_id}", response_model=Service)
async def update_service(service_id: str, updates: ServiceUpdate):
    """Met à jour un service (pour admin)"""
    # Filtre uniquement les champs fournis
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune mise à jour fournie")
    
    service = db.update_service(service_id, update_data)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    return service

@router.get("/{service_id}/queue")
async def get_service_queue(service_id: str):
    """Récupère l'état de la file d'attente d'un service"""
    service = db.get_service(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    active_tickets = db.get_active_tickets_for_service(service_id)
    
    return {
        "service_id": service_id,
        "service_name": service["name"],
        "status": service["status"],
        "queue_size": len(active_tickets),
        "estimated_wait_time": service["estimated_wait_time"],
        "affluence_level": service["affluence_level"],
        "active_tickets": sorted(active_tickets, key=lambda t: t["position_in_queue"])
    }