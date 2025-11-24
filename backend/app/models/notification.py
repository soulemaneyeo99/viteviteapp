"""
ViteviteApp - Notification Model
Système de notifications pour communiquer avec les usagers
"""

from sqlalchemy import Column, String, Integer, Enum as SQLEnum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class NotificationType(str, enum.Enum):
    """Types de notification"""
    INFO = "info"
    WARNING = "warning"
    URGENT = "urgent"
    SUCCESS = "success"
    ERROR = "error"


class NotificationTarget(str, enum.Enum):
    """Cibles de notification"""
    GLOBAL = "global"  # Tous les usagers
    SERVICE = "service"  # Tous les usagers d'un service
    QUEUE = "queue"  # Tous les usagers en file d'attente
    TARGETED = "ciblé"  # Usagers spécifiques
    INDIVIDUAL = "individuel"  # Un seul usager


class NotificationChannel(str, enum.Enum):
    """Canaux de notification"""
    PUSH = "push"
    SMS = "sms"
    EMAIL = "email"
    IN_APP = "in_app"


class Notification(Base, BaseModel):
    """Model Notification - Notifications envoyées aux usagers"""
    
    __tablename__ = "notifications"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== FOREIGN KEYS ==========
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=True, index=True)
    sender_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # Admin qui envoie
    
    # ========== NOTIFICATION INFO ==========
    title = Column(String(200), nullable=False)
    message = Column(String(1000), nullable=False)
    notification_type = Column(SQLEnum(NotificationType), default=NotificationType.INFO, nullable=False)
    
    # ========== TARGET ==========
    target_type = Column(SQLEnum(NotificationTarget), default=NotificationTarget.GLOBAL, nullable=False)
    
    # ========== TARGET USERS (JSON) ==========
    # Format: ["user_id_1", "user_id_2", ...]
    target_user_ids = Column(JSON, default=list, nullable=False)
    
    # ========== CHANNELS (JSON) ==========
    # Format: ["push", "sms", "email"]
    channels = Column(JSON, default=list, nullable=False)
    
    # ========== STATUS ==========
    is_sent = Column(Boolean, default=False, nullable=False)
    is_scheduled = Column(Boolean, default=False, nullable=False)
    scheduled_at = Column(String, nullable=True)  # ISO timestamp
    sent_at = Column(String, nullable=True)  # ISO timestamp
    
    # ========== STATISTICS ==========
    total_recipients = Column(Integer, default=0, nullable=False)
    total_sent = Column(Integer, default=0, nullable=False)
    total_delivered = Column(Integer, default=0, nullable=False)
    total_read = Column(Integer, default=0, nullable=False)
    total_failed = Column(Integer, default=0, nullable=False)
    
    # ========== READ BY (JSON) ==========
    # Format: ["user_id_1", "user_id_2", ...]
    read_by = Column(JSON, default=list, nullable=False)
    
    # ========== METADATA (JSON) ==========
    # Format: {
    #   "template_id": "peak_hours_alert",
    #   "action_url": "/services/123",
    #   "priority": "high"
    # }
    metadata = Column(JSON, default=dict, nullable=False)
    
    # ========== RELATIONSHIPS ==========
    service = relationship("Service", foreign_keys=[service_id])
    sender = relationship("User", foreign_keys=[sender_id])
    
    # ========== PROPERTIES ==========
    @property
    def is_global(self) -> bool:
        """Vérifie si la notification est globale"""
        return self.target_type == NotificationTarget.GLOBAL
    
    @property
    def is_targeted(self) -> bool:
        """Vérifie si la notification est ciblée"""
        return self.target_type in [NotificationTarget.TARGETED, NotificationTarget.INDIVIDUAL]
    
    @property
    def delivery_rate(self) -> float:
        """Calcule le taux de livraison"""
        if self.total_sent == 0:
            return 0.0
        return (self.total_delivered / self.total_sent) * 100
    
    @property
    def read_rate(self) -> float:
        """Calcule le taux de lecture"""
        if self.total_delivered == 0:
            return 0.0
        return (self.total_read / self.total_delivered) * 100
    
    def mark_as_sent(self) -> None:
        """Marque la notification comme envoyée"""
        from datetime import datetime
        self.is_sent = True
        self.sent_at = datetime.utcnow().isoformat()
    
    def mark_as_read(self, user_id: str) -> None:
        """Marque la notification comme lue par un usager"""
        if user_id not in self.read_by:
            self.read_by.append(user_id)
            self.total_read += 1
    
    def increment_delivered(self) -> None:
        """Incrémente le compteur de notifications livrées"""
        self.total_delivered += 1
    
    def increment_failed(self) -> None:
        """Incrémente le compteur de notifications échouées"""
        self.total_failed += 1
    
    def __repr__(self) -> str:
        return f"Notification(id={self.id!r}, type={self.notification_type.value}, target={self.target_type.value})"
