"""
Service IA d'analyse de documents requis
Génère checklists intelligentes, détecte documents manquants, alerte expirations
"""

import google.generativeai as genai
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIDocumentService:
    """Service d'analyse intelligente des documents avec Gemini AI"""
    
    def __init__(self):
        self.enabled = False
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(
                    'gemini-flash-latest',
                    generation_config={
                        'temperature': 0.2,  # Très précis pour documents
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
                logger.info("✅ AI Document Service activé")
            except Exception as e:
                logger.error(f"❌ Erreur initialisation AI Document: {str(e)}")
        else:
            logger.warning("⚠️ GEMINI_API_KEY non configurée pour AI Document")
    
    async def generate_checklist(
        self,
        service_type: str,
        request_type: str,
        user_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Génère une checklist intelligente de documents requis
        
        Args:
            service_type: Type de service (mairie, banque, hôpital, etc.)
            request_type: Type de demande (passeport, CNI, extrait, etc.)
            user_info: Infos utilisateur (pour personnalisation)
        
        Returns:
            {
                "required_documents": List[Dict],
                "optional_documents": List[Dict],
                "warnings": List[str],
                "suggestions": List[str],
                "estimated_processing_time": str,
                "fees": Dict,
                "additional_info": str
            }
        """
        if not self.enabled:
            return self._fallback_checklist(service_type, request_type)
        
        try:
            # Contexte utilisateur
            user_context = ""
            if user_info:
                age = user_info.get('age')
                has_cni = user_info.get('has_cni', False)
                cni_expiry = user_info.get('cni_expiry_date')
                
                user_context = f"\nINFOS UTILISATEUR:\n"
                if age:
                    user_context += f"- Âge: {age} ans\n"
                if has_cni:
                    user_context += f"- Possède CNI: Oui\n"
                    if cni_expiry:
                        user_context += f"- Expiration CNI: {cni_expiry}\n"
            
            prompt = f"""Tu es un expert des démarches administratives en Côte d'Ivoire.

DEMANDE:
- Service: {service_type}
- Type de demande: {request_type}
{user_context}

CONTEXTE IVOIRIEN:
- CNI: Carte Nationale d'Identité (valide 10 ans)
- Extrait de naissance: Document d'état civil
- Certificat de résidence: Délivré par la mairie
- Timbre fiscal: Requis pour certaines démarches

GÉNÈRE UNE CHECKLIST COMPLÈTE:

1. Documents OBLIGATOIRES (sans lesquels la demande sera rejetée)
2. Documents OPTIONNELS (qui peuvent accélérer ou faciliter)
3. AVERTISSEMENTS (expirations, documents manquants probables)
4. SUGGESTIONS PROACTIVES (ex: "Votre CNI expire bientôt, profitez-en pour la renouveler")
5. Temps de traitement estimé
6. Frais (si applicable)
7. Informations additionnelles utiles

Réponds UNIQUEMENT en JSON valide:
{{
  "required_documents": [
    {{
      "name": "<nom document>",
      "description": "<description courte>",
      "format": "original|copie|certifiée",
      "quantity": <nombre>,
      "validity_requirement": "<si applicable>"
    }}
  ],
  "optional_documents": [
    {{
      "name": "<nom>",
      "description": "<description>",
      "benefit": "<avantage de le fournir>"
    }}
  ],
  "warnings": ["<avertissement1>", "<avertissement2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "estimated_processing_time": "<délai>",
  "fees": {{
    "amount": <montant en FCFA ou 0>,
    "description": "<description frais>"
  }},
  "additional_info": "<info utile>"
}}"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Nettoyage JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result_text = result_text.replace('\n', '').replace('\r', '')
            result = json.loads(result_text)
            
            # Ajouter vérifications d'expiration si user_info fourni
            if user_info and user_info.get('cni_expiry_date'):
                expiry_check = self._check_document_expiry(
                    user_info.get('cni_expiry_date'),
                    'CNI'
                )
                if expiry_check:
                    result['warnings'].insert(0, expiry_check['warning'])
                    if expiry_check.get('suggestion'):
                        result['suggestions'].insert(0, expiry_check['suggestion'])
            
            result['service_type'] = service_type
            result['request_type'] = request_type
            result['generated_at'] = datetime.now().isoformat()
            
            return result
        
        except Exception as e:
            logger.error(f"Erreur génération checklist Gemini: {str(e)}")
            return self._fallback_checklist(service_type, request_type)
    
    async def analyze_user_documents(
        self,
        user_documents: List[Dict[str, Any]],
        required_documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyse les documents de l'utilisateur vs requis
        
        Returns:
            {
                "is_complete": bool,
                "missing_documents": List[str],
                "expiring_soon": List[Dict],
                "invalid_documents": List[Dict],
                "readiness_score": int (0-100),
                "recommendations": List[str]
            }
        """
        missing = []
        expiring = []
        invalid = []
        
        # Créer map des documents utilisateur
        user_docs_map = {doc.get('type', '').lower(): doc for doc in user_documents}
        
        # Vérifier chaque document requis
        for req_doc in required_documents:
            doc_name = req_doc.get('name', '').lower()
            
            # Chercher correspondance
            found = False
            for user_doc_type, user_doc in user_docs_map.items():
                if doc_name in user_doc_type or user_doc_type in doc_name:
                    found = True
                    
                    # Vérifier expiration
                    if user_doc.get('expiry_date'):
                        expiry_check = self._check_document_expiry(
                            user_doc.get('expiry_date'),
                            req_doc.get('name')
                        )
                        if expiry_check:
                            if 'expiré' in expiry_check.get('warning', '').lower():
                                invalid.append({
                                    "document": req_doc.get('name'),
                                    "reason": expiry_check['warning']
                                })
                            elif 'expire' in expiry_check.get('warning', '').lower():
                                expiring.append({
                                    "document": req_doc.get('name'),
                                    "expiry_date": user_doc.get('expiry_date'),
                                    "warning": expiry_check['warning']
                                })
                    break
            
            if not found:
                missing.append(req_doc.get('name'))
        
        # Calculer score de préparation
        total_required = len(required_documents)
        missing_count = len(missing)
        invalid_count = len(invalid)
        
        readiness_score = max(0, int(100 * (1 - (missing_count + invalid_count) / max(total_required, 1))))
        
        # Générer recommandations
        recommendations = []
        if missing:
            recommendations.append(f"Obtenez les documents manquants: {', '.join(missing[:3])}")
        if invalid:
            recommendations.append(f"Renouvelez les documents expirés: {', '.join([d['document'] for d in invalid[:2]])}")
        if expiring:
            recommendations.append(f"Attention: {expiring[0]['document']} expire bientôt")
        if readiness_score == 100:
            recommendations.append("✅ Vous êtes prêt ! Tous les documents sont en ordre.")
        
        return {
            "is_complete": readiness_score == 100,
            "missing_documents": missing,
            "expiring_soon": expiring,
            "invalid_documents": invalid,
            "readiness_score": readiness_score,
            "recommendations": recommendations,
            "total_required": total_required,
            "total_provided": total_required - missing_count
        }
    
    def _check_document_expiry(self, expiry_date_str: str, document_name: str) -> Optional[Dict[str, str]]:
        """Vérifie si un document est expiré ou expire bientôt"""
        try:
            # Parser la date (format ISO ou DD/MM/YYYY)
            if 'T' in expiry_date_str:
                expiry_date = datetime.fromisoformat(expiry_date_str.replace('Z', '+00:00'))
            else:
                # Essayer format DD/MM/YYYY
                parts = expiry_date_str.split('/')
                if len(parts) == 3:
                    expiry_date = datetime(int(parts[2]), int(parts[1]), int(parts[0]))
                else:
                    return None
            
            now = datetime.now()
            days_until_expiry = (expiry_date - now).days
            
            if days_until_expiry < 0:
                return {
                    "warning": f"⚠️ {document_name} a expiré le {expiry_date_str}",
                    "suggestion": f"Renouvelez votre {document_name} immédiatement"
                }
            elif days_until_expiry <= 30:
                return {
                    "warning": f"⚠️ {document_name} expire dans {days_until_expiry} jours",
                    "suggestion": f"Profitez-en pour renouveler votre {document_name}"
                }
            elif days_until_expiry <= 90:
                return {
                    "warning": f"ℹ️ {document_name} expire dans {days_until_expiry} jours",
                    "suggestion": None
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Erreur vérification expiration: {str(e)}")
            return None
    
    def _fallback_checklist(self, service_type: str, request_type: str) -> Dict[str, Any]:
        """Checklist de secours basée sur règles"""
        
        # Base de données simple de documents
        common_docs = {
            "passeport": {
                "required": [
                    {"name": "CNI", "description": "Carte Nationale d'Identité en cours de validité", "format": "original", "quantity": 1},
                    {"name": "Extrait de naissance", "description": "Extrait de naissance de moins de 3 mois", "format": "original", "quantity": 1},
                    {"name": "Photos d'identité", "description": "4 photos récentes fond blanc", "format": "original", "quantity": 4},
                    {"name": "Timbre fiscal", "description": "Timbre fiscal de 25 000 FCFA", "format": "original", "quantity": 1}
                ],
                "optional": [
                    {"name": "Certificat de résidence", "description": "Peut accélérer le traitement", "benefit": "Traitement prioritaire"}
                ],
                "time": "2-3 semaines",
                "fees": {"amount": 75000, "description": "Frais de passeport biométrique"}
            },
            "cni": {
                "required": [
                    {"name": "Extrait de naissance", "description": "Extrait de naissance original", "format": "original", "quantity": 1},
                    {"name": "Certificat de résidence", "description": "Délivré par la mairie", "format": "original", "quantity": 1},
                    {"name": "Photos d'identité", "description": "4 photos récentes", "format": "original", "quantity": 4}
                ],
                "optional": [],
                "time": "1-2 semaines",
                "fees": {"amount": 5000, "description": "Frais de CNI"}
            },
            "extrait": {
                "required": [
                    {"name": "Pièce d'identité", "description": "CNI ou passeport", "format": "copie", "quantity": 1}
                ],
                "optional": [],
                "time": "Immédiat à 24h",
                "fees": {"amount": 1000, "description": "Frais d'extrait"}
            }
        }
        
        # Chercher correspondance
        request_lower = request_type.lower()
        checklist = None
        
        for key, data in common_docs.items():
            if key in request_lower or request_lower in key:
                checklist = data
                break
        
        if not checklist:
            # Checklist générique
            checklist = {
                "required": [
                    {"name": "Pièce d'identité", "description": "CNI ou passeport", "format": "copie", "quantity": 1}
                ],
                "optional": [],
                "time": "Variable",
                "fees": {"amount": 0, "description": "Consultez le service"}
            }
        
        return {
            "required_documents": checklist["required"],
            "optional_documents": checklist.get("optional", []),
            "warnings": ["Vérifiez que tous vos documents sont en cours de validité"],
            "suggestions": ["Préparez des copies de vos documents"],
            "estimated_processing_time": checklist.get("time", "Variable"),
            "fees": checklist.get("fees", {"amount": 0, "description": "Non spécifié"}),
            "additional_info": f"Checklist pour {request_type} - {service_type}",
            "service_type": service_type,
            "request_type": request_type,
            "generated_at": datetime.now().isoformat()
        }


# Instance globale
ai_document_service = AIDocumentService()
