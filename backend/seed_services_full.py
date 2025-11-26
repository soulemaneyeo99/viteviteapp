"""
Seed script pour ajouter les services réels d'Abidjan (version complète pour Admin Dashboard)
"""

import asyncio
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.core.database import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_services_full():
    """Seed comprehensive services data for Abidjan"""
    # Database connection (re-using existing config)
    DATABASE_URL = settings.DATABASE_URL
    engine = create_async_engine(DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        logger.info("🌱 Starting full services seeding...")

        services_data = [
            # --- MAIRIES ---
            {
                "name": "Mairie de Cocody",
                "slug": "mairie-cocody-service",
                "category": "Administration",
                "description": "Services administratifs, état civil et urbanisme de la commune de Cocody.",
                "icon": "building",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.HIGH,
                "estimated_wait_time": 45,
                "current_queue_size": 23,
                "opening_hours": "07:30 - 16:30",
                "location": {"lat": 5.3599, "lng": -3.9810, "address": "Boulevard Latrille, Cocody, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}],
                "sub_services": [
                    {"id": "extrait_naissance", "name": "Extrait de Naissance", "fees": 500, "description": "Demande ou retrait d'extrait de naissance"},
                    {"id": "legalisation", "name": "Légalisation de documents", "fees": 2000, "description": "Certification conforme de documents"},
                    {"id": "mariage", "name": "Dossier Mariage", "fees": 15000, "description": "Dépôt de dossier ou célébration"},
                    {"id": "urbanisme", "name": "Permis de construire", "fees": 50000, "description": "Dépôt de demande de permis de construire"}
                ]
            },
            {
                "name": "Mairie de Plateau",
                "slug": "mairie-plateau-service",
                "category": "Administration",
                "description": "Mairie de la commune du Plateau.",
                "icon": "building",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 30,
                "current_queue_size": 15,
                "opening_hours": "07:30 - 16:00",
                "location": {"lat": 5.3250, "lng": -4.0267, "address": "Avenue Franchet d'Esperey, Plateau, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}],
                "sub_services": [
                    {"id": "extrait_naissance", "name": "Extrait de Naissance", "fees": 500},
                    {"id": "legalisation", "name": "Légalisation", "fees": 2000},
                    {"id": "taxes", "name": "Taxes Communales", "fees": 0}
                ]
            },
            {
                "name": "Mairie de Yopougon",
                "slug": "mairie-yopougon-service",
                "category": "Administration",
                "description": "Services administratifs de Yopougon.",
                "icon": "building",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.VERY_HIGH,
                "estimated_wait_time": 90,
                "current_queue_size": 85,
                "opening_hours": "07:30 - 16:30",
                "location": {"lat": 5.3364, "lng": -4.0890, "address": "Boulevard Principal, Yopougon, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}],
                "sub_services": [
                    {"id": "extrait_naissance", "name": "Extrait de Naissance", "fees": 500},
                    {"id": "legalisation", "name": "Légalisation", "fees": 2000},
                    {"id": "etat_civil", "name": "État Civil Divers", "fees": 1000}
                ]
            },

            # --- PRÉFECTURES ---
            {
                "name": "Préfecture d'Abidjan",
                "slug": "prefecture-abidjan-service",
                "category": "Documents officiels",
                "description": "Délivrance de CNI, Passeports et documents officiels.",
                "icon": "id-card",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.VERY_HIGH,
                "estimated_wait_time": 120,
                "current_queue_size": 156,
                "opening_hours": "08:00 - 17:00",
                "location": {"lat": 5.3250, "lng": -4.0167, "address": "Boulevard Angoulvant, Plateau, Abidjan"},
                "required_documents": [{"name": "Ancienne CNI", "required": True}, {"name": "Récépissé", "required": True}],
                "sub_services": [
                    {"id": "cni_new", "name": "Nouvelle CNI", "fees": 5000, "description": "Enrôlement pour la carte nationale d'identité"},
                    {"id": "cni_retrait", "name": "Retrait CNI", "fees": 0, "description": "Retrait de la carte imprimée"},
                    {"id": "passeport", "name": "Passeport Biométrique", "fees": 40000, "description": "Demande de passeport"},
                    {"id": "permis", "name": "Permis de Conduire", "fees": 15000, "description": "Édition et renouvellement"}
                ]
            },

            # --- SÉCURITÉ ---
            {
                "name": "Commissariat Plateau",
                "slug": "commissariat-plateau-service",
                "category": "Sécurité",
                "description": "Plaintes, déclarations de perte et certificats de résidence.",
                "icon": "shield",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.LOW,
                "estimated_wait_time": 20,
                "current_queue_size": 5,
                "opening_hours": "24/7",
                "location": {"lat": 5.3220, "lng": -4.0247, "address": "Avenue Delafosse, Plateau, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}],
                "sub_services": [
                    {"id": "plainte", "name": "Dépôt de plainte", "fees": 0},
                    {"id": "perte", "name": "Déclaration de perte", "fees": 2000},
                    {"id": "residence", "name": "Certificat de résidence", "fees": 3000}
                ]
            },

            # --- SANTÉ ---
            {
                "name": "CHU de Cocody",
                "slug": "chu-cocody-service",
                "category": "Santé",
                "description": "Consultations, urgences et soins spécialisés.",
                "icon": "activity",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.HIGH,
                "estimated_wait_time": 60,
                "current_queue_size": 45,
                "opening_hours": "24/7",
                "location": {"lat": 5.3499, "lng": -3.9710, "address": "Boulevard de l'Université, Cocody, Abidjan"},
                "required_documents": [{"name": "Carnet de santé", "required": True}],
                "sub_services": [
                    {"id": "consultation_gen", "name": "Consultation Générale", "fees": 2000},
                    {"id": "specialiste", "name": "Consultation Spécialiste", "fees": 5000},
                    {"id": "urgences", "name": "Urgences", "fees": 0},
                    {"id": "laboratoire", "name": "Analyses Médicales", "fees": 0}
                ]
            },
            {
                "name": "CHU de Treichville",
                "slug": "chu-treichville-service",
                "category": "Santé",
                "description": "Hôpital public de référence.",
                "icon": "activity",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.HIGH,
                "estimated_wait_time": 75,
                "current_queue_size": 60,
                "opening_hours": "24/7",
                "location": {"lat": 5.2800, "lng": -4.0017, "address": "Boulevard Giscard d'Estaing, Treichville"},
                "required_documents": [{"name": "Carnet de santé", "required": True}],
                "sub_services": [
                    {"id": "consultation", "name": "Consultation", "fees": 2000},
                    {"id": "maternite", "name": "Maternité", "fees": 5000},
                    {"id": "radio", "name": "Radiologie", "fees": 10000}
                ]
            },

            # --- UTILITAIRES ---
            {
                "name": "CIE - Agence Plateau",
                "slug": "cie-plateau-service",
                "category": "Énergie",
                "description": "Paiement de factures et réclamations électricité.",
                "icon": "zap",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 20,
                "current_queue_size": 12,
                "opening_hours": "07:30 - 16:00",
                "location": {"lat": 5.3250, "lng": -4.0250, "address": "Avenue Noguès, Plateau, Abidjan"},
                "required_documents": [{"name": "Facture CIE", "required": True}],
                "sub_services": [
                    {"id": "facture", "name": "Paiement Facture", "fees": 0},
                    {"id": "reclamation", "name": "Réclamation", "fees": 0},
                    {"id": "abonnement", "name": "Nouvel Abonnement", "fees": 0}
                ]
            },
            {
                "name": "SODECI - Treichville",
                "slug": "sodeci-treichville-service",
                "category": "Eau",
                "description": "Service client et raccordement eau potable.",
                "icon": "droplet",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.LOW,
                "estimated_wait_time": 10,
                "current_queue_size": 5,
                "opening_hours": "07:30 - 16:00",
                "location": {"lat": 5.3000, "lng": -4.0000, "address": "Boulevard de Marseille, Treichville"},
                "required_documents": [{"name": "Facture SODECI", "required": True}],
                "sub_services": [
                    {"id": "facture", "name": "Paiement Facture", "fees": 0},
                    {"id": "fuite", "name": "Signalement Fuite", "fees": 0},
                    {"id": "abonnement", "name": "Nouvel Abonnement", "fees": 0}
                ]
            },

            # --- BANQUES & ASSURANCES ---
            {
                "name": "CNPS Plateau",
                "slug": "cnps-plateau-service",
                "category": "Social",
                "description": "Caisse Nationale de Prévoyance Sociale.",
                "icon": "users",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 40,
                "current_queue_size": 25,
                "opening_hours": "08:00 - 16:00",
                "location": {"lat": 5.3200, "lng": -4.0217, "address": "Avenue Nogues, Plateau, Abidjan"},
                "required_documents": [{"name": "Numéro CNPS", "required": True}],
                "sub_services": [
                    {"id": "retraite", "name": "Dossier Retraite", "fees": 0},
                    {"id": "prestations", "name": "Prestations Familiales", "fees": 0},
                    {"id": "cotisations", "name": "Paiement Cotisations", "fees": 0}
                ]
            },
            {
                "name": "SGBCI - Agence Principale",
                "slug": "sgbci-plateau-service",
                "category": "Banque",
                "description": "Opérations bancaires et service client.",
                "icon": "credit-card",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 15,
                "current_queue_size": 8,
                "opening_hours": "08:00 - 15:00",
                "location": {"lat": 5.3220, "lng": -4.0220, "address": "Plateau, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}],
                "sub_services": [
                    {"id": "versement", "name": "Versement / Retrait", "fees": 0},
                    {"id": "virement", "name": "Virement", "fees": 0},
                    {"id": "compte", "name": "Ouverture de Compte", "fees": 0}
                ]
            }
        ]

        for service_data in services_data:
            # Check if exists by slug
            stmt = select(Service).where(Service.slug == service_data['slug'])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                logger.info(f"⚠️ Service {service_data['name']} already exists. Updating sub_services...")
                # Update sub_services if needed
                existing.sub_services = service_data['sub_services']
                existing.location = service_data['location']
                existing.description = service_data['description']
                existing.category = service_data['category']
                existing.icon = service_data['icon']
            else:
                service = Service(**service_data)
                session.add(service)
                logger.info(f"✅ Added service: {service.name}")

        await session.commit()
        logger.info("🎉 Full Services Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_services_full())
