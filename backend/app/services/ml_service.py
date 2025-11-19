"""
ViteviteApp - ML Service
Prédictions temps d'attente avec heuristiques + Gemini AI (optionnel)
"""

from datetime import datetime
from typing import Dict, Any
import logging

from app.core.config import settings
from pathlib import Path

logger = logging.getLogger(__name__)

# Tenter de charger le modèle ML entraîné
try:
    from app.services.ml_trainer import predictor as ml_predictor
    ML_MODEL_AVAILABLE = Path("models/queue_predictor.pkl").exists()
    if ML_MODEL_AVAILABLE:
        ml_predictor.load_model()
        logger.info("✅ Modèle ML chargé avec succès")
except Exception as e:
    ML_MODEL_AVAILABLE = False
    ml_predictor = None
    logger.warning(f"⚠️ Modèle ML non disponible: {e}")

# Import Gemini uniquement si configuré
if settings.gemini_enabled:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
    except Exception as e:
        logger.warning(f"Gemini non disponible: {e}")
        gemini_model = None
else:
    gemini_model = None


class MLService:
    """Service de prédiction ML pour temps d'attente"""
    
    # Temps de base par catégorie (en minutes par personne)
    BASE_TIMES = {
        "Administration": 8,
        "Banque": 12,
        "Santé": 15,
        "Mairie": 10,
        "default": 10
    }
    
    # Facteurs multiplicateurs contextuels ivoiriens
    SALARY_DAYS = [1, 5, 10, 15, 20, 25]  # Jours de salaire
    
    async def predict_wait_time(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prédit le temps d'attente pour un service
        
        Args:
            service_data: {id, name, category, current_queue_size, affluence_level, ...}
        
        Returns:
            {predicted_wait_time, confidence, recommendation, method}
        """
        # Heuristiques rapides et précises
        base_prediction = self._heuristic_prediction(service_data)
        
        # Enrichir avec Gemini si disponible (optionnel)
        if gemini_model and settings.ENABLE_AI:
            try:
                ai_prediction = await self._gemini_prediction(service_data)
                # Moyenne pondérée: 70% heuristique + 30% AI
                final_time = int(base_prediction["predicted_wait_time"] * 0.7 + 
                                ai_prediction["predicted_wait_time"] * 0.3)
                return {
                    **base_prediction,
                    "predicted_wait_time": final_time,
                    "confidence": min(0.95, (base_prediction["confidence"] + ai_prediction["confidence"]) / 2),
                    "method": "hybrid"
                }
            except Exception as e:
                logger.warning(f"Gemini fallback: {e}")
        
        return base_prediction
    
    def _heuristic_prediction(self, service: Dict[str, Any]) -> Dict[str, Any]:
        """Prédiction par heuristiques contextuelles"""
        
        queue_size = service.get("current_queue_size", 0)
        category = service.get("category", "default")
        
        # Temps de base par catégorie
        base_time = self.BASE_TIMES.get(category, self.BASE_TIMES["default"])
        
        # Calcul de base
        predicted_time = queue_size * base_time
        
        # Facteurs contextuels ivoiriens
        now = datetime.now()
        day = now.day
        hour = now.hour
        weekday = now.weekday()  # 0=Lundi, 6=Dimanche
        
        multiplier = 1.0
        
        # Jours de salaire (forte affluence)
        if day in self.SALARY_DAYS:
            multiplier *= 1.5
        
        # Début de mois
        if day <= 7:
            multiplier *= 1.3
        
        # Heures de pointe (9h-12h)
        if 9 <= hour <= 12:
            multiplier *= 1.4
        
        # Lundi (jour chargé)
        if weekday == 0:
            multiplier *= 1.2
        
        # Vendredi (jour chargé)
        if weekday == 4:
            multiplier *= 1.15
        
        # Fin de journée (moins de personnel)
        if hour >= 16:
            multiplier *= 1.3
        
        # Application du multiplicateur
        predicted_time = int(predicted_time * multiplier)
        
        # Minimum 5 minutes si file non vide
        if queue_size > 0:
            predicted_time = max(5, predicted_time)
        
        # Génération de la recommandation
        recommendation = self._generate_recommendation(predicted_time, hour, day)
        
        # Calcul de la confiance
        confidence = 0.85 if queue_size > 0 else 0.70
        
        return {
            "service_id": service.get("id"),
            "predicted_wait_time": predicted_time,
            "confidence": confidence,
            "recommendation": recommendation,
            "best_time_to_visit": self._get_best_time(hour, day),
            "method": "heuristic"
        }
    
    async def _gemini_prediction(self, service: Dict[str, Any]) -> Dict[str, Any]:
        """Prédiction avec Gemini AI (enrichissement)"""
        
        prompt = f"""Analyse cette file d'attente en Côte d'Ivoire:

Service: {service['name']}
Catégorie: {service['category']}
File actuelle: {service['current_queue_size']} personnes
Affluence: {service.get('affluence_level', 'modérée')}
Jour: {datetime.now().strftime('%A')}
Heure: {datetime.now().hour}h

Contexte ivoirien:
- Jours 1,5,15,25: jours de salaire (forte affluence)
- Début de mois: banques très occupées
- 9h-12h: heures de pointe
- Lundi/Vendredi: jours chargés

Réponds UNIQUEMENT ce JSON (rien d'autre):
{{"predicted_wait_time": <minutes>, "confidence": <0.0-1.0>, "recommendation": "<conseil court>"}}"""
        
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        
        # Nettoyage
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        text = text.strip()
        
        import json
        result = json.loads(text)
        
        return {
            "predicted_wait_time": result.get("predicted_wait_time", 0),
            "confidence": result.get("confidence", 0.7),
            "recommendation": result.get("recommendation", "")
        }
    
    def _generate_recommendation(self, wait_time: int, hour: int, day: int) -> str:
        """Génère une recommandation basée sur le temps d'attente"""
        
        if wait_time == 0:
            return "Aucune attente ! C'est le moment idéal pour venir."
        elif wait_time < 10:
            return "Temps d'attente minimal. Bon moment pour venir."
        elif wait_time < 30:
            return "Temps d'attente raisonnable. Préparez vos documents."
        elif wait_time < 60:
            return "File modérée. Prévoyez environ 1h."
        else:
            best_time = "demain matin 8h-9h" if hour > 14 else "après 14h"
            return f"Forte affluence. Nous recommandons de venir {best_time}."
    
    def _get_best_time(self, current_hour: int, current_day: int) -> str:
        """Détermine le meilleur moment pour visiter"""
        
        # Éviter les jours de salaire
        if current_day in self.SALARY_DAYS:
            return "Évitez les jours 1, 5, 15, 25 du mois (jours de salaire)"
        
        # Recommandation horaire
        if current_hour < 8:
            return "Aujourd'hui 8h-9h (ouverture)"
        elif 8 <= current_hour < 12:
            return "Aujourd'hui 14h-15h (après déjeuner)"
        elif 12 <= current_hour < 15:
            return "Maintenant ou 15h-16h"
        else:
            return "Demain matin 8h-9h"


# Instance globale
ml_service = MLService()