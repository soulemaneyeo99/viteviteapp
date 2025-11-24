"""
ViteviteApp - Ticket Model
Gestion des tickets virtuels
"""

from sqlalchemy import Column, String, Integer, Enum as SQLEnum, ForeignKey, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid



class TicketStatus(str, enum.Enum):
    """Statuts de ticket"""
    PENDING_VALIDATION = "en_attente_validation"  # Nouveau: en attente de validation admin
    WAITING = "en_attente"
    CALLED = "appelé"
    SERVING = "en_service"
    COMPLETED = "terminé"
    CANCELLED = "annulé"
    NO_SHOW = "absent"
    REJECTED = "refusé"  # Nouveau: refusé par admin


class Ticket(Base, BaseModel):
    """Model Ticket - Tickets virtuels pour file d'attente"""
    
    __tablename__ = "tickets"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== FOREIGN KEYS ==========
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    counter_id = Column(String, ForeignKey("counters.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # ========== TICKET INFO ==========
    ticket_number = Column(String(20), nullable=False, index=True)  # Format: N-001
    position_in_queue = Column(Integer, nullable=False)
    
    # ========== STATUS ==========
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.WAITING, nullable=False, index=True)
    
    # ========== USER INFO (OPTIONAL) ==========
    user_name = Column(String(255), nullable=True)
    user_phone = Column(String(20), nullable=True)
    
    # ========== TIME TRACKING ==========
    estimated_wait_time = Column(Integer, default=0, nullable=False)  # En minutes
    called_at = Column(String, nullable=True)  # ISO timestamp
    started_at = Column(String, nullable=True)  # ISO timestamp
    completed_at = Column(String, nullable=True)  # ISO timestamp
    
    # ========== PAYMENT (for paid services) ==========
    is_paid = Column(Boolean, default=False, nullable=False)
    payment_status = Column(String(20), default="pending", nullable=False)  # pending, paid, refunded
    payment_amount = Column(Float, default=0.0, nullable=False)
    payment_method = Column(String(50), nullable=True)  # cash, mobile_money, card
    
    # ========== DOCUMENT VALIDATION ==========
    documents_validated = Column(Boolean, default=False, nullable=False)
    missing_documents = Column(JSON, default=list, nullable=False)  # Liste des documents manquants
    validation_status = Column(String(20), default="pending", nullable=False)  # valid, invalid, incomplete, pending
    validated_at = Column(String, nullable=True)  # ISO timestamp
    validated_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # Agent qui a validé
    
    # ========== ANTI-ABUSE SYSTEM ==========
    no_show_count = Column(Integer, default=0, nullable=False)
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    blacklist_until = Column(String, nullable=True)  # ISO timestamp
    blacklist_reason = Column(String(500), nullable=True)
    
    # ========== METADATA ==========
    notes = Column(String(500), nullable=True)
    qr_code = Column(String(255), nullable=True)  # URL ou path vers QR code
    
    # ========== RELATIONSHIPS ==========
    service = relationship("Service", back_populates="tickets")
    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    counter = relationship("Counter", foreign_keys=[counter_id])
    validator = relationship("User", foreign_keys=[validated_by])

    # ========== PROPERTIES ==========
    @property
    def is_active(self) -> bool:
        """Vérifie si le ticket est actif"""
        return self.status in [TicketStatus.WAITING, TicketStatus.CALLED, TicketStatus.SERVING]
    
    @property
    def is_completed(self) -> bool:
        """Vérifie si le ticket est terminé"""
        return self.status in [TicketStatus.COMPLETED, TicketStatus.CANCELLED, TicketStatus.NO_SHOW]
    
    @property
    def actual_wait_time(self) -> int | None:
        """Calcule le temps d'attente réel en minutes"""
        if not self.called_at:
            return None
        
        try:
            created = datetime.fromisoformat(self.created_at.replace('Z', '+00:00'))
            called = datetime.fromisoformat(self.called_at.replace('Z', '+00:00'))
            return int((called - created).total_seconds() / 60)
        except:
            return None
    
    def mark_as_called(self) -> None:
        """Marque le ticket comme appelé"""
        self.status = TicketStatus.CALLED
        self.called_at = datetime.utcnow().isoformat()
    
    def mark_as_serving(self) -> None:
        """Marque le ticket en cours de service"""
        self.status = TicketStatus.SERVING
        self.started_at = datetime.utcnow().isoformat()
    
    def mark_as_completed(self) -> None:
        """Marque le ticket comme terminé"""
        self.status = TicketStatus.COMPLETED
        self.completed_at = datetime.utcnow().isoformat()
    
    def mark_as_cancelled(self) -> None:
        """Marque le ticket comme annulé"""
        self.status = TicketStatus.CANCELLED
        self.completed_at = datetime.utcnow().isoformat()
    
    def mark_as_no_show(self) -> None:
        """Marque le ticket comme absent"""
        self.status = TicketStatus.NO_SHOW
        self.completed_at = datetime.utcnow().isoformat()
    
    def __repr__(self) -> str:
        return f"Ticket(id={self.id!r}, number={self.ticket_number!r}, status={self.status.value})"