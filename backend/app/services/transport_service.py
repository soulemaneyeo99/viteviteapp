import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional, Dict, Any

from app.models.transport import (
    TransportCompany, TransportRoute, TransportDeparture, TransportBooking,
    SotraLine, SotraStop, SotraBus,
    DepartureStatus, BookingStatus, SotraBusStatus, LoadLevel
)

class TransportService:
    def __init__(self, db: Session):
        self.db = db

    # --- Interurban Logic ---

    def get_companies(self) -> List[TransportCompany]:
        return self.db.query(TransportCompany).all()

    def search_departures(self, origin: str, destination: str, date: datetime) -> List[TransportDeparture]:
        """Recherche les départs disponibles pour un trajet donné"""
        # Note: Dans une vraie app, on filtrerait aussi par date précise
        # Ici on retourne tout pour la démo
        return self.db.query(TransportDeparture).join(TransportRoute).filter(
            TransportRoute.origin.ilike(f"%{origin}%"),
            TransportRoute.destination.ilike(f"%{destination}%"),
            TransportDeparture.status != DepartureStatus.CANCELLED,
            TransportDeparture.available_seats > 0
        ).all()

    def create_booking(self, user_id: Optional[int], departure_id: int, passenger_name: str, passenger_phone: str, seat_number: str) -> TransportBooking:
        """Crée une réservation"""
        departure = self.db.query(TransportDeparture).filter(TransportDeparture.id == departure_id).first()
        if not departure or departure.available_seats <= 0:
            raise ValueError("Départ complet ou invalide")

        booking = TransportBooking(
            user_id=user_id,
            departure_id=departure_id,
            passenger_name=passenger_name,
            passenger_phone=passenger_phone,
            seat_number=seat_number,
            status=BookingStatus.CONFIRMED,
            qr_code=f"TICKET-{departure_id}-{random.randint(1000, 9999)}",
            payment_reference=f"PAY-{random.randint(10000, 99999)}"
        )
        
        departure.available_seats -= 1
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    # --- SOTRA Simulation Logic ---

    def get_sotra_lines(self) -> List[SotraLine]:
        return self.db.query(SotraLine).all()

    def get_line_realtime_info(self, line_id: int) -> Dict[str, Any]:
        """Simule et récupère les infos temps réel d'une ligne"""
        line = self.db.query(SotraLine).filter(SotraLine.id == line_id).first()
        if not line:
            return None

        # Simuler le mouvement des bus (mise à jour aléatoire des positions)
        buses = self.db.query(SotraBus).filter(SotraBus.line_id == line_id).all()
        
        # Si pas de bus, on en crée pour la démo
        if not buses:
            self._seed_simulation_buses(line)
            buses = self.db.query(SotraBus).filter(SotraBus.line_id == line_id).all()

        bus_data = []
        for bus in buses:
            # Simulation simple : petit déplacement aléatoire
            bus.current_latitude += random.uniform(-0.001, 0.001)
            bus.current_longitude += random.uniform(-0.001, 0.001)
            bus.passenger_load = random.choice(list(LoadLevel))
            bus.status = random.choice([SotraBusStatus.MOVING, SotraBusStatus.MOVING, SotraBusStatus.STOPPED])
            
            bus_data.append({
                "id": bus.id,
                "lat": bus.current_latitude,
                "lng": bus.current_longitude,
                "status": bus.status,
                "load": bus.passenger_load,
                "heading": bus.heading
            })
        
        self.db.commit()

        return {
            "line": {
                "id": line.id,
                "number": line.number,
                "origin": line.origin,
                "destination": line.destination,
                "color": line.color
            },
            "buses": bus_data,
            "stops": [
                {"id": s.id, "name": s.name, "lat": s.latitude, "lng": s.longitude} 
                for s in line.stops
            ]
        }

    def get_stop_arrivals(self, stop_id: int) -> List[Dict[str, Any]]:
        """Estime les temps d'arrivée à un arrêt (Simulé)"""
        stop = self.db.query(SotraStop).filter(SotraStop.id == stop_id).first()
        if not stop:
            return []

        # Générer des arrivées fictives
        arrivals = []
        for i in range(3):
            minutes = random.randint(2, 30)
            arrivals.append({
                "line_number": stop.line.number,
                "destination": stop.line.destination,
                "minutes": minutes,
                "load": random.choice(list(LoadLevel)),
                "status": "on_time" if minutes < 15 else "delayed"
            })
        
        return sorted(arrivals, key=lambda x: x['minutes'])

    def _seed_simulation_buses(self, line: SotraLine):
        """Crée des bus initiaux pour la simulation"""
        # Centre approximatif d'Abidjan
        base_lat, base_lng = 5.34, -4.01
        
        for i in range(3):
            bus = SotraBus(
                line_id=line.id,
                current_latitude=base_lat + random.uniform(-0.05, 0.05),
                current_longitude=base_lng + random.uniform(-0.05, 0.05),
                heading=random.uniform(0, 360),
                status=SotraBusStatus.MOVING,
                passenger_load=LoadLevel.MEDIUM
            )
            self.db.add(bus)
        self.db.commit()
