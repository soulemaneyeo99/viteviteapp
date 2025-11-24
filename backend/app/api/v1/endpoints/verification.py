"""
ViteviteApp - Verification Endpoints
API pour la vérification des usagers et validation des documents
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.ticket import Ticket, TicketStatus
from app.models.service import Service
from app.models.service_config import ServiceConfig

router = APIRouter()


# ========== SCHEMAS ==========
class QRCodeScan(BaseModel):
    """Scanner un QR code"""
    ticket_id: str
    counter_id: Optional[str] = None


class DocumentValidation(BaseModel):
    """Valider les documents d'un ticket"""
    ticket_id: str
    documents_validated: bool
    missing_documents: List[str] = []
    validation_status: str  # valid, invalid, incomplete
    notes: Optional[str] = None


class TicketMarkStatus(BaseModel):
    """Marquer un ticket avec un statut"""
    status: str  # valid, invalid, incomplete


# ========== SCAN QR CODE ==========
@router.post("/scan-qr")
async def scan_qr_code(
    scan_data: QRCodeScan,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Scanner et vérifier un QR code de ticket
    Retourne les informations du ticket et son statut de validation
    """
    # Récupérer le ticket
    stmt = select(Ticket).where(Ticket.id == scan_data.ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Récupérer le service
    stmt = select(Service).where(Service.id == ticket.service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Récupérer la configuration du service
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == ticket.service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    # Déterminer le statut de validation
    validation_status = "🟢"  # Vert par défaut
    validation_message = "Ticket valide"
    can_proceed = True
    
    # Vérifier si le ticket est blacklisté
    if ticket.is_blacklisted:
        validation_status = "🔴"
        validation_message = f"Ticket blacklisté jusqu'à {ticket.blacklist_until}"
        can_proceed = False
    
    # Vérifier le statut du ticket
    elif ticket.status == TicketStatus.CANCELLED:
        validation_status = "🔴"
        validation_message = "Ticket annulé"
        can_proceed = False
    
    elif ticket.status == TicketStatus.COMPLETED:
        validation_status = "🔴"
        validation_message = "Ticket déjà traité"
        can_proceed = False
    
    elif ticket.status == TicketStatus.NO_SHOW:
        validation_status = "🔴"
        validation_message = "Ticket marqué comme absent"
        can_proceed = False
    
    # Vérifier le paiement si service payant
    elif config and config.is_paid_service:
        if ticket.payment_status != "paid":
            validation_status = "🔴"
            validation_message = f"Paiement requis ({config.price} {config.currency})"
            can_proceed = False
    
    # Vérifier les documents
    elif not ticket.documents_validated:
        if ticket.validation_status == "incomplete":
            validation_status = "🟡"
            validation_message = "Documents incomplets"
            can_proceed = True  # Peut procéder mais avec avertissement
        elif ticket.validation_status == "invalid":
            validation_status = "🔴"
            validation_message = "Documents invalides"
            can_proceed = False
    
    # Vérifier si c'est bien le tour du ticket
    if can_proceed and ticket.status == TicketStatus.WAITING:
        # Compter les tickets avant celui-ci
        stmt = select(Ticket).where(
            Ticket.service_id == ticket.service_id,
            Ticket.status.in_([TicketStatus.WAITING, TicketStatus.CALLED]),
            Ticket.position_in_queue < ticket.position_in_queue
        )
        result = await db.execute(stmt)
        tickets_before = result.scalars().all()
        
        if len(tickets_before) > 5:
            validation_status = "🟡"
            validation_message = f"Ticket valide mais {len(tickets_before)} personnes avant"
    
    return {
        "success": True,
        "validation_status": validation_status,
        "validation_message": validation_message,
        "can_proceed": can_proceed,
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "user_name": ticket.user_name,
            "user_phone": ticket.user_phone,
            "status": ticket.status,
            "position_in_queue": ticket.position_in_queue,
            "is_paid": ticket.is_paid,
            "payment_status": ticket.payment_status,
            "documents_validated": ticket.documents_validated,
            "validation_status": ticket.validation_status,
            "missing_documents": ticket.missing_documents,
            "is_blacklisted": ticket.is_blacklisted,
            "created_at": ticket.created_at.isoformat()
        },
        "service": {
            "id": service.id,
            "name": service.name,
            "category": service.category
        },
        "required_documents": config.required_documents if config else []
    }


# ========== VALIDATE DOCUMENTS ==========
@router.post("/validate-documents")
async def validate_documents(
    validation_data: DocumentValidation,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Valider les documents d'un usager
    """
    # Récupérer le ticket
    stmt = select(Ticket).where(Ticket.id == validation_data.ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Valider le statut de validation
    valid_statuses = ["valid", "invalid", "incomplete"]
    if validation_data.validation_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Statut de validation invalide. Valeurs acceptées: {valid_statuses}"
        )
    
    # Mettre à jour le ticket
    ticket.documents_validated = validation_data.documents_validated
    ticket.missing_documents = validation_data.missing_documents
    ticket.validation_status = validation_data.validation_status
    ticket.validated_at = datetime.utcnow().isoformat()
    ticket.validated_by = admin.id
    
    if validation_data.notes:
        ticket.notes = validation_data.notes
    
    ticket.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": f"Documents validés avec le statut: {validation_data.validation_status}",
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "documents_validated": ticket.documents_validated,
            "validation_status": ticket.validation_status,
            "missing_documents": ticket.missing_documents,
            "validated_at": ticket.validated_at
        }
    }


# ========== GET TICKET VALIDATION STATUS ==========
@router.get("/ticket/{ticket_id}/status")
async def get_ticket_validation_status(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer le statut de validation d'un ticket
    """
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Récupérer l'agent validateur si existe
    validator_name = None
    if ticket.validated_by:
        stmt = select(User).where(User.id == ticket.validated_by)
        result = await db.execute(stmt)
        validator = result.scalar_one_or_none()
        if validator:
            validator_name = validator.full_name
    
    return {
        "success": True,
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "documents_validated": ticket.documents_validated,
        "validation_status": ticket.validation_status,
        "missing_documents": ticket.missing_documents,
        "validated_at": ticket.validated_at,
        "validated_by": validator_name,
        "notes": ticket.notes
    }


# ========== MARK TICKET STATUS ==========
@router.patch("/ticket/{ticket_id}/mark")
async def mark_ticket_status(
    ticket_id: str,
    mark_data: TicketMarkStatus,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Marquer un ticket comme valide/invalide/incomplet
    """
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Valider le statut
    valid_statuses = ["valid", "invalid", "incomplete"]
    if mark_data.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}"
        )
    
    # Mettre à jour le ticket
    ticket.validation_status = mark_data.status
    
    if mark_data.status == "valid":
        ticket.documents_validated = True
        ticket.missing_documents = []
    elif mark_data.status == "invalid":
        ticket.documents_validated = False
    elif mark_data.status == "incomplete":
        ticket.documents_validated = False
    
    ticket.validated_at = datetime.utcnow().isoformat()
    ticket.validated_by = admin.id
    ticket.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(ticket)
    
    status_messages = {
        "valid": "✅ Ticket marqué comme valide",
        "invalid": "❌ Ticket marqué comme invalide",
        "incomplete": "⚠️ Ticket marqué comme incomplet"
    }
    
    return {
        "success": True,
        "message": status_messages[mark_data.status],
        "ticket": {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "validation_status": ticket.validation_status,
            "documents_validated": ticket.documents_validated
        }
    }


# ========== GET DOCUMENT CHECKLIST ==========
@router.get("/checklist/{service_id}")
async def get_document_checklist(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer la checklist des documents requis pour un service
    """
    stmt = select(ServiceConfig).where(ServiceConfig.service_id == service_id)
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()
    
    if not config:
        # Retourner une liste vide si pas de config
        return {
            "success": True,
            "service_id": service_id,
            "required_documents": []
        }
    
    return {
        "success": True,
        "service_id": service_id,
        "required_documents": config.required_documents
    }
