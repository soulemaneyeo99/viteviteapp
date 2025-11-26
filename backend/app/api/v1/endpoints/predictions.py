"""
ViteviteApp - Predictions Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.service import Service
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/{service_id}")
async def get_prediction(service_id: str, db: AsyncSession = Depends(get_db)):
    """Prédiction IA du temps d'attente"""
    
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    service_dict = {
        "id": service.id,
        "name": service.name,
        "category": service.category,
        "current_queue_size": service.current_queue_size,
        "affluence_level": service.affluence_level.value,
        "estimated_wait_time": service.estimated_wait_time
    }
    
    prediction = await ml_service.predict_wait_time(service_dict)
    
    wait_time = prediction['predicted_wait_time']
    formatted_time = f"{wait_time} min"
    if wait_time >= 60:
        hours = wait_time // 60
        mins = wait_time % 60
        formatted_time = f"{hours}h" if mins == 0 else f"{hours}h {mins:02d}"

    message = f"Temps d'attente estimé : {formatted_time}. {prediction['recommendation']}"

    return {
        "success": True,
        "service_id": service.id,
        "service_name": service.name,
        "predicted_wait_time": prediction["predicted_wait_time"],
        "confidence": prediction["confidence"],
        "recommendation": prediction["recommendation"],
        "best_time_to_visit": prediction["best_time_to_visit"],
        "method": prediction["method"],
        "message": message
    }