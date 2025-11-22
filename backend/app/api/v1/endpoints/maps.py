"""
Endpoints API pour Google Maps et géolocalisation
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.services.maps_service import maps_service
from app.database import db

router = APIRouter(prefix="/maps", tags=["Maps"])


# ========== MODELS ==========

class LocationModel(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class DirectionsRequest(BaseModel):
    origin: LocationModel
    destination: LocationModel
    mode: str = Field(default="driving", pattern="^(driving|transit|walking|bicycling)$")


class NearbyServicesRequest(BaseModel):
    user_location: LocationModel
    max_distance_km: float = Field(default=10.0, ge=0.1, le=50.0)
    category: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


# ========== ENDPOINTS ==========

@router.post("/directions")
async def get_directions(request: DirectionsRequest):
    """
    🗺️ **Calcul d'itinéraire**
    
    Calcule la distance et le temps de trajet entre deux points.
    
    Modes disponibles:
    - `driving`: En voiture
    - `transit`: Transport public
    - `walking`: À pied
    - `bicycling`: À vélo
    """
    try:
        directions = maps_service.get_directions(
            origin=request.origin.dict(),
            destination=request.destination.dict(),
            mode=request.mode
        )
        
        return {
            "success": True,
            "data": directions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur calcul itinéraire: {str(e)}")


@router.post("/nearby")
async def find_nearby_services(request: NearbyServicesRequest):
    """
    📍 **Services à proximité**
    
    Trouve les services les plus proches de votre position.
    """
    try:
        # Récupérer tous les services
        all_services = db.get_all_services()
        
        # Filtrer par catégorie si spécifié
        if request.category:
            all_services = [
                s for s in all_services 
                if s.get('category', '').lower() == request.category.lower()
            ]
        
        # Trouver services à proximité
        nearby = maps_service.find_nearby_services(
            user_location=request.user_location.dict(),
            services=all_services,
            max_distance_km=request.max_distance_km,
            limit=request.limit
        )
        
        return {
            "success": True,
            "data": {
                "services": nearby,
                "count": len(nearby),
                "search_radius_km": request.max_distance_km
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur recherche proximité: {str(e)}")


@router.get("/distance")
async def calculate_distance(
    origin_lat: float = Query(..., ge=-90, le=90),
    origin_lng: float = Query(..., ge=-180, le=180),
    dest_lat: float = Query(..., ge=-90, le=90),
    dest_lng: float = Query(..., ge=-180, le=180)
):
    """
    📏 **Calcul de distance**
    
    Calcule la distance entre deux coordonnées GPS.
    """
    try:
        origin = {"lat": origin_lat, "lng": origin_lng}
        destination = {"lat": dest_lat, "lng": dest_lng}
        
        distance = maps_service.calculate_distance(origin, destination)
        travel_time = maps_service.estimate_travel_time(distance, "driving")
        
        return {
            "success": True,
            "data": {
                "distance_km": distance,
                "estimated_time_minutes": travel_time,
                "origin": origin,
                "destination": destination
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur calcul distance: {str(e)}")


@router.get("/travel-time/{service_id}")
async def get_travel_time_to_service(
    service_id: str,
    user_lat: float = Query(..., ge=-90, le=90),
    user_lng: float = Query(..., ge=-180, le=180),
    mode: str = Query(default="driving", pattern="^(driving|transit|walking|bicycling)$")
):
    """
    ⏱️ **Temps de trajet vers un service**
    
    Calcule le temps de trajet de votre position vers un service.
    """
    try:
        # Récupérer le service
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        service_location = service.get('location')
        if not service_location or not service_location.get('lat'):
            raise HTTPException(status_code=400, detail="Service sans localisation")
        
        user_location = {"lat": user_lat, "lng": user_lng}
        
        directions = maps_service.get_directions(
            origin=user_location,
            destination=service_location,
            mode=mode
        )
        
        return {
            "success": True,
            "data": {
                "service": {
                    "id": service.get('id'),
                    "name": service.get('name'),
                    "address": service_location.get('address')
                },
                "travel": directions
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/geocode")
async def geocode_address(address: str = Body(..., embed=True)):
    """
    🌍 **Géocodage d'adresse**
    
    Convertit une adresse en coordonnées GPS.
    
    Note: Version basique avec adresses connues d'Abidjan.
    """
    try:
        coordinates = maps_service.geocode_address(address)
        
        if not coordinates:
            raise HTTPException(status_code=404, detail="Adresse non trouvée")
        
        return {
            "success": True,
            "data": {
                "address": address,
                "coordinates": coordinates
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur géocodage: {str(e)}")


@router.get("/coverage/{service_id}")
async def get_service_coverage(service_id: str, radius_km: float = Query(default=5.0, ge=0.1, le=50.0)):
    """
    📡 **Zone de couverture d'un service**
    
    Calcule la zone géographique couverte par un service.
    """
    try:
        service = db.get_service_by_id(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        service_location = service.get('location')
        if not service_location or not service_location.get('lat'):
            raise HTTPException(status_code=400, detail="Service sans localisation")
        
        coverage = maps_service.get_service_coverage_area(
            service_location=service_location,
            radius_km=radius_km
        )
        
        return {
            "success": True,
            "data": {
                "service": {
                    "id": service.get('id'),
                    "name": service.get('name')
                },
                "coverage": coverage
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/optimize-route")
async def optimize_route(
    origin: LocationModel = Body(...),
    destinations: List[Dict[str, Any]] = Body(...)
):
    """
    🎯 **Optimisation d'itinéraire**
    
    Optimise un itinéraire multi-destinations pour minimiser la distance.
    """
    try:
        optimized = maps_service.optimize_route(
            origin=origin.dict(),
            destinations=destinations
        )
        
        return {
            "success": True,
            "data": optimized
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur optimisation: {str(e)}")


@router.get("/health")
async def maps_health_check():
    """
    ✅ **Vérification santé du service Maps**
    """
    return {
        "success": True,
        "service": "maps",
        "enabled": maps_service.enabled,
        "features": [
            "distance_calculation",
            "travel_time_estimation",
            "nearby_search",
            "route_optimization",
            "geocoding"
        ]
    }
