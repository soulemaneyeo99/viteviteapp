"""
ViteviteApp - ML Predictions Endpoint
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.service import service_crud
from app.services.ml_service import ml_service
from pydantic import BaseModel


router = APIRouter(prefix="/predictions", tags=["ML Predictions"])


class PredictionResponse(BaseModel):
    """Response de prédiction ML"""
    success: bool
    service_id: str
    service_name: str
    predicted_wait_time: int
    confidence: float
    recommendation: str
    best_time_to_visit: str
    method: str


@router.post("/{service_id}", response_model=PredictionResponse)
async def predict_wait_time(
    service_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🤖 **Prédire le temps d'attente avec ML/IA**
    
    - **service_id**: ID du service
    
    Utilise:
    - Heuristiques contextuelles ivoiriennes
    - Gemini AI (si configuré)
    - Données temps réel
    
    Returns:
        - Temps d'attente prédit
        - Confiance (0-1)
        - Recommandation
        - Meilleur moment pour venir
    """
    # Récupérer le service
    service = await service_crud.get(db, id=service_id)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service non trouvé"
        )
    
    # Préparer les données
    service_data = {
        "id": service.id,
        "name": service.name,
        "category": service.category,
        "current_queue_size": service.current_queue_size,
        "affluence_level": service.affluence_level.value,
        "estimated_wait_time": service.estimated_wait_time
    }
    
    # Prédiction
    prediction = await ml_service.predict_wait_time(service_data)
    
    return PredictionResponse(
        success=True,
        service_id=service.id,
        service_name=service.name,
        **prediction
    )