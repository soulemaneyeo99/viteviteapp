import google.generativeai as genai
import os
from typing import Optional
from datetime import datetime
import json
from app.models import AffluenceLevel

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.enabled = True
        else:
            self.enabled = False
            print("⚠️  GEMINI_API_KEY non configurée - prédictions IA désactivées")
    
    async def predict_wait_time(self, service_data: dict, historical_data: list = None) -> dict:
        """Prédit le temps d'attente pour un service"""
        if not self.enabled:
            return self._fallback_prediction(service_data)
        
        try:
            # Prépare le contexte pour Gemini
            current_time = datetime.now()
            day_of_week = current_time.strftime("%A")
            hour = current_time.hour
            
            prompt = f"""
Tu es un assistant IA pour ViteviteApp, une application de gestion de files d'attente en Côte d'Ivoire.

Analyse les données suivantes et prédit le temps d'attente optimal :

SERVICE : {service_data['name']}
CATÉGORIE : {service_data['category']}
FILE D'ATTENTE ACTUELLE : {service_data['current_queue_size']} personnes
TEMPS D'ATTENTE ESTIMÉ ACTUEL : {service_data['estimated_wait_time']} minutes
NIVEAU D'AFFLUENCE : {service_data['affluence_level']}
JOUR : {day_of_week}
HEURE : {hour}h

CONTEXTE IVOIRIEN :
- Les services publics sont plus fréquentés en début de mois (paiements, démarches)
- Les banques sont bondées les jours de salaire (fin de mois)
- Les hôpitaux ont un pic le matin (8h-11h)
- Les mairies sont calmes après 14h

Réponds UNIQUEMENT au format JSON suivant (pas de texte avant ou après) :
{{
  "predicted_wait_time": <nombre en minutes>,
  "confidence": <0.0 à 1.0>,
  "suggested_affluence": "<faible|modérée|élevée|très_élevée>",
  "recommendation": "<conseil court pour l'utilisateur>",
  "best_time_to_visit": "<meilleur créneau horaire>"
}}
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Nettoie le texte pour extraire le JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            
            return {
                "service_id": service_data['id'],
                "predicted_wait_time": result.get("predicted_wait_time", service_data['estimated_wait_time']),
                "confidence": result.get("confidence", 0.7),
                "suggested_affluence": result.get("suggested_affluence", service_data['affluence_level']),
                "recommendation": result.get("recommendation", "Consultez les horaires pour éviter l'affluence"),
                "best_time_to_visit": result.get("best_time_to_visit", None)
            }
        
        except Exception as e:
            print(f"Erreur prédiction Gemini: {e}")
            return self._fallback_prediction(service_data)
    
    def _fallback_prediction(self, service_data: dict) -> dict:
        """Prédiction de secours si Gemini n'est pas disponible"""
        queue_size = service_data['current_queue_size']
        
        # Logique simple basée sur la taille de la file
        if queue_size == 0:
            predicted_time = 5
            affluence = "faible"
            recommendation = "C'est le moment idéal pour venir !"
        elif queue_size <= 3:
            predicted_time = 10
            affluence = "faible"
            recommendation = "Peu d'attente prévue"
        elif queue_size <= 8:
            predicted_time = 30
            affluence = "modérée"
            recommendation = "Affluence modérée, prévoyez un peu d'attente"
        elif queue_size <= 15:
            predicted_time = 60
            affluence = "élevée"
            recommendation = "Forte affluence, privilégiez un autre moment si possible"
        else:
            predicted_time = 90
            affluence = "très_élevée"
            recommendation = "Très forte affluence, nous recommandons de revenir plus tard"
        
        # Meilleur créneau basé sur l'heure actuelle
        current_hour = datetime.now().hour
        if current_hour < 10:
            best_time = "Après 14h"
        elif current_hour < 14:
            best_time = "Après 16h ou demain matin tôt"
        else:
            best_time = "Demain matin entre 8h et 9h"
        
        return {
            "service_id": service_data['id'],
            "predicted_wait_time": predicted_time,
            "confidence": 0.6,
            "suggested_affluence": affluence,
            "recommendation": recommendation,
            "best_time_to_visit": best_time
        }
    
    async def get_chatbot_response(self, user_message: str, context: dict = None) -> str:
        """Répond aux questions des utilisateurs via chatbot"""
        if not self.enabled:
            return "Je suis désolé, le service de chat IA est temporairement indisponible. Veuillez consulter la FAQ ou contacter le support."
        
        try:
            prompt = f"""
Tu es l'assistant virtuel de ViteviteApp, une application ivoirienne de gestion de files d'attente.

CONTEXTE UTILISATEUR :
{json.dumps(context, indent=2) if context else "Aucun contexte"}

MESSAGE UTILISATEUR : {user_message}

Réponds de manière amicale, concise et en français ivoirien si approprié.
Tu peux aider avec :
- Questions sur les services disponibles
- Comment prendre un ticket virtuel
- Documents nécessaires
- Horaires d'ouverture
- Conseils pour éviter l'affluence

Sois chaleureux et professionnel. Maximum 3 phrases.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            print(f"Erreur chatbot Gemini: {e}")
            return "Je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?"

# Instance globale
gemini_service = GeminiService()