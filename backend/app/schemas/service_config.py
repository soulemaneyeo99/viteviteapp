"""
ViteviteApp - ServiceConfig Schemas
Schémas Pydantic pour la configuration des services
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


# ========== SUB-SCHEMAS ==========
class DocumentRequired(BaseModel):
    """Document requis pour un service"""
    id: str
    name: str
    required: bool = True
    description: Optional[str] = None
    examples: List[str] = []


class OpeningHours(BaseModel):
    """Horaires d'ouverture pour un jour"""
    open: str = Field(..., description="Heure d'ouverture (HH:MM)")
    close: str = Field(..., description="Heure de fermeture (HH:MM)")
    is_open: bool = True


class WeeklyHours(BaseModel):
    """Horaires d'ouverture pour toute la semaine"""
    lundi: Optional[OpeningHours] = None
    mardi: Optional[OpeningHours] = None
    mercredi: Optional[OpeningHours] = None
    jeudi: Optional[OpeningHours] = None
    vendredi: Optional[OpeningHours] = None
    samedi: Optional[OpeningHours] = None
    dimanche: Optional[OpeningHours] = None


# ========== CREATE SCHEMAS ==========
class ServiceConfigCreate(BaseModel):
    """Schéma pour créer une configuration de service"""
    service_id: str
    average_processing_time: int = 10
    min_processing_time: int = 5
    max_processing_time: int = 30
    required_documents: List[DocumentRequired] = []
    opening_hours: Dict[str, dict] = {}
    is_paid_service: bool = False
    price: float = 0.0
    currency: str = "FCFA"
    payment_methods: List[str] = []
    max_queue_size: int = 100
    allow_virtual_tickets: bool = True
    allow_walk_in: bool = True
    require_appointment: bool = False
    notify_before_minutes: int = 15
    send_sms_notifications: bool = True
    send_email_notifications: bool = False
    send_push_notifications: bool = True
    enable_no_show_penalty: bool = False
    max_no_shows_allowed: int = 3
    blacklist_duration_hours: int = 24
    auto_cancel_after_minutes: int = 5
    max_advance_booking_days: int = 7
    min_advance_booking_hours: int = 1
    allow_same_day_booking: bool = True
    max_tickets_per_day: Optional[int] = None
    max_tickets_per_hour: Optional[int] = None
    special_settings: Dict = {}


# ========== UPDATE SCHEMAS ==========
class ServiceConfigUpdate(BaseModel):
    """Schéma pour mettre à jour une configuration de service"""
    average_processing_time: Optional[int] = None
    min_processing_time: Optional[int] = None
    max_processing_time: Optional[int] = None
    required_documents: Optional[List[DocumentRequired]] = None
    opening_hours: Optional[Dict[str, dict]] = None
    is_paid_service: Optional[bool] = None
    price: Optional[float] = None
    payment_methods: Optional[List[str]] = None
    max_queue_size: Optional[int] = None
    allow_virtual_tickets: Optional[bool] = None
    allow_walk_in: Optional[bool] = None
    require_appointment: Optional[bool] = None
    notify_before_minutes: Optional[int] = None
    send_sms_notifications: Optional[bool] = None
    send_email_notifications: Optional[bool] = None
    send_push_notifications: Optional[bool] = None
    enable_no_show_penalty: Optional[bool] = None
    max_no_shows_allowed: Optional[int] = None
    blacklist_duration_hours: Optional[int] = None
    auto_cancel_after_minutes: Optional[int] = None
    max_advance_booking_days: Optional[int] = None
    min_advance_booking_hours: Optional[int] = None
    allow_same_day_booking: Optional[bool] = None
    max_tickets_per_day: Optional[int] = None
    max_tickets_per_hour: Optional[int] = None
    special_settings: Optional[Dict] = None


# ========== RESPONSE SCHEMAS ==========
class ServiceConfigResponse(BaseModel):
    """Schéma de réponse pour une configuration de service"""
    id: str
    service_id: str
    average_processing_time: int
    min_processing_time: int
    max_processing_time: int
    required_documents: List[dict]
    opening_hours: Dict[str, dict]
    is_paid_service: bool
    price: float
    currency: str
    payment_methods: List[str]
    max_queue_size: int
    allow_virtual_tickets: bool
    allow_walk_in: bool
    require_appointment: bool
    notify_before_minutes: int
    send_sms_notifications: bool
    send_email_notifications: bool
    send_push_notifications: bool
    enable_no_show_penalty: bool
    max_no_shows_allowed: int
    blacklist_duration_hours: int
    auto_cancel_after_minutes: int
    max_advance_booking_days: int
    min_advance_booking_hours: int
    allow_same_day_booking: bool
    max_tickets_per_day: Optional[int]
    max_tickets_per_hour: Optional[int]
    special_settings: Dict
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
