"""
Fichier: backend/app/routers/notifications.py
Router pour les notifications (push, SMS, email)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# Stockage en mémoire (en production: Redis/Database)
NOTIFICATIONS_STORE = []

class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    user_phone: Optional[str] = None
    type: str  # ticket, promo, update, alert
    title: str
    message: str
    ticket_id: Optional[str] = None
    urgent: bool = False

class Notification(BaseModel):
    id: str
    user_id: Optional[str]
    user_phone: Optional[str]
    type: str
    title: str
    message: str
    ticket_id: Optional[str]
    urgent: bool
    read: bool
    created_at: str

@router.post("")
async def create_notification(notif_data: NotificationCreate):
    """Crée une nouvelle notification"""
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": notif_data.user_id,
        "user_phone": notif_data.user_phone,
        "type": notif_data.type,
        "title": notif_data.title,
        "message": notif_data.message,
        "ticket_id": notif_data.ticket_id,
        "urgent": notif_data.urgent,
        "read": False,
        "created_at": datetime.now().isoformat()
    }
    
    NOTIFICATIONS_STORE.append(notification)
    
    # Ici on enverrait le SMS/Push/Email réel
    if notif_data.urgent:
        await send_urgent_notification(notification)
    
    return {
        "success": True,
        "notification": notification,
        "message": "Notification envoyée"
    }

@router.get("/user/{user_phone}")
async def get_user_notifications(user_phone: str, unread_only: bool = False):
    """Récupère les notifications d'un utilisateur par téléphone"""
    notifications = [
        n for n in NOTIFICATIONS_STORE 
        if n.get("user_phone") == user_phone
    ]
    
    if unread_only:
        notifications = [n for n in notifications if not n.get("read", False)]
    
    # Tri par date décroissante
    notifications.sort(key=lambda n: n["created_at"], reverse=True)
    
    return {
        "notifications": notifications,
        "count": len(notifications),
        "unread_count": len([n for n in notifications if not n.get("read", False)])
    }

@router.get("/ticket/{ticket_id}")
async def get_ticket_notifications(ticket_id: str):
    """Récupère les notifications liées à un ticket"""
    notifications = [
        n for n in NOTIFICATIONS_STORE 
        if n.get("ticket_id") == ticket_id
    ]
    
    notifications.sort(key=lambda n: n["created_at"], reverse=True)
    
    return {"notifications": notifications, "count": len(notifications)}

@router.patch("/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Marque une notification comme lue"""
    for notif in NOTIFICATIONS_STORE:
        if notif["id"] == notification_id:
            notif["read"] = True
            return {"success": True, "notification": notif}
    
    raise HTTPException(status_code=404, detail="Notification non trouvée")

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Supprime une notification"""
    global NOTIFICATIONS_STORE
    initial_count = len(NOTIFICATIONS_STORE)
    NOTIFICATIONS_STORE = [n for n in NOTIFICATIONS_STORE if n["id"] != notification_id]
    
    if len(NOTIFICATIONS_STORE) == initial_count:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    return {"success": True, "message": "Notification supprimée"}

@router.get("/recent")
async def get_recent_notifications(limit: int = 10):
    """Récupère les notifications récentes (toutes)"""
    notifications = sorted(
        NOTIFICATIONS_STORE, 
        key=lambda n: n["created_at"], 
        reverse=True
    )[:limit]
    
    return {"notifications": notifications, "count": len(notifications)}

# Helper functions

async def send_urgent_notification(notification: dict):
    """Simule l'envoi d'une notification urgente"""
    # En production: intégration avec Twilio/Firebase/etc
    print(f"🚨 URGENT: {notification['title']} - {notification['message']}")
    
    if notification.get("user_phone"):
        print(f"📱 SMS envoyé à {notification['user_phone']}")
    
    return True

@router.post("/broadcast")
async def broadcast_notification(notif_data: NotificationCreate):
    """Envoie une notification à tous les utilisateurs"""
    # En production: récupérer tous les users depuis la DB
    broadcast_notif = {
        "id": str(uuid.uuid4()),
        "type": "broadcast",
        "title": notif_data.title,
        "message": notif_data.message,
        "urgent": notif_data.urgent,
        "read": False,
        "created_at": datetime.now().isoformat()
    }
    
    NOTIFICATIONS_STORE.append(broadcast_notif)
    
    return {
        "success": True,
        "notification": broadcast_notif,
        "message": "Notification diffusée"
    }

@router.get("/stats")
async def get_notification_stats():
    """Statistiques sur les notifications"""
    total = len(NOTIFICATIONS_STORE)
    unread = len([n for n in NOTIFICATIONS_STORE if not n.get("read", False)])
    urgent = len([n for n in NOTIFICATIONS_STORE if n.get("urgent", False)])
    
    types_count = {}
    for notif in NOTIFICATIONS_STORE:
        notif_type = notif.get("type", "unknown")
        types_count[notif_type] = types_count.get(notif_type, 0) + 1
    
    return {
        "total": total,
        "unread": unread,
        "urgent": urgent,
        "by_type": types_count,
        "delivery_rate": 98.5  # Simulation
    }