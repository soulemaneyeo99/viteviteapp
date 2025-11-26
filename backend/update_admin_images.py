"""
Update administrations with image URLs
"""
import asyncio
from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models import Administration

async def update_images():
    # Mapping of slugs to image filenames
    image_mapping = {
        "mairie-cocody": "/images/administrations/mairie_cocody.png",
        "mairie-plateau": "/images/administrations/mairie_plateau.png",
        "mairie-yopougon": "/images/administrations/mairie_yopougon.png",
        "mairie-abobo": "/images/administrations/mairie_abobo.png",
        "prefecture-abidjan": "/images/administrations/prefecture_abidjan.png",
        "cnps-plateau": "/images/administrations/cnps_plateau.png",
        "chu-cocody": "/images/administrations/chu_cocody.png",
    }
    
    async with AsyncSessionLocal() as session:
        for slug, image_url in image_mapping.items():
            stmt = (
                update(Administration)
                .where(Administration.slug == slug)
                .values(main_image_url=image_url)
            )
            await session.execute(stmt)
            print(f"✅ Updated {slug} with image {image_url}")
        
        await session.commit()
        print(f"\n✅ Updated {len(image_mapping)} administrations with images")

if __name__ == "__main__":
    asyncio.run(update_images())
