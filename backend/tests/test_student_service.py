import json
import os

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.services import student_service

# Load environment variables from .env file
load_dotenv()

# It's recommended to use a separate test database or schema
# For this example, we use the main DB URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create an async engine and session factory
async_engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionFactory = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


async def impersonate_user(session: AsyncSession, claims: dict):
    """Sets the request.jwt.claims for the current transaction."""
    claims_str = json.dumps(claims)
    await session.execute(text(f"SET request.jwt.claims = '{claims_str}'"))


@pytest_asyncio.fixture(scope="function")
async def async_session() -> AsyncSession:
    """
    Fixture that provides a transactional session for each test function.
    Rolls back the transaction after the test is complete.
    """
    session = AsyncSessionFactory()
    await session.begin()
    try:
        yield session
    finally:
        await session.rollback()
        await session.close()


@pytest.mark.asyncio
class TestStudentServiceRLS:
    """
    Tests the student_service functions with Row-Level Security (RLS)
    by impersonating users with different roles and school affiliations.
    """

    async def test_get_student_allowed(self, async_session: AsyncSession):
        """
        A user from school 1 should be able to retrieve a student from school 1.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Teacher"]})

        # ACT: Try to get a student from the same school (assuming student_id=1 exists in school 1)
        student = await student_service.get_student(async_session, student_id=1)

        # ASSERT: The student should be found
        assert student is not None
        assert student.student_id == 1
        # The RLS policy is on the `profiles` table, joined by `students`.
        # We expect the profile's school_id to match.
        assert student.profile.school_id == 1

    async def test_get_student_denied(self, async_session: AsyncSession):
        """
        A user from school 1 should NOT be able to retrieve a student from school 2.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Teacher"]})

        # ACT: Try to get a student from another school (assuming student_id=2 exists in school 2)
        student = await student_service.get_student(async_session, student_id=2)

        # ASSERT: The student should not be found due to RLS
        assert student is None

    async def test_search_students_returns_only_school_specific_results(self, async_session: AsyncSession):
        """
        Searching for students should only return results from the user's school.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Admin"]})

        # ACT: Search for all students without specific criteria
        students = await student_service.search_students(async_session, school_id=1)

        # ASSERT: All returned students must belong to school 1
        assert students
        for student in students:
            assert student.profile.school_id == 1

    async def test_search_students_denied_for_other_school(self, async_session: AsyncSession):
        """
        A user from school 1 searching for students in school 2 should get no results.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Admin"]})

        # ACT: Explicitly search for students in another school
        students = await student_service.search_students(async_session, school_id=2)

        # ASSERT: RLS should prevent any rows from being returned, so the list is empty
        assert not students

    async def test_get_all_students_for_class_allowed(self, async_session: AsyncSession):
        """
        A user should be able to get all students for a class within their own school.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Teacher"]})

        # ACT: Get students for a class in school 1 (assuming class_id=1 exists in school 1)
        students = await student_service.get_all_students_for_class(async_session, class_id=1)

        # ASSERT: The list should contain students, and all should be from school 1
        assert students
        for student in students:
            assert student.profile.school_id == 1

    async def test_get_all_students_for_class_denied(self, async_session: AsyncSession):
        """
        A user from school 1 should not get any students for a class in school 2.
        """
        # ARRANGE: Impersonate a user from school 1
        await impersonate_user(async_session, {"school_id": 1, "roles": ["Teacher"]})

        # ACT: Try to get students for a class in school 2 (assuming class_id=2 exists in school 2)
        students = await student_service.get_all_students_for_class(async_session, class_id=2)

        # ASSERT: The list should be empty due to RLS
        assert not students

    async def test_unauthenticated_user_gets_no_results(self, async_session: AsyncSession):
        """
        A request with no authentication (no claims set) should return no results.
        """
        # ARRANGE: No impersonation is done. The `request.jwt.claims` is not set.

        # ACT: Try to get a student
        student = await student_service.get_student(async_session, student_id=1)

        # ASSERT: Should return None as RLS policy will not find a matching school_id
        assert student is None

        # ACT: Try to search for students
        students = await student_service.search_students(async_session, school_id=1)

        # ASSERT: Should return an empty list
        assert not students
