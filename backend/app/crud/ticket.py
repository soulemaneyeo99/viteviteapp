"""
ViteviteApp - Ticket CRUD
Opérations CRUD spécifiques aux tickets
"""

from typing import Optional, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date

from app.crud.base import CRUDBase
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import TicketCreate, TicketUpdate


class CRUDTicket(CRUDBase[Ticket, TicketCreate, TicketUpdate]):
    """CRUD operations pour Ticket"""
    
    async def create_with_service(
        self,
        db: AsyncSession,
        *,
        obj_in: TicketCreate,
        user_id: Optional[str] = None,
        service
    ) -> Ticket:
        """
        Crée un ticket pour un service
        
        Args:
            db: Session database
            obj_in: Données du ticket
            user_id: ID utilisateur (optionnel)
            service: Service associé
        
        Returns:
            Ticket créé
        """
        # Génère le numéro de ticket
        ticket_count = await self.count_for_service(db, service_id=service.id)
        ticket_number = f"N-{ticket_count + 1:03d}"
        
        # Calcule la position dans la file
        active_count = await self.count_active_for_service(db, service_id=service.id)
        position = active_count + 1
        
        # Crée le ticket
        db_obj = Ticket(
            service_id=service.id,
            user_id=user_id,
            ticket_number=ticket_number,
            position_in_queue=position,
            user_name=obj_in.user_name,
            user_phone=obj_in.user_phone,
            notes=obj_in.notes,
            status=TicketStatus.WAITING,
            estimated_wait_time=service.estimated_wait_time
        )
        
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def get_by_service(
        self,
        db: AsyncSession,
        *,
        service_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Ticket]:
        """
        Récupère les tickets d'un service
        
        Args:
            db: Session database
            service_id: ID du service
            skip: Offset
            limit: Limite
        
        Returns:
            Liste de tickets
        """
        result = await db.execute(
            select(Ticket)
            .where(Ticket.service_id == service_id)
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_active_by_service(
        self,
        db: AsyncSession,
        *,
        service_id: str
    ) -> List[Ticket]:
        """
        Récupère les tickets actifs d'un service
        
        Args:
            db: Session database
            service_id: ID du service
        
        Returns:
            Liste de tickets actifs
        """
        result = await db.execute(
            select(Ticket)
            .where(
                and_(
                    Ticket.service_id == service_id,
                    Ticket.status.in_([
                        TicketStatus.WAITING,
                        TicketStatus.CALLED,
                        TicketStatus.SERVING
                    ])
                )
            )
            .order_by(Ticket.position_in_queue)
        )
        return list(result.scalars().all())
    
    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Ticket]:
        """
        Récupère les tickets d'un utilisateur
        
        Args:
            db: Session database
            user_id: ID de l'utilisateur
            skip: Offset
            limit: Limite
        
        Returns:
            Liste de tickets
        """
        result = await db.execute(
            select(Ticket)
            .where(Ticket.user_id == user_id)
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_next_waiting(
        self,
        db: AsyncSession,
        *,
        service_id: str
    ) -> Optional[Ticket]:
        """
        Récupère le prochain ticket en attente
        
        Args:
            db: Session database
            service_id: ID du service
        
        Returns:
            Prochain ticket ou None
        """
        result = await db.execute(
            select(Ticket)
            .where(
                and_(
                    Ticket.service_id == service_id,
                    Ticket.status == TicketStatus.WAITING
                )
            )
            .order_by(Ticket.position_in_queue)
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def count_for_service(
        self,
        db: AsyncSession,
        *,
        service_id: str
    ) -> int:
        """
        Compte tous les tickets d'un service
        
        Args:
            db: Session database
            service_id: ID du service
        
        Returns:
            Nombre total de tickets
        """
        result = await db.execute(
            select(func.count())
            .select_from(Ticket)
            .where(Ticket.service_id == service_id)
        )
        return result.scalar_one()
    
    async def count_active_for_service(
        self,
        db: AsyncSession,
        *,
        service_id: str
    ) -> int:
        """
        Compte les tickets actifs d'un service
        
        Args:
            db: Session database
            service_id: ID du service
        
        Returns:
            Nombre de tickets actifs
        """
        result = await db.execute(
            select(func.count())
            .select_from(Ticket)
            .where(
                and_(
                    Ticket.service_id == service_id,
                    Ticket.status.in_([
                        TicketStatus.WAITING,
                        TicketStatus.CALLED,
                        TicketStatus.SERVING
                    ])
                )
            )
        )
        return result.scalar_one()
    
    async def count_today(self, db: AsyncSession) -> int:
        """
        Compte les tickets créés aujourd'hui
        
        Args:
            db: Session database
        
        Returns:
            Nombre de tickets aujourd'hui
        """
        today = date.today()
        result = await db.execute(
            select(func.count())
            .select_from(Ticket)
            .where(func.date(Ticket.created_at) == today)
        )
        return result.scalar_one()
    
    async def count_completed_today(self, db: AsyncSession) -> int:
        """
        Compte les tickets complétés aujourd'hui
        
        Args:
            db: Session database
        
        Returns:
            Nombre de tickets complétés
        """
        today = date.today()
        result = await db.execute(
            select(func.count())
            .select_from(Ticket)
            .where(
                and_(
                    func.date(Ticket.created_at) == today,
                    Ticket.status == TicketStatus.COMPLETED
                )
            )
        )
        return result.scalar_one()
    
    async def get_average_wait_time(self, db: AsyncSession) -> float:
        """
        Calcule le temps d'attente moyen des tickets complétés aujourd'hui
        
        Args:
            db: Session database
        
        Returns:
            Temps d'attente moyen en minutes
        """
        today = date.today()
        result = await db.execute(
            select(Ticket)
            .where(
                and_(
                    func.date(Ticket.created_at) == today,
                    Ticket.status == TicketStatus.COMPLETED,
                    Ticket.called_at.isnot(None)
                )
            )
        )
        tickets = list(result.scalars().all())
        
        if not tickets:
            return 0.0
        
        wait_times = []
        for ticket in tickets:
            try:
                created = datetime.fromisoformat(str(ticket.created_at).replace('Z', '+00:00'))
                called = datetime.fromisoformat(ticket.called_at.replace('Z', '+00:00'))
                wait_time = (called - created).total_seconds() / 60
                wait_times.append(wait_time)
            except:
                continue
        
        return sum(wait_times) / len(wait_times) if wait_times else 0.0


# ========== INSTANCE GLOBALE ==========
ticket_crud = CRUDTicket(Ticket)