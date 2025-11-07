"""
Fichier: backend/app/routers/marketplace.py
Router pour la marketplace intégrée
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

# === MODELS ===

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    unit: str
    seller: str
    description: str
    image_url: Optional[str] = None
    rating: float = 0.0
    reviews_count: int = 0
    delivery_time: str = "2-3h"
    stock: int = 0
    discount: float = 0.0
    featured: bool = False
    tags: List[str] = []

class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Order(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    user_phone: str
    items: List[CartItem]
    total_amount: float
    delivery_address: str
    payment_method: str
    status: str = "pending"  # pending, confirmed, delivering, completed, cancelled
    created_at: str
    estimated_delivery: str

class OrderCreate(BaseModel):
    user_name: Optional[str] = None
    user_phone: str
    items: List[CartItem]
    delivery_address: str
    payment_method: str

# === DATA STORE (En production, utiliser une vraie base de données) ===

PRODUCTS = [
    {
        "id": "prod_1",
        "name": "Ciment 50kg",
        "category": "construction",
        "price": 4500,
        "unit": "sac",
        "seller": "Quincaillerie Moderne",
        "description": "Ciment de haute qualité pour construction",
        "image_url": "🏗️",
        "rating": 4.8,
        "reviews_count": 234,
        "delivery_time": "2h",
        "stock": 150,
        "discount": 10,
        "featured": True,
        "tags": ["construction", "materiel", "promo"]
    },
    {
        "id": "prod_2",
        "name": "Fer à béton 12mm",
        "category": "construction",
        "price": 3200,
        "unit": "barre",
        "seller": "Sidérurgie CI",
        "description": "Fer à béton haute résistance",
        "image_url": "⚒️",
        "rating": 4.6,
        "reviews_count": 189,
        "delivery_time": "3h",
        "stock": 85,
        "discount": 0,
        "featured": False,
        "tags": ["construction", "fer"]
    },
    {
        "id": "prod_3",
        "name": "Paracétamol 500mg",
        "category": "health",
        "price": 500,
        "unit": "boîte",
        "seller": "Pharmacie Santé Plus",
        "description": "Médicament générique anti-douleur",
        "image_url": "💊",
        "rating": 4.9,
        "reviews_count": 456,
        "delivery_time": "1h",
        "stock": 320,
        "discount": 15,
        "featured": True,
        "tags": ["sante", "medicament", "promo"]
    },
    {
        "id": "prod_4",
        "name": "Thermomètre digital",
        "category": "health",
        "price": 2500,
        "unit": "pièce",
        "seller": "Pharmacie Santé Plus",
        "description": "Thermomètre digital précis",
        "image_url": "🌡️",
        "rating": 4.7,
        "reviews_count": 123,
        "delivery_time": "1h",
        "stock": 45,
        "discount": 0,
        "featured": False,
        "tags": ["sante", "materiel"]
    },
    {
        "id": "prod_5",
        "name": "Câble électrique 2.5mm",
        "category": "electronics",
        "price": 1800,
        "unit": "mètre",
        "seller": "Électro Pro",
        "description": "Câble électrique normalisé",
        "image_url": "🔌",
        "rating": 4.5,
        "reviews_count": 98,
        "delivery_time": "2h",
        "stock": 200,
        "discount": 5,
        "featured": False,
        "tags": ["electronique", "cable"]
    },
    {
        "id": "prod_6",
        "name": "Plomberie - Réparation",
        "category": "services",
        "price": 15000,
        "unit": "intervention",
        "seller": "ArtisanCI Pro",
        "description": "Service de plomberie professionnel",
        "image_url": "🔧",
        "rating": 4.9,
        "reviews_count": 567,
        "delivery_time": "Sur RDV",
        "stock": 999,
        "discount": 0,
        "featured": True,
        "tags": ["service", "plomberie"]
    }
]

ORDERS = []

# === ENDPOINTS ===

@router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured_only: bool = False,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """Récupère la liste des produits avec filtres"""
    products = PRODUCTS.copy()
    
    # Filtre par catégorie
    if category and category != "all":
        products = [p for p in products if p["category"] == category]
    
    # Filtre par recherche
    if search:
        search_lower = search.lower()
        products = [p for p in products if 
                   search_lower in p["name"].lower() or 
                   search_lower in p["seller"].lower() or
                   search_lower in p["description"].lower()]
    
    # Filtre featured
    if featured_only:
        products = [p for p in products if p.get("featured", False)]
    
    # Filtre par prix
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    
    return products

@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Récupère un produit spécifique"""
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return product

@router.get("/categories")
async def get_categories():
    """Récupère la liste des catégories avec compteurs"""
    categories = {}
    for product in PRODUCTS:
        cat = product["category"]
        if cat not in categories:
            categories[cat] = {"count": 0, "products": []}
        categories[cat]["count"] += 1
        categories[cat]["products"].append(product["id"])
    
    return {
        "categories": [
            {"id": cat, "name": cat.capitalize(), "count": data["count"]}
            for cat, data in categories.items()
        ]
    }

@router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Crée une nouvelle commande"""
    # Validation des produits
    total = 0
    for item in order_data.items:
        product = next((p for p in PRODUCTS if p["id"] == item.product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail=f"Produit {item.product_id} non trouvé")
        
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant pour {product['name']}")
        
        # Calcul du prix avec réduction
        final_price = product["price"]
        if product.get("discount", 0) > 0:
            final_price = product["price"] * (1 - product["discount"] / 100)
        
        total += final_price * item.quantity
    
    # Création de la commande
    order = {
        "id": str(uuid.uuid4()),
        "user_id": str(uuid.uuid4()),  # En production, récupérer de l'auth
        "user_name": order_data.user_name,
        "user_phone": order_data.user_phone,
        "items": [item.dict() for item in order_data.items],
        "total_amount": total,
        "delivery_address": order_data.delivery_address,
        "payment_method": order_data.payment_method,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "estimated_delivery": "2-3 heures"
    }
    
    ORDERS.append(order)
    
    # Mise à jour du stock
    for item in order_data.items:
        for product in PRODUCTS:
            if product["id"] == item.product_id:
                product["stock"] -= item.quantity
    
    return order

@router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Récupère une commande spécifique"""
    order = next((o for o in ORDERS if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return order

@router.get("/orders")
async def get_orders(user_phone: Optional[str] = None):
    """Récupère les commandes (par téléphone ou toutes)"""
    if user_phone:
        return [o for o in ORDERS if o["user_phone"] == user_phone]
    return ORDERS

@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """Met à jour le statut d'une commande"""
    valid_statuses = ["pending", "confirmed", "delivering", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Options: {valid_statuses}")
    
    for order in ORDERS:
        if order["id"] == order_id:
            order["status"] = status
            return {"message": "Statut mis à jour", "order": order}
    
    raise HTTPException(status_code=404, detail="Commande non trouvée")

@router.get("/stats")
async def get_marketplace_stats():
    """Récupère les statistiques de la marketplace"""
    total_products = len(PRODUCTS)
    total_orders = len(ORDERS)
    total_revenue = sum(o["total_amount"] for o in ORDERS)
    
    # Top catégories
    category_sales = {}
    for order in ORDERS:
        for item in order["items"]:
            product = next((p for p in PRODUCTS if p["id"] == item["product_id"]), None)
            if product:
                cat = product["category"]
                if cat not in category_sales:
                    category_sales[cat] = 0
                category_sales[cat] += item["quantity"]
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": total_revenue / total_orders if total_orders > 0 else 0,
        "top_categories": sorted(category_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    }

@router.post("/products/{product_id}/review")
async def add_review(product_id: str, rating: float, comment: Optional[str] = None):
    """Ajoute un avis sur un produit"""
    if rating < 0 or rating > 5:
        raise HTTPException(status_code=400, detail="Note doit être entre 0 et 5")
    
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Calcul de la nouvelle moyenne
    current_total = product["rating"] * product["reviews_count"]
    new_total = current_total + rating
    product["reviews_count"] += 1
    product["rating"] = round(new_total / product["reviews_count"], 1)
    
    return {
        "message": "Avis ajouté avec succès",
        "new_rating": product["rating"],
        "total_reviews": product["reviews_count"]
    }