from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import json

from app.core.database import get_db
from app.models.pharmacy import Pharmacy, Medicine, PharmacyStock, Order, OrderStatus
from app.ai.ai_pharmacy_service import ai_pharmacy_service
from pydantic import BaseModel

router = APIRouter()

# --- Schemas ---
class PharmacyBase(BaseModel):
    name: str
    address: str
    phone: str
    is_on_duty: bool = False
    is_open: bool = True
    latitude: float
    longitude: float

class PharmacyOut(PharmacyBase):
    id: int
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class MedicineOut(BaseModel):
    id: int
    name: str
    dosage: Optional[str]
    category: str
    image_url: Optional[str]
    requires_prescription: bool
    
    class Config:
        from_attributes = True

class StockOut(BaseModel):
    id: int
    quantity: int
    price: float
    status: str
    medicine: MedicineOut
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    pharmacy_id: int
    items: List[dict]  # [{"medicine_id": 1, "quantity": 2}]
    type: str = "pickup"
    payment_method: str = "cash"

# --- Endpoints ---

@router.get("/", response_model=List[PharmacyOut])
async def get_pharmacies(
    skip: int = 0, 
    limit: int = 20, 
    search: Optional[str] = None,
    is_on_duty: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer la liste des pharmacies avec filtres"""
    query = select(Pharmacy)
    
    if search:
        query = query.filter(Pharmacy.name.ilike(f"%{search}%"))
    
    if is_on_duty is not None:
        query = query.filter(Pharmacy.is_on_duty == is_on_duty)
        
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{pharmacy_id}/stock", response_model=List[StockOut])
async def get_pharmacy_stock(
    pharmacy_id: int,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer le stock d'une pharmacie"""
    query = select(PharmacyStock).join(Medicine).filter(PharmacyStock.pharmacy_id == pharmacy_id)
    
    if category:
        query = query.filter(Medicine.category == category)
        
    if search:
        query = query.filter(Medicine.name.ilike(f"%{search}%"))
        
    result = await db.execute(query)
    stocks = result.scalars().all()
    
    # Eager loading workaround if needed, but joinedload is better. 
    # For now, assuming lazy loading might fail with async, so let's ensure we fetch what we need.
    # Actually, Pydantic from_attributes will try to access .medicine.
    # We should use options(joinedload(PharmacyStock.medicine)) to avoid N+1 or async errors.
    # But let's try simple first as models might not be set up for async relationships perfectly yet.
    # To be safe, let's use explicit join and select.
    
    # Re-writing query to be safer with async
    from sqlalchemy.orm import selectinload
    query = select(PharmacyStock).options(selectinload(PharmacyStock.medicine)).filter(PharmacyStock.pharmacy_id == pharmacy_id)
    
    if category:
        query = query.join(Medicine).filter(Medicine.category == category)
    if search:
        query = query.join(Medicine).filter(Medicine.name.ilike(f"%{search}%"))
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/medicines/alternatives")
async def get_medicine_alternatives(
    medicine_name: str,
    dosage: str,
    context: Optional[str] = None
):
    """Obtenir des alternatives IA pour un médicament"""
    return await ai_pharmacy_service.find_alternatives(medicine_name, dosage, context)

@router.post("/orders")
async def create_order(order: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Créer une nouvelle commande/précommande"""
    # Calcul du total (simplifié)
    total = 0
    items_json = []
    
    for item in order.items:
        stmt = select(PharmacyStock).options(selectinload(PharmacyStock.medicine)).filter(
            PharmacyStock.pharmacy_id == order.pharmacy_id,
            PharmacyStock.medicine_id == item['medicine_id']
        )
        result = await db.execute(stmt)
        stock = result.scalars().first()
        
        if stock:
            price = stock.price
            total += price * item['quantity']
            items_json.append({
                "medicine_id": item['medicine_id'],
                "name": stock.medicine.name,
                "quantity": item['quantity'],
                "price": price
            })
    
    new_order = Order(
        pharmacy_id=order.pharmacy_id,
        status=OrderStatus.PENDING,
        type=order.type,
        payment_method=order.payment_method,
        total_amount=total,
        items_json=json.dumps(items_json)
    )
    
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    
    return {"status": "success", "order_id": new_order.id, "total": total}
