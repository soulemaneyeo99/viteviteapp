"""
ViteviteApp - Auto Seeding Module
Fonction de seeding automatique pour production
"""
import asyncio
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.core.database import AsyncSessionLocal

logger = logging.getLogger(__name__)


async def auto_seed_database():
    """
    Seed automatique de la base de données au démarrage
    Vérifie si des services existent déjà pour éviter les doublons
    """
    try:
        logger.info("🌱 Vérification du seeding de la base de données...")
        
        # Créer une session directement
        async with AsyncSessionLocal() as session:
            # Vérifier si des services existent déjà
            result = await session.execute(select(Service))
            existing_services = result.scalars().all()
            
            if len(existing_services) > 0:
                logger.info(f"✅ Base de données déjà seedée ({len(existing_services)} services)")
                return
            
            logger.info("📝 Aucun service trouvé, seeding en cours...")
            
            # Liste des services à créer
            services_data = [
                {
                    "name": "Mairie de Cocody - État Civil",
                    "slug": "mairie-cocody-etat-civil",
                    "category": "Administration",
                    "description": "Service d'état civil pour les déclarations de naissance, décès et mariages.",
                    "icon": "building",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.HIGH,
                    "estimated_wait_time": 45,
                    "current_queue_size": 23,
                    "opening_hours": "07:30 - 16:30",
                    "location": {"lat": 5.3599, "lng": -4.0083, "address": "Boulevard de France, Cocody, Abidjan"},
                    "required_documents": [{"name": "Pièce d'identité", "required": True}, {"name": "Extrait de naissance", "required": True}]
                },
                {
                    "name": "Préfecture d'Abidjan - Cartes d'identité",
                    "slug": "prefecture-abidjan-cni",
                    "category": "Documents officiels",
                    "description": "Renouvellement et retrait de CNI.",
                    "icon": "id-card",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.VERY_HIGH,
                    "estimated_wait_time": 120,
                    "current_queue_size": 156,
                    "opening_hours": "08:00 - 17:00",
                    "location": {"lat": 5.3200, "lng": -4.0200, "address": "Plateau, Abidjan"},
                    "required_documents": [{"name": "Ancienne CNI", "required": False}, {"name": "Extrait de naissance", "required": True}]
                },
                {
                    "name": "CNPS - Affiliation",
                    "slug": "cnps-affiliation",
                    "category": "Sécurité sociale",
                    "description": "Affiliation à la Caisse Nationale de Prévoyance Sociale.",
                    "icon": "shield",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.MODERATE,
                    "estimated_wait_time": 30,
                    "current_queue_size": 12,
                    "opening_hours": "08:00 - 15:00",
                    "location": {"lat": 5.3400, "lng": -4.0100, "address": "Avenue Lamblin, Plateau, Abidjan"},
                    "required_documents": [{"name": "Contrat de travail", "required": True}, {"name": "Pièce d'identité", "required": True}]
                },
                {
                    "name": "Hôpital Général d'Abobo - Consultations",
                    "slug": "hopital-abobo-consultations",
                    "category": "Santé",
                    "description": "Consultations médicales générales.",
                    "icon": "heart",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.HIGH,
                    "estimated_wait_time": 60,
                    "current_queue_size": 45,
                    "opening_hours": "07:00 - 18:00",
                    "location": {"lat": 5.4200, "lng": -4.0300, "address": "Abobo, Abidjan"},
                    "required_documents": [{"name": "Carnet de santé", "required": False}, {"name": "Carte d'assurance", "required": False}]
                },
                {
                    "name": "Banque Atlantique - Ouverture de compte",
                    "slug": "banque-atlantique-compte",
                    "category": "Banque",
                    "description": "Ouverture de compte bancaire personnel.",
                    "icon": "credit-card",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.LOW,
                    "estimated_wait_time": 15,
                    "current_queue_size": 5,
                    "opening_hours": "08:00 - 17:00",
                    "location": {"lat": 5.3250, "lng": -4.0150, "address": "Boulevard Clozel, Plateau, Abidjan"},
                    "required_documents": [{"name": "Pièce d'identité", "required": True}, {"name": "Justificatif de domicile", "required": True}]
                },
                {
                    "name": "CIE - Branchement électrique",
                    "slug": "cie-branchement",
                    "category": "Énergie",
                    "description": "Demande de nouveau branchement électrique.",
                    "icon": "zap",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.MODERATE,
                    "estimated_wait_time": 40,
                    "current_queue_size": 18,
                    "opening_hours": "07:30 - 16:00",
                    "location": {"lat": 5.3300, "lng": -4.0250, "address": "Avenue Christiani, Treichville, Abidjan"},
                    "required_documents": [{"name": "Plan de localisation", "required": True}, {"name": "Pièce d'identité", "required": True}]
                },
                {
                    "name": "SODECI - Abonnement eau",
                    "slug": "sodeci-abonnement",
                    "category": "Eau",
                    "description": "Nouvel abonnement pour l'eau potable.",
                    "icon": "droplet",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.LOW,
                    "estimated_wait_time": 25,
                    "current_queue_size": 8,
                    "opening_hours": "08:00 - 16:30",
                    "location": {"lat": 5.3350, "lng": -4.0180, "address": "Rue du Commerce, Plateau, Abidjan"},
                    "required_documents": [{"name": "Titre de propriété ou bail", "required": True}, {"name": "Pièce d'identité", "required": True}]
                },
                {
                    "name": "Tribunal de Première Instance - Casier judiciaire",
                    "slug": "tribunal-casier-judiciaire",
                    "category": "Justice",
                    "description": "Demande de casier judiciaire.",
                    "icon": "file-text",
                    "status": ServiceStatus.OPEN,
                    "affluence_level": AffluenceLevel.MODERATE,
                    "estimated_wait_time": 35,
                    "current_queue_size": 14,
                    "opening_hours": "08:00 - 15:00",
                    "location": {"lat": 5.3280, "lng": -4.0220, "address": "Boulevard Angoulvant, Plateau, Abidjan"},
                    "required_documents": [{"name": "Pièce d'identité", "required": True}, {"name": "Timbre fiscal", "required": True}]
                }
            ]
            
            # Créer les services s'ils n'existent pas
            services_created = 0
            for service_data in services_data:
                # Vérifier si le service existe déjà par son slug
                stmt = select(Service).where(Service.slug == service_data['slug'])
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    continue
                
                # Créer le service
                service = Service(**service_data)
                session.add(service)
                services_created += 1
                logger.info(f"➕ Service ajouté: {service_data['name']}")
            
            if services_created > 0:
                await session.commit()
                logger.info(f"✅ {services_created} nouveaux services créés")
            else:
                logger.info("✅ Tous les services par défaut sont présents")
                
    except Exception as e:
        logger.error(f"❌ Erreur lors du seeding: {e}")
        # Ne pas raise l'exception pour ne pas bloquer le démarrage
        logger.warning("⚠️ L'application continuera sans seeding automatique")
