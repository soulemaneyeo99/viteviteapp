"""
Service Google Maps pour géolocalisation et navigation
Calcul de distances, temps de trajet, services à proximité
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import logging
import math

logger = logging.getLogger(__name__)


class MapsService:
    """
    Service de géolocalisation et navigation
    
    Note: Pour l'instant, utilise des calculs basiques.
    En production, intégrer Google Maps API avec NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    """
    
    def __init__(self):
        self.enabled = True
        logger.info("✅ Maps Service activé (mode calcul basique)")
    
    def calculate_distance(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> float:
        """
        Calcule la distance entre deux points (formule de Haversine)
        
        Args:
            origin: {"lat": float, "lng": float}
            destination: {"lat": float, "lng": float}
        
        Returns:
            Distance en kilomètres
        """
        lat1, lon1 = origin.get('lat'), origin.get('lng')
        lat2, lon2 = destination.get('lat'), destination.get('lng')
        
        if not all([lat1, lon1, lat2, lon2]):
            return 0.0
        
        # Rayon de la Terre en km
        R = 6371.0
        
        # Convertir en radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Différences
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Formule de Haversine
        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)
    
    def estimate_travel_time(
        self,
        distance_km: float,
        mode: str = "driving"
    ) -> int:
        """
        Estime le temps de trajet
        
        Args:
            distance_km: Distance en km
            mode: "driving", "transit", "walking"
        
        Returns:
            Temps en minutes
        """
        # Vitesses moyennes à Abidjan (km/h)
        speeds = {
            "driving": 25,      # Trafic urbain Abidjan
            "transit": 20,      # Transport public
            "walking": 5,       # Marche
            "bicycling": 15     # Vélo
        }
        
        speed = speeds.get(mode, 25)
        time_hours = distance_km / speed
        time_minutes = int(time_hours * 60)
        
        # Ajouter temps de base (parking, attente, etc.)
        base_time = {
            "driving": 5,
            "transit": 10,
            "walking": 0,
            "bicycling": 2
        }
        
        return time_minutes + base_time.get(mode, 0)
    
    def find_nearby_services(
        self,
        user_location: Dict[str, float],
        services: List[Dict[str, Any]],
        max_distance_km: float = 10.0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Trouve les services à proximité
        
        Args:
            user_location: {"lat": float, "lng": float}
            services: Liste de services avec location
            max_distance_km: Distance maximale
            limit: Nombre max de résultats
        
        Returns:
            Liste de services triés par distance
        """
        nearby = []
        
        for service in services:
            location = service.get('location')
            if not location or not location.get('lat') or not location.get('lng'):
                continue
            
            distance = self.calculate_distance(user_location, location)
            
            if distance <= max_distance_km:
                service_copy = service.copy()
                service_copy['distance_km'] = distance
                service_copy['travel_time_minutes'] = self.estimate_travel_time(distance, "driving")
                nearby.append(service_copy)
        
        # Trier par distance
        nearby.sort(key=lambda s: s['distance_km'])
        
        return nearby[:limit]
    
    def get_directions(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float],
        mode: str = "driving"
    ) -> Dict[str, Any]:
        """
        Obtient les directions entre deux points
        
        Returns:
            {
                "distance_km": float,
                "duration_minutes": int,
                "mode": str,
                "summary": str,
                "google_maps_url": str
            }
        """
        distance = self.calculate_distance(origin, destination)
        duration = self.estimate_travel_time(distance, mode)
        
        # Générer URL Google Maps
        google_maps_url = (
            f"https://www.google.com/maps/dir/?api=1"
            f"&origin={origin['lat']},{origin['lng']}"
            f"&destination={destination['lat']},{destination['lng']}"
            f"&travelmode={mode}"
        )
        
        # Résumé
        mode_fr = {
            "driving": "en voiture",
            "transit": "en transport public",
            "walking": "à pied",
            "bicycling": "à vélo"
        }
        
        summary = f"{distance} km {mode_fr.get(mode, mode)} - environ {duration} minutes"
        
        return {
            "distance_km": distance,
            "duration_minutes": duration,
            "mode": mode,
            "summary": summary,
            "google_maps_url": google_maps_url,
            "origin": origin,
            "destination": destination
        }
    
    def geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        """
        Convertit une adresse en coordonnées
        
        Note: Version basique avec adresses connues d'Abidjan
        En production, utiliser Google Geocoding API
        """
        # Base de données simple d'adresses connues
        known_addresses = {
            "cocody": {"lat": 5.3599, "lng": -3.9928},
            "plateau": {"lat": 5.3272, "lng": -4.0144},
            "yopougon": {"lat": 5.3364, "lng": -4.0892},
            "abobo": {"lat": 5.4239, "lng": -4.0208},
            "adjamé": {"lat": 5.3515, "lng": -4.0228},
            "marcory": {"lat": 5.2833, "lng": -3.9833},
            "treichville": {"lat": 5.2833, "lng": -4.0000},
            "port-bouet": {"lat": 5.2667, "lng": -3.9167},
            "koumassi": {"lat": 5.2833, "lng": -3.9500},
            "bingerville": {"lat": 5.3547, "lng": -3.8947}
        }
        
        address_lower = address.lower()
        
        for key, coords in known_addresses.items():
            if key in address_lower:
                return coords
        
        # Coordonnées par défaut (centre d'Abidjan)
        return {"lat": 5.3364, "lng": -4.0267}
    
    def get_service_coverage_area(
        self,
        service_location: Dict[str, float],
        radius_km: float = 5.0
    ) -> Dict[str, Any]:
        """
        Calcule la zone de couverture d'un service
        
        Returns:
            {
                "center": Dict,
                "radius_km": float,
                "bounds": Dict (pour affichage carte)
            }
        """
        lat = service_location.get('lat')
        lng = service_location.get('lng')
        
        # Approximation: 1 degré ≈ 111 km
        lat_offset = radius_km / 111.0
        lng_offset = radius_km / (111.0 * math.cos(math.radians(lat)))
        
        bounds = {
            "north": lat + lat_offset,
            "south": lat - lat_offset,
            "east": lng + lng_offset,
            "west": lng - lng_offset
        }
        
        return {
            "center": service_location,
            "radius_km": radius_km,
            "bounds": bounds
        }
    
    def optimize_route(
        self,
        origin: Dict[str, float],
        destinations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Optimise un itinéraire multi-destinations (algorithme glouton simple)
        
        Returns:
            Liste de destinations ordonnées pour minimiser la distance totale
        """
        if not destinations:
            return []
        
        optimized = []
        current_location = origin
        remaining = destinations.copy()
        
        while remaining:
            # Trouver le point le plus proche
            closest = min(
                remaining,
                key=lambda d: self.calculate_distance(
                    current_location,
                    d.get('location', {})
                )
            )
            
            distance = self.calculate_distance(current_location, closest.get('location', {}))
            closest_copy = closest.copy()
            closest_copy['distance_from_previous'] = distance
            closest_copy['travel_time_from_previous'] = self.estimate_travel_time(distance)
            
            optimized.append(closest_copy)
            current_location = closest.get('location', {})
            remaining.remove(closest)
        
        # Calculer distance totale
        total_distance = sum(d.get('distance_from_previous', 0) for d in optimized)
        total_time = sum(d.get('travel_time_from_previous', 0) for d in optimized)
        
        return {
            "optimized_route": optimized,
            "total_distance_km": round(total_distance, 2),
            "total_time_minutes": total_time,
            "num_stops": len(optimized)
        }


# Instance globale
maps_service = MapsService()
