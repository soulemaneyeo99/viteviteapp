"""
ViteviteApp - ServiceConfig Model
Configuration détaillée des services (horaires, tarifs, documents requis)
"""

from sqlalchemy import Column, String, Integer, Boolean, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class ServiceConfig(Base, BaseModel):
    """Model ServiceConfig - Configuration détaillée d'un service"""
    
    __tablename__ = "service_configs"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== FOREIGN KEY ==========
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # ========== PROCESSING TIME ==========
    average_processing_time = Column(Integer, default=10, nullable=False)  # En minutes
    min_processing_time = Column(Integer, default=5, nullable=False)
    max_processing_time = Column(Integer, default=30, nullable=False)
    
    # ========== DOCUMENTS REQUIRED (JSON) ==========
    # Format: [
    #   {
    #     "id": "doc_1",
    #     "name": "Pièce d'identité",
    #     "required": true,
    #     "description": "CNI, passeport ou attestation",
    #     "examples": ["CNI", "Passeport"]
    #   }
    # ]
    required_documents = Column(JSON, default=list, nullable=False)
    
    # ========== OPENING HOURS (JSON) ==========
    # Format: {
    #   "lundi": {"open": "08:00", "close": "17:00", "is_open": true},
    #   "mardi": {"open": "08:00", "close": "17:00", "is_open": true},
    #   ...
    # }
    opening_hours = Column(JSON, default=dict, nullable=False)
    
    # ========== PRICING ==========
    is_paid_service = Column(Boolean, default=False, nullable=False)
    price = Column(Float, default=0.0, nullable=False)  # En FCFA
    currency = Column(String(10), default="FCFA", nullable=False)
    
    # ========== PAYMENT METHODS (JSON) ==========
    # Format: ["cash", "mobile_money", "card", "bank_transfer"]
    payment_methods = Column(JSON, default=list, nullable=False)
    
    # ========== QUEUE SETTINGS ==========
    max_queue_size = Column(Integer, default=100, nullable=False)
    allow_virtual_tickets = Column(Boolean, default=True, nullable=False)
    allow_walk_in = Column(Boolean, default=True, nullable=False)  # Accepter les personnes sans ticket
    require_appointment = Column(Boolean, default=False, nullable=False)
    
    # ========== NOTIFICATION SETTINGS ==========
    notify_before_minutes = Column(Integer, default=15, nullable=False)  # Notifier X minutes avant
    send_sms_notifications = Column(Boolean, default=True, nullable=False)
    send_email_notifications = Column(Boolean, default=False, nullable=False)
    send_push_notifications = Column(Boolean, default=True, nullable=False)
    
    # ========== ANTI-ABUSE SETTINGS ==========
    enable_no_show_penalty = Column(Boolean, default=False, nullable=False)
    max_no_shows_allowed = Column(Integer, default=3, nullable=False)
    blacklist_duration_hours = Column(Integer, default=24, nullable=False)
    auto_cancel_after_minutes = Column(Integer, default=5, nullable=False)  # Annuler si absent après X min
    
    # ========== BOOKING SETTINGS ==========
    max_advance_booking_days = Column(Integer, default=7, nullable=False)  # Réserver jusqu'à X jours à l'avance
    min_advance_booking_hours = Column(Integer, default=1, nullable=False)  # Minimum X heures à l'avance
    allow_same_day_booking = Column(Boolean, default=True, nullable=False)
    
    # ========== CAPACITY ==========
    max_tickets_per_day = Column(Integer, nullable=True)  # Limite journalière
    max_tickets_per_hour = Column(Integer, nullable=True)  # Limite horaire
    
    # ========== SPECIAL SETTINGS (JSON) ==========
    # Format: {
    #   "priority_lanes": ["femme_enceinte", "handicapé", "senior"],
    #   "languages": ["fr", "en"],
    #   "special_instructions": "Apporter 2 photos d'identité"
    # }
    special_settings = Column(JSON, default=dict, nullable=False)
    
    # ========== RELATIONSHIPS ==========
    service = relationship("Service", back_populates="config")
    
    # ========== PROPERTIES ==========
    @property
    def is_open_today(self) -> bool:
        """Vérifie si le service est ouvert aujourd'hui"""
        from datetime import datetime
        day_names = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        today = day_names[datetime.now().weekday()]
        
        if today in self.opening_hours:
            return self.opening_hours[today].get("is_open", False)
        return False
    
    @property
    def requires_payment(self) -> bool:
        """Vérifie si le service nécessite un paiement"""
        return self.is_paid_service and self.price > 0
    
    @property
    def has_anti_abuse(self) -> bool:
        """Vérifie si le système anti-abus est activé"""
        return self.enable_no_show_penalty and self.is_paid_service
    
    def get_opening_hours_today(self) -> dict | None:
        """Récupère les horaires d'aujourd'hui"""
        from datetime import datetime
        day_names = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        today = day_names[datetime.now().weekday()]
        return self.opening_hours.get(today)
    
    def is_within_opening_hours(self) -> bool:
        """Vérifie si on est dans les horaires d'ouverture"""
        from datetime import datetime
        
        hours = self.get_opening_hours_today()
        if not hours or not hours.get("is_open"):
            return False
        
        now = datetime.now().time()
        open_time = datetime.strptime(hours["open"], "%H:%M").time()
        close_time = datetime.strptime(hours["close"], "%H:%M").time()
        
        return open_time <= now <= close_time
    
    def __repr__(self) -> str:
        return f"ServiceConfig(service_id={self.service_id!r}, is_paid={self.is_paid_service})"
