"""
ViteviteApp - Administration Model
Gestion des administrations (mairies, préfectures, etc.)
"""

from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class Administration(Base, BaseModel):
    """Model Administration - Regroupement de services administratifs"""
    
    __tablename__ = "administrations"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== BASIC INFO ==========
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(100), nullable=False, index=True)  # mairie, prefecture, hospital, etc.
    description = Column(String(1000), nullable=True)
    
    # ========== IMAGES ==========
    # URL de l'image principale
    main_image_url = Column(String(500), nullable=True)
    # Format: ["url1", "url2", "url3"]
    image_gallery = Column(JSON, default=list, nullable=False)
    
    # ========== LOCATION ==========
    # Format: {"lat": 5.3599, "lng": -4.0083, "address": "Cocody, Abidjan", "city": "Abidjan"}
    location = Column(JSON, nullable=True)
    
    # ========== CONTACT ==========
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    # ========== OPERATING INFO ==========
    # Format: {"monday": "08:00-17:00", "tuesday": "08:00-17:00", ...}
    operating_hours = Column(JSON, nullable=True)
    
    # Est actuellement ouvert
    is_open = Column(Boolean, default=False, nullable=False)
    
    # ========== SERVICES ==========
    # IDs des services associés (relation many-to-many via service_id)
    # Format: ["service_id_1", "service_id_2", ...]
    service_ids = Column(JSON, default=list, nullable=False)
    
    # ========== AGGREGATED STATS ==========
    # Statistiques agrégées de tous les services
    total_queue_size = Column(Integer, default=0, nullable=False)
    average_wait_time = Column(Integer, default=0, nullable=False)  # En minutes
    total_active_counters = Column(Integer, default=0, nullable=False)
    
    # ========== METADATA ==========
    # Format: {"parking": true, "wheelchair_access": true, "wifi": false}
    facilities = Column(JSON, default=dict, nullable=False)
    
    # Note moyenne (0-5)
    rating = Column(Integer, default=0, nullable=True)
    total_ratings = Column(Integer, default=0, nullable=False)
    
    # ========== PROPERTIES ==========
    @property
    def has_queue(self) -> bool:
        """Vérifie s'il y a une file d'attente"""
        return self.total_queue_size > 0
    
    @property
    def is_busy(self) -> bool:
        """Vérifie si l'administration est très occupée"""
        return self.total_queue_size > 50 or self.average_wait_time > 60
    
    def __repr__(self) -> str:
        return f"Administration(id={self.id!r}, name={self.name!r}, type={self.type})"
