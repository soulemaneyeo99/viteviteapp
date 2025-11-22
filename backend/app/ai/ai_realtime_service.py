"""
Service IA pour prédictions en temps réel
Analyse l'affluence, prédit les temps d'attente, recommande les meilleurs moments
"""

import google.generativeai as genai
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIRealtimeService:
    """Service de prédictions en temps réel avec Gemini AI"""
    
    def __init__(self):
        self.enabled = False
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(
                    'gemini-flash-latest',
                    generation_config={
                        'temperature': 0.5,  # Plus déterministe pour prédictions
                        'top_p': 0.8,
                        'top_k': 40,
                        'max_output_tokens': 800,
                    },
                    safety_settings={
                        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                        'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                    }
                )
                self.enabled = True
                logger.info("✅ AI Realtime Service activé")
            except Exception as e:
                logger.error(f"❌ Erreur initialisation AI Realtime: {str(e)}")
        else:
            logger.warning("⚠️ GEMINI_API_KEY non configurée pour AI Realtime")
    
    async def predict_affluence(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prédit l'affluence actuelle et future pour un service
        
        Returns:
            {
                "current_affluence": "faible|modérée|élevée|très_élevée",
                "predicted_wait_time": int (minutes),
                "confidence": float (0.0-1.0),
                "peak_hours_today": ["10h-12h", "14h-16h"],
                "best_time_today": "15h30-16h30",
                "best_time_tomorrow": "8h-9h",
                "trend": "increasing|stable|decreasing",
                "recommendation": str
            }
        """
        if not self.enabled:
            return self._fallback_affluence_prediction(service_data)
        
        try:
            current_time = datetime.now()
            day_of_week = current_time.strftime("%A")
            hour = current_time.hour
            day_of_month = current_time.day
            
            # Contexte ivoirien spécifique
            is_month_start = day_of_month <= 5
            is_month_end = day_of_month >= 25
            
            prompt = f"""Tu es un expert en analyse de files d'attente pour ViteviteApp (Côte d'Ivoire).

DONNÉES DU SERVICE:
- Nom: {service_data.get('name', 'N/A')}
- Catégorie: {service_data.get('category', 'N/A')}
- File actuelle: {service_data.get('current_queue_size', 0)} personnes
- Temps estimé actuel: {service_data.get('estimated_wait_time', 0)} minutes
- Statut: {service_data.get('status', 'inconnu')}

CONTEXTE TEMPOREL:
- Jour: {day_of_week}
- Heure: {hour}h
- Jour du mois: {day_of_month}
- Début de mois: {"OUI" if is_month_start else "NON"}
- Fin de mois: {"OUI" if is_month_end else "NON"}

PATTERNS IVOIRIENS CONNUS:
- Banques: Très chargées début/fin de mois (salaires, paiements)
- Mairies: Pic le matin (8h-11h), calme après 14h
- Hôpitaux: Pic matin (7h-11h), urgences soir (18h-21h)
- Administration: Pic lundi matin, calme vendredi après-midi

ANALYSE REQUISE:
1. Niveau d'affluence actuel (faible/modérée/élevée/très_élevée)
2. Temps d'attente prédit avec haute précision
3. Heures de pic aujourd'hui
4. Meilleur moment aujourd'hui
5. Meilleur moment demain
6. Tendance (increasing/stable/decreasing)
7. Recommandation personnalisée

Réponds UNIQUEMENT en JSON valide (pas de texte avant/après):
{{
  "current_affluence": "faible|modérée|élevée|très_élevée",
  "predicted_wait_time": <nombre>,
  "confidence": <0.85-0.95>,
  "peak_hours_today": ["HHh-HHh", "HHh-HHh"],
  "best_time_today": "HHh-HHh ou null si trop tard",
  "best_time_tomorrow": "HHh-HHh",
  "trend": "increasing|stable|decreasing",
  "recommendation": "<conseil court et actionnable>"
}}"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Nettoyage du JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_text = result_text.replace('\n', '').replace('\r', '')
            result = json.loads(result_text)
            
            # Enrichir avec données du service
            result['service_id'] = service_data.get('id')
            result['service_name'] = service_data.get('name')
            result['timestamp'] = current_time.isoformat()
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur prédiction affluence Gemini: {str(e)}")
            return self._fallback_affluence_prediction(service_data)
    
    async def analyze_queue_trends(self, service_data: Dict[str, Any], historical_data: List[Dict] = None) -> Dict[str, Any]:
        """
        Analyse les tendances de la file d'attente
        
        Returns:
            {
                "trend_7days": "increasing|stable|decreasing",
                "average_wait_time": int,
                "busiest_day": str,
                "quietest_day": str,
                "anomalies_detected": List[str],
                "predictions_next_week": List[Dict]
            }
        """
        if not self.enabled or not historical_data:
            return self._fallback_trend_analysis(service_data)
        
        try:
            # Préparer résumé des données historiques
            history_summary = self._summarize_historical_data(historical_data)
            
            prompt = f"""Analyse les tendances de file d'attente pour {service_data.get('name', 'ce service')}.

DONNÉES HISTORIQUES (7 derniers jours):
{json.dumps(history_summary, indent=2)}

DONNÉES ACTUELLES:
- File: {service_data.get('current_queue_size', 0)} personnes
- Temps: {service_data.get('estimated_wait_time', 0)} min

Analyse et détecte:
1. Tendance générale (7 jours)
2. Temps d'attente moyen
3. Jour le plus chargé
4. Jour le plus calme
5. Anomalies (pics inhabituels, stagnations)
6. Prédictions pour la semaine prochaine

Réponds en JSON:
{{
  "trend_7days": "increasing|stable|decreasing",
  "average_wait_time": <nombre>,
  "busiest_day": "<jour>",
  "quietest_day": "<jour>",
  "anomalies_detected": ["<anomalie1>", "<anomalie2>"],
  "predictions_next_week": [
    {{"day": "<jour>", "predicted_affluence": "faible|modérée|élevée", "best_time": "HHh-HHh"}}
  ]
}}"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text.replace('\n', '').replace('\r', ''))
            result['service_id'] = service_data.get('id')
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur analyse tendances: {str(e)}")
            return self._fallback_trend_analysis(service_data)
    
    async def detect_anomalies(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Détecte les anomalies dans la file d'attente
        
        Returns:
            {
                "has_anomaly": bool,
                "anomaly_type": "stagnation|spike|unusual_pattern|none",
                "severity": "low|medium|high",
                "description": str,
                "suggested_action": str
            }
        """
        queue_size = service_data.get('current_queue_size', 0)
        wait_time = service_data.get('estimated_wait_time', 0)
        
        # Détection simple d'anomalies
        anomalies = []
        severity = "low"
        
        # File très longue
        if queue_size > 50:
            anomalies.append("File exceptionnellement longue")
            severity = "high"
        
        # Temps d'attente disproportionné
        expected_time_per_person = 5  # minutes
        expected_wait = queue_size * expected_time_per_person
        if wait_time > expected_wait * 2:
            anomalies.append("Temps d'attente anormalement long")
            severity = "high" if severity != "high" else "high"
        
        # File stagnante (à implémenter avec données temps réel)
        # Pour l'instant, détection basique
        
        if anomalies:
            return {
                "has_anomaly": True,
                "anomaly_type": "spike" if queue_size > 50 else "stagnation",
                "severity": severity,
                "description": " | ".join(anomalies),
                "suggested_action": "Ouvrir un guichet supplémentaire" if severity == "high" else "Surveiller l'évolution"
            }
        
        return {
            "has_anomaly": False,
            "anomaly_type": "none",
            "severity": "low",
            "description": "Aucune anomalie détectée",
            "suggested_action": "Continuer la surveillance normale"
        }
    
    def _fallback_affluence_prediction(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prédiction de secours sans IA"""
        queue_size = service_data.get('current_queue_size', 0)
        current_hour = datetime.now().hour
        
        # Logique heuristique
        if queue_size == 0:
            affluence = "faible"
            wait_time = 5
        elif queue_size <= 5:
            affluence = "faible"
            wait_time = 15
        elif queue_size <= 15:
            affluence = "modérée"
            wait_time = 45
        elif queue_size <= 30:
            affluence = "élevée"
            wait_time = 90
        else:
            affluence = "très_élevée"
            wait_time = 120
        
        # Heures de pic typiques
        peak_hours = ["9h-11h", "14h-16h"]
        
        # Meilleur moment
        if current_hour < 14:
            best_today = "15h-16h30"
        elif current_hour < 16:
            best_today = "16h30-17h"
        else:
            best_today = None
        
        return {
            "service_id": service_data.get('id'),
            "service_name": service_data.get('name'),
            "current_affluence": affluence,
            "predicted_wait_time": wait_time,
            "confidence": 0.65,
            "peak_hours_today": peak_hours,
            "best_time_today": best_today,
            "best_time_tomorrow": "8h-9h",
            "trend": "stable",
            "recommendation": "Consultez les horaires pour éviter l'affluence",
            "timestamp": datetime.now().isoformat()
        }
    
    def _fallback_trend_analysis(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse de tendances de secours"""
        return {
            "service_id": service_data.get('id'),
            "trend_7days": "stable",
            "average_wait_time": 30,
            "busiest_day": "Lundi",
            "quietest_day": "Vendredi",
            "anomalies_detected": [],
            "predictions_next_week": [
                {"day": "Lundi", "predicted_affluence": "élevée", "best_time": "15h-16h"},
                {"day": "Mardi", "predicted_affluence": "modérée", "best_time": "14h-15h"},
                {"day": "Mercredi", "predicted_affluence": "modérée", "best_time": "14h-15h"},
                {"day": "Jeudi", "predicted_affluence": "modérée", "best_time": "14h-15h"},
                {"day": "Vendredi", "predicted_affluence": "faible", "best_time": "Toute la journée"},
            ]
        }
    
    def _summarize_historical_data(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """Résume les données historiques pour le prompt"""
        if not historical_data:
            return {}
        
        # Grouper par jour
        by_day = {}
        for entry in historical_data[-7:]:  # 7 derniers jours
            day = entry.get('day', 'Unknown')
            if day not in by_day:
                by_day[day] = []
            by_day[day].append(entry)
        
        summary = {}
        for day, entries in by_day.items():
            avg_queue = sum(e.get('queue_size', 0) for e in entries) / len(entries)
            avg_wait = sum(e.get('wait_time', 0) for e in entries) / len(entries)
            summary[day] = {
                "avg_queue_size": round(avg_queue, 1),
                "avg_wait_time": round(avg_wait, 1),
                "num_entries": len(entries)
            }
        
        return summary


# Instance globale
ai_realtime_service = AIRealtimeService()
