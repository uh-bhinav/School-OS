# backend/tests/test_main.py
import pytest
from httpx import ASGITransport, AsyncClient  # Import ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    # Use ASGITransport to connect the client directly to the app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "SchoolOS API is running!"}
