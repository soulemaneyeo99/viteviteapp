"""
ViteviteApp - Base Model
Classe de base pour tous les models SQLAlchemy
"""

from datetime import datetime
from typing import Any
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_mixin, declared_attr
import uuid


@declarative_mixin
class TimestampMixin:
    """Mixin pour ajouter created_at et updated_at à tous les models"""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


@declarative_mixin
class TableNameMixin:
    """Mixin pour générer automatiquement le nom de table"""
    
    @declared_attr
    def __tablename__(cls) -> str:
        """Génère le nom de table depuis le nom de classe (snake_case)"""
        import re
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', cls.__name__)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()


class BaseModel(TimestampMixin):
    """
    Classe de base pour tous les models
    Inclut timestamps automatiques
    """
    
    def to_dict(self) -> dict[str, Any]:
        """
        Convertit le model en dictionnaire
        Utile pour sérialisation rapide
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def update_from_dict(self, data: dict[str, Any]) -> None:
        """
        Met à jour le model depuis un dictionnaire
        Ignore les clés inexistantes
        """
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def __repr__(self) -> str:
        """Représentation lisible du model"""
        attrs = []
        for column in self.__table__.columns:
            if column.name != 'password_hash':  # Ne pas afficher les mots de passe
                value = getattr(self, column.name)
                attrs.append(f"{column.name}={value!r}")
        
        return f"{self.__class__.__name__}({', '.join(attrs)})"


def generate_uuid() -> str:
    """Génère un UUID v4 sous forme de string"""
    return str(uuid.uuid4())