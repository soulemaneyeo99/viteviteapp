import asyncio
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models import Administration

async def check_administrations():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count(Administration.id)))
        count = result.scalar()
        print(f"Total administrations in DB: {count}")
        
        if count > 0:
            result = await session.execute(select(Administration).limit(5))
            admins = result.scalars().all()
            for admin in admins:
                print(f"- {admin.name} ({admin.slug})")

if __name__ == "__main__":
    asyncio.run(check_administrations())
