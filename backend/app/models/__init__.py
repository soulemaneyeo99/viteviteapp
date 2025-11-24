"""
ViteviteApp - Models Package
Centralise tous les modèles SQLAlchemy
"""

from app.models.base import BaseModel
from app.models.user import User, UserRole
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.models.ticket import Ticket, TicketStatus
from app.models.pharmacy import Pharmacy
from app.models.transport import TransportRoute, TransportStop, TransportSchedule
from app.models.counter import Counter, CounterStatus, PriorityType
from app.models.service_config import ServiceConfig
from app.models.notification import Notification, NotificationType, NotificationTarget, NotificationChannel
from app.models.analytics import Analytics

__all__ = [
    "BaseModel",
    "User",
    "UserRole",
    "Service",
    "ServiceStatus",
    "AffluenceLevel",
    "Ticket",
    "TicketStatus",
    "Pharmacy",
    "TransportRoute",
    "TransportStop",
    "TransportSchedule",
    "Counter",
    "CounterStatus",
    "PriorityType",
    "ServiceConfig",
    "Notification",
    "NotificationType",
    "NotificationTarget",
    "NotificationChannel",
    "Analytics",
]
