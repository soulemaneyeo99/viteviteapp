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

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_services():
    async with AsyncSessionLocal() as session:
        logger.info("🌱 Starting seeding...")

        # List of realistic services in Abidjan
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
                "required_documents": [{"name": "Ancienne CNI", "required": True}, {"name": "Récépissé", "required": True}]
            },
            {
                "name": "CIE - Agence Plateau",
                "slug": "cie-plateau",
                "category": "Énergie",
                "description": "Paiement de factures et réclamations.",
                "icon": "zap",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 20,
                "current_queue_size": 12,
                "opening_hours": "07:30 - 16:00",
                "location": {"lat": 5.3250, "lng": -4.0250, "address": "Avenue Noguès, Plateau, Abidjan"},
                "required_documents": [{"name": "Facture CIE", "required": True}]
            },
            {
                "name": "SODECI - Treichville",
                "slug": "sodeci-treichville",
                "category": "Eau",
                "description": "Service client et raccordement.",
                "icon": "droplet",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.LOW,
                "estimated_wait_time": 10,
                "current_queue_size": 5,
                "opening_hours": "07:30 - 16:00",
                "location": {"lat": 5.3000, "lng": -4.0000, "address": "Boulevard de Marseille, Treichville"},
                "required_documents": [{"name": "Facture SODECI", "required": True}]
            },
            {
                "name": "CHU de Cocody - Consultations",
                "slug": "chu-cocody-consultations",
                "category": "Santé",
                "description": "Consultations générales et spécialisées.",
                "icon": "activity",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.HIGH,
                "estimated_wait_time": 90,
                "current_queue_size": 45,
                "opening_hours": "24/7",
                "location": {"lat": 5.3400, "lng": -4.0100, "address": "Cocody, Abidjan"},
                "required_documents": [{"name": "Carnet de santé", "required": True}]
            },
            {
                "name": "SGBCI - Agence Principale",
                "slug": "sgbci-plateau",
                "category": "Banque",
                "description": "Opérations de guichet et service client.",
                "icon": "credit-card",
                "status": ServiceStatus.OPEN,
                "affluence_level": AffluenceLevel.MODERATE,
                "estimated_wait_time": 15,
                "current_queue_size": 8,
                "opening_hours": "08:00 - 15:00",
                "location": {"lat": 5.3220, "lng": -4.0220, "address": "Plateau, Abidjan"},
                "required_documents": [{"name": "Pièce d'identité", "required": True}, {"name": "Chéquier", "required": False}]
            }
        ]

        for service_data in services_data:
            # Check if exists
            stmt = select(Service).where(Service.slug == service_data['slug'])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                logger.info(f"⚠️ Service {service_data['name']} already exists. Skipping.")
                continue

            service = Service(**service_data)
            session.add(service)
            logger.info(f"✅ Added service: {service.name}")

        await session.commit()
        logger.info("🎉 Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_services())
