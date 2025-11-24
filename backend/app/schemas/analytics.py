"""
ViteviteApp - Analytics Schemas
Schémas Pydantic pour les analytics
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date


# ========== SUB-SCHEMAS ==========
class PeakHour(BaseModel):
    """Heure de pointe"""
    hour: str = Field(..., description="Heure au format HH:MM")
    tickets: int = Field(..., description="Nombre de tickets à cette heure")


class HourlyData(BaseModel):
    """Données horaires"""
    tickets: int
    avg_wait: float


class Trend(BaseModel):
    """Tendance"""
    trend: str = Field(..., description="increasing, decreasing, stable")
    change_percentage: float
    comparison_period: str


class Recommendation(BaseModel):
    """Recommandation d'optimisation"""
    type: str = Field(..., description="Type de recommandation")
    priority: str = Field(..., description="high, medium, low")
    reason: str
    impact: str


# ========== CREATE SCHEMAS ==========
class AnalyticsCreate(BaseModel):
    """Schéma pour créer une entrée analytics"""
    service_id: str
    date: date


# ========== UPDATE SCHEMAS ==========
class AnalyticsUpdate(BaseModel):
    """Schéma pour mettre à jour une entrée analytics"""
    total_tickets: Optional[int] = None
    completed_tickets: Optional[int] = None
    cancelled_tickets: Optional[int] = None
    no_show_tickets: Optional[int] = None
    pending_tickets: Optional[int] = None
    average_wait_time: Optional[float] = None
    min_wait_time: Optional[float] = None
    max_wait_time: Optional[float] = None
    median_wait_time: Optional[float] = None
    average_service_time: Optional[float] = None
    min_service_time: Optional[float] = None
    max_service_time: Optional[float] = None
    peak_hours: Optional[List[Dict]] = None
    satisfaction_rate: Optional[float] = None
    total_ratings: Optional[int] = None
    average_rating: Optional[float] = None
    incomplete_documents_count: Optional[int] = None
    rejected_documents_count: Optional[int] = None
    validated_documents_count: Optional[int] = None
    total_counters: Optional[int] = None
    active_counters: Optional[int] = None
    average_tickets_per_counter: Optional[float] = None
    utilization_rate: Optional[float] = None
    throughput: Optional[float] = None
    queue_efficiency: Optional[float] = None
    total_revenue: Optional[float] = None
    paid_tickets: Optional[int] = None
    unpaid_tickets: Optional[int] = None
    refunded_tickets: Optional[int] = None
    hourly_distribution: Optional[Dict[str, dict]] = None
    trends: Optional[Dict] = None
    recommendations: Optional[List[Dict]] = None


# ========== RESPONSE SCHEMAS ==========
class AnalyticsResponse(BaseModel):
    """Schéma de réponse pour une entrée analytics"""
    id: str
    service_id: str
    date: str
    total_tickets: int
    completed_tickets: int
    cancelled_tickets: int
    no_show_tickets: int
    pending_tickets: int
    average_wait_time: float
    min_wait_time: float
    max_wait_time: float
    median_wait_time: float
    average_service_time: float
    min_service_time: float
    max_service_time: float
    peak_hours: List[dict]
    satisfaction_rate: float
    total_ratings: int
    average_rating: float
    incomplete_documents_count: int
    rejected_documents_count: int
    validated_documents_count: int
    total_counters: int
    active_counters: int
    average_tickets_per_counter: float
    utilization_rate: float
    throughput: float
    queue_efficiency: float
    total_revenue: float
    paid_tickets: int
    unpaid_tickets: int
    refunded_tickets: int
    hourly_distribution: Dict[str, dict]
    trends: Dict
    recommendations: List[dict]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    """Résumé analytics pour un service"""
    service_id: str
    service_name: str
    period: str = Field(..., description="daily, weekly, monthly")
    total_tickets: int
    completed_tickets: int
    completion_rate: float
    average_wait_time: float
    satisfaction_rate: float
    peak_hour: Optional[str]
    efficiency_score: float = Field(..., description="Score d'efficacité 0-100")
    recommendations: List[Recommendation]


class DailyAnalytics(BaseModel):
    """Analytics journalières"""
    date: str
    total_tickets: int
    completed_tickets: int
    average_wait_time: float
    satisfaction_rate: float
    peak_hours: List[PeakHour]


class WeeklyAnalytics(BaseModel):
    """Analytics hebdomadaires"""
    week_start: str
    week_end: str
    total_tickets: int
    daily_breakdown: List[DailyAnalytics]
    average_wait_time: float
    busiest_day: str
    recommendations: List[Recommendation]


class MonthlyAnalytics(BaseModel):
    """Analytics mensuelles"""
    month: str
    year: int
    total_tickets: int
    weekly_breakdown: List[Dict]
    average_wait_time: float
    trends: Trend
    recommendations: List[Recommendation]


class PerformanceMetrics(BaseModel):
    """Métriques de performance"""
    service_id: str
    completion_rate: float
    cancellation_rate: float
    no_show_rate: float
    document_validation_rate: float
    utilization_rate: float
    throughput: float
    queue_efficiency: float
    efficiency_score: float
