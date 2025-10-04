# backend/tests/conftest.py
import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import db_context, get_db
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole


@pytest_asyncio.fixture(scope="session", autouse=True)
async def lifespan_manager():
    """
    This is a session-scoped fixture that runs the application's
    lifespan events (startup/shutdown) once for all tests.
    'autouse=True' means it runs automatically.
    """
    async with app.router.lifespan_context(app):
        yield


@pytest_asyncio.fixture(scope="session")
async def test_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Primary test fixture to create an AsyncClient that handles the
    FastAPI app's lifespan events (startup/shutdown).
    """
    # This 'async with' block is CRUCIAL. It enters the app's lifespan
    # context, running the startup events before yielding the client.
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    # After all tests in the session are done, it exits the context,
    # running the shutdown events.


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides a transactional database session for a single test function.
    Rolls back all changes after the test completes.
    """
    engine = db_context.get("engine")
    if not engine:
        raise RuntimeError("Database engine not initialized.")

    async with engine.connect() as connection:
        async with connection.begin() as transaction:
            # Create a session that is bound to this transaction
            session = AsyncSession(bind=connection)

            # Override the app's get_db dependency to use our new session
            app.dependency_overrides[get_db] = lambda: session

            yield session

            # After the test, the transaction is automatically rolled back
            await transaction.rollback()

    # Clean up the override
    app.dependency_overrides.clear()


# This is needed for session-scoped async fixtures.
@pytest_asyncio.fixture(scope="session")
def event_loop():
    """
    Creates an instance of the default event loop for each test session.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def mock_admin_profile() -> Profile:
    """Provides a reusable, session-scoped mock admin profile."""
    return Profile(
        user_id="cb0cf1e2-19d0-4ae3-93ed-3073a47a5058",
        school_id=1,  # Corresponds to VALID_SCHOOL_ID
        first_name="Priya",
        last_name="Singh",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=1, role_name="Admin"))],
    )
