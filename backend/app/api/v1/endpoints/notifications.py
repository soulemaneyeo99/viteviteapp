"""
ViteviteApp - Notifications Endpoints
API pour la communication avec les usagers
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.notification import Notification, NotificationTarget
from app.models.service import Service
from app.models.ticket import Ticket, TicketStatus
from app.schemas.notification import (
    NotificationCreate,
    NotificationBroadcast,
    NotificationTargeted,
    NotificationIndividual,
    NotificationResponse,
    NotificationStats,
    NotificationTemplate
)

router = APIRouter()


# ========== SEND BROADCAST NOTIFICATION ==========
@router.post("/broadcast", response_model=NotificationResponse)
async def send_broadcast_notification(
    notification_data: NotificationBroadcast,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Envoyer une notification globale à tous les usagers
    """
    # Compter le nombre total d'usagers
    stmt = select(User).where(User.role == "citoyen")
    result = await db.execute(stmt)
    all_users = result.scalars().all()
    
    # Créer la notification
    new_notification = Notification(
        service_id=None,
        sender_id=admin.id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type,
        target_type=NotificationTarget.GLOBAL,
        target_user_ids=[],
        channels=notification_data.channels,
        total_recipients=len(all_users),
        total_sent=len(all_users)
    )
    
    db.add(new_notification)
    
    # Marquer comme envoyée
    new_notification.mark_as_sent()
    
    await db.commit()
    await db.refresh(new_notification)
    
    return new_notification


# ========== SEND TARGETED NOTIFICATION ==========
@router.post("/targeted", response_model=NotificationResponse)
async def send_targeted_notification(
    notification_data: NotificationTargeted,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Envoyer une notification ciblée à des usagers spécifiques
    """
    # Vérifier que les usagers existent
    stmt = select(User).where(User.id.in_(notification_data.target_user_ids))
    result = await db.execute(stmt)
    target_users = result.scalars().all()
    
    if len(target_users) != len(notification_data.target_user_ids):
        raise HTTPException(
            status_code=400,
            detail="Certains usagers n'ont pas été trouvés"
        )
    
    # Créer la notification
    new_notification = Notification(
        service_id=notification_data.service_id,
        sender_id=admin.id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type,
        target_type=NotificationTarget.TARGETED,
        target_user_ids=notification_data.target_user_ids,
        channels=notification_data.channels,
        total_recipients=len(target_users),
        total_sent=len(target_users)
    )
    
    db.add(new_notification)
    
    # Marquer comme envoyée
    new_notification.mark_as_sent()
    
    await db.commit()
    await db.refresh(new_notification)
    
    return new_notification


# ========== SEND INDIVIDUAL NOTIFICATION ==========
@router.post("/individual", response_model=NotificationResponse)
async def send_individual_notification(
    notification_data: NotificationIndividual,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Envoyer une notification à un seul usager
    """
    # Vérifier que l'usager existe
    stmt = select(User).where(User.id == notification_data.user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usager non trouvé")
    
    # Créer la notification
    new_notification = Notification(
        service_id=None,
        sender_id=admin.id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type,
        target_type=NotificationTarget.INDIVIDUAL,
        target_user_ids=[notification_data.user_id],
        channels=notification_data.channels,
        total_recipients=1,
        total_sent=1
    )
    
    db.add(new_notification)
    
    # Marquer comme envoyée
    new_notification.mark_as_sent()
    
    await db.commit()
    await db.refresh(new_notification)
    
    return new_notification


# ========== NOTIFY QUEUE ==========
@router.post("/queue/{service_id}")
async def notify_queue(
    service_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    channels: List[str] = ["push"],
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Notifier tous les usagers en file d'attente pour un service
    """
    # Récupérer tous les tickets actifs du service
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == service_id,
            Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED])
        )
    )
    result = await db.execute(stmt)
    active_tickets = result.scalars().all()
    
    # Récupérer les IDs des usagers
    user_ids = [t.user_id for t in active_tickets if t.user_id]
    
    if not user_ids:
        return {
            "success": True,
            "message": "Aucun usager en file d'attente",
            "total_notified": 0
        }
    
    # Créer la notification
    new_notification = Notification(
        service_id=service_id,
        sender_id=admin.id,
        title=title,
        message=message,
        notification_type=notification_type,
        target_type=NotificationTarget.QUEUE,
        target_user_ids=user_ids,
        channels=channels,
        total_recipients=len(user_ids),
        total_sent=len(user_ids)
    )
    
    db.add(new_notification)
    new_notification.mark_as_sent()
    
    await db.commit()
    await db.refresh(new_notification)
    
    return {
        "success": True,
        "message": f"{len(user_ids)} usagers notifiés",
        "notification_id": new_notification.id,
        "total_notified": len(user_ids)
    }


# ========== GET NOTIFICATION TEMPLATES ==========
@router.get("/templates", response_model=List[NotificationTemplate])
async def get_notification_templates(
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les templates de notifications prédéfinis
    """
    templates = [
        {
            "id": "peak_hours_alert",
            "name": "Alerte Heures de Pointe",
            "title": "⚠️ Affluence Forte",
            "message": "Affluence forte actuellement. Temps d'attente estimé : {wait_time} minutes.",
            "notification_type": "warning",
            "suggested_channels": ["push", "sms"],
            "variables": ["wait_time"]
        },
        {
            "id": "service_closed",
            "name": "Service Fermé",
            "title": "🔴 Service Fermé",
            "message": "Le service {service_name} est temporairement fermé. Réouverture prévue à {reopen_time}.",
            "notification_type": "urgent",
            "suggested_channels": ["push", "sms", "email"],
            "variables": ["service_name", "reopen_time"]
        },
        {
            "id": "your_turn_soon",
            "name": "Votre Tour Approche",
            "title": "🔔 Votre Tour Approche",
            "message": "Votre tour est dans {minutes} minutes. Veuillez vous préparer.",
            "notification_type": "info",
            "suggested_channels": ["push", "sms"],
            "variables": ["minutes"]
        },
        {
            "id": "documents_missing",
            "name": "Documents Manquants",
            "title": "📄 Documents Manquants",
            "message": "Documents manquants : {missing_docs}. Veuillez les apporter pour votre rendez-vous.",
            "notification_type": "warning",
            "suggested_channels": ["push", "email"],
            "variables": ["missing_docs"]
        },
        {
            "id": "service_update",
            "name": "Mise à Jour Service",
            "title": "ℹ️ Mise à Jour",
            "message": "{update_message}",
            "notification_type": "info",
            "suggested_channels": ["push"],
            "variables": ["update_message"]
        }
    ]
    
    return templates


# ========== GET NOTIFICATION HISTORY ==========
@router.get("/history", response_model=List[NotificationResponse])
async def get_notification_history(
    service_id: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer l'historique des notifications
    """
    stmt = select(Notification).order_by(Notification.created_at.desc()).limit(limit)
    
    if service_id:
        stmt = stmt.where(Notification.service_id == service_id)
    
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    
    return notifications


# ========== GET NOTIFICATION STATS ==========
@router.get("/{notification_id}/stats", response_model=NotificationStats)
async def get_notification_stats(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les statistiques d'une notification
    """
    stmt = select(Notification).where(Notification.id == notification_id)
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    return {
        "notification_id": notification.id,
        "total_recipients": notification.total_recipients,
        "total_sent": notification.total_sent,
        "total_delivered": notification.total_delivered,
        "total_read": notification.total_read,
        "total_failed": notification.total_failed,
        "delivery_rate": notification.delivery_rate,
        "read_rate": notification.read_rate
    }


# ========== MARK NOTIFICATION AS READ ==========
@router.post("/{notification_id}/read/{user_id}")
async def mark_notification_as_read(
    notification_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Marquer une notification comme lue par un usager
    """
    stmt = select(Notification).where(Notification.id == notification_id)
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    notification.mark_as_read(user_id)
    
    await db.commit()
    
    return {
        "success": True,
        "message": "Notification marquée comme lue"
    }
