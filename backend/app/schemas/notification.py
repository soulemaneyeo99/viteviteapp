"""
ViteviteApp - Notification Schemas
Schémas Pydantic pour les notifications
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


# ========== ENUMS ==========
class NotificationTypeEnum(str):
    INFO = "info"
    WARNING = "warning"
    URGENT = "urgent"
    SUCCESS = "success"
    ERROR = "error"


class NotificationTargetEnum(str):
    GLOBAL = "global"
    SERVICE = "service"
    QUEUE = "queue"
    TARGETED = "ciblé"
    INDIVIDUAL = "individuel"


class NotificationChannelEnum(str):
    PUSH = "push"
    SMS = "sms"
    EMAIL = "email"
    IN_APP = "in_app"


# ========== CREATE SCHEMAS ==========
class NotificationCreate(BaseModel):
    """Schéma pour créer une notification"""
    service_id: Optional[str] = None
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: str = NotificationTypeEnum.INFO
    target_type: str = NotificationTargetEnum.GLOBAL
    target_user_ids: List[str] = []
    channels: List[str] = [NotificationChannelEnum.PUSH]
    is_scheduled: bool = False
    scheduled_at: Optional[str] = None
    extra_data: Dict = {}


class NotificationBroadcast(BaseModel):
    """Schéma pour une notification globale"""
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: str = NotificationTypeEnum.INFO
    channels: List[str] = [NotificationChannelEnum.PUSH]


class NotificationTargeted(BaseModel):
    """Schéma pour une notification ciblée"""
    service_id: Optional[str] = None
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: str = NotificationTypeEnum.INFO
    target_user_ids: List[str] = Field(..., min_items=1)
    channels: List[str] = [NotificationChannelEnum.PUSH]


class NotificationIndividual(BaseModel):
    """Schéma pour une notification individuelle"""
    user_id: str
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    notification_type: str = NotificationTypeEnum.INFO
    channels: List[str] = [NotificationChannelEnum.PUSH]


# ========== RESPONSE SCHEMAS ==========
class NotificationResponse(BaseModel):
    """Schéma de réponse pour une notification"""
    id: str
    service_id: Optional[str]
    sender_id: Optional[str]
    title: str
    message: str
    notification_type: str
    target_type: str
    target_user_ids: List[str]
    channels: List[str]
    is_sent: bool
    is_scheduled: bool
    scheduled_at: Optional[str]
    sent_at: Optional[str]
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_read: int
    total_failed: int
    read_by: List[str]
    extra_data: Dict
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    """Statistiques d'une notification"""
    notification_id: str
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_read: int
    total_failed: int
    delivery_rate: float = Field(..., description="Taux de livraison en %")
    read_rate: float = Field(..., description="Taux de lecture en %")


class NotificationTemplate(BaseModel):
    """Template de notification prédéfini"""
    id: str
    name: str
    title: str
    message: str
    notification_type: str
    suggested_channels: List[str]
    variables: List[str] = Field(default=[], description="Variables disponibles dans le template")
