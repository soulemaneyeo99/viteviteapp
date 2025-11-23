import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.pharmacy import Pharmacy, Medicine, PharmacyStock, StockStatus

async def seed_pharmacies():
    # Ensure tables exist
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Create Medicines
            medicines = [
                Medicine(name="Doliprane", dosage="1000mg", category="Antalgique", description="Paracétamol pour douleurs et fièvre", requires_prescription=False),
                Medicine(name="Doliprane Sirop", dosage="2.4%", category="Antalgique", description="Pour enfants", requires_prescription=False),
                Medicine(name="Amoxicilline", dosage="500mg", category="Antibiotique", description="Antibiotique large spectre", requires_prescription=True),
                Medicine(name="Augmentin", dosage="1g", category="Antibiotique", description="Amoxicilline + Acide clavulanique", requires_prescription=True),
                Medicine(name="Coartem", dosage="20/120mg", category="Antipaludéen", description="Traitement du paludisme", requires_prescription=True),
                Medicine(name="Efferalgan", dosage="500mg", category="Antalgique", description="Paracétamol effervescent", requires_prescription=False),
                Medicine(name="Spasfon", dosage="80mg", category="Antispasmodique", description="Douleurs abdominales", requires_prescription=False),
                Medicine(name="Maalox", dosage="Suspension", category="Anti-acide", description="Brûlures d'estomac", requires_prescription=False),
            ]
            
            for med in medicines:
                result = await db.execute(select(Medicine).filter(Medicine.name == med.name))
                existing = result.scalars().first()
                if not existing:
                    db.add(med)
            await db.commit()
            
            # Reload medicines to get IDs
            result = await db.execute(select(Medicine))
            all_meds = result.scalars().all()
            med_map = {m.name: m for m in all_meds}

            # 2. Create Pharmacies
            pharmacies = [
                Pharmacy(name="Pharmacie Sainte-Marie", address="Cocody, Riviera 2", phone="+225 0707070707", latitude=5.345, longitude=-3.987, is_open=True, is_on_duty=False),
                Pharmacy(name="Pharmacie des Arts", address="Cocody, Lycée Technique", phone="+225 0505050505", latitude=5.350, longitude=-3.990, is_open=True, is_on_duty=True),
                Pharmacy(name="Pharmacie Mermoz", address="Cocody, Mermoz", phone="+225 0101010101", latitude=5.355, longitude=-3.985, is_open=False, is_on_duty=False),
                Pharmacy(name="Grande Pharmacie du Plateau", address="Plateau, Avenue Chardy", phone="+225 2720202020", latitude=5.320, longitude=-4.020, is_open=True, is_on_duty=False),
            ]
            
            for pharm in pharmacies:
                result = await db.execute(select(Pharmacy).filter(Pharmacy.name == pharm.name))
                existing = result.scalars().first()
                if not existing:
                    db.add(pharm)
            await db.commit()
            
            # Reload pharmacies
            result = await db.execute(select(Pharmacy))
            all_pharms = result.scalars().all()
            
            # 3. Create Stocks
            import random
            
            for pharm in all_pharms:
                for med_name, med in med_map.items():
                    # Check if stock exists
                    result = await db.execute(select(PharmacyStock).filter(
                        PharmacyStock.pharmacy_id == pharm.id,
                        PharmacyStock.medicine_id == med.id
                    ))
                    if result.scalars().first():
                        continue

                    # Randomize stock
                    status = random.choice([StockStatus.AVAILABLE, StockStatus.AVAILABLE, StockStatus.LOW, StockStatus.OUT_OF_STOCK])
                    qty = 0 if status == StockStatus.OUT_OF_STOCK else random.randint(5, 100)
                    price = random.randint(1000, 15000)
                    
                    stock = PharmacyStock(
                        pharmacy_id=pharm.id,
                        medicine_id=med.id,
                        quantity=qty,
                        price=price,
                        status=status
                    )
                    db.add(stock)
            
            await db.commit()
            print("✅ Pharmacies seeded successfully!")
            
        except Exception as e:
            print(f"❌ Error seeding pharmacies: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_pharmacies())
