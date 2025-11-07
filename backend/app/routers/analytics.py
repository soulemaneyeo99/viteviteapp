"""
Fichier: backend/app/routers/analytics.py
Router pour les analytics et insights IA
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
from app.database import db
from app.ai.gemini_service import gemini_service
from typing import List, Dict
import random

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/insights")
async def get_ai_insights():
    """Récupère les insights IA en temps réel"""
    services = db.get_all_services()
    tickets = db.get_all_tickets()
    
    insights = []
    
    # Analyse de chaque service
    for service in services:
        active_tickets = [t for t in tickets if t["service_id"] == service["id"] and t["status"] in ["en_attente", "appelé"]]
        
        if len(active_tickets) > 10:
            insights.append({
                "id": f"insight_{service['id']}_1",
                "type": "warning",
                "icon": "⚠️",
                "title": f"Forte affluence détectée",
                "message": f"{service['name']}: {len(active_tickets)} personnes en attente",
                "confidence": 95,
                "action": f"Recommander aux utilisateurs de venir après {get_best_time()}",
                "priority": "high",
                "service_id": service["id"]
            })
    
    # Insight sur les optimisations possibles
    busiest_service = max(services, key=lambda s: s["current_queue_size"], default=None)
    if busiest_service and busiest_service["current_queue_size"] > 5:
        potential_reduction = int(busiest_service["estimated_wait_time"] * 0.23)
        insights.append({
            "id": f"insight_optimization_1",
            "type": "optimization",
            "icon": "⚡",
            "title": "Optimisation détectée",
            "message": f"{busiest_service['name']} pourrait réduire le temps d'attente de {potential_reduction} min avec un guichet supplémentaire",
            "confidence": 87,
            "action": "Contacter le partenaire",
            "priority": "medium",
            "service_id": busiest_service["id"]
        })
    
    # Tendance générale
    today_tickets = [t for t in tickets if datetime.fromisoformat(t["created_at"]).date() == datetime.now().date()]
    insights.append({
        "id": "insight_trend_1",
        "type": "trend",
        "icon": "📈",
        "title": "Tendance du jour",
        "message": f"{len(today_tickets)} tickets créés aujourd'hui",
        "confidence": 92,
        "action": "Surveiller l'évolution",
        "priority": "low"
    })
    
    return {"insights": insights, "count": len(insights)}

@router.get("/performance")
async def get_performance_metrics():
    """Métriques de performance globales"""
    tickets = db.get_all_tickets()
    services = db.get_all_services()
    
    today = datetime.now().date()
    today_tickets = [t for t in tickets if datetime.fromisoformat(t["created_at"]).date() == today]
    completed_tickets = [t for t in today_tickets if t["status"] == "terminé"]
    
    # Calcul du temps d'attente moyen
    avg_wait_times = []
    for ticket in completed_tickets:
        if ticket.get("called_at"):
            created = datetime.fromisoformat(ticket["created_at"])
            called = datetime.fromisoformat(ticket["called_at"])
            wait_time = (called - created).total_seconds() / 60
            avg_wait_times.append(wait_time)
    
    avg_wait = sum(avg_wait_times) / len(avg_wait_times) if avg_wait_times else 0
    
    # Calcul réduction (simulation)
    baseline_wait = 65  # Temps moyen avant ViteviteApp
    reduction = ((baseline_wait - avg_wait) / baseline_wait * 100) if avg_wait < baseline_wait else 0
    
    return {
        "avgWaitTimeReduction": round(reduction, 1),
        "userSatisfaction": 4.7,
        "ticketsProcessedToday": len(today_tickets),
        "timeSavedToday": int(reduction * len(today_tickets) * 0.5),  # Heures économisées
        "peakHoursPredicted": 3,
        "aiAccuracy": 91.2
    }

@router.get("/trends")
async def get_service_trends():
    """Tendances par service"""
    services = db.get_all_services()
    tickets = db.get_all_tickets()
    
    trends = []
    for service in services:
        service_tickets = [t for t in tickets if t["service_id"] == service["id"]]
        
        # Calcul tendance (simulation basée sur la taille de file)
        if service["current_queue_size"] < 5:
            trend = "down"
            change = -random.randint(8, 15)
            status = "improving"
        elif service["current_queue_size"] > 12:
            trend = "up"
            change = random.randint(15, 25)
            status = "worsening"
        else:
            trend = "stable"
            change = random.randint(-3, 3)
            status = "stable"
        
        trends.append({
            "name": service["name"],
            "service_id": service["id"],
            "trend": trend,
            "change": change,
            "status": status,
            "current_queue": service["current_queue_size"],
            "tickets_count": len(service_tickets)
        })
    
    return {"trends": trends}

@router.get("/hourly")
async def get_hourly_data():
    """Données d'affluence par heure"""
    tickets = db.get_all_tickets()
    today = datetime.now().date()
    
    hourly_data = []
    for hour in range(8, 18):  # 8h à 17h
        hour_tickets = [
            t for t in tickets 
            if datetime.fromisoformat(t["created_at"]).date() == today
            and datetime.fromisoformat(t["created_at"]).hour == hour
        ]
        
        # Calcul temps d'attente moyen pour l'heure
        avg_wait = sum([t.get("estimated_wait_time", 30) for t in hour_tickets]) / len(hour_tickets) if hour_tickets else 20
        
        hourly_data.append({
            "hour": f"{hour}h",
            "tickets": len(hour_tickets),
            "wait": int(avg_wait)
        })
    
    return {"data": hourly_data}

@router.get("/recommendations")
async def get_strategic_recommendations():
    """Recommandations stratégiques IA"""
    services = db.get_all_services()
    
    recommendations = []
    
    # Recommandation 1: Nouveau point de service
    high_demand_areas = ["Abobo", "Yopougon", "Adjamé"]
    recommendations.append({
        "id": "rec_1",
        "title": "Ouvrir nouveau point de service",
        "location": random.choice(high_demand_areas),
        "reason": "Demande élevée non couverte dans cette zone",
        "impact": "Réduction de 35% du temps d'attente",
        "cost": "Moyen",
        "priority": "high",
        "estimated_revenue": "2.5M FCFA/mois"
    })
    
    # Recommandation 2: Ajuster horaires
    for service in services[:2]:
        recommendations.append({
            "id": f"rec_{service['id']}",
            "title": "Ajuster horaires d'ouverture",
            "location": service["name"],
            "reason": "Affluence tardive constatée",
            "impact": "Amélioration satisfaction +15%",
            "cost": "Faible",
            "priority": "medium",
            "estimated_revenue": "500K FCFA/mois"
        })
    
    # Recommandation 3: Formation personnel
    busiest = max(services, key=lambda s: s["current_queue_size"])
    recommendations.append({
        "id": "rec_training",
        "title": "Former personnel supplémentaire",
        "location": busiest["name"],
        "reason": "Surcharge pendant pics d'affluence",
        "impact": "Traitement 28% plus rapide",
        "cost": "Élevé",
        "priority": "high",
        "estimated_revenue": "1.2M FCFA/mois"
    })
    
    return {"recommendations": recommendations[:3]}

@router.get("/heatmap")
async def get_population_heatmap():
    """Carte thermique des zones d'affluence"""
    zones = [
        {"name": "Cocody", "lat": 5.3599, "lng": -4.0083, "level": "low", "services": 3},
        {"name": "Plateau", "lat": 5.3484, "lng": -4.0267, "level": "moderate", "services": 5},
        {"name": "Treichville", "lat": 5.3415, "lng": -4.0289, "level": "high", "services": 4},
        {"name": "Yopougon", "lat": 5.3364, "lng": -4.0818, "level": "moderate", "services": 2},
        {"name": "Abobo", "lat": 5.4258, "lng": -4.0208, "level": "very_high", "services": 6},
        {"name": "Adjamé", "lat": 5.3515, "lng": -4.0165, "level": "high", "services": 4}
    ]
    
    zones_fluides = [z for z in zones if z["level"] == "low"]
    zones_moderees = [z for z in zones if z["level"] == "moderate"]
    zones_saturees = [z for z in zones if z["level"] in ["high", "very_high"]]
    
    return {
        "zones": zones,
        "summary": {
            "fluides": len(zones_fluides),
            "moderees": len(zones_moderees),
            "saturees": len(zones_saturees)
        }
    }

def get_best_time():
    """Helper: retourne le meilleur créneau"""
    hour = datetime.now().hour
    if hour < 12:
        return "14h-16h"
    return "demain matin 8h-10h"