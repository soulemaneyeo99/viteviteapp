"""
ViteviteApp - Counter Schemas
Schémas Pydantic pour les guichets
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ========== ENUMS ==========
class CounterStatusEnum(str):
    OPEN = "ouvert"
    CLOSED = "fermé"
    PAUSED = "en_pause"


class PriorityTypeEnum(str):
    NORMAL = "normal"
    PREGNANT = "femme_enceinte"
    DISABLED = "handicapé"
    SENIOR = "senior"
    URGENT = "urgent"


# ========== CREATE SCHEMAS ==========
class CounterCreate(BaseModel):
    """Schéma pour créer un guichet"""
    service_id: str
    counter_number: int
    name: Optional[str] = None
    priority_type: str = PriorityTypeEnum.NORMAL
    max_tickets_per_day: Optional[int] = None


# ========== UPDATE SCHEMAS ==========
class CounterUpdate(BaseModel):
    """Schéma pour mettre à jour un guichet"""
    name: Optional[str] = None
    status: Optional[str] = None
    priority_type: Optional[str] = None
    agent_id: Optional[str] = None
    max_tickets_per_day: Optional[int] = None
    is_active: Optional[bool] = None


class CounterStatusUpdate(BaseModel):
    """Schéma pour changer le statut d'un guichet"""
    status: str = Field(..., description="ouvert, fermé, ou en_pause")


class CounterAgentAssign(BaseModel):
    """Schéma pour assigner un agent à un guichet"""
    agent_id: str


# ========== RESPONSE SCHEMAS ==========
class CounterResponse(BaseModel):
    """Schéma de réponse pour un guichet"""
    id: str
    service_id: str
    agent_id: Optional[str] = None
    current_ticket_id: Optional[str] = None
    counter_number: int
    name: Optional[str] = None
    status: str
    priority_type: str
    tickets_processed_today: int
    total_tickets_processed: int
    average_service_time: int
    is_active: bool
    max_tickets_per_day: Optional[int] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class CounterWithAgent(CounterResponse):
    """Schéma de réponse pour un guichet avec informations de l'agent"""
    agent_name: Optional[str] = None
    agent_email: Optional[str] = None


class CounterStats(BaseModel):
    """Statistiques d'un guichet"""
    counter_id: str
    counter_number: int
    tickets_processed_today: int
    total_tickets_processed: int
    average_service_time: int
    current_status: str
    agent_name: Optional[str] = None
    efficiency_score: float = Field(..., description="Score d'efficacité 0-100")
