"""
ViteviteApp - Seed Services Abidjan
Script pour créer des services de test par zone
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.service import Service, ServiceStatus, AffluenceLevel


async def seed_services():
    """Crée des services de test pour Abidjan"""
    
    services_data = [
        # COCODY
        {
            "name": "Mairie de Cocody - État Civil",
            "slug": "mairie-cocody-etat-civil",
            "category": "Administration",
            "description": "Extraits de naissance, mariages, décès",
            "icon": "🏛️",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.MODERATE,
            "estimated_wait_time": 35,
            "current_queue_size": 12,
            "opening_hours": "07h30 - 15h30",
            "location": {
                "lat": 5.3599,
                "lng": -4.0083,
                "address": "Boulevard Latrille, Cocody"
            },
            "required_documents": [
                {"name": "Pièce d'identité", "required": True},
                {"name": "Certificat de naissance (original)", "required": True}
            ]
        },
        {
            "name": "CHU Cocody - Consultations",
            "slug": "chu-cocody-consultations",
            "category": "Santé",
            "description": "Consultations générales et spécialisées",
            "icon": "🏥",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.HIGH,
            "estimated_wait_time": 65,
            "current_queue_size": 28,
            "opening_hours": "08h00 - 16h00",
            "location": {
                "lat": 5.3445,
                "lng": -4.0097,
                "address": "Boulevard de la République, Cocody"
            },
            "required_documents": [
                {"name": "Carnet de santé", "required": True},
                {"name": "Ordonnance médicale", "required": False}
            ]
        },
        
        # PLATEAU
        {
            "name": "Préfecture d'Abidjan - Cartes d'identité",
            "slug": "prefecture-abidjan-cni",
            "category": "Administration",
            "description": "Établissement et renouvellement CNI",
            "icon": "🆔",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.VERY_HIGH,
            "estimated_wait_time": 90,
            "current_queue_size": 45,
            "opening_hours": "07h00 - 14h00",
            "location": {
                "lat": 5.3250,
                "lng": -4.0267,
                "address": "Avenue Franchet d'Esperey, Plateau"
            },
            "required_documents": [
                {"name": "Acte de naissance", "required": True},
                {"name": "Certificat de résidence", "required": True},
                {"name": "2 photos d'identité", "required": True}
            ]
        },
        {
            "name": "CNPS Plateau - Prestations",
            "slug": "cnps-plateau-prestations",
            "category": "Administration",
            "description": "Caisse Nationale de Prévoyance Sociale",
            "icon": "💼",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.HIGH,
            "estimated_wait_time": 55,
            "current_queue_size": 22,
            "opening_hours": "07h30 - 15h00",
            "location": {
                "lat": 5.3260,
                "lng": -4.0250,
                "address": "Rue des Banques, Plateau"
            },
            "required_documents": [
                {"name": "Numéro CNPS", "required": True},
                {"name": "Pièce d'identité", "required": True}
            ]
        },
        
        # YOPOUGON
        {
            "name": "Mairie de Yopougon - Services Sociaux",
            "slug": "mairie-yopougon-social",
            "category": "Administration",
            "description": "Aide sociale, certificats divers",
            "icon": "🏛️",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.MODERATE,
            "estimated_wait_time": 40,
            "current_queue_size": 15,
            "opening_hours": "08h00 - 15h00",
            "location": {
                "lat": 5.3364,
                "lng": -4.0818,
                "address": "Carrefour Sideci, Yopougon"
            },
            "required_documents": [
                {"name": "Pièce d'identité", "required": True},
                {"name": "Justificatif de domicile", "required": True}
            ]
        },
        {
            "name": "Centre de Santé Yopougon",
            "slug": "centre-sante-yopougon",
            "category": "Santé",
            "description": "Soins de santé primaires",
            "icon": "⚕️",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.MODERATE,
            "estimated_wait_time": 45,
            "current_queue_size": 18,
            "opening_hours": "07h00 - 18h00",
            "location": {
                "lat": 5.3350,
                "lng": -4.0850,
                "address": "Quartier Koweït, Yopougon"
            },
            "required_documents": [
                {"name": "Carnet de vaccination", "required": False}
            ]
        },
        
        # ABOBO
        {
            "name": "Sous-Préfecture Abobo",
            "slug": "sous-prefecture-abobo",
            "category": "Administration",
            "description": "Services administratifs de proximité",
            "icon": "🏢",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.HIGH,
            "estimated_wait_time": 60,
            "current_queue_size": 25,
            "opening_hours": "07h30 - 14h30",
            "location": {
                "lat": 5.4258,
                "lng": -4.0208,
                "address": "Carrefour Abobo Baoulé, Abobo"
            },
            "required_documents": [
                {"name": "Pièce d'identité", "required": True}
            ]
        },
        {
            "name": "Hôpital Général Abobo",
            "slug": "hopital-general-abobo",
            "category": "Santé",
            "description": "Urgences et consultations",
            "icon": "🏥",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.VERY_HIGH,
            "estimated_wait_time": 85,
            "current_queue_size": 38,
            "opening_hours": "24h/24",
            "location": {
                "lat": 5.4280,
                "lng": -4.0190,
                "address": "Abobo PK18"
            },
            "required_documents": [
                {"name": "Carnet de santé", "required": True}
            ]
        },
        
        # ADJAME
        {
            "name": "Mairie d'Adjamé - Urbanisme",
            "slug": "mairie-adjame-urbanisme",
            "category": "Administration",
            "description": "Permis de construire, attestations",
            "icon": "🏗️",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.LOW,
            "estimated_wait_time": 25,
            "current_queue_size": 8,
            "opening_hours": "08h00 - 15h00",
            "location": {
                "lat": 5.3515,
                "lng": -4.0165,
                "address": "Adjamé Liberté"
            },
            "required_documents": [
                {"name": "Plan de construction", "required": True},
                {"name": "Titre foncier", "required": True}
            ]
        },
        
        # TREICHVILLE
        {
            "name": "CAE Treichville - Passeports",
            "slug": "cae-treichville-passeports",
            "category": "Administration",
            "description": "Centre d'Accueil et d'Établissement - Passeports",
            "icon": "🛂",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.HIGH,
            "estimated_wait_time": 70,
            "current_queue_size": 32,
            "opening_hours": "07h00 - 13h00",
            "location": {
                "lat": 5.3415,
                "lng": -4.0289,
                "address": "Boulevard VGE, Treichville"
            },
            "required_documents": [
                {"name": "CNI en cours de validité", "required": True},
                {"name": "Acte de naissance", "required": True},
                {"name": "4 photos biométriques", "required": True}
            ]
        },
        {
            "name": "Polyclinique Les Perles - Analyses",
            "slug": "polyclinique-perles-analyses",
            "category": "Santé",
            "description": "Laboratoire d'analyses médicales",
            "icon": "🔬",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.LOW,
            "estimated_wait_time": 20,
            "current_queue_size": 6,
            "opening_hours": "07h00 - 18h00",
            "location": {
                "lat": 5.3400,
                "lng": -4.0300,
                "address": "Zone 4, Treichville"
            },
            "required_documents": [
                {"name": "Ordonnance médicale", "required": True}
            ]
        },
        
        # MARCORY
        {
            "name": "Mairie de Marcory - Légalisations",
            "slug": "mairie-marcory-legalisations",
            "category": "Administration",
            "description": "Légalisation de signatures",
            "icon": "✍️",
            "status": ServiceStatus.OPEN,
            "affluence_level": AffluenceLevel.LOW,
            "estimated_wait_time": 15,
            "current_queue_size": 5,
            "opening_hours": "08h00 - 14h00",
            "location": {
                "lat": 5.3180,
                "lng": -4.0050,
                "address": "Marcory Zone 4"
            },
            "required_documents": [
                {"name": "Document à légaliser", "required": True},
                {"name": "Pièce d'identité", "required": True}
            ]
        }
    ]
    
    async with AsyncSessionLocal() as db:
        for service_data in services_data:
            # Vérifier si existe déjà
            from sqlalchemy import select
            result = await db.execute(
                select(Service).where(Service.slug == service_data["slug"])
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                service = Service(**service_data)
                db.add(service)
                print(f"✅ Créé: {service_data['name']}")
            else:
                print(f"⏭️  Existe déjà: {service_data['name']}")
        
        await db.commit()
        print(f"\n🎉 {len(services_data)} services créés/vérifiés pour Abidjan")


if __name__ == "__main__":
    asyncio.run(seed_services())