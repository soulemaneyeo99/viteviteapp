"""
Service IA de notifications intelligentes
Génère des notifications contextuelles et prédictives
"""

import google.generativeai as genai
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AINotificationService:
    """Service de notifications intelligentes avec Gemini AI"""
    
    def __init__(self):
        self.enabled = False
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(
                    'gemini-flash-latest',
                    generation_config={
                        'temperature': 0.6,
                        'top_p': 0.9,
                        'top_k': 40,
                        'max_output_tokens': 300,
                    },
                    safety_settings={
                        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                        'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                    }
                )
                self.enabled = True
                logger.info("✅ AI Notification Service activé")
            except Exception as e:
                logger.error(f"❌ Erreur initialisation AI Notification: {str(e)}")
        else:
            logger.warning("⚠️ GEMINI_API_KEY non configurée pour AI Notification")
    
    async def generate_smart_notification(
        self,
        notification_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Génère une notification intelligente et contextuelle
        
        Args:
            notification_type: Type (position_update, affluence_alert, closing_soon, etc.)
            context: Contexte (position, service, temps, etc.)
        
        Returns:
            {
                "title": str,
                "message": str,
                "priority": "low|medium|high|urgent",
                "action_button": Optional[Dict],
                "icon": str (emoji),
                "sound": bool
            }
        """
        
        # Pour notifications simples, utiliser templates rapides
        if notification_type in self._get_simple_templates():
            return self._generate_from_template(notification_type, context)
        
        # Pour notifications complexes, utiliser IA
        if not self.enabled:
            return self._generate_from_template(notification_type, context)
        
        try:
            prompt = f"""Génère une notification mobile intelligente pour ViteviteApp.

TYPE: {notification_type}
CONTEXTE: {json.dumps(context, ensure_ascii=False)}

RÈGLES:
- Titre: Max 40 caractères, accrocheur
- Message: Max 100 caractères, clair et actionnable
- Priorité: low/medium/high/urgent selon importance
- Emoji: 1 emoji pertinent au début du titre
- Ton: Amical, professionnel, rassurant

TYPES DE NOTIFICATIONS:
- position_update: "Il reste X personnes avant vous"
- affluence_alert: "Affluence élevée détectée"
- closing_soon: "Le service ferme bientôt"
- agent_added: "Un agent supplémentaire ajouté"
- your_turn: "C'est bientôt votre tour"
- delay_warning: "Retard détecté"

Réponds en JSON:
{{
  "title": "<titre avec emoji>",
  "message": "<message court>",
  "priority": "low|medium|high|urgent",
  "action_button": {{"text": "<texte bouton>", "action": "<action>"}},
  "icon": "<emoji>",
  "sound": true|false
}}"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text.replace('\n', '').replace('\r', ''))
            result['timestamp'] = datetime.now().isoformat()
            result['type'] = notification_type
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur génération notification IA: {str(e)}")
            return self._generate_from_template(notification_type, context)
    
    def _generate_from_template(self, notification_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Génère notification depuis templates prédéfinis (rapide)"""
        
        templates = {
            "position_update": {
                "title": "🎫 Mise à jour de votre position",
                "message": f"Il reste {context.get('people_ahead', 'X')} personnes avant vous. Préparez-vous !",
                "priority": "medium" if context.get('people_ahead', 10) <= 3 else "low",
                "icon": "🎫",
                "sound": context.get('people_ahead', 10) <= 3
            },
            "affluence_alert": {
                "title": "📊 Affluence élevée",
                "message": f"+{context.get('new_people', 'X')} personnes en {context.get('time_window', '15')} min. Temps d'attente augmenté.",
                "priority": "medium",
                "icon": "📊",
                "sound": False
            },
            "closing_soon": {
                "title": "⏰ Fermeture imminente",
                "message": f"Le service ferme dans {context.get('minutes_left', 'X')} minutes. Dépêchez-vous !",
                "priority": "high",
                "icon": "⏰",
                "sound": True
            },
            "agent_added": {
                "title": "✅ Bonne nouvelle !",
                "message": f"1 agent ajouté → Temps d'attente réduit de {context.get('time_saved', 'X')} min",
                "priority": "low",
                "icon": "✅",
                "sound": False
            },
            "your_turn": {
                "title": "🔔 C'est votre tour !",
                "message": f"Présentez-vous au guichet {context.get('counter', 'X')}",
                "priority": "urgent",
                "icon": "🔔",
                "sound": True,
                "action_button": {"text": "J'arrive", "action": "confirm_arrival"}
            },
            "delay_warning": {
                "title": "⚠️ Retard détecté",
                "message": f"File stagnante depuis {context.get('minutes', 'X')} min. Nous surveillons la situation.",
                "priority": "medium",
                "icon": "⚠️",
                "sound": False
            },
            "best_time_suggestion": {
                "title": "💡 Conseil IA",
                "message": f"Meilleur moment pour visiter: {context.get('best_time', 'demain matin')}",
                "priority": "low",
                "icon": "💡",
                "sound": False
            },
            "document_reminder": {
                "title": "📄 N'oubliez pas !",
                "message": f"Documents requis: {context.get('documents', 'CNI, extrait de naissance')}",
                "priority": "medium",
                "icon": "📄",
                "sound": False
            }
        }
        
        template = templates.get(notification_type, {
            "title": "ℹ️ Notification",
            "message": context.get('message', 'Nouvelle notification'),
            "priority": "low",
            "icon": "ℹ️",
            "sound": False
        })
        
        return {
            **template,
            "timestamp": datetime.now().isoformat(),
            "type": notification_type
        }
    
    def _get_simple_templates(self) -> List[str]:
        """Types de notifications avec templates simples"""
        return [
            "position_update",
            "affluence_alert",
            "closing_soon",
            "agent_added",
            "your_turn",
            "delay_warning",
            "best_time_suggestion",
            "document_reminder"
        ]
    
    async def generate_admin_alert(
        self,
        alert_type: str,
        service_data: Dict[str, Any],
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Génère une alerte pour les administrateurs
        
        Returns:
            {
                "title": str,
                "message": str,
                "severity": "info|warning|critical",
                "recommended_action": str,
                "metrics": Dict
            }
        """
        
        alerts = {
            "queue_overflow": {
                "title": "🚨 File d'attente saturée",
                "message": f"{service_data.get('name')}: {metrics.get('queue_size')} personnes en attente",
                "severity": "critical",
                "recommended_action": "Ouvrir un guichet supplémentaire immédiatement"
            },
            "long_wait_time": {
                "title": "⚠️ Temps d'attente élevé",
                "message": f"{service_data.get('name')}: {metrics.get('wait_time')} min d'attente moyenne",
                "severity": "warning",
                "recommended_action": "Envisager d'ajouter un agent"
            },
            "stagnant_queue": {
                "title": "⏸️ File stagnante",
                "message": f"{service_data.get('name')}: Aucun mouvement depuis {metrics.get('stagnant_minutes')} min",
                "severity": "warning",
                "recommended_action": "Vérifier le fonctionnement des guichets"
            },
            "peak_approaching": {
                "title": "📈 Pic d'affluence prévu",
                "message": f"{service_data.get('name')}: Pic attendu dans {metrics.get('minutes_until_peak')} min",
                "severity": "info",
                "recommended_action": "Prévoir agents supplémentaires"
            },
            "low_efficiency": {
                "title": "📉 Efficacité réduite",
                "message": f"{service_data.get('name')}: {metrics.get('tickets_per_hour')} tickets/h (normal: {metrics.get('normal_rate')})",
                "severity": "warning",
                "recommended_action": "Vérifier les processus et former les agents"
            }
        }
        
        alert = alerts.get(alert_type, {
            "title": "ℹ️ Alerte système",
            "message": f"Alerte pour {service_data.get('name')}",
            "severity": "info",
            "recommended_action": "Vérifier les données"
        })
        
        return {
            **alert,
            "service_id": service_data.get('id'),
            "timestamp": datetime.now().isoformat(),
            "metrics": metrics
        }


# Instance globale
ai_notification_service = AINotificationService()
