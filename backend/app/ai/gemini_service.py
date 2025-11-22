"""
Fichier: backend/app/ai/gemini_service.py (VERSION CORRIGÉE)
Service IA avec Gemini Flash optimisé pour ViteviteApp
"""

import google.generativeai as genai
import os
from typing import Optional, Dict, Any
from datetime import datetime
import json
from app.models import AffluenceLevel
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if api_key:
            try:
                genai.configure(api_key=api_key)
                # ✅ CORRECTION: Utilisation du bon modèle Gemini Flash
                self.model = genai.GenerativeModel(
                    'gemini-flash-latest',  # ✅ Version valide
                    generation_config={
                        'temperature': 0.7,
                        'top_p': 0.8,
                        'top_k': 40,
                        'max_output_tokens': 500,
                    },
                    # ✅ AJOUT: Safety settings pour production
                    safety_settings={
                        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                        'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                    }
                )
                self.enabled = True
                logger.info("✅ Gemini AI activé (gemini-2.0-flash-exp)")
            except Exception as e:
                self.enabled = False
                logger.error(f"❌ Erreur initialisation Gemini: {str(e)}")
        else:
            self.enabled = False
            logger.warning("⚠️  GEMINI_API_KEY non configurée")
    
    async def predict_wait_time(self, service_data: dict, historical_data: list = None) -> dict:
        """Prédit le temps d'attente pour un service"""
        if not self.enabled:
            return self._fallback_prediction(service_data)
        
        try:
            current_time = datetime.now()
            day_of_week = current_time.strftime("%A")
            hour = current_time.hour
            
            prompt = f"""Tu es un assistant IA pour ViteviteApp, application ivoirienne de gestion de files d'attente.

Analyse et prédit le temps d'attente optimal :

SERVICE : {service_data['name']}
CATÉGORIE : {service_data['category']}
FILE ACTUELLE : {service_data['current_queue_size']} personnes
TEMPS ESTIMÉ : {service_data['estimated_wait_time']} minutes
AFFLUENCE : {service_data['affluence_level']}
JOUR : {day_of_week}
HEURE : {hour}h

CONTEXTE IVOIRIEN :
- Début de mois = forte affluence (salaires, paiements)
- Banques bondées fin de mois
- Hôpitaux pic matin (8h-11h)
- Mairies calmes après 14h

Réponds UNIQUEMENT en JSON (pas de texte avant/après) :
{{
  "predicted_wait_time": <nombre minutes>,
  "confidence": <0.0-1.0>,
  "suggested_affluence": "<faible|modérée|élevée|très_élevée>",
  "recommendation": "<conseil court>",
  "best_time_to_visit": "<meilleur créneau>"
}}"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # ✅ AMÉLIORATION: Nettoyage robuste du JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            # Suppression des caractères indésirables
            result_text = result_text.replace('\n', '').replace('\r', '')
            
            result = json.loads(result_text)
            
            return {
                "service_id": service_data['id'],
                "predicted_wait_time": result.get("predicted_wait_time", service_data['estimated_wait_time']),
                "confidence": result.get("confidence", 0.7),
                "suggested_affluence": result.get("suggested_affluence", service_data['affluence_level']),
                "recommendation": result.get("recommendation", "Consultez les horaires"),
                "best_time_to_visit": result.get("best_time_to_visit", None)
            }
        
        except Exception as e:
            logger.error(f"Erreur prédiction Gemini: {str(e)}")
            return self._fallback_prediction(service_data)
    
    def _fallback_prediction(self, service_data: dict) -> dict:
        """Prédiction de secours si Gemini indisponible"""
        queue_size = service_data['current_queue_size']
        
        if queue_size == 0:
            predicted_time = 5
            affluence = "faible"
            recommendation = "C'est le moment idéal !"
        elif queue_size <= 3:
            predicted_time = 10
            affluence = "faible"
            recommendation = "Peu d'attente prévue"
        elif queue_size <= 8:
            predicted_time = 30
            affluence = "modérée"
            recommendation = "Affluence modérée"
        elif queue_size <= 15:
            predicted_time = 60
            affluence = "élevée"
            recommendation = "Forte affluence"
        else:
            predicted_time = 90
            affluence = "très_élevée"
            recommendation = "Très forte affluence"
        
        current_hour = datetime.now().hour
        best_time = "Après 14h" if current_hour < 10 else "Demain matin 8h-9h"
        
        return {
            "service_id": service_data['id'],
            "predicted_wait_time": predicted_time,
            "confidence": 0.6,
            "suggested_affluence": affluence,
            "recommendation": recommendation,
            "best_time_to_visit": best_time
        }
    
    async def get_chatbot_response(self, user_message: str, context: dict = None) -> str:
        """
        Répond aux questions via chatbot
        ✅ AMÉLIORATION: Gestion contexte + historique conversation
        """
        if not self.enabled:
            return "Le service IA est temporairement indisponible. Consultez la FAQ ou contactez le support."
        
        try:
            # ✅ Construction contexte enrichi
            context_info = ""
            if context:
                if 'services' in context:
                    services_list = ', '.join([s['name'] for s in context['services']])
                    context_info += f"\n\nSERVICES: {services_list}"
                
                if 'previous_messages' in context and len(context['previous_messages']) > 0:
                    context_info += "\n\nHISTORIQUE:"
                    for msg in context['previous_messages'][-3:]:  # 3 derniers messages
                        role = msg.get('role', 'user')
                        content = msg.get('content', '')[:100]
                        context_info += f"\n- {role}: {content}"
            
            prompt = f"""Tu es l'assistant virtuel de ViteviteApp, application ivoirienne de gestion de files d'attente.

CARACTÉRISTIQUES:
- Amical, professionnel, efficace
- Français accessible avec expressions ivoiriennes quand approprié
- Réponses courtes (max 3 phrases)
- Expert en files d'attente, services publics CI, marketplace

TU AIDES AVEC:
✅ Prendre un ticket virtuel
✅ Documents nécessaires
✅ Horaires et adresses
✅ Éviter affluence
✅ Marketplace
✅ Fonctionnement app

SERVICES PRINCIPAUX:
- Mairies (État civil, cartes d'identité)
- Banques (Services bancaires)
- Hôpitaux (Consultations)
- Administration (DGI, etc.)

CONTEXTE:{context_info}

MESSAGE: {user_message}

Réponds naturellement, chaleureusement, concisément. Si incertain, oriente vers les bonnes ressources."""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # ✅ Limitation longueur
            if len(response_text) > 500:
                response_text = response_text[:497] + "..."
            
            # ✅ Ajout émoji contextuel si absent
            if not any(emoji in response_text for emoji in ['👋', '✅', '📄', '🎫', '⏰', '📍', '💬']):
                response_text = "💬 " + response_text
            
            return response_text
        
        except Exception as e:
            logger.error(f"Erreur chatbot Gemini: {str(e)}")
            
            # ✅ AMÉLIORATION: Réponses de secours intelligentes
            user_message_lower = user_message.lower()
            
            fallback_responses = {
                'ticket': "🎫 Pour prendre un ticket : allez sur 'Services', choisissez votre service, cliquez 'Prendre un ticket'. Instantané !",
                'document': "📄 Les documents requis dépendent du service. Chaque page de service liste les pièces nécessaires.",
                'horaire': "⏰ Les horaires varient. Consultez la page du service pour horaires précis. Plupart ouverts 8h-16h.",
                'marketplace': "🛍️ La marketplace permet d'acheter matériaux, médicaments pendant l'attente ! Livraison rapide Abidjan.",
                'comment': "💡 ViteviteApp : 1) Choisissez service 2) Prenez ticket 3) Suivez position 4) Venez quand c'est votre tour !",
            }
            
            for keyword, response in fallback_responses.items():
                if keyword in user_message_lower:
                    return response
            
            return "Je rencontre un problème technique momentané. Consultez notre FAQ ou contactez-nous directement. 😊"

# Instance globale
gemini_service = GeminiService()