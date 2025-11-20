# backend/app/api/v1/admin.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.ticket import Ticket
from app.models.service import Service

router = APIRouter()

# ========== SCHEMAS ==========
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# ========== USERS CRUD ==========
@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(User)
    
    if role:
        stmt = stmt.where(User.role == role)
    
    if search:
        stmt = stmt.where(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%")
            )
        )
    
    # Total avant pagination
    total_result = await db.execute(stmt.with_only_columns(func.count()))
    total = total_result.scalar_one()
    
    # Pagination
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return {
        "success": True,
        "total": total,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "phone": u.phone,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ]
    }

@router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {
        "success": True,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat()
        }
    }

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.phone is not None:
        user.phone = user_data.phone
    if user_data.role is not None:
        if user_data.role not in ["citoyen", "admin", "super"]:
            raise HTTPException(status_code=400, detail="Rôle invalide")
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    user.updated_at = datetime.utcnow()
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "message": "Utilisateur mis à jour",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if user.role == "super":
        raise HTTPException(status_code=403, detail="Impossible de supprimer un super admin")
    
    await db.delete(user)
    await db.commit()
    
    return {"success": True, "message": "Utilisateur supprimé"}

# ========== TICKETS CRUD ==========
@router.get("/tickets")
async def get_all_tickets_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    service_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Ticket)
    
    if status:
        stmt = stmt.where(Ticket.status == status)
    if service_id:
        stmt = stmt.where(Ticket.service_id == service_id)
    
    total_result = await db.execute(stmt.with_only_columns(func.count()))
    total = total_result.scalar_one()
    
    stmt = stmt.order_by(Ticket.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    tickets = result.scalars().all()
    
    return {
        "success": True,
        "total": total,
        "tickets": [
            {
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "service_id": str(t.service_id),
                "user_name": t.user_name,
                "status": t.status,
                "position_in_queue": t.position_in_queue,
                "created_at": t.created_at.isoformat()
            }
            for t in tickets
        ]
    }

@router.put("/tickets/{ticket_id}")
async def update_ticket_admin(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    if ticket_data.status:
        if ticket_data.status not in ["en_attente", "appelé", "en_service", "terminé", "annulé"]:
            raise HTTPException(status_code=400, detail="Statut invalide")
        ticket.status = ticket_data.status
        
        if ticket_data.status == "appelé":
            ticket.called_at = datetime.utcnow()
        elif ticket_data.status == "en_service":
            ticket.started_at = datetime.utcnow()
        elif ticket_data.status == "terminé":
            ticket.completed_at = datetime.utcnow()
    
    if ticket_data.notes is not None:
        ticket.notes = ticket_data.notes
    
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": "Ticket mis à jour",
        "ticket": {
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "status": ticket.status,
            "notes": ticket.notes
        }
    }

@router.delete("/tickets/{ticket_id}")
async def delete_ticket_admin(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    await db.delete(ticket)
    await db.commit()
    
    return {"success": True, "message": "Ticket supprimé"}

# ========== SERVICES CRUD ==========
@router.post("/services")
async def create_service_admin(
    service_data: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    new_service = Service(**service_data)
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    
    return {"success": True, "message": "Service créé", "service": new_service}

@router.put("/services/{service_id}")
async def update_service_admin(
    service_id: str,
    service_data: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    for key, value in service_data.items():
        setattr(service, key, value)
    
    service.updated_at = datetime.utcnow()
    db.add(service)
    await db.commit()
    await db.refresh(service)
    
    return {"success": True, "message": "Service mis à jour", "service": service}

@router.delete("/services/{service_id}")
async def delete_service_admin(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    await db.delete(service)
    await db.commit()
    
    return {"success": True, "message": "Service supprimé"}
