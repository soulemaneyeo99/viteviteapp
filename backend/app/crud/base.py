"""
ViteviteApp - Base CRUD
Classe de base pour toutes les opérations CRUD avec SQLAlchemy async
"""

from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from pydantic import BaseModel
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Classe CRUD générique avec méthodes standard
    
    Usage:
        user_crud = CRUDBase(User)
        users = await user_crud.get_multi(db)
    """
    
    def __init__(self, model: Type[ModelType]):
        """
        Args:
            model: Model SQLAlchemy
        """
        self.model = model
    
    # ========== READ ==========
    async def get(self, db: AsyncSession, id: str) -> Optional[ModelType]:
        """
        Récupère un objet par ID
        
        Args:
            db: Session database
            id: ID de l'objet
        
        Returns:
            Objet trouvé ou None
        """
        result = await db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """
        Récupère plusieurs objets avec pagination
        
        Args:
            db: Session database
            skip: Nombre d'éléments à skip
            limit: Nombre maximum d'éléments
            filters: Filtres optionnels (dict)
        
        Returns:
            Liste d'objets
        """
        query = select(self.model)
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())
    
    async def count(
        self,
        db: AsyncSession,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Compte le nombre total d'objets
        
        Args:
            db: Session database
            filters: Filtres optionnels
        
        Returns:
            Nombre total
        """
        query = select(func.count()).select_from(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        result = await db.execute(query)
        return result.scalar_one()
    
    # ========== CREATE ==========
    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: CreateSchemaType
    ) -> ModelType:
        """
        Crée un nouvel objet
        
        Args:
            db: Session database
            obj_in: Schema Pydantic de création
        
        Returns:
            Objet créé
        """
        obj_data = obj_in.model_dump()
        db_obj = self.model(**obj_data)
        
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        
        return db_obj
    
    # ========== UPDATE ==========
    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType | Dict[str, Any]
    ) -> ModelType:
        """
        Met à jour un objet existant
        
        Args:
            db: Session database
            db_obj: Objet existant depuis DB
            obj_in: Schema Pydantic ou dict de mise à jour
        
        Returns:
            Objet mis à jour
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def update_by_id(
        self,
        db: AsyncSession,
        *,
        id: str,
        obj_in: UpdateSchemaType | Dict[str, Any]
    ) -> Optional[ModelType]:
        """
        Met à jour un objet par ID
        
        Args:
            db: Session database
            id: ID de l'objet
            obj_in: Données de mise à jour
        
        Returns:
            Objet mis à jour ou None
        """
        db_obj = await self.get(db, id=id)
        if not db_obj:
            return None
        
        return await self.update(db, db_obj=db_obj, obj_in=obj_in)
    
    # ========== DELETE ==========
    async def remove(self, db: AsyncSession, *, id: str) -> Optional[ModelType]:
        """
        Supprime un objet par ID
        
        Args:
            db: Session database
            id: ID de l'objet
        
        Returns:
            Objet supprimé ou None
        """
        db_obj = await self.get(db, id=id)
        if not db_obj:
            return None
        
        await db.delete(db_obj)
        await db.flush()
        
        return db_obj
    
    async def remove_multi(
        self,
        db: AsyncSession,
        *,
        ids: List[str]
    ) -> int:
        """
        Supprime plusieurs objets par IDs
        
        Args:
            db: Session database
            ids: Liste d'IDs
        
        Returns:
            Nombre d'objets supprimés
        """
        result = await db.execute(
            delete(self.model).where(self.model.id.in_(ids))
        )
        await db.flush()
        
        return result.rowcount
    
    # ========== EXISTS ==========
    async def exists(self, db: AsyncSession, *, id: str) -> bool:
        """
        Vérifie si un objet existe
        
        Args:
            db: Session database
            id: ID de l'objet
        
        Returns:
            True si existe
        """
        result = await db.execute(
            select(func.count()).select_from(self.model).where(self.model.id == id)
        )
        return result.scalar_one() > 0