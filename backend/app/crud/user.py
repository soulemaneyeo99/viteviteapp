"""
ViteviteApp - User CRUD
Opérations CRUD spécifiques aux utilisateurs
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations pour User"""
    
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """
        Récupère un utilisateur par email
        
        Args:
            db: Session database
            email: Email de l'utilisateur
        
        Returns:
            User ou None
        """
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_phone(self, db: AsyncSession, *, phone: str) -> Optional[User]:
        """
        Récupère un utilisateur par téléphone
        
        Args:
            db: Session database
            phone: Numéro de téléphone
        
        Returns:
            User ou None
        """
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()
    
    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """
        Crée un nouvel utilisateur avec mot de passe hashé
        
        Args:
            db: Session database
            obj_in: Données de création
        
        Returns:
            User créé
        """
        # Hash le mot de passe
        hashed_password = get_password_hash(obj_in.password)
        
        # Crée l'utilisateur
        db_obj = User(
            email=obj_in.email,
            phone=obj_in.phone,
            full_name=obj_in.full_name,
            password_hash=hashed_password,
            role=UserRole.USER,  # Par défaut USER
            is_active=True,
            is_verified=False
        )
        
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def authenticate(
        self,
        db: AsyncSession,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Authentifie un utilisateur
        
        Args:
            db: Session database
            email: Email de l'utilisateur
            password: Mot de passe en clair
        
        Returns:
            User si authentification réussie, None sinon
        """
        user = await self.get_by_email(db, email=email)
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user
    
    async def update_last_login(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """
        Met à jour la date de dernière connexion
        
        Args:
            db: Session database
            user: Utilisateur
        
        Returns:
            User mis à jour
        """
        from datetime import datetime
        user.last_login_at = datetime.utcnow().isoformat()
        
        db.add(user)
        await db.flush()
        await db.refresh(user)
        
        return user
    
    async def is_active(self, user: User) -> bool:
        """Vérifie si l'utilisateur est actif"""
        return user.is_active
    
    async def is_admin(self, user: User) -> bool:
        """Vérifie si l'utilisateur est admin"""
        return user.is_admin
    
    async def set_password(
        self,
        db: AsyncSession,
        *,
        user: User,
        new_password: str
    ) -> User:
        """
        Change le mot de passe d'un utilisateur
        
        Args:
            db: Session database
            user: Utilisateur
            new_password: Nouveau mot de passe
        
        Returns:
            User mis à jour
        """
        user.password_hash = get_password_hash(new_password)
        
        db.add(user)
        await db.flush()
        await db.refresh(user)
        
        return user
    
    async def verify_user(self, db: AsyncSession, *, user: User) -> User:
        """
        Vérifie un utilisateur
        
        Args:
            db: Session database
            user: Utilisateur
        
        Returns:
            User vérifié
        """
        user.is_verified = True
        
        db.add(user)
        await db.flush()
        await db.refresh(user)
        
        return user
    
    async def deactivate_user(self, db: AsyncSession, *, user: User) -> User:
        """
        Désactive un utilisateur
        
        Args:
            db: Session database
            user: Utilisateur
        
        Returns:
            User désactivé
        """
        user.is_active = False
        
        db.add(user)
        await db.flush()
        await db.refresh(user)
        
        return user


# ========== INSTANCE GLOBALE ==========
user_crud = CRUDUser(User)