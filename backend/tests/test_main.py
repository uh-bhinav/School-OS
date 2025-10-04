# # backend/tests/test_main.py
# import pytest
# from httpx import AsyncClient

# @pytest.mark.asyncio
# async def test_health_check(test_client: AsyncClient):
#     response = await test_client.get("/")
#     assert response.status_code == 200
#     assert response.json() == {"message": "SchoolOS API is running!"}
