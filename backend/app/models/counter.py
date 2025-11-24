"""
ViteviteApp - Counter Model
Gestion des guichets pour chaque service
"""

from sqlalchemy import Column, String, Integer, Enum as SQLEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class CounterStatus(str, enum.Enum):
    """Statuts de guichet"""
    OPEN = "ouvert"
    CLOSED = "fermé"
    PAUSED = "en_pause"


class PriorityType(str, enum.Enum):
    """Types de priorité pour les guichets"""
    NORMAL = "normal"
    PREGNANT = "femme_enceinte"
    DISABLED = "handicapé"
    SENIOR = "senior"
    URGENT = "urgent"


class Counter(Base, BaseModel):
    """Model Counter - Guichets pour les services"""
    
    __tablename__ = "counters"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== FOREIGN KEYS ==========
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    current_ticket_id = Column(String, ForeignKey("tickets.id", ondelete="SET NULL"), nullable=True)
    
    # ========== COUNTER INFO ==========
    counter_number = Column(Integer, nullable=False)  # 1, 2, 3...
    name = Column(String(100), nullable=True)  # Ex: "Guichet A", "Caisse 1"
    
    # ========== STATUS ==========
    status = Column(SQLEnum(CounterStatus), default=CounterStatus.CLOSED, nullable=False, index=True)
    priority_type = Column(SQLEnum(PriorityType), default=PriorityType.NORMAL, nullable=False)
    
    # ========== STATISTICS ==========
    tickets_processed_today = Column(Integer, default=0, nullable=False)
    total_tickets_processed = Column(Integer, default=0, nullable=False)
    average_service_time = Column(Integer, default=0, nullable=False)  # En minutes
    
    # ========== SETTINGS ==========
    is_active = Column(Boolean, default=True, nullable=False)  # Guichet activé/désactivé
    max_tickets_per_day = Column(Integer, nullable=True)  # Limite optionnelle
    
    # ========== RELATIONSHIPS ==========
    service = relationship("Service", back_populates="counters")
    agent = relationship("User", foreign_keys=[agent_id])
    current_ticket = relationship("Ticket", foreign_keys=[current_ticket_id], post_update=True)
    
    # ========== PROPERTIES ==========
    @property
    def is_open(self) -> bool:
        """Vérifie si le guichet est ouvert"""
        return self.status == CounterStatus.OPEN and self.is_active
    
    @property
    def is_available(self) -> bool:
        """Vérifie si le guichet est disponible (ouvert et sans ticket en cours)"""
        return self.is_open and self.current_ticket_id is None
    
    @property
    def has_agent(self) -> bool:
        """Vérifie si un agent est assigné"""
        return self.agent_id is not None
    
    @property
    def can_process_tickets(self) -> bool:
        """Vérifie si le guichet peut traiter des tickets"""
        if not self.is_open or not self.has_agent:
            return False
        if self.max_tickets_per_day and self.tickets_processed_today >= self.max_tickets_per_day:
            return False
        return True
    
    def open_counter(self) -> None:
        """Ouvre le guichet"""
        if self.has_agent:
            self.status = CounterStatus.OPEN
    
    def close_counter(self) -> None:
        """Ferme le guichet"""
        self.status = CounterStatus.CLOSED
    
    def pause_counter(self) -> None:
        """Met le guichet en pause"""
        self.status = CounterStatus.PAUSED
    
    def assign_agent(self, agent_id: str) -> None:
        """Assigne un agent au guichet"""
        self.agent_id = agent_id
    
    def remove_agent(self) -> None:
        """Retire l'agent du guichet"""
        self.agent_id = None
        self.close_counter()
    
    def assign_ticket(self, ticket_id: str) -> None:
        """Assigne un ticket au guichet"""
        self.current_ticket_id = ticket_id
    
    def complete_ticket(self) -> None:
        """Marque le ticket comme terminé et incrémente les compteurs"""
        self.current_ticket_id = None
        self.tickets_processed_today += 1
        self.total_tickets_processed += 1
    
    def reset_daily_stats(self) -> None:
        """Réinitialise les statistiques journalières"""
        self.tickets_processed_today = 0
    
    def __repr__(self) -> str:
        return f"Counter(id={self.id!r}, number={self.counter_number}, status={self.status.value})"
