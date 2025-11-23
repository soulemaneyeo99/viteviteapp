from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base

# --- Enums ---

class TransportType(str, enum.Enum):
    VIP = "VIP"
    CLASSIC = "Classique"

class DepartureStatus(str, enum.Enum):
    ON_TIME = "on_time"
    DELAYED = "delayed"
    CANCELLED = "cancelled"
    BOARDING = "boarding"
    DEPARTED = "departed"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class SotraBusStatus(str, enum.Enum):
    MOVING = "moving"
    STOPPED = "stopped"
    TRAFFIC = "traffic"

class LoadLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    FULL = "full"

# --- Interurban Transport Models ---

class TransportCompany(Base):
    __tablename__ = "transport_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    logo_url = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    departures = relationship("TransportDeparture", back_populates="company")

class TransportRoute(Base):
    __tablename__ = "transport_routes"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    distance_km = Column(Float)
    estimated_duration_minutes = Column(Integer)
    
    # Relationships
    departures = relationship("TransportDeparture", back_populates="route")

class TransportDeparture(Base):
    __tablename__ = "transport_departures"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("transport_companies.id"))
    route_id = Column(Integer, ForeignKey("transport_routes.id"))
    
    departure_time = Column(DateTime(timezone=True))
    arrival_time = Column(DateTime(timezone=True))
    
    price = Column(Float)
    car_type = Column(Enum(TransportType), default=TransportType.CLASSIC)
    
    total_seats = Column(Integer)
    available_seats = Column(Integer)
    
    status = Column(Enum(DepartureStatus), default=DepartureStatus.ON_TIME)
    delay_minutes = Column(Integer, default=0)
    
    boarding_gate = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("TransportCompany", back_populates="departures")
    route = relationship("TransportRoute", back_populates="departures")
    bookings = relationship("TransportBooking", back_populates="departure")

class TransportBooking(Base):
    __tablename__ = "transport_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for guest checkout
    departure_id = Column(Integer, ForeignKey("transport_departures.id"))
    
    passenger_name = Column(String)
    passenger_phone = Column(String)
    seat_number = Column(String, nullable=True)
    
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    qr_code = Column(String, nullable=True)
    payment_reference = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    departure = relationship("TransportDeparture", back_populates="bookings")

# --- SOTRA Models ---

class SotraLine(Base):
    __tablename__ = "sotra_lines"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, index=True) # ex: "19", "47"
    origin = Column(String)
    destination = Column(String)
    color = Column(String, default="#000000")
    
    # Relationships
    stops = relationship("SotraStop", back_populates="line")
    buses = relationship("SotraBus", back_populates="line")

class SotraStop(Base):
    __tablename__ = "sotra_stops"

    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(Integer, ForeignKey("sotra_lines.id"))
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    sequence_order = Column(Integer) # Order in the route
    
    # Relationships
    line = relationship("SotraLine", back_populates="stops")

class SotraBus(Base):
    __tablename__ = "sotra_buses"

    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(Integer, ForeignKey("sotra_lines.id"))
    
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    heading = Column(Float, default=0.0) # Direction in degrees
    
    status = Column(Enum(SotraBusStatus), default=SotraBusStatus.MOVING)
    passenger_load = Column(Enum(LoadLevel), default=LoadLevel.MEDIUM)
    
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    line = relationship("SotraLine", back_populates="buses")
