"""
Service IA de triage médical pour urgences
Analyse les symptômes, classifie l'urgence, recommande l'hôpital approprié
"""

import google.generativeai as genai
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AITriageService:
    """Service de triage médical intelligent avec Gemini AI"""
    
    def __init__(self):
        self.enabled = False
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(
                    'gemini-flash-latest',
                    generation_config={
                        'temperature': 0.3,  # Très déterministe pour médical
                        'top_p': 0.9,
                        'top_k': 40,
                        'max_output_tokens': 1000,
                    },
                    safety_settings={
                        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                        'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                    }
                )
                self.enabled = True
                logger.info("✅ AI Triage Service activé")
            except Exception as e:
                logger.error(f"❌ Erreur initialisation AI Triage: {str(e)}")
        else:
            logger.warning("⚠️ GEMINI_API_KEY non configurée pour AI Triage")
    
    async def analyze_symptoms(
        self, 
        symptoms: str, 
        patient_info: Optional[Dict[str, Any]] = None,
        available_hospitals: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Analyse les symptômes et recommande un plan d'action
        
        Args:
            symptoms: Description des symptômes
            patient_info: Infos patient (âge, sexe, antécédents)
            available_hospitals: Liste des hôpitaux disponibles
        
        Returns:
            {
                "urgency_level": "urgence_vitale|urgente|normale|non_urgente",
                "severity_score": int (1-10),
                "confidence": float (0.0-1.0),
                "primary_concern": str,
                "recommended_specialty": str,
                "recommended_hospital": Dict,
                "alternative_hospitals": List[Dict],
                "action_required": str,
                "warning_signs": List[str],
                "estimated_consultation_time": int (minutes),
                "advice": str
            }
        """
        if not self.enabled:
            return self._fallback_triage(symptoms, available_hospitals)
        
        try:
            # Préparer contexte patient
            patient_context = ""
            if patient_info:
                age = patient_info.get('age', 'non spécifié')
                sex = patient_info.get('sex', 'non spécifié')
                history = patient_info.get('medical_history', 'aucun')
                patient_context = f"\nÂge: {age}\nSexe: {sex}\nAntécédents: {history}"
            
            # Préparer liste hôpitaux
            hospitals_context = ""
            if available_hospitals:
                hospitals_list = []
                for h in available_hospitals[:5]:  # Top 5
                    hospitals_list.append(
                        f"- {h.get('name')}: "
                        f"Attente {h.get('estimated_wait_time', 'N/A')} min, "
                        f"{h.get('current_queue_size', 0)} personnes, "
                        f"Spécialités: {', '.join(h.get('specialties', ['Général']))}"
                    )
                hospitals_context = "\n\nHÔPITAUX DISPONIBLES:\n" + "\n".join(hospitals_list)
            
            prompt = f"""Tu es un assistant médical IA pour le triage des urgences en Côte d'Ivoire.

⚠️ IMPORTANT: Ceci est un outil d'aide à la décision, PAS un diagnostic médical.

SYMPTÔMES RAPPORTÉS:
{symptoms}
{patient_context}
{hospitals_context}

NIVEAUX D'URGENCE:
1. URGENCE VITALE: Danger immédiat (AVC, crise cardiaque, hémorragie sévère, difficulté respiratoire aiguë)
2. URGENTE: Nécessite soins rapides (fracture, fièvre élevée, douleur intense)
3. NORMALE: Consultation dans les heures qui suivent (infections, douleurs modérées)
4. NON-URGENTE: Peut attendre (rhume, petites blessures, consultation de routine)

SPÉCIALITÉS COURANTES:
- Cardiologie (cœur, poitrine)
- Neurologie (tête, vertiges, paralysie)
- Orthopédie (os, fractures)
- Pédiatrie (enfants)
- Médecine générale (autres cas)

ANALYSE REQUISE:
1. Niveau d'urgence (sois prudent, en cas de doute → urgence supérieure)
2. Score de sévérité (1-10)
3. Préoccupation principale
4. Spécialité recommandée
5. Hôpital recommandé (si liste fournie, sinon "CHU le plus proche")
6. Hôpitaux alternatifs
7. Action requise (appeler SAMU 185, aller immédiatement, consulter rapidement, etc.)
8. Signes d'alerte à surveiller
9. Temps de consultation estimé
10. Conseil bref

Réponds UNIQUEMENT en JSON valide:
{{
  "urgency_level": "urgence_vitale|urgente|normale|non_urgente",
  "severity_score": <1-10>,
  "confidence": <0.7-0.95>,
  "primary_concern": "<préoccupation principale>",
  "recommended_specialty": "<spécialité>",
  "recommended_hospital": {{"name": "<nom>", "reason": "<raison courte>"}},
  "alternative_hospitals": [{{"name": "<nom>", "reason": "<raison>"}}],
  "action_required": "<action immédiate>",
  "warning_signs": ["<signe1>", "<signe2>"],
  "estimated_consultation_time": <minutes>,
  "advice": "<conseil bref et rassurant>"
}}

RAPPEL: En cas de doute, privilégie toujours la sécurité du patient."""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Nettoyage JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_text = result_text.replace('\n', '').replace('\r', '')
            result = json.loads(result_text)
            
            # Enrichir avec métadonnées
            result['timestamp'] = datetime.now().isoformat()
            result['symptoms_analyzed'] = symptoms[:100]  # Premiers 100 caractères
            result['disclaimer'] = "Ceci est une aide à la décision, pas un diagnostic médical. En cas de doute, appelez le SAMU (185)."
            
            # Si urgence vitale, forcer action SAMU
            if result.get('urgency_level') == 'urgence_vitale':
                result['action_required'] = "🚨 APPELEZ IMMÉDIATEMENT LE SAMU (185) ou rendez-vous aux urgences"
                result['severity_score'] = max(result.get('severity_score', 9), 9)
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur triage Gemini: {str(e)}")
            return self._fallback_triage(symptoms, available_hospitals)
    
    async def recommend_hospital(
        self,
        urgency_level: str,
        specialty: str,
        available_hospitals: List[Dict[str, Any]],
        user_location: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Recommande le meilleur hôpital selon l'urgence et la spécialité
        
        Returns:
            {
                "recommended": Dict (hôpital recommandé),
                "alternatives": List[Dict],
                "reasoning": str
            }
        """
        if not available_hospitals:
            return {
                "recommended": {"name": "CHU de Cocody", "reason": "Hôpital par défaut"},
                "alternatives": [],
                "reasoning": "Aucun hôpital disponible dans la base de données"
            }
        
        # Filtrer par spécialité si possible
        matching_hospitals = [
            h for h in available_hospitals 
            if specialty.lower() in [s.lower() for s in h.get('specialties', [])]
        ]
        
        if not matching_hospitals:
            matching_hospitals = available_hospitals
        
        # Trier par temps d'attente et disponibilité
        sorted_hospitals = sorted(
            matching_hospitals,
            key=lambda h: (
                h.get('estimated_wait_time', 999),
                h.get('current_queue_size', 999)
            )
        )
        
        recommended = sorted_hospitals[0] if sorted_hospitals else available_hospitals[0]
        alternatives = sorted_hospitals[1:4] if len(sorted_hospitals) > 1 else []
        
        reasoning = f"Recommandé pour {specialty} avec temps d'attente minimal ({recommended.get('estimated_wait_time', 'N/A')} min)"
        
        return {
            "recommended": {
                "id": recommended.get('id'),
                "name": recommended.get('name'),
                "wait_time": recommended.get('estimated_wait_time'),
                "queue_size": recommended.get('current_queue_size'),
                "reason": reasoning
            },
            "alternatives": [
                {
                    "id": h.get('id'),
                    "name": h.get('name'),
                    "wait_time": h.get('estimated_wait_time'),
                    "queue_size": h.get('current_queue_size')
                }
                for h in alternatives
            ],
            "reasoning": reasoning
        }
    
    def _fallback_triage(self, symptoms: str, available_hospitals: Optional[List] = None) -> Dict[str, Any]:
        """Triage de secours basé sur mots-clés"""
        symptoms_lower = symptoms.lower()
        
        # Détection mots-clés critiques
        critical_keywords = ['coeur', 'poitrine', 'respir', 'sang', 'inconscient', 'paralys', 'avc']
        urgent_keywords = ['fièvre', 'douleur intense', 'fracture', 'brûlure', 'vomissement']
        
        is_critical = any(kw in symptoms_lower for kw in critical_keywords)
        is_urgent = any(kw in symptoms_lower for kw in urgent_keywords)
        
        if is_critical:
            urgency = "urgence_vitale"
            severity = 9
            action = "🚨 APPELEZ IMMÉDIATEMENT LE SAMU (185)"
            specialty = "Urgences / Cardiologie"
            time = 0
        elif is_urgent:
            urgency = "urgente"
            severity = 7
            action = "Rendez-vous rapidement aux urgences"
            specialty = "Médecine générale"
            time = 30
        else:
            urgency = "normale"
            severity = 4
            action = "Consultez un médecin dans les prochaines heures"
            specialty = "Médecine générale"
            time = 60
        
        # Recommander hôpital
        hospital = {"name": "CHU de Cocody", "reason": "Hôpital principal"}
        if available_hospitals and len(available_hospitals) > 0:
            # Prendre celui avec le moins d'attente
            sorted_h = sorted(available_hospitals, key=lambda h: h.get('estimated_wait_time', 999))
            hospital = {
                "name": sorted_h[0].get('name'),
                "reason": f"Temps d'attente minimal ({sorted_h[0].get('estimated_wait_time')} min)"
            }
        
        return {
            "urgency_level": urgency,
            "severity_score": severity,
            "confidence": 0.6,
            "primary_concern": "Évaluation basique des symptômes",
            "recommended_specialty": specialty,
            "recommended_hospital": hospital,
            "alternative_hospitals": [],
            "action_required": action,
            "warning_signs": ["Aggravation des symptômes", "Nouveaux symptômes"],
            "estimated_consultation_time": time,
            "advice": "En cas de doute, appelez toujours le SAMU (185)",
            "timestamp": datetime.now().isoformat(),
            "symptoms_analyzed": symptoms[:100],
            "disclaimer": "Triage automatique basique. Consultez un professionnel de santé."
        }


# Instance globale
ai_triage_service = AITriageService()
