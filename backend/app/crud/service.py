"""
ViteviteApp - Service CRUD
Opérations CRUD spécifiques aux services
"""

from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.service import Service, ServiceStatus, AffluenceLevel
from app.schemas.service import ServiceCreate, ServiceUpdate


class CRUDService(CRUDBase[Service, ServiceCreate, ServiceUpdate]):
    """CRUD operations pour Service"""
    
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Service]:
        """
        Récupère un service par slug
        
        Args:
            db: Session database
            slug: Slug du service
        
        Returns:
            Service ou None
        """
        result = await db.execute(
            select(Service).where(Service.slug == slug)
        )
        return result.scalar_one_or_none()
    
    async def get_by_category(
        self,
        db: AsyncSession,
        *,
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Récupère les services d'une catégorie
        
        Args:
            db: Session database
            category: Catégorie
            skip: Offset
            limit: Limite
        
        Returns:
            Liste de services
        """
        result = await db.execute(
            select(Service)
            .where(Service.category == category)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_open_services(self, db: AsyncSession) -> List[Service]:
        """
        Récupère tous les services ouverts
        
        Args:
            db: Session database
        
        Returns:
            Liste de services ouverts
        """
        result = await db.execute(
            select(Service).where(Service.status == ServiceStatus.OPEN)
        )
        return list(result.scalars().all())
    
    async def increment_queue(
        self,
        db: AsyncSession,
        *,
        service: Service
    ) -> Service:
        """
        Incrémente la file d'attente d'un service
        
        Args:
            db: Session database
            service: Service
        
        Returns:
            Service mis à jour
        """
        service.current_queue_size += 1
        
        # Mise à jour automatique du niveau d'affluence
        if service.max_queue_size:
            fill_rate = service.current_queue_size / service.max_queue_size
            
            if fill_rate >= 0.8:
                service.affluence_level = AffluenceLevel.VERY_HIGH
            elif fill_rate >= 0.6:
                service.affluence_level = AffluenceLevel.HIGH
            elif fill_rate >= 0.3:
                service.affluence_level = AffluenceLevel.MODERATE
            else:
                service.affluence_level = AffluenceLevel.LOW
        
        db.add(service)
        await db.flush()
        await db.refresh(service)
        
        return service
    
    async def decrement_queue(
        self,
        db: AsyncSession,
        *,
        service: Service
    ) -> Service:
        """
        Décrémente la file d'attente d'un service
        
        Args:
            db: Session database
            service: Service
        
        Returns:
            Service mis à jour
        """
        if service.current_queue_size > 0:
            service.current_queue_size -= 1
        
        # Mise à jour automatique du niveau d'affluence
        if service.max_queue_size:
            fill_rate = service.current_queue_size / service.max_queue_size
            
            if fill_rate >= 0.8:
                service.affluence_level = AffluenceLevel.VERY_HIGH
            elif fill_rate >= 0.6:
                service.affluence_level = AffluenceLevel.HIGH
            elif fill_rate >= 0.3:
                service.affluence_level = AffluenceLevel.MODERATE
            else:
                service.affluence_level = AffluenceLevel.LOW
        
        db.add(service)
        await db.flush()
        await db.refresh(service)
        
        return service
    
    async def update_estimated_wait_time(
        self,
        db: AsyncSession,
        *,
        service: Service
    ) -> Service:
        """
        Calcule et met à jour le temps d'attente estimé
        
        Args:
            db: Session database
            service: Service
        
        Returns:
            Service mis à jour
        """
        # Calcul simple: queue_size * average_service_time
        service.estimated_wait_time = (
            service.current_queue_size * service.average_service_time
        )
        
        db.add(service)
        await db.flush()
        await db.refresh(service)
        
        return service
    
    async def increment_tickets_served(
        self,
        db: AsyncSession,
        *,
        service: Service
    ) -> Service:
        """
        Incrémente le compteur de tickets servis
        
        Args:
            db: Session database
            service: Service
        
        Returns:
            Service mis à jour
        """
        service.total_tickets_served += 1
        
        db.add(service)
        await db.flush()
        await db.refresh(service)
        
        return service
    
    async def get_busiest_service(self, db: AsyncSession) -> Optional[Service]:
        """
        Récupère le service le plus occupé
        
        Args:
            db: Session database
        
        Returns:
            Service le plus occupé ou None
        """
        result = await db.execute(
            select(Service)
            .where(Service.status == ServiceStatus.OPEN)
            .order_by(Service.current_queue_size.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def count_open_services(self, db: AsyncSession) -> int:
        """
        Compte le nombre de services ouverts
        
        Args:
            db: Session database
        
        Returns:
            Nombre de services ouverts
        """
        result = await db.execute(
            select(func.count())
            .select_from(Service)
            .where(Service.status == ServiceStatus.OPEN)
        )
        return result.scalar_one()


# ========== INSTANCE GLOBALE ==========
service_crud = CRUDService(Service)