"""
ViteviteApp - Models Package
Export de tous les models SQLAlchemy
"""

from app.models.base import BaseModel, generate_uuid
from app.models.user import User, UserRole
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.models.ticket import Ticket, TicketStatus

__all__ = [
    # Base
    "BaseModel",
    "generate_uuid",
    
    # User
    "User",
    "UserRole",
    
    # Service
    "Service",
    "ServiceStatus",
    "AffluenceLevel",
    
    # Ticket
    "Ticket",
    "TicketStatus",
]
