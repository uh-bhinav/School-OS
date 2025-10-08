# backend/tests/conftest.py
import asyncio
import os
import sys
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.employment_statuses import router as employment_statuses
from app.api.v1.endpoints.student_contacts import router as student_contacts

# Import and register routers
from app.api.v1.endpoints.teachers import router as teachers
from app.core.security import create_access_token
from app.db.session import db_context, get_db
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.user_roles import UserRole

app.include_router(teachers, prefix="/v1/teachers", tags=["teachers"])
app.include_router(student_contacts, prefix="/v1/student-contacts", tags=["student-contacts"])
app.include_router(employment_statuses, prefix="/v1/employment-statuses", tags=["employment-statuses"])

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


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
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


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
            session = AsyncSession(bind=connection)
            app.dependency_overrides[get_db] = lambda: session
            yield session
            await transaction.rollback()

    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
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
        user_id=uuid.UUID("cb0cf1e2-19d0-4ae3-93ed-3073a47a5058"),
        school_id=1,
        first_name="Priya",
        last_name="Singh",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=1, role_name="Admin"))],
    )


@pytest.fixture(scope="session")
def mock_teacher_profile() -> Profile:
    """Provides a reusable, session-scoped mock teacher profile."""
    return Profile(
        user_id=uuid.uuid4(),  # Use a random UUID for teachers
        school_id=1,
        first_name="Karan",
        last_name="Rao",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )


@pytest.fixture(scope="session")
def superuser_auth_header(mock_admin_profile: Profile) -> dict[str, str]:
    """
    Creates and returns an authentication header for a superuser.
    """
    token = create_access_token(
        subject=str(mock_admin_profile.user_id),
        roles=[role.role_definition.role_name for role in mock_admin_profile.roles],
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def normal_user_auth_header() -> dict[str, str]:
    """
    Creates and returns an authentication header for a regular user (e.g., a student).
    """
    # This creates a token for a user with no special roles.
    token = create_access_token(subject=str(uuid.uuid4()), roles=["Student"])
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def mock_normal_user_profile() -> Profile:
    """Provides a reusable, session-scoped mock profile for a non-admin user."""
    return Profile(
        user_id=uuid.uuid4(),
        school_id=1,
        first_name="Sam",
        last_name="Student",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=3, role_name="Student"))],
    )
