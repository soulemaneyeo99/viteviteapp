import pytest
from httpx import AsyncClient
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_get_tickets_admin_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_PREFIX}/admin/tickets")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_pending_tickets_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_PREFIX}/tickets/pending-validation")
    assert response.status_code == 401
