# import pytest
# import uuid
# from httpx import AsyncClient
# from sqlalchemy.ext.asyncio import AsyncSession
# from fastapi import status
# from pydantic import BaseModel
# from typing import Optional, Any, Dict
# from sqlalchemy import update

# from sqlalchemy import select
# # Import the app and dependencies to override
# from app.main import app
# from app.api.deps import get_db_session
# from app.core.security import get_current_user_profile
# from sqlalchemy.orm import selectinload

# # Import our mock profiles from conftest
# from app.models.profile import Profile
# from app.models.academic_year import AcademicYear
# from app.models.class_model import Class
# from app.models.student import Student
# from app.models.mark import Mark
# from app.models.exams import Exam
# from app.models.student_contact import StudentContact

# from app.models.exam_type import ExamType # <-- Add this import
# from app.models.subject import Subject # <-- Add this import
# from sqlalchemy.sql import text

# # Import the response schema for our agent
# # We need to find this in api_with_jwt.py
# # (Assuming it's defined there, or we can define it here)
# from tests.conftest import SCHOOL_ID # Import the school ID
# from app.models.academic_year import AcademicYear
# import datetime


# # Let's define the schemas our test expects
# class AgentChatRequest(BaseModel):
#     query: str
#     session_id: Optional[str] = None

# class AgentChatResponse(BaseModel):
#     response: str
#     session_id: Optional[str] = None


# # Our main test helper function
# async def post_to_agent_chat(
#     client: AsyncClient, # This is the test_client
#     query: str,
#     profile: Profile,
#     db: AsyncSession
# ) -> Dict[str, Any]:
#     """
#     Helper function to post a query to the main L1 agent endpoint
#     with dependency overrides AND the test_client injected.
#     """
#     # 1. Inject the test_client into the app's state
#     app.state.pytest_client = client

#     # 2. Set the dependency overrides
#     app.dependency_overrides[get_current_user_profile] = lambda: profile
#     app.dependency_overrides[get_db_session] = lambda: db

#     # 3. Create the request body
#     chat_request_data = AgentChatRequest(query=query, session_id="test-session")

#     # 4. Call the L1 Root Orchestrator endpoint
#     response = await client.post("/agents/chat", json=chat_request_data.model_dump())

#     # 5. Clean up
#     app.dependency_overrides = {}
#     del app.state.pytest_client

#     # 6. Return the full response and the parsed JSON
#     response_json = {}
#     if response.status_code == 200:
#         try:
#             response_json = response.json()
#         except Exception as e:
#             print(f"Failed to parse JSON response: {e} | Text: {response.text}")
#             response_json = {"response": f"Failed to parse JSON: {response.text}"}
#     else:
#         print(f"Agent query failed with {response.status_code}: {response.text}")
#         try:
#             response_json = response.json()
#         except Exception:
#             response_json = {"detail": response.text}

#     return {"status_code": response.status_code, "json": response_json}

# @pytest.mark.asyncio
# async def test_l4_simple_read_academic_year(
#     test_client: AsyncClient,
#     db_session: AsyncSession,
#     mock_admin_profile: Profile
# ):
#     """
#     Tests a simple read query that must travel the full stack:
#     L1(Root) -> L2(Academics) -> L3(CoreCurriculum) -> L4(AcademicYearAgent)
#     """
#     # --- 1. SETUP ---
#     # We must ensure an active academic year exists in the DB
#     # for the agent's tool to find.
#     active_year_name = f"Test Active Year {uuid.uuid4()}"
#     active_year = AcademicYear(
#         school_id=mock_admin_profile.school_id,
#         name=active_year_name,
#         start_date=datetime.date(2025, 1, 1),
#         end_date=datetime.date(2025, 12, 31),
#         is_active=True
#     )
#     # --- FIX: Deactivate all other active years first ---
#     await db_session.execute(
#         update(AcademicYear)
#         .where(
#             AcademicYear.school_id == mock_admin_profile.school_id,
#             AcademicYear.is_active == True
#         )
#         .values(is_active=False)
#     )
#     # --- END FIX ---

#     db_session.add(active_year)
#     await db_session.commit()

#     # --- 2. EXECUTE ---
#     query = "What is the current year of study?"
#     response = await post_to_agent_chat(
#         client=test_client,
#         query=query,
#         profile=mock_admin_profile,
#         db=db_session
#     )

#     # --- 3. ASSERT ---
#     assert response["status_code"] == status.HTTP_200_OK
#     answer = response["json"]["response"]

#     # Check that the agent's final, natural-language answer
#     # contains the name of the active year.
#     assert active_year_name in answer
#     assert "2025-01-01" in answer # Check that it returned the data

# # @pytest.mark.asyncio
# # async def test_l4_read_with_parent_auth(
# #     test_client: AsyncClient,
# #     db_session: AsyncSession,
# #     mock_parent_profile: Profile,
# #     mock_parent_auth_headers: dict,
# #     test_academic_year: AcademicYear,
# #     test_student: Student  # Use existing fixture to avoid duplicates
# # ):
# #     """
# #     Tests a read query from a Parent, which requires complex authorization.
# #     L1 -> L2(Academics) -> L3(Assessment) -> L4(MarkAgent)
# #     Verifies the API correctly authorizes a linked parent.
# #     """
# #     # --- 1. SETUP ---
# #     # We need to create a Subject, an Exam, and a Mark.
# #     # Then we MUST link the mock_parent_profile to the Student.

# #     # A. Link Parent to Student via StudentContact
# #     student_id = test_student.student_id

# #     contact_link = StudentContact(
# #         student_id=student_id,
# #         profile_user_id=mock_parent_profile.user_id,
# #         name=f"{mock_parent_profile.first_name} {mock_parent_profile.last_name}",
# #         phone="1234567890",
# #         email=f"parent.{uuid.uuid4().hex[:6]}@school.com",
# #         relationship_type="Mother",
# #         is_emergency_contact=True,
# #         is_active=True
# #     )
# #     db_session.add(contact_link)

# #     # B. Create ExamType (required for Exam)
# #     exam_type = ExamType(school_id=SCHOOL_ID, type_name="Test Midterm")
# #     db_session.add(exam_type)
# #     await db_session.flush()

# #     # C. Create Subject
# #     subject = Subject(
# #         school_id=SCHOOL_ID,
# #         name="Test Mathematics",
# #         short_code=f"TM{uuid.uuid4().hex[:4].upper()}"
# #     )
# #     db_session.add(subject)
# #     await db_session.flush()

# #     # D. Create Exam
# #     test_exam = Exam(
# #         school_id=SCHOOL_ID,
# #         exam_name="Test Midterm Exam",
# #         exam_type_id=exam_type.exam_type_id,
# #         start_date=datetime.date(2025, 5, 1),
# #         end_date=datetime.date(2025, 5, 5),
# #         marks=100.0,
# #         academic_year_id=test_academic_year.id,
# #         is_active=True
# #     )
# #     db_session.add(test_exam)
# #     await db_session.flush()

# #     # E. Create the Mark
# #     test_mark = Mark(
# #         school_id=SCHOOL_ID,
# #         student_id=student_id,
# #         exam_id=test_exam.id,
# #         subject_id=subject.subject_id,
# #         marks_obtained=88.5,
# #         max_marks=100.0
# #     )
# #     db_session.add(test_mark)
# #     await db_session.commit()

# #     # Refresh objects to load all attributes
# #     stmt = select(Student).where(
# #         Student.student_id == student_id
# #     ).options(selectinload(Student.profile))

# #     result = await db_session.execute(stmt)
# #     test_student = result.scalar_one()

# #     await db_session.refresh(test_exam)  # Refresh exam too!
# #     await db_session.refresh(test_mark)

# #     # --- 2. EXECUTE ---
# #     # The parent asks about their child's marks using the child's name
# #     # This is how a real parent would ask the question
# #     student_name = f"{test_student.profile.first_name}"  # Get student's first name
# #     query = f"Show me {student_name}'s marks in the Test Midterm Exam"

# #     response = await post_to_agent_chat(
# #         client=test_client,
# #         query=query,
# #         profile=mock_parent_profile,  # We override with the Parent's profile
# #         db=db_session
# #     )

# #     # --- 3. ASSERT ---
# #     assert response["status_code"] == status.HTTP_200_OK
# #     answer = response["json"]["response"]

# #     # Check that the agent's response contains:
# #     # 1. The marks we created (88.5)
# #     # 2. The subject name (Test Mathematics)
# #     # 3. Some indication of the exam or total marks
# #     assert "88.5" in answer or "88.50" in answer, f"Marks not found in response: {answer}"
# #     assert "Mathematics" in answer or "Test Mathematics" in answer, f"Subject not found in response: {answer}"
# #     assert "100" in answer or "out of" in answer.lower(), f"Total marks not indicated in response: {answer}"
