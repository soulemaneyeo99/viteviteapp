import json
import logging
from typing import List, Dict, Any, Optional
from app.ai.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class AIPharmacyService:
    def __init__(self):
        self.model = gemini_service.model
        self.enabled = gemini_service.enabled

    async def find_alternatives(self, medicine_name: str, dosage: str, context: str = "") -> Dict[str, Any]:
        """
        Trouve des alternatives intelligentes pour un médicament en rupture
        """
        if not self.enabled:
            return self._fallback_alternatives(medicine_name)

        try:
            prompt = f"""Tu es un assistant pharmacien expert.
            
            MÉDICAMENT RECHERCHÉ : {medicine_name}
            DOSAGE : {dosage}
            CONTEXTE : {context}
            
            Le médicament est en rupture de stock. Propose des alternatives sûres et pertinentes.
            
            Règles :
            1. Propose d'abord la MÊME MOLECULE (génériques)
            2. Propose ensuite des ÉQUIVALENTS THÉRAPEUTIQUES (même classe)
            3. Indique clairement si une ordonnance est requise
            4. Précise si le dosage est différent
            
            Réponds UNIQUEMENT en JSON au format suivant :
            {{
                "alternatives": [
                    {{
                        "name": "Nom du médicament",
                        "molecule": "Molécule active",
                        "type": "Générique" | "Équivalent",
                        "dosage": "Dosage proposé",
                        "confidence": 0.95,
                        "warning": "Message d'avertissement si nécessaire"
                    }}
                ],
                "advice": "Conseil général pour le patient"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
                
            return json.loads(result_text)
            
        except Exception as e:
            logger.error(f"Erreur AI Pharmacy: {str(e)}")
            return self._fallback_alternatives(medicine_name)

    def _fallback_alternatives(self, medicine_name: str) -> Dict[str, Any]:
        """Fallback basique si l'IA échoue"""
        return {
            "alternatives": [],
            "advice": "Veuillez consulter un pharmacien pour trouver une alternative.",
            "is_fallback": True
        }

ai_pharmacy_service = AIPharmacyService()
