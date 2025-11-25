"""
Seed script pour ajouter les administrations réelles d'Abidjan (version async)
"""

import sys
import os
import asyncio
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models import Administration


async def seed_administrations():
    """Seed real administrations from Abidjan"""
    async with AsyncSessionLocal() as db:
        try:
            # Check if administrations already exist
            from sqlalchemy import select
            result = await db.execute(select(Administration))
            existing = result.scalar_one_or_none()
            
            if existing:
                print("⚠️  Administrations already exist. Skipping seed.")
                return
            
            administrations_data = [
                # MAIRIES
                {
                    "name": "Mairie de Cocody",
                    "slug": "mairie-cocody",
                    "type": "mairie",
                    "description": "Mairie de la commune de Cocody - Services administratifs, état civil, urbanisme",
                    "main_image_url": "/images/mairie-cocody.jpg",
                    "location": {
                        "lat": 5.3599517,
                        "lng": -3.9810222,
                        "address": "Boulevard Latrille, Cocody, Abidjan",
                        "city": "Abidjan",
                        "commune": "Cocody"
                    },
                    "phone": "+225 27 22 44 18 69",
                    "email": "contact@mairie-cocody.ci",
                    "website": "https://www.mairie-cocody.ci",
                    "operating_hours": {
                        "lundi": "08:00-16:00",
                        "mardi": "08:00-16:00",
                        "mercredi": "08:00-16:00",
                        "jeudi": "08:00-16:00",
                        "vendredi": "08:00-16:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": False,
                        "air_conditioning": True
                    }
                },
                {
                    "name": "Mairie de Plateau",
                    "slug": "mairie-plateau",
                    "type": "mairie",
                    "description": "Mairie de la commune du Plateau - Centre administratif et commercial d'Abidjan",
                    "main_image_url": "/images/mairie-plateau.jpg",
                    "location": {
                        "lat": 5.3250355,
                        "lng": -4.0267721,
                        "address": "Avenue Franchet d'Esperey, Plateau, Abidjan",
                        "city": "Abidjan",
                        "commune": "Plateau"
                    },
                    "phone": "+225 27 20 21 04 20",
                    "email": "info@mairie-plateau.ci",
                    "website": "https://www.mairie-plateau.ci",
                    "operating_hours": {
                        "lundi": "07:30-15:30",
                        "mardi": "07:30-15:30",
                        "mercredi": "07:30-15:30",
                        "jeudi": "07:30-15:30",
                        "vendredi": "07:30-15:30",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": True,
                        "air_conditioning": True
                    }
                },
                {
                    "name": "Mairie de Yopougon",
                    "slug": "mairie-yopougon",
                    "type": "mairie",
                    "description": "Mairie de la commune de Yopougon - La plus grande commune d'Abidjan",
                    "main_image_url": "/images/mairie-yopougon.jpg",
                    "location": {
                        "lat": 5.3364449,
                        "lng": -4.0890284,
                        "address": "Boulevard Principal, Yopougon, Abidjan",
                        "city": "Abidjan",
                        "commune": "Yopougon"
                    },
                    "phone": "+225 27 23 45 67 89",
                    "email": "contact@mairie-yopougon.ci",
                    "operating_hours": {
                        "lundi": "08:00-16:00",
                        "mardi": "08:00-16:00",
                        "mercredi": "08:00-16:00",
                        "jeudi": "08:00-16:00",
                        "vendredi": "08:00-16:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": False,
                        "wifi": False,
                        "air_conditioning": True
                    }
                },
                {
                    "name": "Mairie d'Abobo",
                    "slug": "mairie-abobo",
                    "type": "mairie",
                    "description": "Mairie de la commune d'Abobo - Services de proximité pour les citoyens",
                    "main_image_url": "/images/mairie-abobo.jpg",
                    "location": {
                        "lat": 5.4196028,
                        "lng": -4.0205093,
                        "address": "Avenue Principale, Abobo, Abidjan",
                        "city": "Abidjan",
                        "commune": "Abobo"
                    },
                    "phone": "+225 27 23 45 12 34",
                    "email": "mairie@abobo.ci",
                    "operating_hours": {
                        "lundi": "08:00-16:00",
                        "mardi": "08:00-16:00",
                        "mercredi": "08:00-16:00",
                        "jeudi": "08:00-16:00",
                        "vendredi": "08:00-16:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": False,
                        "wifi": False,
                        "air_conditioning": False
                    }
                },
                
                # PRÉFECTURES
                {
                    "name": "Préfecture d'Abidjan",
                    "slug": "prefecture-abidjan",
                    "type": "prefecture",
                    "description": "Préfecture d'Abidjan - Passeports, visas, attestations administratives",
                    "main_image_url": "/images/prefecture-abidjan.jpg",
                    "location": {
                        "lat": 5.3250355,
                        "lng": -4.0167721,
                        "address": "Boulevard Angoulvant, Plateau, Abidjan",
                        "city": "Abidjan",
                        "commune": "Plateau"
                    },
                    "phone": "+225 27 20 21 05 06",
                    "email": "prefecture@interieur.gouv.ci",
                    "website": "https://www.prefecture-abidjan.ci",
                    "operating_hours": {
                        "lundi": "07:30-15:00",
                        "mardi": "07:30-15:00",
                        "mercredi": "07:30-15:00",
                        "jeudi": "07:30-15:00",
                        "vendredi": "07:30-15:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": False,
                        "air_conditioning": True
                    }
                },
                
                # CNPS
                {
                    "name": "CNPS Plateau",
                    "slug": "cnps-plateau",
                    "type": "cnps",
                    "description": "Caisse Nationale de Prévoyance Sociale - Agence Plateau",
                    "main_image_url": "/images/cnps-plateau.jpg",
                    "location": {
                        "lat": 5.3200355,
                        "lng": -4.0217721,
                        "address": "Avenue Nogues, Plateau, Abidjan",
                        "city": "Abidjan",
                        "commune": "Plateau"
                    },
                    "phone": "+225 27 20 25 50 00",
                    "email": "info@cnps.ci",
                    "website": "https://www.cnps.ci",
                    "operating_hours": {
                        "lundi": "08:00-16:00",
                        "mardi": "08:00-16:00",
                        "mercredi": "08:00-16:00",
                        "jeudi": "08:00-16:00",
                        "vendredi": "08:00-16:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": True,
                        "air_conditioning": True
                    }
                },
                {
                    "name": "CNPS Treichville",
                    "slug": "cnps-treichville",
                    "type": "cnps",
                    "description": "Caisse Nationale de Prévoyance Sociale - Agence Treichville",
                    "main_image_url": "/images/cnps-treichville.jpg",
                    "location": {
                        "lat": 5.2850355,
                        "lng": -4.0067721,
                        "address": "Boulevard de Marseille, Treichville, Abidjan",
                        "city": "Abidjan",
                        "commune": "Treichville"
                    },
                    "phone": "+225 27 21 25 50 00",
                    "email": "treichville@cnps.ci",
                    "website": "https://www.cnps.ci",
                    "operating_hours": {
                        "lundi": "08:00-16:00",
                        "mardi": "08:00-16:00",
                        "mercredi": "08:00-16:00",
                        "jeudi": "08:00-16:00",
                        "vendredi": "08:00-16:00",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": False,
                        "handicap_access": False,
                        "wifi": False,
                        "air_conditioning": True
                    }
                },
                
                # HÔPITAUX
                {
                    "name": "CHU de Cocody",
                    "slug": "chu-cocody",
                    "type": "hospital",
                    "description": "Centre Hospitalier Universitaire de Cocody - Urgences, consultations, hospitalisations",
                    "main_image_url": "/images/chu-cocody.jpg",
                    "location": {
                        "lat": 5.3499517,
                        "lng": -3.9710222,
                        "address": "Boulevard de l'Université, Cocody, Abidjan",
                        "city": "Abidjan",
                        "commune": "Cocody"
                    },
                    "phone": "+225 27 22 44 13 00",
                    "email": "contact@chu-cocody.ci",
                    "website": "https://www.chu-cocody.ci",
                    "operating_hours": {
                        "lundi": "24h/24",
                        "mardi": "24h/24",
                        "mercredi": "24h/24",
                        "jeudi": "24h/24",
                        "vendredi": "24h/24",
                        "samedi": "24h/24",
                        "dimanche": "24h/24"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": True,
                        "air_conditioning": True
                    }
                },
                {
                    "name": "CHU de Treichville",
                    "slug": "chu-treichville",
                    "type": "hospital",
                    "description": "Centre Hospitalier Universitaire de Treichville - Services médicaux complets",
                    "main_image_url": "/images/chu-treichville.jpg",
                    "location": {
                        "lat": 5.2800355,
                        "lng": -4.0017721,
                        "address": "Boulevard Giscard d'Estaing, Treichville, Abidjan",
                        "city": "Abidjan",
                        "commune": "Treichville"
                    },
                    "phone": "+225 27 21 24 91 00",
                    "email": "info@chu-treichville.ci",
                    "operating_hours": {
                        "lundi": "24h/24",
                        "mardi": "24h/24",
                        "mercredi": "24h/24",
                        "jeudi": "24h/24",
                        "vendredi": "24h/24",
                        "samedi": "24h/24",
                        "dimanche": "24h/24"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": False,
                        "air_conditioning": True
                    }
                },
                
                # POLICE
                {
                    "name": "Commissariat Central du Plateau",
                    "slug": "commissariat-plateau",
                    "type": "police",
                    "description": "Commissariat de Police du Plateau - Déclarations, plaintes, attestations",
                    "main_image_url": "/images/commissariat-plateau.jpg",
                    "location": {
                        "lat": 5.3220355,
                        "lng": -4.0247721,
                        "address": "Avenue Delafosse, Plateau, Abidjan",
                        "city": "Abidjan",
                        "commune": "Plateau"
                    },
                    "phone": "+225 27 20 21 06 07",
                    "email": "commissariat.plateau@police.ci",
                    "operating_hours": {
                        "lundi": "24h/24",
                        "mardi": "24h/24",
                        "mercredi": "24h/24",
                        "jeudi": "24h/24",
                        "vendredi": "24h/24",
                        "samedi": "24h/24",
                        "dimanche": "24h/24"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": False,
                        "handicap_access": False,
                        "wifi": False,
                        "air_conditioning": False
                    }
                },
                
                # IMPÔTS
                {
                    "name": "Direction Générale des Impôts - Plateau",
                    "slug": "dgi-plateau",
                    "type": "impots",
                    "description": "Direction des Impôts - Déclarations fiscales, paiements, attestations",
                    "main_image_url": "/images/dgi-plateau.jpg",
                    "location": {
                        "lat": 5.3180355,
                        "lng": -4.0197721,
                        "address": "Immeuble SCIAM, Plateau, Abidjan",
                        "city": "Abidjan",
                        "commune": "Plateau"
                    },
                    "phone": "+225 27 20 25 80 00",
                    "email": "contact@dgi.gouv.ci",
                    "website": "https://www.dgi.gouv.ci",
                    "operating_hours": {
                        "lundi": "08:00-15:30",
                        "mardi": "08:00-15:30",
                        "mercredi": "08:00-15:30",
                        "jeudi": "08:00-15:30",
                        "vendredi": "08:00-15:30",
                        "samedi": "Fermé",
                        "dimanche": "Fermé"
                    },
                    "is_open": True,
                    "facilities": {
                        "parking": True,
                        "handicap_access": True,
                        "wifi": True,
                        "air_conditioning": True
                    }
                }
            ]
            
            print("🌱 Seeding administrations...")
            
            for admin_data in administrations_data:
                administration = Administration(**admin_data)
                db.add(administration)
                print(f"  ✓ {admin_data['name']}")
            
            await db.commit()
            print(f"\n✅ {len(administrations_data)} administrations seeded successfully!")
            
        except Exception as e:
            print(f"❌ Error seeding administrations: {e}")
            await db.rollback()
            raise


async def create_tables():
    """Create database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created")


async def main():
    print("=" * 60)
    print("SEEDING ABIDJAN ADMINISTRATIONS")
    print("=" * 60)
    
    # Create tables first
    await create_tables()
    
    # Seed data
    await seed_administrations()
    
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
