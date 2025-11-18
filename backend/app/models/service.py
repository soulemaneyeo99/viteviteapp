"""
ViteviteApp - Service Model
Gestion des services (mairies, banques, hôpitaux, etc.)
"""

from sqlalchemy import Column, String, Integer, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class ServiceStatus(str, enum.Enum):
    """Statuts de service"""
    OPEN = "ouvert"
    CLOSED = "fermé"
    PAUSED = "en_pause"


class AffluenceLevel(str, enum.Enum):
    """Niveaux d'affluence"""
    LOW = "faible"
    MODERATE = "modérée"
    HIGH = "élevée"
    VERY_HIGH = "très_élevée"


class Service(Base, BaseModel):
    """Model Service - Services disponibles dans l'application"""
    
    __tablename__ = "services"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== BASIC INFO ==========
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    icon = Column(String(50), default="building", nullable=False)
    
    # ========== STATUS ==========
    status = Column(SQLEnum(ServiceStatus), default=ServiceStatus.OPEN, nullable=False, index=True)
    affluence_level = Column(SQLEnum(AffluenceLevel), default=AffluenceLevel.LOW, nullable=False)
    
    # ========== QUEUE INFO ==========
    estimated_wait_time = Column(Integer, default=0, nullable=False)  # En minutes
    current_queue_size = Column(Integer, default=0, nullable=False)
    max_queue_size = Column(Integer, default=100, nullable=True)
    
    # ========== SCHEDULE ==========
    opening_hours = Column(String(100), default="08:00 - 17:00", nullable=False)
    
    # ========== LOCATION (JSON) ==========
    # Format: {"lat": 5.3599, "lng": -4.0083, "address": "Cocody, Abidjan"}
    location = Column(JSON, nullable=True)
    
    # ========== DOCUMENTS REQUIRED (JSON) ==========
    # Format: [{"name": "Pièce d'identité", "required": true, "description": "..."}]
    required_documents = Column(JSON, default=list, nullable=False)
    
    # ========== METADATA ==========
    average_service_time = Column(Integer, default=10, nullable=False)  # En minutes
    total_tickets_served = Column(Integer, default=0, nullable=False)
    rating = Column(Integer, default=0, nullable=True)  # 0-5
    
    # ========== RELATIONSHIPS ==========
    tickets = relationship("Ticket", back_populates="service", cascade="all, delete-orphan")
    
    # ========== PROPERTIES ==========
    @property
    def is_open(self) -> bool:
        """Vérifie si le service est ouvert"""
        return self.status == ServiceStatus.OPEN
    
    @property
    def is_busy(self) -> bool:
        """Vérifie si le service est très occupé"""
        return self.affluence_level in [AffluenceLevel.HIGH, AffluenceLevel.VERY_HIGH]
    
    @property
    def queue_is_full(self) -> bool:
        """Vérifie si la file est pleine"""
        if self.max_queue_size:
            return self.current_queue_size >= self.max_queue_size
        return False
    
    def increment_queue(self) -> None:
        """Incrémente la taille de la file"""
        self.current_queue_size += 1
    
    def decrement_queue(self) -> None:
        """Décrémente la taille de la file (minimum 0)"""
        if self.current_queue_size > 0:
            self.current_queue_size -= 1
    
    def __repr__(self) -> str:
        return f"Service(id={self.id!r}, name={self.name!r}, status={self.status.value})"