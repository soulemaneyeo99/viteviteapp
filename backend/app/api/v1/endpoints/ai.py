"""
Endpoints API pour fonctionnalités IA avancées
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.ai.ai_realtime_service import ai_realtime_service
from app.ai.ai_triage_service import ai_triage_service
from app.ai.ai_document_service import ai_document_service
from app.ai.ai_notification_service import ai_notification_service
from app.database import db

router = APIRouter(prefix="/ai", tags=["AI"])


# ========== MODELS ==========

class AffluencePredictionRequest(BaseModel):
    service_id: str
    historical_data: Optional[List[Dict]] = None


class TriageRequest(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=1000)
    patient_info: Optional[Dict[str, Any]] = None
    include_hospitals: bool = True


class DocumentChecklistRequest(BaseModel):
    service_type: str = Field(..., examples=["mairie", "banque", "hôpital"])
    request_type: str = Field(..., examples=["passeport", "cni", "extrait"])
    user_info: Optional[Dict[str, Any]] = None


class DocumentAnalysisRequest(BaseModel):
    user_documents: List[Dict[str, Any]]
    required_documents: List[Dict[str, Any]]


class SmartNotificationRequest(BaseModel):
    notification_type: str
    context: Dict[str, Any]


# ========== ENDPOINTS ==========

@router.post("/predict-affluence")
async def predict_affluence(request: AffluencePredictionRequest):
    """
    🔮 **Prédiction d'affluence en temps réel**
    
    Analyse l'affluence actuelle et future pour un service avec IA.
    
    Returns:
        - Niveau d'affluence actuel
        - Temps d'attente prédit
        - Meilleur moment pour visiter
        - Tendances et recommandations
    """
    try:
        # Récupérer données du service
        service = db.get_service_by_id(request.service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        # Prédiction IA
        prediction = await ai_realtime_service.predict_affluence(service)
        
        return {
            "success": True,
            "data": prediction,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur prédiction: {str(e)}")


@router.post("/analyze-trends/{service_id}")
async def analyze_trends(service_id: str, historical_data: List[Dict] = Body(default=[])):
    """
    📊 **Analyse des tendances de file d'attente**
    
    Analyse les patterns historiques et détecte les anomalies.
    """
    try:
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        trends = await ai_realtime_service.analyze_queue_trends(service, historical_data)
        
        return {
            "success": True,
            "data": trends
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur analyse: {str(e)}")


@router.post("/detect-anomalies/{service_id}")
async def detect_anomalies(service_id: str):
    """
    🚨 **Détection d'anomalies**
    
    Détecte les comportements anormaux dans la file d'attente.
    """
    try:
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        anomalies = await ai_realtime_service.detect_anomalies(service)
        
        return {
            "success": True,
            "data": anomalies
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur détection: {str(e)}")


@router.post("/triage")
async def medical_triage(request: TriageRequest):
    """
    🏥 **Triage médical intelligent**
    
    Analyse les symptômes et recommande un plan d'action.
    
    ⚠️ **DISCLAIMER**: Ceci est une aide à la décision, pas un diagnostic médical.
    """
    try:
        # Récupérer hôpitaux si demandé
        available_hospitals = None
        if request.include_hospitals:
            all_services = db.get_all_services()
            available_hospitals = [
                s for s in all_services 
                if s.get('category') in ['Santé', 'Hôpital', 'Urgences']
            ]
        
        # Analyse IA
        triage_result = await ai_triage_service.analyze_symptoms(
            symptoms=request.symptoms,
            patient_info=request.patient_info,
            available_hospitals=available_hospitals
        )
        
        return {
            "success": True,
            "data": triage_result,
            "disclaimer": "⚠️ Ceci est une aide à la décision, pas un diagnostic médical. En cas de doute, appelez le SAMU (185)."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur triage: {str(e)}")


@router.post("/recommend-hospital")
async def recommend_hospital(
    urgency_level: str = Body(...),
    specialty: str = Body(...),
    user_location: Optional[Dict[str, float]] = Body(None)
):
    """
    🏥 **Recommandation d'hôpital**
    
    Recommande le meilleur hôpital selon l'urgence et la spécialité.
    """
    try:
        # Récupérer hôpitaux
        all_services = db.get_all_services()
        hospitals = [
            s for s in all_services 
            if s.get('category') in ['Santé', 'Hôpital', 'Urgences']
        ]
        
        recommendation = await ai_triage_service.recommend_hospital(
            urgency_level=urgency_level,
            specialty=specialty,
            available_hospitals=hospitals,
            user_location=user_location
        )
        
        return {
            "success": True,
            "data": recommendation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur recommandation: {str(e)}")


@router.post("/documents/checklist")
async def generate_document_checklist(request: DocumentChecklistRequest):
    """
    📄 **Génération de checklist de documents**
    
    Génère une liste intelligente des documents requis.
    """
    try:
        checklist = await ai_document_service.generate_checklist(
            service_type=request.service_type,
            request_type=request.request_type,
            user_info=request.user_info
        )
        
        return {
            "success": True,
            "data": checklist
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération checklist: {str(e)}")


@router.post("/documents/analyze")
async def analyze_user_documents(request: DocumentAnalysisRequest):
    """
    🔍 **Analyse des documents utilisateur**
    
    Vérifie si l'utilisateur a tous les documents requis.
    """
    try:
        analysis = await ai_document_service.analyze_user_documents(
            user_documents=request.user_documents,
            required_documents=request.required_documents
        )
        
        return {
            "success": True,
            "data": analysis
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur analyse documents: {str(e)}")


@router.post("/notification/generate")
async def generate_smart_notification(request: SmartNotificationRequest):
    """
    🔔 **Génération de notification intelligente**
    
    Crée une notification contextuelle et personnalisée.
    """
    try:
        notification = await ai_notification_service.generate_smart_notification(
            notification_type=request.notification_type,
            context=request.context
        )
        
        return {
            "success": True,
            "data": notification
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération notification: {str(e)}")


@router.post("/notification/admin-alert")
async def generate_admin_alert(
    alert_type: str = Body(...),
    service_id: str = Body(...),
    metrics: Dict[str, Any] = Body(...)
):
    """
    🚨 **Génération d'alerte admin**
    
    Crée une alerte pour les administrateurs.
    """
    try:
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        alert = await ai_notification_service.generate_admin_alert(
            alert_type=alert_type,
            service_data=service,
            metrics=metrics
        )
        
        return {
            "success": True,
            "data": alert
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération alerte: {str(e)}")


@router.get("/best-time/{service_id}")
async def get_best_time(service_id: str):
    """
    ⏰ **Meilleur moment pour visiter**
    
    Recommande le meilleur créneau horaire.
    """
    try:
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        prediction = await ai_realtime_service.predict_affluence(service)
        
        return {
            "success": True,
            "data": {
                "best_time_today": prediction.get('best_time_today'),
                "best_time_tomorrow": prediction.get('best_time_tomorrow'),
                "peak_hours_today": prediction.get('peak_hours_today'),
                "current_affluence": prediction.get('current_affluence'),
                "recommendation": prediction.get('recommendation')
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/health")
async def ai_health_check():
    """
    ✅ **Vérification santé des services IA**
    """
    return {
        "success": True,
        "services": {
            "realtime": ai_realtime_service.enabled,
            "triage": ai_triage_service.enabled,
            "documents": ai_document_service.enabled,
            "notifications": ai_notification_service.enabled
        },
        "timestamp": datetime.now().isoformat()
    }
