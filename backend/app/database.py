import json
import os
from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.core.database import AsyncSessionLocal

class Database:
    def __init__(self):
        self.data_dir = "data"
        self.services_file = os.path.join(self.data_dir, "services.json")
        self.tickets_file = os.path.join(self.data_dir, "tickets.json")
        self._ensure_data_dir()
        self._initialize_default_data()
    
    def _ensure_data_dir(self):
        """Crée le dossier data s'il n'existe pas"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _initialize_default_data(self):
        """Initialise les données par défaut si les fichiers n'existent pas"""
        if not os.path.exists(self.services_file):
            default_services = [
                {
                    "id": "mairie-etat-civil",
                    "name": "Mairie - État Civil",
                    "category": "Administration",
                    "description": "Carte d'identité, acte de naissance, certificat",
                    "status": "ouvert",
                    "affluence_level": "faible",
                    "estimated_wait_time": 10,
                    "current_queue_size": 3,
                    "required_documents": [
                        {"name": "Pièce d'identité", "required": True},
                        {"name": "Justificatif de domicile", "required": True},
                        {"name": "Photo d'identité", "required": True}
                    ],
                    "opening_hours": "08:00 - 16:00",
                    "location": {"lat": 5.3599, "lng": -4.0083, "address": "Cocody, Abidjan"},
                    "icon": "building"
                },
                {
                    "id": "banque-atlantique",
                    "name": "Banque Atlantique",
                    "category": "Banque",
                    "description": "Services bancaires, virements, ouverture de compte",
                    "status": "ouvert",
                    "affluence_level": "modérée",
                    "estimated_wait_time": 30,
                    "current_queue_size": 8,
                    "required_documents": [
                        {"name": "Carte d'identité", "required": True},
                        {"name": "Justificatif de revenus", "required": False}
                    ],
                    "opening_hours": "08:30 - 16:30",
                    "location": {"lat": 5.3484, "lng": -4.0267, "address": "Plateau, Abidjan"},
                    "icon": "building-columns"
                },
                {
                    "id": "hopital-central",
                    "name": "Hôpital Central - Consultations",
                    "category": "Santé",
                    "description": "Consultations générales et spécialisées",
                    "status": "ouvert",
                    "affluence_level": "élevée",
                    "estimated_wait_time": 60,
                    "current_queue_size": 15,
                    "required_documents": [
                        {"name": "Carte de santé", "required": True},
                        {"name": "Ordonnance médicale", "required": False},
                        {"name": "Carte d'assurance", "required": False}
                    ],
                    "opening_hours": "24/7",
                    "location": {"lat": 5.3415, "lng": -4.0289, "address": "Treichville, Abidjan"},
                    "icon": "hospital"
                }
            ]
            self._write_json(self.services_file, default_services)
        
        if not os.path.exists(self.tickets_file):
            self._write_json(self.tickets_file, [])
    
    def _read_json(self, filepath: str) -> list:
        """Lit un fichier JSON"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erreur lecture {filepath}: {e}")
            return []
    
    def _write_json(self, filepath: str, data: list):
        """Écrit dans un fichier JSON"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erreur écriture {filepath}: {e}")
    
    # === SERVICES ===
    def get_all_services(self) -> List[dict]:
        """Récupère tous les services"""
        return self._read_json(self.services_file)
    
    def get_service(self, service_id: str) -> Optional[dict]:
        """Récupère un service par ID"""
        services = self.get_all_services()
        return next((s for s in services if s["id"] == service_id), None)
    
    def update_service(self, service_id: str, updates: dict) -> Optional[dict]:
        """Met à jour un service"""
        services = self.get_all_services()
        for service in services:
            if service["id"] == service_id:
                service.update(updates)
                self._write_json(self.services_file, services)
                return service
        return None
    
    # === TICKETS ===
    def get_all_tickets(self) -> List[dict]:
        """Récupère tous les tickets"""
        return self._read_json(self.tickets_file)
    
    def get_ticket(self, ticket_id: str) -> Optional[dict]:
        """Récupère un ticket par ID"""
        tickets = self.get_all_tickets()
        return next((t for t in tickets if t["id"] == ticket_id), None)
    
    def create_ticket(self, ticket_data: dict) -> dict:
        """Crée un nouveau ticket"""
        tickets = self.get_all_tickets()
        
        # Génère un numéro de ticket unique
        service_tickets = [t for t in tickets if t["service_id"] == ticket_data["service_id"]]
        ticket_number = f"N-{len(service_tickets) + 1:03d}"
        
        # Calcule la position dans la file
        active_tickets = [t for t in service_tickets if t["status"] in ["en_attente", "appelé"]]
        position = len(active_tickets) + 1
        
        new_ticket = {
            "id": str(uuid.uuid4()),
            "ticket_number": ticket_number,
            "position_in_queue": position,
            "created_at": datetime.now().isoformat(),
            "called_at": None,
            "completed_at": None,
            **ticket_data
        }
        
        tickets.append(new_ticket)
        self._write_json(self.tickets_file, tickets)
        
        # Met à jour la taille de la file du service
        service = self.get_service(ticket_data["service_id"])
        if service:
            self.update_service(ticket_data["service_id"], {
                "current_queue_size": service["current_queue_size"] + 1
            })
        
        return new_ticket
    
    def update_ticket(self, ticket_id: str, updates: dict) -> Optional[dict]:
        """Met à jour un ticket"""
        tickets = self.get_all_tickets()
        for ticket in tickets:
            if ticket["id"] == ticket_id:
                # Gère les timestamps automatiques
                if updates.get("status") == "appelé" and not ticket.get("called_at"):
                    updates["called_at"] = datetime.now().isoformat()
                elif updates.get("status") in ["terminé", "annulé"] and not ticket.get("completed_at"):
                    updates["completed_at"] = datetime.now().isoformat()
                
                ticket.update(updates)
                self._write_json(self.tickets_file, tickets)
                
                # Met à jour la taille de la file du service
                if updates.get("status") in ["terminé", "annulé"]:
                    service = self.get_service(ticket["service_id"])
                    if service and service["current_queue_size"] > 0:
                        self.update_service(ticket["service_id"], {
                            "current_queue_size": service["current_queue_size"] - 1
                        })
                
                return ticket
        return None
    
    def get_active_tickets_for_service(self, service_id: str) -> List[dict]:
        """Récupère les tickets actifs pour un service"""
        tickets = self.get_all_tickets()
        return [t for t in tickets if t["service_id"] == service_id 
                and t["status"] in ["en_attente", "appelé", "en_service"]]
    
    def get_stats(self) -> dict:
        """Calcule les statistiques globales"""
        tickets = self.get_all_tickets()
        services = self.get_all_services()
        
        today = datetime.now().date()
        today_tickets = [t for t in tickets 
                        if datetime.fromisoformat(t["created_at"]).date() == today]
        
        active = [t for t in tickets if t["status"] in ["en_attente", "appelé", "en_service"]]
        completed = [t for t in today_tickets if t["status"] == "terminé"]
        
        # Calcule le temps d'attente moyen
        avg_wait = 0
        if completed:
            wait_times = []
            for t in completed:
                if t.get("called_at"):
                    created = datetime.fromisoformat(t["created_at"])
                    called = datetime.fromisoformat(t["called_at"])
                    wait_times.append((called - created).total_seconds() / 60)
            avg_wait = sum(wait_times) / len(wait_times) if wait_times else 0
        
        # Service le plus occupé
        busiest = None
        if services:
            busiest_service = max(services, key=lambda s: s["current_queue_size"])
            busiest = busiest_service["name"] if busiest_service["current_queue_size"] > 0 else None
        
        return {
            "total_tickets_today": len(today_tickets),
            "active_tickets": len(active),
            "completed_tickets": len(completed),
            "average_wait_time": round(avg_wait, 1),
            "services_open": len([s for s in services if s["status"] == "ouvert"]),
            "busiest_service": busiest
        }
async def get_async_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
# Instance globale
db = Database()