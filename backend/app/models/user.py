"""
ViteviteApp - User Model
Gestion des utilisateurs avec authentification
"""

from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class UserRole(str, enum.Enum):
    """Rôles utilisateurs"""
    USER = "user"           # Utilisateur standard
    ADMIN = "admin"         # Administrateur
    SUPER_ADMIN = "super"   # Super administrateur


class User(Base, BaseModel):
    """Model User - Utilisateurs de l'application"""
    
    __tablename__ = "users"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== AUTHENTICATION ==========
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    # ========== PROFILE ==========
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    
    # ========== METADATA ==========
    last_login_at = Column(String, nullable=True)  # ISO timestamp
    
    # ========== RELATIONSHIPS ==========
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")
    
    # ========== PROPERTIES ==========
    @property
    def is_admin(self) -> bool:
        """Vérifie si l'utilisateur est admin"""
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    @property
    def is_super_admin(self) -> bool:
        """Vérifie si l'utilisateur est super admin"""
        return self.role == UserRole.SUPER_ADMIN
    
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, role={self.role.value})"