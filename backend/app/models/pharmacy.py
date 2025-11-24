from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class StockStatus(str, enum.Enum):
    AVAILABLE = "available"
    LOW = "low"
    OUT_OF_STOCK = "out_of_stock"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERING = "delivering"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderType(str, enum.Enum):
    PICKUP = "pickup"
    DELIVERY = "delivery"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    MOBILE_MONEY = "mobile_money"
    CARD = "card"
    INSURANCE = "insurance"

class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    email = Column(String, nullable=True)
    
    is_on_duty = Column(Boolean, default=False)  # Pharmacie de garde
    is_open = Column(Boolean, default=True)
    opening_hours = Column(String, nullable=True)
    
    image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    stocks = relationship("PharmacyStock", back_populates="pharmacy")
    orders = relationship("Order", back_populates="pharmacy")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    dosage = Column(String, nullable=True)  # ex: 500mg
    category = Column(String, index=True)   # ex: Antibiotique, Antipaludéen
    manufacturer = Column(String, nullable=True)
    
    image_url = Column(String, nullable=True)
    requires_prescription = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    stocks = relationship("PharmacyStock", back_populates="medicine")

class PharmacyStock(Base):
    __tablename__ = "pharmacy_stocks"

    id = Column(Integer, primary_key=True, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    
    quantity = Column(Integer, default=0)
    price = Column(Float)  # Prix en FCFA
    status = Column(Enum(StockStatus), default=StockStatus.AVAILABLE)
    
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="stocks")
    medicine = relationship("Medicine", back_populates="stocks")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Nullable pour guest checkout si besoin
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"))
    
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    type = Column(Enum(OrderType), default=OrderType.PICKUP)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    
    total_amount = Column(Float)
    items_json = Column(Text)  # Stockage simple des items commandés en JSON
    
    prescription_url = Column(String, nullable=True)  # Photo ordonnance
    pickup_time = Column(DateTime(timezone=True), nullable=True)
    delivery_address = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="orders")
    # user relationship à ajouter si User model importé
