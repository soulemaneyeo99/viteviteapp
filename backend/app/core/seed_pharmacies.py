import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.pharmacy import Pharmacy, Medicine, PharmacyStock, StockStatus
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PHARMACIES_DATA = [
    {
        "name": "Pharmacie des Lagunes",
        "address": "Zone 4, Rue du Dr Blanchard, Marcory, Abidjan",
        "phone": "+225 27 21 35 35 35",
        "is_on_duty": True,
        "is_open": True,
        "latitude": 5.303,
        "longitude": -3.998,
        "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pharmacie Sainte Famille",
        "address": "Cocody Riviera 2, Abidjan",
        "phone": "+225 27 22 43 12 12",
        "is_on_duty": False,
        "is_open": True,
        "latitude": 5.345,
        "longitude": -3.960,
        "image_url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pharmacie du Plateau",
        "address": "Avenue Chardy, Plateau, Abidjan",
        "phone": "+225 27 20 21 21 21",
        "is_on_duty": False,
        "is_open": True,
        "latitude": 5.325,
        "longitude": -4.020,
        "image_url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pharmacie Longchamp",
        "address": "Boulevard de Marseille, Biétry, Abidjan",
        "phone": "+225 27 21 35 70 70",
        "is_on_duty": True,
        "is_open": True,
        "latitude": 5.290,
        "longitude": -3.980,
        "image_url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pharmacie Saint Jean",
        "address": "Cocody Saint Jean, Abidjan",
        "phone": "+225 27 22 44 44 44",
        "is_on_duty": False,
        "is_open": True,
        "latitude": 5.340,
        "longitude": -4.000,
        "image_url": "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pharmacie Bel Air",
        "address": "Marcory Zone 4, Abidjan",
        "phone": "+225 27 21 25 25 25",
        "is_on_duty": False,
        "is_open": False,
        "latitude": 5.300,
        "longitude": -3.990,
        "image_url": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1000"
    }
]

MEDICINES_DATA = [
    {"name": "Doliprane 1000mg", "category": "Antalgique", "price": 1500},
    {"name": "Efferalgan 500mg", "category": "Antalgique", "price": 1200},
    {"name": "Amoxicilline 1g", "category": "Antibiotique", "price": 3500},
    {"name": "Spasfon", "category": "Antispasmodique", "price": 2800},
    {"name": "Smecta", "category": "Digestion", "price": 4500},
    {"name": "Coartem", "category": "Antipaludéen", "price": 3000},
    {"name": "Vogalène", "category": "Anti-émétique", "price": 4200},
    {"name": "Bétadine Jaune", "category": "Antiseptique", "price": 2500},
]

async def seed_pharmacies():
    # Create tables if they don't exist
    from app.core.database import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        logger.info("🌱 Seeding Pharmacies...")
        
        # Check if pharmacies exist
        result = await session.execute(select(Pharmacy))
        if result.scalars().first():
            logger.info("⚠️ Pharmacies already exist. Skipping.")
            return

        # Create Pharmacies
        pharmacies = []
        for p_data in PHARMACIES_DATA:
            pharmacy = Pharmacy(**p_data)
            session.add(pharmacy)
            pharmacies.append(pharmacy)
        
        await session.flush() # Get IDs

        # Create Medicines
        medicines = []
        for m_data in MEDICINES_DATA:
            medicine = Medicine(
                name=m_data["name"],
                category=m_data["category"],
                description=f"Médicament {m_data['category']} courant.",
                requires_prescription=m_data["category"] == "Antibiotique"
            )
            session.add(medicine)
            medicines.append(medicine)
        
        await session.flush()

        # Create Stocks
        import random
        for pharmacy in pharmacies:
            for medicine in medicines:
                # Random stock
                status = random.choice(list(StockStatus))
                quantity = random.randint(0, 100) if status != StockStatus.OUT_OF_STOCK else 0
                
                # Find price from data
                base_price = next(m["price"] for m in MEDICINES_DATA if m["name"] == medicine.name)
                
                stock = PharmacyStock(
                    pharmacy_id=pharmacy.id,
                    medicine_id=medicine.id,
                    quantity=quantity,
                    price=base_price,
                    status=status
                )
                session.add(stock)

        await session.commit()
        logger.info("✅ Pharmacies seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_pharmacies())
