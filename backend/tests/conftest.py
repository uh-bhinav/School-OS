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
from collections.abc import AsyncGenerator
from unittest.mock import MagicMock
from uuid import UUID

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.employment_statuses import router as employment_statuses
from app.api.v1.endpoints.student_contacts import router as student_contacts

# Import and register routers
from app.api.v1.endpoints.teachers import router as teachers
from app.core.security import create_access_token, get_current_user_profile, require_role
from app.db.session import db_context, get_db, init_engine
from app.main import app
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.school import School
from app.models.student import Student
from app.models.user_roles import UserRole

app.include_router(teachers, prefix="/v1/teachers", tags=["teachers"])
app.include_router(student_contacts, prefix="/v1/student-contacts", tags=["student-contacts"])
app.include_router(employment_statuses, prefix="/v1/employment-statuses", tags=["employment-statuses"])

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest_asyncio.fixture(scope="session", autouse=True)
async def initialize_database():
    """
    Initializes the database engine once before any tests run.
    Ensures db_context['engine'] and SessionLocal are available.
    """
    init_engine()  # sets up db_context['engine'] and ['SessionLocal']
    yield


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
def mock_admin_profile_1() -> Profile:
    """Provides a reusable, session-scoped mock admin profile."""
    return Profile(
        user_id="3e163ee6-cd91-4d63-8bc1-189cc0d13860",
        school_id=2,  # Corresponds to VALID_SCHOOL_ID
        first_name="Admin",
        last_name="Springfield",
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


@pytest.fixture(scope="session")
def admin_token(mock_admin_profile: Profile) -> str:
    """
    Creates and returns a JWT access token for the mock admin profile.
    """
    return create_access_token(subject=str(mock_admin_profile.user_id))


@pytest.fixture(scope="session")
def parent_token(mock_parent_profile: Profile) -> str:
    """
    Creates and returns a JWT access token for the mock parent profile.
    """
    return create_access_token(subject=str(mock_parent_profile.user_id))


@pytest.fixture(scope="session")
def teacher_token(mock_teacher_profile: Profile) -> str:
    """
    Creates and returns a JWT access token for the mock teacher profile.
    """
    return create_access_token(subject=str(mock_teacher_profile.user_id))


@pytest_asyncio.fixture(scope="function")
async def test_client_admin_security_override() -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an AsyncClient where the 'require_role("Admin")' dependency
    is temporarily disabled (mocked) for a single test.
    """

    # This is a simple function that does nothing, effectively bypassing the security check
    def mock_require_admin():
        pass

    # Temporarily override the dependency for the app
    app.dependency_overrides[require_role("Admin")] = mock_require_admin

    # Yield the test client with the override in place
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clean up the override after the test is done to avoid affecting other tests
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_client_authenticated_admin(mock_admin_profile: Profile) -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an AsyncClient where the get_current_user dependency is
    overridden to always return a mock admin profile.
    This completely bypasses real authentication for the test.
    """

    # This is our mock dependency function. It simply returns the admin profile.
    async def mock_get_current_admin() -> Profile:
        return mock_admin_profile

    # Temporarily override the real get_current_user with our mock
    app.dependency_overrides[get_current_user_profile] = mock_get_current_admin

    # Yield the test client with the override in place
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clean up the override after the test is done
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_client_authenticated_parent(mock_parent_profile: Profile) -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an AsyncClient where get_current_user is overridden
    to always return a mock parent profile.
    """

    # Our mock dependency that returns the parent profile
    async def mock_get_current_parent() -> Profile:
        return mock_parent_profile

    # Temporarily override the real dependency
    app.dependency_overrides[get_current_user_profile] = mock_get_current_parent

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clean up the override
    app.dependency_overrides.clear()


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


@pytest.fixture(scope="session", autouse=True)
def load_env():
    load_dotenv(".env.test")


@pytest.fixture
def mock_razorpay_client(mocker) -> MagicMock:  # Use 'mocker' fixture
    """
    Mocks the razorpay.Client to avoid hitting the real API in tests.
    Returns predefined data for order creation.
    """
    # Create a mock object for the Razorpay client instance
    mock_instance = MagicMock()

    # Configure the mock 'order.create' method to return specific data
    mock_instance.order.create.return_value = {"id": "order_MOCK123456789", "amount": 1500000, "currency": "INR", "status": "created"}  # A predictable mock order ID  # Example amount in paise

    # Configure the mock 'payment.fetch' method (needed for verify_payment)
    mock_instance.payment.fetch.return_value = {"id": "pay_MOCK_SUCCESS", "method": "card", "notes": {"internal_payment_id": 1}}  # Example notes

    # Configure the mock 'utility.verify_payment_signature'
    # By default, it will do nothing (simulate success)
    mock_instance.utility.verify_payment_signature.return_value = None

    # Configure the mock 'utility.verify_webhook_signature'
    mock_instance.utility.verify_webhook_signature.return_value = None

    # Patch the razorpay.Client class to return our mock instance when called
    mocker.patch("razorpay.Client", return_value=mock_instance)

    # Return the mock instance itself so tests can make assertions on it
    return mock_instance


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
