from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.services.transport_service import TransportService
from app.models.transport import TransportCompany, TransportDeparture, TransportBooking, SotraLine

router = APIRouter()

# --- Schemas ---

class CompanyOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str]
    rating: float
    contact_phone: Optional[str]
    
    class Config:
        from_attributes = True

class DepartureOut(BaseModel):
    id: int
    company: CompanyOut
    departure_time: datetime
    arrival_time: datetime
    price: float
    car_type: str
    available_seats: int
    status: str
    origin: str
    destination: str
    
    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    departure_id: int
    passenger_name: str
    passenger_phone: str
    seat_number: str
    user_id: Optional[int] = None

class SotraLineOut(BaseModel):
    id: int
    number: str
    origin: str
    destination: str
    color: str
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/companies", response_model=List[CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    service = TransportService(db)
    return service.get_companies()

@router.get("/departures", response_model=List[DepartureOut])
def search_departures(
    origin: str,
    destination: str,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = TransportService(db)
    # Conversion simple pour la démo
    search_date = datetime.now() 
    departures = service.search_departures(origin, destination, search_date)
    
    # Mapping manuel pour inclure origin/destination du route
    result = []
    for d in departures:
        d_out = DepartureOut(
            id=d.id,
            company=d.company,
            departure_time=d.departure_time,
            arrival_time=d.arrival_time,
            price=d.price,
            car_type=d.car_type,
            available_seats=d.available_seats,
            status=d.status,
            origin=d.route.origin,
            destination=d.route.destination
        )
        result.append(d_out)
    return result

@router.post("/bookings")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    service = TransportService(db)
    try:
        new_booking = service.create_booking(
            user_id=booking.user_id,
            departure_id=booking.departure_id,
            passenger_name=booking.passenger_name,
            passenger_phone=booking.passenger_phone,
            seat_number=booking.seat_number
        )
        return {"status": "success", "booking_id": new_booking.id, "qr_code": new_booking.qr_code}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sotra/lines", response_model=List[SotraLineOut])
def get_sotra_lines(db: Session = Depends(get_db)):
    service = TransportService(db)
    return service.get_sotra_lines()

@router.get("/sotra/lines/{line_id}/realtime")
def get_line_realtime(line_id: int, db: Session = Depends(get_db)):
    service = TransportService(db)
    data = service.get_line_realtime_info(line_id)
    if not data:
        raise HTTPException(status_code=404, detail="Ligne non trouvée")
    return data

@router.get("/sotra/stops/{stop_id}/arrivals")
def get_stop_arrivals(stop_id: int, db: Session = Depends(get_db)):
    service = TransportService(db)
    return service.get_stop_arrivals(stop_id)
