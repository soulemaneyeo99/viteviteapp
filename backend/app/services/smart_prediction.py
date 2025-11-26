"""
ViteviteApp - Smart Prediction Service
Prédictions intelligentes avec facteurs contextuels réels
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
import logging
import calendar

logger = logging.getLogger(__name__)


class SmartPredictionService:
    """Service de prédiction intelligent avec facteurs contextuels ivoiriens"""
    
    # Temps de base par catégorie (minutes par personne)
    BASE_TIMES = {
        "mairie": 12,
        "prefecture": 15,
        "cnps": 10,
        "hospital": 20,
        "police": 8,
        "impots": 14,
        "banque": 12,
        "default": 10
    }
    
    # Jours de salaire en Côte d'Ivoire
    SALARY_DAYS = [1, 5, 10, 15, 20, 25, 28]
    
    # Jours fériés 2025 (Côte d'Ivoire)
    HOLIDAYS_2025 = [
        (1, 1),   # Nouvel An
        (4, 18),  # Vendredi Saint
        (4, 21),  # Lundi de Pâques
        (5, 1),   # Fête du Travail
        (5, 29),  # Ascension
        (6, 9),   # Lundi de Pentecôte
        (8, 7),   # Indépendance
        (8, 15),  # Assomption
        (11, 1),  # Toussaint
        (11, 15), # Journée Nationale de la Paix
        (12, 25), # Noël
    ]
    
    def predict_wait_time(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prédit le temps d'attente avec facteurs contextuels réels
        
        Args:
            service_data: {
                id, name, type, 
                total_queue_size, 
                total_active_counters,
                is_open
            }
        
        Returns:
            {
                predicted_wait_time: int,
                confidence: float,
                factors: dict,
                recommendation: str,
                best_times: list,
                current_vs_average: str,
                alert: str (optional)
            }
        """
        
        queue_size = service_data.get("total_queue_size", 0)
        active_counters = max(1, service_data.get("total_active_counters", 1))
        service_type = service_data.get("type", "default")
        is_open = service_data.get("is_open", True)
        
        if not is_open or queue_size == 0:
            return self._empty_queue_prediction(service_data)
        
        # Temps de base
        base_time_per_person = self.BASE_TIMES.get(service_type, self.BASE_TIMES["default"])
        base_time = (queue_size * base_time_per_person) / active_counters
        
        # Facteurs contextuels
        now = datetime.now()
        factors = self._calculate_contextual_factors(now, service_type)
        
        # Temps final
        final_multiplier = (
            factors["hour_multiplier"] *
            factors["day_multiplier"] *
            factors["month_multiplier"] *
            factors["special_multiplier"]
        )
        
        predicted_time = int(base_time * final_multiplier)
        predicted_time = max(5, predicted_time)  # Minimum 5 minutes
        
        # Confiance basée sur les facteurs
        confidence = self._calculate_confidence(queue_size, factors)
        
        # Recommandation intelligente
        recommendation = self._generate_smart_recommendation(
            predicted_time, now, factors, service_type
        )
        
        # Meilleurs moments
        best_times = self._get_best_times(now, service_type)
        
        # Comparaison avec moyenne
        average_time = base_time
        comparison = self._compare_with_average(predicted_time, average_time)
        
        # Alerte si nécessaire
        alert = self._check_alerts(factors, predicted_time)
        
        result = {
            "predicted_wait_time": predicted_time,
            "confidence": confidence,
            "factors": {
                "base_time": int(base_time),
                "hour_multiplier": factors["hour_multiplier"],
                "day_multiplier": factors["day_multiplier"],
                "month_multiplier": factors["month_multiplier"],
                "special_multiplier": factors["special_multiplier"],
                "final_multiplier": round(final_multiplier, 2)
            },
            "recommendation": recommendation,
            "best_times": best_times,
            "current_vs_average": comparison
        }
        
        if alert:
            result["alert"] = alert
        
        return result
    
    def _calculate_contextual_factors(self, now: datetime, service_type: str) -> Dict[str, float]:
        """Calcule tous les facteurs contextuels"""
        
        hour = now.hour
        day = now.day
        weekday = now.weekday()  # 0=Lundi, 6=Dimanche
        month = now.month
        
        factors = {
            "hour_multiplier": 1.0,
            "day_multiplier": 1.0,
            "month_multiplier": 1.0,
            "special_multiplier": 1.0
        }
        
        # === FACTEUR HORAIRE ===
        if 8 <= hour < 10:
            factors["hour_multiplier"] = 1.5  # Pic matinal
        elif 10 <= hour < 12:
            factors["hour_multiplier"] = 1.3  # Matinée chargée
        elif 12 <= hour < 14:
            factors["hour_multiplier"] = 0.7  # Pause déjeuner
        elif 14 <= hour < 16:
            factors["hour_multiplier"] = 1.1  # Après-midi normal
        elif 16 <= hour < 18:
            factors["hour_multiplier"] = 1.4  # Fin de journée
        
        # === FACTEUR JOUR DE LA SEMAINE ===
        if weekday == 0:  # Lundi
            factors["day_multiplier"] = 1.3
        elif weekday == 4:  # Vendredi
            factors["day_multiplier"] = 1.2
        elif weekday == 5 or weekday == 6:  # Weekend
            factors["day_multiplier"] = 0.5  # Fermé ou très calme
        
        # === FACTEUR JOUR DU MOIS ===
        if day in self.SALARY_DAYS:
            # Jours de salaire - impact selon le service
            if service_type in ["banque", "cnps"]:
                factors["month_multiplier"] = 2.5  # Très forte affluence
            elif service_type in ["mairie", "impots"]:
                factors["month_multiplier"] = 1.8
            else:
                factors["month_multiplier"] = 1.4
        
        elif day <= 5:  # Début de mois
            if service_type in ["banque", "cnps", "impots"]:
                factors["month_multiplier"] = 1.6
            else:
                factors["month_multiplier"] = 1.2
        
        elif day >= 25:  # Fin de mois
            if service_type in ["banque", "cnps"]:
                factors["month_multiplier"] = 2.0
            else:
                factors["month_multiplier"] = 1.3
        
        # === FACTEURS SPÉCIAUX ===
        # Veille de jour férié
        if self._is_before_holiday(now):
            factors["special_multiplier"] = 1.5
        
        # Rentrée scolaire (Septembre)
        if month == 9 and day <= 15:
            if service_type in ["mairie", "prefecture"]:
                factors["special_multiplier"] = 1.7
        
        # Période fiscale (Mars-Avril)
        if month in [3, 4] and service_type == "impots":
            factors["special_multiplier"] = 2.0
        
        return factors
    
    def _is_before_holiday(self, date: datetime) -> bool:
        """Vérifie si c'est la veille d'un jour férié"""
        tomorrow = date + timedelta(days=1)
        return (tomorrow.month, tomorrow.day) in self.HOLIDAYS_2025
    
    def _calculate_confidence(self, queue_size: int, factors: Dict[str, float]) -> float:
        """Calcule le niveau de confiance de la prédiction"""
        
        base_confidence = 0.75
        
        # Plus de monde = plus de confiance
        if queue_size > 10:
            base_confidence += 0.10
        elif queue_size > 5:
            base_confidence += 0.05
        
        # Facteurs extrêmes = moins de confiance
        total_multiplier = (
            factors["hour_multiplier"] *
            factors["day_multiplier"] *
            factors["month_multiplier"] *
            factors["special_multiplier"]
        )
        
        if total_multiplier > 3.0:
            base_confidence -= 0.10
        elif total_multiplier > 2.0:
            base_confidence -= 0.05
        
        return min(0.95, max(0.60, base_confidence))
    
    def _generate_smart_recommendation(
        self, 
        predicted_time: int, 
        now: datetime,
        factors: Dict[str, float],
        service_type: str
    ) -> str:
        """Génère une recommandation intelligente et contextuelle"""
        
        hour = now.hour
        day = now.day
        
        # Cas spéciaux
        if day in self.SALARY_DAYS and service_type in ["banque", "cnps"]:
            return f"⚠️ Jour de salaire - Très forte affluence ({predicted_time} min). Reportez si possible au jour {day + 2 if day < 28 else 2} du mois."
        
        if factors["month_multiplier"] >= 2.0:
            next_best_day = self._get_next_calm_day(now)
            return f"⚠️ Fin de mois - Affluence exceptionnelle. Venez plutôt {next_best_day} pour éviter l'attente."
        
        # Recommandations normales
        if predicted_time < 10:
            return f"✅ Excellent moment ! Attente minimale ({predicted_time} min)."
        
        elif predicted_time < 30:
            return f"Temps d'attente raisonnable ({predicted_time} min). Préparez vos documents."
        
        elif predicted_time < 60:
            best_time = self._get_immediate_best_time(hour)
            return f"File modérée ({predicted_time} min). Meilleur moment : {best_time}."
        
        else:
            best_time = self._get_immediate_best_time(hour)
            return f"⚠️ Forte affluence ({predicted_time} min). Nous recommandons de venir {best_time}."
    
    def _get_next_calm_day(self, now: datetime) -> str:
        """Trouve le prochain jour calme"""
        for i in range(1, 10):
            next_day = now + timedelta(days=i)
            if next_day.day not in self.SALARY_DAYS and next_day.weekday() not in [5, 6]:
                return f"le {next_day.day}/{next_day.month}"
        return "en début de semaine prochaine"
    
    def _get_immediate_best_time(self, current_hour: int) -> str:
        """Meilleur moment immédiat"""
        if current_hour < 8:
            return "à l'ouverture (8h)"
        elif current_hour < 12:
            return "après 14h"
        elif current_hour < 16:
            return "maintenant ou demain matin 8h"
        else:
            return "demain matin 8h-9h"
    
    def _get_best_times(self, now: datetime, service_type: str) -> List[str]:
        """Liste des meilleurs créneaux"""
        
        best_times = []
        day = now.day
        hour = now.hour
        
        # Éviter les jours de salaire
        if day not in self.SALARY_DAYS:
            if hour < 8:
                best_times.append("Aujourd'hui 8h-9h")
            elif hour < 14:
                best_times.append("Aujourd'hui 14h-15h")
        
        # Milieu de semaine
        if now.weekday() in [1, 2, 3]:  # Mardi, Mercredi, Jeudi
            best_times.append("Milieu de semaine (Mar-Jeu)")
        
        # Milieu de mois
        if 10 <= day <= 20 and day not in self.SALARY_DAYS:
            best_times.append("Milieu de mois (10-20)")
        
        # Après-midi
        best_times.append("Après-midi 14h-16h")
        
        return best_times[:3]  # Max 3 suggestions
    
    def _compare_with_average(self, predicted: int, average: int) -> str:
        """Compare avec la moyenne"""
        if predicted < average * 0.8:
            return "-20% (Moins chargé que d'habitude)"
        elif predicted > average * 1.5:
            return "+50% (Plus chargé que d'habitude)"
        elif predicted > average * 1.2:
            return "+20% (Légèrement plus chargé)"
        else:
            return "Normal (Comme d'habitude)"
    
    def _check_alerts(self, factors: Dict[str, float], predicted_time: int) -> str:
        """Vérifie s'il faut émettre une alerte"""
        
        total_multiplier = (
            factors["hour_multiplier"] *
            factors["day_multiplier"] *
            factors["month_multiplier"] *
            factors["special_multiplier"]
        )
        
        if total_multiplier >= 3.0:
            return "Affluence exceptionnelle - Reportez si possible"
        elif predicted_time >= 90:
            return "Temps d'attente très élevé"
        
        return None
    
    def _empty_queue_prediction(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prédiction pour file vide"""
        return {
            "predicted_wait_time": 0,
            "confidence": 0.95,
            "factors": {
                "base_time": 0,
                "hour_multiplier": 1.0,
                "day_multiplier": 1.0,
                "month_multiplier": 1.0,
                "special_multiplier": 1.0,
                "final_multiplier": 1.0
            },
            "recommendation": "✅ Aucune attente ! C'est le moment idéal pour venir.",
            "best_times": ["Maintenant"],
            "current_vs_average": "Excellent moment"
        }


# Instance globale
smart_prediction_service = SmartPredictionService()
