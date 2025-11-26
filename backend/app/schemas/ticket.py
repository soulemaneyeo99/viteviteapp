"""
ViteviteApp - Ticket Schemas
Validation Pydantic v2 pour les tickets
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.models.ticket import TicketStatus


# ========== BASE SCHEMAS ==========
class TicketBase(BaseModel):
    """Base schema pour Ticket"""
    service_id: str
    sub_service_id: Optional[str] = None  # Nouveau: ID du sous-service
    user_name: Optional[str] = Field(None, max_length=255)
    user_phone: Optional[str] = Field(None, max_length=20)  # Relaxed: accept various phone formats
    notes: Optional[str] = Field(None, max_length=500)


class TicketCreate(TicketBase):
    """Schema pour création de ticket"""
    pass


class TicketUpdate(BaseModel):
    """Schema pour mise à jour de ticket"""
    status: Optional[TicketStatus] = None
    notes: Optional[str] = Field(None, max_length=500)
    position_in_queue: Optional[int] = Field(None, ge=1)


class TicketInDB(TicketBase):
    """Schema Ticket depuis DB"""
    id: str
    user_id: Optional[str]
    ticket_number: str
    position_in_queue: int
    status: TicketStatus
    estimated_wait_time: int
    called_at: Optional[str]
    started_at: Optional[str]
    completed_at: Optional[str]
    qr_code: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class TicketPublic(TicketInDB):
    """Schema Ticket public"""
    
    # Computed fields
    is_active: bool = False
    is_completed: bool = False
    actual_wait_time: Optional[int] = None


class TicketWithService(TicketPublic):
    """Ticket avec info du service"""
    service_name: str
    service_category: str
    service_status: str


# ========== ACTION SCHEMAS ==========
class TicketCallNext(BaseModel):
    """Schema pour appeler le prochain ticket"""
    service_id: str


class TicketComplete(BaseModel):
    """Schema pour compléter un ticket"""
    ticket_id: str
    notes: Optional[str] = None


class TicketCancel(BaseModel):
    """Schema pour annuler un ticket"""
    ticket_id: str
    reason: Optional[str] = Field(None, max_length=500)


# ========== RESPONSE SCHEMAS ==========
class TicketResponse(BaseModel):
    """Response standard pour opérations Ticket"""
    success: bool
    message: str
    ticket: Optional[TicketPublic] = None


class TicketsListResponse(BaseModel):
    """Response pour liste de tickets"""
    success: bool
    total: int
    tickets: list[TicketPublic]


class TicketStatsResponse(BaseModel):
    """Response pour statistiques tickets"""
    success: bool
    total_tickets_today: int
    active_tickets: int
    completed_tickets: int
    average_wait_time: float
    services_open: int
    busiest_service: Optional[str]