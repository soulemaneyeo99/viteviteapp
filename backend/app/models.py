from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ServiceStatus(str, Enum):
    OPEN = "ouvert"
    CLOSED = "fermé"
    PAUSED = "en_pause"

class AffluenceLevel(str, Enum):
    LOW = "faible"
    MODERATE = "modérée"
    HIGH = "élevée"
    VERY_HIGH = "très_élevée"

class TicketStatus(str, Enum):
    WAITING = "en_attente"
    CALLED = "appelé"
    SERVING = "en_service"
    COMPLETED = "terminé"
    CANCELLED = "annulé"

class Document(BaseModel):
    name: str
    required: bool = True
    description: Optional[str] = None

class Service(BaseModel):
    id: str
    name: str
    category: str
    description: str
    status: ServiceStatus = ServiceStatus.OPEN
    affluence_level: AffluenceLevel = AffluenceLevel.LOW
    estimated_wait_time: int = 0  # en minutes
    current_queue_size: int = 0
    required_documents: List[Document] = []
    opening_hours: str = "08:00 - 17:00"
    location: Optional[dict] = None  # {lat, lng, address}
    icon: str = "building"

class TicketCreate(BaseModel):
    service_id: str
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    notes: Optional[str] = None

class Ticket(BaseModel):
    id: str
    service_id: str
    ticket_number: str  # Format: N-XXX
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    status: TicketStatus = TicketStatus.WAITING
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    called_at: Optional[str] = None
    completed_at: Optional[str] = None
    estimated_wait_time: int = 0
    position_in_queue: int = 0
    notes: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    notes: Optional[str] = None

class ServiceUpdate(BaseModel):
    status: Optional[ServiceStatus] = None
    affluence_level: Optional[AffluenceLevel] = None
    estimated_wait_time: Optional[int] = None
    current_queue_size: Optional[int] = None

class AdminStats(BaseModel):
    total_tickets_today: int
    active_tickets: int
    completed_tickets: int
    average_wait_time: float
    services_open: int
    busiest_service: Optional[str] = None

class AIPrediction(BaseModel):
    service_id: str
    predicted_wait_time: int
    confidence: float
    suggested_affluence: AffluenceLevel
    recommendation: str
    best_time_to_visit: Optional[str] = None