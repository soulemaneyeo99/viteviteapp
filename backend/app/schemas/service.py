"""
ViteviteApp - Service Schemas
Validation Pydantic v2 pour les services
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

from app.models.service import ServiceStatus, AffluenceLevel


# ========== SUB-SCHEMAS ==========
class DocumentRequired(BaseModel):
    """Schema pour document requis"""
    name: str = Field(..., max_length=200)
    required: bool = True
    description: Optional[str] = Field(None, max_length=500)


class Location(BaseModel):
    """Schema pour localisation"""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    address: str = Field(..., max_length=500)


# ========== BASE SCHEMAS ==========
class ServiceBase(BaseModel):
    """Base schema pour Service"""
    name: str = Field(..., min_length=3, max_length=255)
    category: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    icon: str = Field(default="building", max_length=50)
    opening_hours: str = Field(default="08:00 - 17:00", max_length=100)
    location: Optional[Location] = None
    required_documents: List[DocumentRequired] = Field(default_factory=list)


class ServiceCreate(ServiceBase):
    """Schema pour création de service"""
    slug: str = Field(..., pattern=r"^[a-z0-9-]+$", max_length=255)
    max_queue_size: Optional[int] = Field(100, ge=1, le=1000)
    average_service_time: int = Field(10, ge=1, le=120)  # minutes


class ServiceUpdate(BaseModel):
    """Schema pour mise à jour de service"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ServiceStatus] = None
    affluence_level: Optional[AffluenceLevel] = None
    estimated_wait_time: Optional[int] = Field(None, ge=0)
    current_queue_size: Optional[int] = Field(None, ge=0)
    opening_hours: Optional[str] = None
    location: Optional[Location] = None
    required_documents: Optional[List[DocumentRequired]] = None


class ServiceInDB(ServiceBase):
    """Schema Service depuis DB"""
    id: str
    slug: str
    status: ServiceStatus
    affluence_level: AffluenceLevel
    estimated_wait_time: int
    current_queue_size: int
    max_queue_size: Optional[int]
    average_service_time: int
    total_tickets_served: int
    rating: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ServicePublic(ServiceInDB):
    """Schema Service public (alias)"""
    pass


# ========== QUEUE INFO ==========
class QueueInfo(BaseModel):
    """Information sur la file d'attente d'un service"""
    service_id: str
    service_name: str
    status: ServiceStatus
    queue_size: int
    estimated_wait_time: int
    affluence_level: AffluenceLevel
    is_accepting_tickets: bool
    position_in_queue: Optional[int] = None


# ========== RESPONSE SCHEMAS ==========
class ServiceResponse(BaseModel):
    """Response standard pour opérations Service"""
    success: bool
    message: str
    service: Optional[ServicePublic] = None


class ServicesListResponse(BaseModel):
    """Response pour liste de services"""
    success: bool
    total: int
    services: List[ServicePublic]


class QueueInfoResponse(BaseModel):
    """Response pour info file d'attente"""
    success: bool
    queue_info: QueueInfo