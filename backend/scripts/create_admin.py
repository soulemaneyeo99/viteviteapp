"""
ViteviteApp - Script de création d'un admin
"""
import asyncio
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models.base import generate_uuid


async def create_admin():
    """Crée un compte admin de test"""
    
    async with AsyncSessionLocal() as session:
        # Vérifier si admin existe
        result = await session.execute(
            select(User).where(User.email == "admin@viteviteapp.ci")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("✅ Admin existe déjà")
            return
        
        admin = User(
            id=generate_uuid(),
            email="admin@viteviteapp.ci",
            password_hash=get_password_hash("Admin2024!"),
            full_name="Administrateur ViteviteApp",
            phone="+22507000000",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        session.add(admin)
        await session.commit()
        
        print("✅ Admin créé:")
        print("   Email: admin@viteviteapp.ci")
        print("   Mot de passe: Admin2024!")


if __name__ == "__main__":
    asyncio.run(create_admin())