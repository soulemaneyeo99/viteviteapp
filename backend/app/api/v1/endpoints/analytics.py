"""
ViteviteApp - Analytics Endpoints
API pour les statistiques et analytics détaillées
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.api.v1.deps import get_current_admin
from app.models.user import User
from app.models.analytics import Analytics
from app.models.service import Service
from app.models.ticket import Ticket, TicketStatus
from app.models.counter import Counter
from app.schemas.analytics import (
    AnalyticsResponse,
    AnalyticsSummary,
    DailyAnalytics,
    WeeklyAnalytics,
    MonthlyAnalytics,
    PerformanceMetrics
)

router = APIRouter()


# ========== GET DAILY ANALYTICS ==========
@router.get("/daily/{service_id}", response_model=AnalyticsResponse)
async def get_daily_analytics(
    service_id: str,
    date_str: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les analytics journalières d'un service
    """
    target_date = datetime.fromisoformat(date_str).date() if date_str else datetime.now().date()
    
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date == target_date
        )
    )
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        # Créer une entrée vide si elle n'existe pas
        analytics = Analytics.create_daily_analytics(service_id, target_date)
        db.add(analytics)
        await db.commit()
        await db.refresh(analytics)
    
    return analytics


# ========== GET WEEKLY ANALYTICS ==========
@router.get("/weekly/{service_id}", response_model=WeeklyAnalytics)
async def get_weekly_analytics(
    service_id: str,
    week_start: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les analytics hebdomadaires d'un service
    """
    if week_start:
        start_date = datetime.fromisoformat(week_start).date()
    else:
        # Début de la semaine actuelle (lundi)
        today = datetime.now().date()
        start_date = today - timedelta(days=today.weekday())
    
    end_date = start_date + timedelta(days=6)
    
    # Récupérer les analytics de la semaine
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date >= start_date,
            Analytics.date <= end_date
        )
    ).order_by(Analytics.date)
    result = await db.execute(stmt)
    weekly_analytics = result.scalars().all()
    
    # Calculer les totaux
    total_tickets = sum(a.total_tickets for a in weekly_analytics)
    avg_wait_time = sum(a.average_wait_time for a in weekly_analytics) / len(weekly_analytics) if weekly_analytics else 0
    
    # Trouver le jour le plus chargé
    busiest_day = max(weekly_analytics, key=lambda a: a.total_tickets).date.isoformat() if weekly_analytics else None
    
    # Créer la réponse
    daily_breakdown = [
        {
            "date": str(a.date),
            "total_tickets": a.total_tickets,
            "completed_tickets": a.completed_tickets,
            "average_wait_time": a.average_wait_time,
            "satisfaction_rate": a.satisfaction_rate,
            "peak_hours": a.peak_hours
        }
        for a in weekly_analytics
    ]
    
    return {
        "week_start": str(start_date),
        "week_end": str(end_date),
        "total_tickets": total_tickets,
        "daily_breakdown": daily_breakdown,
        "average_wait_time": avg_wait_time,
        "busiest_day": busiest_day,
        "recommendations": []
    }


# ========== GET MONTHLY ANALYTICS ==========
@router.get("/monthly/{service_id}", response_model=MonthlyAnalytics)
async def get_monthly_analytics(
    service_id: str,
    month: int = None,
    year: int = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les analytics mensuelles d'un service
    """
    if not month or not year:
        now = datetime.now()
        month = now.month
        year = now.year
    
    # Premier et dernier jour du mois
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    
    # Récupérer les analytics du mois
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date >= first_day,
            Analytics.date <= last_day
        )
    ).order_by(Analytics.date)
    result = await db.execute(stmt)
    monthly_analytics = result.scalars().all()
    
    # Calculer les totaux
    total_tickets = sum(a.total_tickets for a in monthly_analytics)
    avg_wait_time = sum(a.average_wait_time for a in monthly_analytics) / len(monthly_analytics) if monthly_analytics else 0
    
    # Regrouper par semaine
    weekly_breakdown = []
    # TODO: Implémenter le regroupement par semaine
    
    return {
        "month": f"{year}-{month:02d}",
        "year": year,
        "total_tickets": total_tickets,
        "weekly_breakdown": weekly_breakdown,
        "average_wait_time": avg_wait_time,
        "trends": {},
        "recommendations": []
    }


# ========== GET PERFORMANCE METRICS ==========
@router.get("/performance/{service_id}", response_model=PerformanceMetrics)
async def get_performance_metrics(
    service_id: str,
    date_str: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les métriques de performance d'un service
    """
    target_date = datetime.fromisoformat(date_str).date() if date_str else datetime.now().date()
    
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date == target_date
        )
    )
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics non trouvées pour cette date")
    
    return {
        "service_id": service_id,
        "completion_rate": analytics.completion_rate,
        "cancellation_rate": analytics.cancellation_rate,
        "no_show_rate": analytics.no_show_rate,
        "document_validation_rate": analytics.document_validation_rate,
        "utilization_rate": analytics.utilization_rate,
        "throughput": analytics.throughput,
        "queue_efficiency": analytics.queue_efficiency,
        "efficiency_score": analytics.calculate_efficiency_score()
    }


# ========== GET PEAK HOURS ==========
@router.get("/peak-hours/{service_id}")
async def get_peak_hours(
    service_id: str,
    date_str: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les heures de pointe d'un service
    """
    target_date = datetime.fromisoformat(date_str).date() if date_str else datetime.now().date()
    
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date == target_date
        )
    )
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        return {
            "success": True,
            "service_id": service_id,
            "date": str(target_date),
            "peak_hours": [],
            "peak_hour": None
        }
    
    return {
        "success": True,
        "service_id": service_id,
        "date": str(target_date),
        "peak_hours": analytics.peak_hours,
        "peak_hour": analytics.peak_hour,
        "hourly_distribution": analytics.hourly_distribution
    }


# ========== GET SATISFACTION RATE ==========
@router.get("/satisfaction/{service_id}")
async def get_satisfaction_rate(
    service_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer le taux de satisfaction d'un service sur une période
    """
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).date()
    else:
        start_date = datetime.fromisoformat(start_date).date()
    
    if not end_date:
        end_date = datetime.now().date()
    else:
        end_date = datetime.fromisoformat(end_date).date()
    
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date >= start_date,
            Analytics.date <= end_date
        )
    )
    result = await db.execute(stmt)
    analytics_list = result.scalars().all()
    
    if not analytics_list:
        return {
            "success": True,
            "service_id": service_id,
            "period": f"{start_date} to {end_date}",
            "average_satisfaction_rate": 0.0,
            "average_rating": 0.0,
            "total_ratings": 0
        }
    
    avg_satisfaction = sum(a.satisfaction_rate for a in analytics_list) / len(analytics_list)
    avg_rating = sum(a.average_rating for a in analytics_list) / len(analytics_list)
    total_ratings = sum(a.total_ratings for a in analytics_list)
    
    return {
        "success": True,
        "service_id": service_id,
        "period": f"{start_date} to {end_date}",
        "average_satisfaction_rate": avg_satisfaction,
        "average_rating": avg_rating,
        "total_ratings": total_ratings
    }


# ========== GET RECOMMENDATIONS ==========
@router.get("/recommendations/{service_id}")
async def get_recommendations(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Récupérer les recommandations d'optimisation pour un service
    """
    # Récupérer les analytics récentes
    today = datetime.now().date()
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date == today
        )
    )
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    
    recommendations = []
    
    if analytics:
        # Recommandation basée sur le temps d'attente
        if analytics.average_wait_time > 45:
            recommendations.append({
                "type": "add_counter",
                "priority": "high",
                "reason": f"Temps d'attente élevé ({analytics.average_wait_time:.0f} minutes)",
                "impact": "Réduction estimée de 30% du temps d'attente"
            })
        
        # Recommandation basée sur le taux d'absence
        if analytics.no_show_rate > 20:
            recommendations.append({
                "type": "enable_penalties",
                "priority": "medium",
                "reason": f"Taux d'absence élevé ({analytics.no_show_rate:.1f}%)",
                "impact": "Réduction estimée de 50% des absences"
            })
        
        # Recommandation basée sur les documents incomplets
        if analytics.incomplete_documents_count > 10:
            recommendations.append({
                "type": "improve_communication",
                "priority": "medium",
                "reason": f"{analytics.incomplete_documents_count} dossiers incomplets aujourd'hui",
                "impact": "Réduction du temps de traitement et des retours"
            })
        
        # Recommandation basée sur l'efficacité
        efficiency = analytics.calculate_efficiency_score()
        if efficiency < 60:
            recommendations.append({
                "type": "optimize_process",
                "priority": "high",
                "reason": f"Score d'efficacité faible ({efficiency:.1f}/100)",
                "impact": "Amélioration globale de la qualité de service"
            })
    
    return {
        "success": True,
        "service_id": service_id,
        "recommendations": recommendations,
        "total_recommendations": len(recommendations)
    }


# ========== UPDATE ANALYTICS ==========
@router.post("/update/{service_id}")
async def update_analytics(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Mettre à jour les analytics d'un service pour aujourd'hui
    (Calculer automatiquement à partir des tickets et guichets)
    """
    today = datetime.now().date()
    
    # Récupérer ou créer l'entrée analytics
    stmt = select(Analytics).where(
        and_(
            Analytics.service_id == service_id,
            Analytics.date == today
        )
    )
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        analytics = Analytics.create_daily_analytics(service_id, today)
        db.add(analytics)
    
    # Compter les tickets
    stmt = select(Ticket).where(
        and_(
            Ticket.service_id == service_id,
            func.date(Ticket.created_at) == today
        )
    )
    result = await db.execute(stmt)
    all_tickets = result.scalars().all()
    
    analytics.total_tickets = len(all_tickets)
    analytics.completed_tickets = len([t for t in all_tickets if t.status == TicketStatus.COMPLETED])
    analytics.cancelled_tickets = len([t for t in all_tickets if t.status == TicketStatus.CANCELLED])
    analytics.no_show_tickets = len([t for t in all_tickets if t.status == TicketStatus.NO_SHOW])
    analytics.pending_tickets = len([t for t in all_tickets if t.status == TicketStatus.WAITING])
    
    # Calculer les temps d'attente
    wait_times = [t.actual_wait_time for t in all_tickets if t.actual_wait_time]
    if wait_times:
        analytics.average_wait_time = sum(wait_times) / len(wait_times)
        analytics.min_wait_time = min(wait_times)
        analytics.max_wait_time = max(wait_times)
        analytics.median_wait_time = sorted(wait_times)[len(wait_times) // 2]
    
    # Compter les guichets
    stmt = select(Counter).where(Counter.service_id == service_id)
    result = await db.execute(stmt)
    counters = result.scalars().all()
    
    analytics.total_counters = len(counters)
    analytics.active_counters = len([c for c in counters if c.is_open])
    
    if counters:
        analytics.average_tickets_per_counter = analytics.total_tickets / len(counters)
    
    analytics.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(analytics)
    
    return {
        "success": True,
        "message": "Analytics mis à jour",
        "analytics": {
            "total_tickets": analytics.total_tickets,
            "completed_tickets": analytics.completed_tickets,
            "average_wait_time": analytics.average_wait_time,
            "efficiency_score": analytics.calculate_efficiency_score()
        }
    }
