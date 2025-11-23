import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.transport import (
    TransportCompany, TransportRoute, TransportDeparture, 
    SotraLine, SotraStop, SotraBus,
    TransportType, DepartureStatus, SotraBusStatus, LoadLevel
)
from datetime import datetime, timedelta
import random

async def seed_transport():
    # Ensure tables exist
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Create Transport Companies
            companies = [
                TransportCompany(name="UTB", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png", rating=4.7, contact_phone="+225 0101010101"),
                TransportCompany(name="STIF", logo_url=None, rating=4.5, contact_phone="+225 0202020202"),
                TransportCompany(name="AHT", logo_url=None, rating=4.2, contact_phone="+225 0303030303"),
            ]
            
            for comp in companies:
                result = await db.execute(select(TransportCompany).filter(TransportCompany.name == comp.name))
                if not result.scalars().first():
                    db.add(comp)
            await db.commit()
            
            # Reload companies
            result = await db.execute(select(TransportCompany))
            all_companies = result.scalars().all()
            utb = next(c for c in all_companies if c.name == "UTB")
            
            # 2. Create Routes
            routes = [
                TransportRoute(origin="Abidjan", destination="Bouaké", distance_km=350, estimated_duration_minutes=300),
                TransportRoute(origin="Abidjan", destination="Yamoussoukro", distance_km=240, estimated_duration_minutes=180),
                TransportRoute(origin="Abidjan", destination="Korhogo", distance_km=600, estimated_duration_minutes=480),
            ]
            
            for route in routes:
                result = await db.execute(select(TransportRoute).filter(
                    TransportRoute.origin == route.origin, 
                    TransportRoute.destination == route.destination
                ))
                if not result.scalars().first():
                    db.add(route)
            await db.commit()
            
            # Reload routes
            result = await db.execute(select(TransportRoute))
            all_routes = result.scalars().all()
            
            # 3. Create Departures
            now = datetime.now()
            for route in all_routes:
                for i in range(3): # 3 departures per route
                    dep_time = now + timedelta(hours=2 + i*3)
                    arr_time = dep_time + timedelta(minutes=route.estimated_duration_minutes)
                    
                    dep = TransportDeparture(
                        company_id=utb.id,
                        route_id=route.id,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        price=5000 + (i * 1000),
                        car_type=TransportType.VIP if i % 2 == 0 else TransportType.CLASSIC,
                        total_seats=40,
                        available_seats=random.randint(5, 35),
                        status=DepartureStatus.ON_TIME
                    )
                    db.add(dep)
            await db.commit()

            # 4. Create SOTRA Lines
            sotra_lines = [
                SotraLine(number="19", origin="Yopougon", destination="Plateau", color="#EF4444"),
                SotraLine(number="47", origin="Cocody", destination="Adjamé", color="#10B981"),
                SotraLine(number="81", origin="Koumassi", destination="Plateau", color="#3B82F6"),
            ]
            
            for line in sotra_lines:
                result = await db.execute(select(SotraLine).filter(SotraLine.number == line.number))
                if not result.scalars().first():
                    db.add(line)
            await db.commit()
            
            # Reload SOTRA lines
            result = await db.execute(select(SotraLine))
            all_sotra = result.scalars().all()
            
            # 5. Create SOTRA Stops & Buses
            for line in all_sotra:
                # Stops
                for i in range(5):
                    stop = SotraStop(
                        line_id=line.id,
                        name=f"Arrêt {line.origin} {i+1}",
                        latitude=5.34 + (i * 0.01),
                        longitude=-4.01 + (i * 0.01),
                        sequence_order=i
                    )
                    db.add(stop)
                
                # Buses
                for i in range(3):
                    bus = SotraBus(
                        line_id=line.id,
                        current_latitude=5.34 + (i * 0.005),
                        current_longitude=-4.01 + (i * 0.005),
                        heading=random.uniform(0, 360),
                        status=SotraBusStatus.MOVING,
                        passenger_load=LoadLevel.MEDIUM
                    )
                    db.add(bus)
            
            await db.commit()
            print("✅ Transport data seeded successfully!")
            
        except Exception as e:
            print(f"❌ Error seeding transport: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_transport())
