"""
Fichier: backend/app/ai/gemini_service.py (VERSION AMÉLIORÉE)
Service IA avec Gemini Pro optimisé pour ViteviteApp
"""

import google.generativeai as genai
import os
from typing import Optional, Dict, Any
from datetime import datetime
import json
from app.models import AffluenceLevel
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                # Configuration optimisée pour des réponses rapides et pertinentes
                self.model = genai.GenerativeModel(
                    'gemini-pro',
                    generation_config={
                        'temperature': 0.7,  # Équilibre créativité/précision
                        'top_p': 0.8,
                        'top_k': 40,
                        'max_output_tokens': 500,  # Limiter pour rapidité
                    }
                )
                self.enabled = True
                logger.info("✅ Gemini AI activé avec succès")
            except Exception as e:
                self.enabled = False
                logger.error(f"❌ Erreur initialisation Gemini: {str(e)}")
        else:
            self.enabled = False
            logger.warning("⚠️  GEMINI_API_KEY non configurée - prédictions IA désactivées")
    
    async def predict_wait_time(self, service_data: dict, historical_data: list = None) -> dict:
        """Prédit le temps d'attente pour un service"""
        if not self.enabled:
            return self._fallback_prediction(service_data)
        
        try:
            current_time = datetime.now()
            day_of_week = current_time.strftime("%A")
            hour = current_time.hour
            
            prompt = f"""Tu es un assistant IA pour ViteviteApp, une application de gestion de files d'attente en Côte d'Ivoire.

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
            logger.error(f"Erreur prédiction Gemini: {str(e)}")
            return self._fallback_prediction(service_data)
    
    def _fallback_prediction(self, service_data: dict) -> dict:
        """Prédiction de secours si Gemini n'est pas disponible"""
        queue_size = service_data['current_queue_size']
        
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
        """
        Répond aux questions des utilisateurs via chatbot
        Optimisé pour des réponses naturelles et contextuelles
        """
        if not self.enabled:
            return "Je suis désolé, le service de chat IA est temporairement indisponible. Veuillez consulter la FAQ ou contacter le support."
        
        try:
            # Construction du contexte enrichi
            context_info = ""
            if context:
                if 'services' in context:
                    services_list = ', '.join([s['name'] for s in context['services']])
                    context_info = f"\n\nSERVICES DISPONIBLES: {services_list}"
                
                if 'previous_messages' in context and len(context['previous_messages']) > 0:
                    context_info += "\n\nHISTORIQUE RÉCENT:"
                    for msg in context['previous_messages'][-2:]:
                        context_info += f"\n- {msg['role']}: {msg['content'][:100]}"
            
            prompt = f"""Tu es l'assistant virtuel de ViteviteApp, une application ivoirienne innovante de gestion de files d'attente.

TES CARACTÉRISTIQUES:
- Tu es amical, professionnel et efficace
- Tu utilises un français accessible avec quelques expressions ivoiriennes quand approprié
- Tu donnes des réponses courtes et claires (maximum 3 phrases)
- Tu es expert en gestion de files d'attente, services publics ivoiriens, et marketplace

TU PEUX AIDER AVEC:
✅ Comment prendre un ticket virtuel
✅ Trouver les documents nécessaires pour chaque service
✅ Connaître les horaires et adresses des services
✅ Éviter les files d'attente (conseils affluence)
✅ Utiliser la marketplace pour acheter pendant l'attente
✅ Comprendre le fonctionnement de l'application

SERVICES PRINCIPAUX:
- Mairies (État civil, cartes d'identité)
- Banques (Services bancaires)
- Hôpitaux (Consultations)
- Administration (DGI, etc.)

CONTEXTE ACTUEL:{context_info}

MESSAGE UTILISATEUR: {user_message}

Réponds de manière naturelle, chaleureuse et concise. Si tu ne connais pas la réponse exacte, oriente l'utilisateur vers les bonnes ressources.
"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Nettoyage de la réponse
            if len(response_text) > 500:
                response_text = response_text[:497] + "..."
            
            # Ajout d'émojis contextuels si manquants
            if not any(emoji in response_text for emoji in ['👋', '✅', '📄', '🎫', '⏰', '📍']):
                response_text = "💬 " + response_text
            
            return response_text
        
        except Exception as e:
            logger.error(f"Erreur chatbot Gemini: {str(e)}")
            
            # Réponses de secours intelligentes basées sur les mots-clés
            user_message_lower = user_message.lower()
            
            if any(word in user_message_lower for word in ['ticket', 'prendre', 'créer']):
                return "🎫 Pour prendre un ticket : allez sur 'Services', choisissez votre service, cliquez sur 'Prendre un ticket' et renseignez vos informations. Vous recevrez votre numéro de ticket instantanément !"
            
            elif any(word in user_message_lower for word in ['document', 'papier', 'fournir']):
                return "📄 Les documents requis dépendent du service. Sur chaque page de service, vous trouverez la liste complète des pièces nécessaires. Préparez-les avant de venir pour gagner du temps !"
            
            elif any(word in user_message_lower for word in ['horaire', 'heure', 'ouvert']):
                return "⏰ Les horaires varient selon les services. Consultez la page du service qui vous intéresse pour voir ses horaires d'ouverture précis. La plupart sont ouverts de 8h à 16h en semaine."
            
            elif any(word in user_message_lower for word in ['marketplace', 'acheter', 'produit']):
                return "🛍️ La marketplace vous permet d'acheter matériaux, médicaments et plus encore pendant votre attente ! Parcourez nos produits et commandez en quelques clics. Livraison rapide à Abidjan."
            
            elif any(word in user_message_lower for word in ['comment', 'utiliser', 'marche']):
                return "💡 ViteviteApp est simple : 1) Choisissez votre service 2) Prenez un ticket virtuel 3) Suivez votre position en temps réel 4) Venez quand c'est votre tour ! Plus de longues files d'attente."
            
            else:
                return "Je rencontre une difficulté technique momentanée. Pour toute question, vous pouvez consulter notre FAQ ou nous contacter directement. Comment puis-je vous aider autrement ? 😊"

# Instance globale
gemini_service = GeminiService()