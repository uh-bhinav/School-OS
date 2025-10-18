# backend/tests/conftest.py
"""
Hybrid Test Fixtures - Supports BOTH Async and Sync Tests

- ASYNC fixtures: For existing tests (teammates' tests)
- SYNC fixtures: For order service integration tests
"""

import asyncio
import os
import sys
import uuid
from typing import AsyncGenerator
from uuid import UUID

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import db_context, get_db
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.school import School
from app.models.student import Student
from app.models.user_roles import UserRole

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest_asyncio.fixture(scope="session", autouse=True)
async def lifespan_manager():
    """
    Session-scoped fixture that runs the application's
    lifespan events (startup/shutdown) once for all tests.
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
    ASYNC database session for existing tests.
    Provides a transactional database session that rolls back after test.
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
        school_id=1,
        first_name="Priya",
        last_name="Singh",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=1, role_name="Admin"))],
    )


@pytest.fixture(scope="session")
def mock_teacher_profile() -> Profile:
    """Provides a reusable mock teacher profile."""
    return Profile(
        user_id="6d2c3e0b-42e8-4e1c-8b97-d1c9f77f9f2a",
        school_id=1,
        first_name="Ravi",
        last_name="Kumar",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=2, role_name="Teacher"))],
    )


@pytest.fixture(scope="session")
def mock_parent_profile() -> Profile:
    """Returns a mock profile object for a Parent user."""
    return Profile(
        user_id="de6535a5-6cc7-4740-a6b0-e5b7eb2cfaac",
        school_id=1,
        first_name="Kavya",
        last_name="Joshi",
        is_active=True,
        roles=[UserRole(role_definition=RoleDefinition(role_id=4, role_name="Parent"))],
    )


# ===========================================================================
# == CORRECTED ASYNC FIXTURES for Order Service Tests ==
# ===========================================================================
#
# These fixtures replace the old "..._sync" versions. They are fully async
# and fetch real data from your pre-populated database, which is a robust
# pattern for integration testing.


# NOTE: The 'db_session' fixture is already correctly defined earlier in your conftest.
# You will simply replace `db_session_sync` with `db_session` in your test files.


@pytest_asyncio.fixture
async def parent_profile(db_session: AsyncSession) -> Profile:
    """
    [Replaces parent_profile_sync]
    Fetches the specific test parent profile for Sunita Gupta.
    - user_id: da134162-0d5d-4215-b93b-aefb747ffa17
    """
    profile = await db_session.get(Profile, UUID("1ef75d00-3349-4274-8bc8-da135015ab5d"))
    if not profile:
        raise RuntimeError("Test parent profile 'Sunita Gupta' not found in database. Ensure it is seeded.")
    return profile


@pytest_asyncio.fixture
async def student_22(db_session: AsyncSession) -> Student:
    """
    [Replaces student_22_sync]
    Fetches the specific test student with student_id 22 (Diya Patel).
    """
    student = await db_session.get(Student, 22)
    if not student:
        raise RuntimeError("Test student with ID 22 not found in database. Ensure it is seeded.")
    return student


@pytest_asyncio.fixture
async def parent_profile_1(db_session: AsyncSession) -> Profile:
    """
    [Replaces parent_profile_1_sync]
    Fetches the FIRST parent for the concurrency test (Hitesh Patel).
    - user_id: 1ef75d00-3349-4274-8bc8-da135015ab5d
    """
    profile = await db_session.get(Profile, UUID("1ef75d00-3349-4274-8bc8-da135015ab5d"))
    if not profile:
        raise RuntimeError("Test parent profile 'Hitesh Patel' not found in database.")
    return profile


@pytest_asyncio.fixture
async def parent_profile_2(db_session: AsyncSession) -> Profile:
    """
    [Replaces parent_profile_2_sync]
    Fetches the SECOND parent for the concurrency test (Pooja Patel).
    - user_id: e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404
    """
    profile = await db_session.get(Profile, UUID("e8ea87e7-dbb3-44b1-8dbc-c7a06d3a1404"))
    if not profile:
        raise RuntimeError("Test parent profile 'Pooja Patel' not found in database.")
    return profile


@pytest_asyncio.fixture
async def student_23(db_session: AsyncSession) -> Student:
    """
    [Replaces student_23_sync]
    Fetches the SECOND student for the concurrency test (Rohan Kumar).
    """
    student = await db_session.get(Student, 23)
    if not student:
        raise RuntimeError("Test student with ID 23 not found in database.")
    return student


@pytest_asyncio.fixture
async def mock_admin_profile_school_2(db_session: AsyncSession) -> Profile:
    """
    Provides the specific admin profile for School 2 based on provided data.
    Ensures the school and profile exist.
    user_id: 3e163ee6-cd91-4d63-8bc1-189cc0d13860
    school_id: 2
    """
    school_id_2 = 2
    admin_user_id_2 = uuid.UUID("3e163ee6-cd91-4d63-8bc1-189cc0d13860")

    # 1. Ensure School 2 exists
    school_2 = await db_session.get(School, school_id_2)
    if not school_2:
        print(f"INFO: Creating School with school_id={school_id_2} for fixture")
        school_2 = School(school_id=school_id_2, school_name="Test School Springfield", is_active=True)
        db_session.add(school_2)
        # Rely on test transaction rollback/commit

    # 2. Check if the specific admin profile exists
    admin_profile_2 = await db_session.get(Profile, admin_user_id_2)

    if not admin_profile_2:
        print(f"INFO: Creating mock admin profile for school_id={school_id_2} with specific UUID")
        admin_profile_2 = Profile(
            user_id=admin_user_id_2,
            school_id=school_id_2,
            first_name="Admin",
            last_name="Springfield",
            phone_number="+91-9876543210",  # Add phone if needed by model
            email=f"admin_springfield_{admin_user_id_2}@example.com",  # Ensure unique email
            is_active=True,
            # Add other fields from your data if they exist in the model
        )
        db_session.add(admin_profile_2)
        await db_session.flush()  # Make sure it's added before returning
        print(f"INFO: Created profile {admin_profile_2.user_id} for school {admin_profile_2.school_id}")
    elif admin_profile_2.school_id != school_id_2:
        # Data integrity issue: Profile exists but belongs to the wrong school
        raise RuntimeError(f"Fixture Error: Profile {admin_user_id_2} exists but belongs to school {admin_profile_2.school_id}, not school {school_id_2}")
    else:
        print(f"INFO: Found existing profile {admin_profile_2.user_id} for school {admin_profile_2.school_id}")

    # Ensure profile is active for the test
    admin_profile_2.is_active = True
    await db_session.flush()

    # It's crucial to return the object fetched/created within the current session
    # Re-fetch just to be absolutely sure it's session-managed correctly
    refetched_profile = await db_session.get(Profile, admin_user_id_2)
    if not refetched_profile:
        raise RuntimeError(f"Fixture Error: Failed to fetch profile {admin_user_id_2} after creation/check.")

    return refetched_profile
