# backend/app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base
import enum
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    CITOYEN = "citoyen"
    ADMIN = "admin"
    SUPER = "super"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="citoyen", nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    tickets = relationship(
        "Ticket",
        foreign_keys="[Ticket.user_id]",  # Spécifier explicitement la clé étrangère
        back_populates="user",
        cascade="all, delete-orphan"
    )
