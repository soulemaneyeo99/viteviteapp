"""
ViteviteApp - Script d'initialisation des services de test
Crée des services pour différentes zones d'Abidjan
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.models.base import generate_uuid


SERVICES_DATA = [
    # Cocody
    {
        "name": "Préfecture d'Abidjan - Cartes d'identité",
        "slug": "prefecture-abidjan-cni",
        "category": "Administration",
        "description": "Établissement et renouvellement de cartes nationales d'identité",
        "icon": "🏛️",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.HIGH,
        "estimated_wait_time": 45,
        "current_queue_size": 15,
        "location": {
            "lat": 5.3599,
            "lng": -4.0083,
            "address": "Boulevard Latrille, Cocody, Abidjan"
        },
        "required_documents": [
            {"name": "Acte de naissance", "required": True, "description": "Original ou copie certifiée"},
            {"name": "Certificat de nationalité", "required": True},
            {"name": "Photo d'identité", "required": True, "description": "2 photos récentes"}
        ],
        "opening_hours": "07:30 - 15:30"
    },
    {
        "name": "SGBCI Cocody - Services bancaires",
        "slug": "sgbci-cocody",
        "category": "Banque",
        "description": "Ouverture de compte, virements, et services bancaires",
        "icon": "🏦",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.MODERATE,
        "estimated_wait_time": 25,
        "current_queue_size": 8,
        "location": {
            "lat": 5.3650,
            "lng": -4.0090,
            "address": "Boulevard de France, Cocody, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True},
            {"name": "Justificatif de domicile", "required": True}
        ],
        "opening_hours": "08:00 - 16:00"
    },
    
    # Plateau
    {
        "name": "CHU Treichville - Consultations",
        "slug": "chu-treichville",
        "category": "Santé",
        "description": "Consultations générales et spécialisées",
        "icon": "🏥",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.VERY_HIGH,
        "estimated_wait_time": 90,
        "current_queue_size": 35,
        "location": {
            "lat": 5.3415,
            "lng": -4.0289,
            "address": "Boulevard de Marseille, Treichville, Abidjan"
        },
        "required_documents": [
            {"name": "Carte d'assuré", "required": False},
            {"name": "Carnet de santé", "required": False}
        ],
        "opening_hours": "07:00 - 18:00"
    },
    {
        "name": "Mairie du Plateau - État civil",
        "slug": "mairie-plateau",
        "category": "Mairie",
        "description": "Actes de naissance, mariage, décès",
        "icon": "🏛️",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.HIGH,
        "estimated_wait_time": 50,
        "current_queue_size": 18,
        "location": {
            "lat": 5.3484,
            "lng": -4.0267,
            "address": "Avenue Lamblin, Plateau, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True},
            {"name": "Justificatif de domicile", "required": True}
        ],
        "opening_hours": "08:00 - 15:00"
    },
    
    # Yopougon
    {
        "name": "Mairie de Yopougon - Services municipaux",
        "slug": "mairie-yopougon",
        "category": "Mairie",
        "description": "Actes d'état civil et services municipaux",
        "icon": "🏛️",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.HIGH,
        "estimated_wait_time": 55,
        "current_queue_size": 20,
        "location": {
            "lat": 5.3364,
            "lng": -4.0818,
            "address": "Carrefour Siporex, Yopougon, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True}
        ],
        "opening_hours": "07:30 - 15:00"
    },
    {
        "name": "Ecobank Yopougon - Services bancaires",
        "slug": "ecobank-yopougon",
        "category": "Banque",
        "description": "Services bancaires et transferts",
        "icon": "🏦",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.MODERATE,
        "estimated_wait_time": 30,
        "current_queue_size": 10,
        "location": {
            "lat": 5.3350,
            "lng": -4.0850,
            "address": "Zone 4, Yopougon, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True}
        ],
        "opening_hours": "08:00 - 16:30"
    },
    
    # Abobo
    {
        "name": "Mairie d'Abobo - État civil",
        "slug": "mairie-abobo",
        "category": "Mairie",
        "description": "Actes de naissance, mariage, certificats",
        "icon": "🏛️",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.VERY_HIGH,
        "estimated_wait_time": 70,
        "current_queue_size": 28,
        "location": {
            "lat": 5.4258,
            "lng": -4.0208,
            "address": "Gare d'Abobo, Abobo, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True}
        ],
        "opening_hours": "07:30 - 15:00"
    },
    {
        "name": "Formation Sanitaire Abobo - Consultations",
        "slug": "fs-abobo",
        "category": "Santé",
        "description": "Consultations médicales générales",
        "icon": "🏥",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.HIGH,
        "estimated_wait_time": 60,
        "current_queue_size": 22,
        "location": {
            "lat": 5.4280,
            "lng": -4.0230,
            "address": "Abobo Baoulé, Abidjan"
        },
        "required_documents": [
            {"name": "Carnet de santé", "required": False}
        ],
        "opening_hours": "07:00 - 17:00"
    },
    
    # Adjamé
    {
        "name": "Mairie d'Adjamé - Services administratifs",
        "slug": "mairie-adjame",
        "category": "Mairie",
        "description": "Actes administratifs et état civil",
        "icon": "🏛️",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.HIGH,
        "estimated_wait_time": 48,
        "current_queue_size": 16,
        "location": {
            "lat": 5.3515,
            "lng": -4.0165,
            "address": "220 Logements, Adjamé, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True}
        ],
        "opening_hours": "08:00 - 15:00"
    },
    {
        "name": "Orange Money Adjamé - Services financiers",
        "slug": "orange-money-adjame",
        "category": "Banque",
        "description": "Transactions mobiles et services financiers",
        "icon": "💰",
        "status": ServiceStatus.OPEN,
        "affluence_level": AffluenceLevel.MODERATE,
        "estimated_wait_time": 20,
        "current_queue_size": 7,
        "location": {
            "lat": 5.3520,
            "lng": -4.0170,
            "address": "Marché d'Adjamé, Abidjan"
        },
        "required_documents": [
            {"name": "Pièce d'identité", "required": True},
            {"name": "Numéro de téléphone", "required": True}
        ],
        "opening_hours": "08:00 - 18:00"
    }
]


async def init_services():
    """Initialise les services de test"""
    
    async with AsyncSessionLocal() as session:
        # Vérifier si des services existent déjà
        result = await session.execute(select(Service))
        existing = result.scalars()
        
async def init_services():
    """Initialise les services de test"""
    
    async with AsyncSessionLocal() as session:
        # Vérifier si des services existent déjà
        result = await session.execute(select(Service))
        existing = result.scalars().all()
        
        if existing:
            print(f"✅ {len(existing)} services existent déjà")
            return
        
        print("🚀 Création des services de test pour Abidjan...")
        
        for service_data in SERVICES_DATA:
            service = Service(
                id=generate_uuid(),
                **service_data
            )
            session.add(service)
        
        await session.commit()
        print(f"✅ {len(SERVICES_DATA)} services créés avec succès!")


if __name__ == "__main__":
    asyncio.run(init_services())