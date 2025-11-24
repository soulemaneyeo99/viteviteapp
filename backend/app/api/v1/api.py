"""
ViteviteApp - API Router v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    services,
    tickets,
    admin,
    auth,
    users,
    ai,
    predictions,
    chat,
    pharmacies,
    transport,
    maps,
    counters,
    queue_management,
    verification,
    service_config,
    notifications,
    analytics,
)
api_router = APIRouter()
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(pharmacies.router, prefix="/pharmacies", tags=["pharmacies"])
api_router.include_router(transport.router, prefix="/transport", tags=["transport"])
api_router.include_router(maps.router, prefix="/maps", tags=["maps"])
api_router.include_router(counters.router, prefix="/counters", tags=["counters"])
api_router.include_router(queue_management.router, prefix="/queue", tags=["queue-management"])
api_router.include_router(verification.router, prefix="/verification", tags=["verification"])
api_router.include_router(service_config.router, prefix="/config", tags=["service-config"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}