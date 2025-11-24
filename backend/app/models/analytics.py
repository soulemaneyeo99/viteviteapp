"""
ViteviteApp - Analytics Model
Statistiques détaillées pour l'optimisation des services
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date

from app.core.database import Base
from app.models.base import BaseModel, generate_uuid


class Analytics(Base, BaseModel):
    """Model Analytics - Statistiques journalières par service"""
    
    __tablename__ = "analytics"
    
    # ========== PRIMARY KEY ==========
    id = Column(String, primary_key=True, default=generate_uuid)
    
    # ========== FOREIGN KEY ==========
    service_id = Column(String, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # ========== DATE ==========
    date = Column(Date, nullable=False, index=True)  # Date de la statistique
    
    # ========== TICKET STATISTICS ==========
    total_tickets = Column(Integer, default=0, nullable=False)
    completed_tickets = Column(Integer, default=0, nullable=False)
    cancelled_tickets = Column(Integer, default=0, nullable=False)
    no_show_tickets = Column(Integer, default=0, nullable=False)
    pending_tickets = Column(Integer, default=0, nullable=False)
    
    # ========== WAIT TIME STATISTICS ==========
    average_wait_time = Column(Float, default=0.0, nullable=False)  # En minutes
    min_wait_time = Column(Float, default=0.0, nullable=False)
    max_wait_time = Column(Float, default=0.0, nullable=False)
    median_wait_time = Column(Float, default=0.0, nullable=False)
    
    # ========== SERVICE TIME STATISTICS ==========
    average_service_time = Column(Float, default=0.0, nullable=False)  # En minutes
    min_service_time = Column(Float, default=0.0, nullable=False)
    max_service_time = Column(Float, default=0.0, nullable=False)
    
    # ========== PEAK HOURS (JSON) ==========
    # Format: [
    #   {"hour": "09:00", "tickets": 15},
    #   {"hour": "10:00", "tickets": 23},
    #   ...
    # ]
    peak_hours = Column(JSON, default=list, nullable=False)
    
    # ========== SATISFACTION ==========
    satisfaction_rate = Column(Float, default=0.0, nullable=False)  # 0-100%
    total_ratings = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)  # 0-5
    
    # ========== DOCUMENT VALIDATION ==========
    incomplete_documents_count = Column(Integer, default=0, nullable=False)
    rejected_documents_count = Column(Integer, default=0, nullable=False)
    validated_documents_count = Column(Integer, default=0, nullable=False)
    
    # ========== COUNTER STATISTICS ==========
    total_counters = Column(Integer, default=0, nullable=False)
    active_counters = Column(Integer, default=0, nullable=False)
    average_tickets_per_counter = Column(Float, default=0.0, nullable=False)
    
    # ========== EFFICIENCY METRICS ==========
    utilization_rate = Column(Float, default=0.0, nullable=False)  # Taux d'utilisation (0-100%)
    throughput = Column(Float, default=0.0, nullable=False)  # Tickets traités par heure
    queue_efficiency = Column(Float, default=0.0, nullable=False)  # Efficacité de la file (0-100%)
    
    # ========== REVENUE (for paid services) ==========
    total_revenue = Column(Float, default=0.0, nullable=False)  # En FCFA
    paid_tickets = Column(Integer, default=0, nullable=False)
    unpaid_tickets = Column(Integer, default=0, nullable=False)
    refunded_tickets = Column(Integer, default=0, nullable=False)
    
    # ========== HOURLY DISTRIBUTION (JSON) ==========
    # Format: {
    #   "08:00": {"tickets": 5, "avg_wait": 12.5},
    #   "09:00": {"tickets": 15, "avg_wait": 25.3},
    #   ...
    # }
    hourly_distribution = Column(JSON, default=dict, nullable=False)
    
    # ========== TRENDS (JSON) ==========
    # Format: {
    #   "trend": "increasing",  # increasing, decreasing, stable
    #   "change_percentage": 15.5,
    #   "comparison_period": "previous_week"
    # }
    trends = Column(JSON, default=dict, nullable=False)
    
    # ========== RECOMMENDATIONS (JSON) ==========
    # Format: [
    #   {
    #     "type": "add_counter",
    #     "priority": "high",
    #     "reason": "Temps d'attente élevé aux heures de pointe",
    #     "impact": "Réduction de 30% du temps d'attente"
    #   }
    # ]
    recommendations = Column(JSON, default=list, nullable=False)
    
    # ========== RELATIONSHIPS ==========
    service = relationship("Service", foreign_keys=[service_id])
    
    # ========== PROPERTIES ==========
    @property
    def completion_rate(self) -> float:
        """Calcule le taux de complétion"""
        if self.total_tickets == 0:
            return 0.0
        return (self.completed_tickets / self.total_tickets) * 100
    
    @property
    def cancellation_rate(self) -> float:
        """Calcule le taux d'annulation"""
        if self.total_tickets == 0:
            return 0.0
        return (self.cancelled_tickets / self.total_tickets) * 100
    
    @property
    def no_show_rate(self) -> float:
        """Calcule le taux d'absence"""
        if self.total_tickets == 0:
            return 0.0
        return (self.no_show_tickets / self.total_tickets) * 100
    
    @property
    def document_validation_rate(self) -> float:
        """Calcule le taux de validation des documents"""
        total_validations = (
            self.incomplete_documents_count +
            self.rejected_documents_count +
            self.validated_documents_count
        )
        if total_validations == 0:
            return 0.0
        return (self.validated_documents_count / total_validations) * 100
    
    @property
    def is_busy_day(self) -> bool:
        """Vérifie si c'est un jour chargé"""
        return self.total_tickets > 50 or self.average_wait_time > 30
    
    @property
    def peak_hour(self) -> str | None:
        """Retourne l'heure de pointe"""
        if not self.peak_hours:
            return None
        return max(self.peak_hours, key=lambda x: x.get("tickets", 0)).get("hour")
    
    def calculate_efficiency_score(self) -> float:
        """Calcule un score d'efficacité global (0-100)"""
        scores = [
            self.completion_rate * 0.3,  # 30% poids
            (100 - self.no_show_rate) * 0.2,  # 20% poids
            self.satisfaction_rate * 0.2,  # 20% poids
            self.utilization_rate * 0.15,  # 15% poids
            self.queue_efficiency * 0.15,  # 15% poids
        ]
        return sum(scores)
    
    @classmethod
    def create_daily_analytics(cls, service_id: str, date: date = None) -> "Analytics":
        """Crée une nouvelle entrée analytics pour un service"""
        if date is None:
            date = datetime.now().date()
        
        return cls(
            service_id=service_id,
            date=date
        )
    
    def __repr__(self) -> str:
        return f"Analytics(service_id={self.service_id!r}, date={self.date}, tickets={self.total_tickets})"
