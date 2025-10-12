import uuid

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.student import Student
from app.models.teacher import Teacher

SCHOOL_ID = 1


async def ensure_teacher_record(db_session: AsyncSession, mock_teacher_profile: Profile) -> tuple[uuid.UUID, int]:
    teacher_user_uuid = uuid.UUID(str(mock_teacher_profile.user_id))

    await db_session.execute(
        text(
            """
            INSERT INTO auth.users (id, email, created_at, updated_at)
            VALUES (:user_id, :email, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {
            "user_id": teacher_user_uuid,
            "email": f"test.teacher.{teacher_user_uuid}@schoolos.dev",
        },
    )
    await db_session.commit()

    await db_session.execute(
        text(
            """
            INSERT INTO profiles (user_id, school_id, first_name, last_name, is_active)
            VALUES (:user_id, :school_id, :first_name, :last_name, TRUE)
            ON CONFLICT (user_id) DO NOTHING
            """
        ),
        {
            "user_id": teacher_user_uuid,
            "school_id": SCHOOL_ID,
            "first_name": mock_teacher_profile.first_name,
            "last_name": mock_teacher_profile.last_name,
        },
    )
    await db_session.commit()

    teacher_result = await db_session.execute(select(Teacher).where(Teacher.user_id == teacher_user_uuid))
    teacher = teacher_result.scalars().first()
    if not teacher:
        teacher = Teacher(user_id=teacher_user_uuid, school_id=SCHOOL_ID)
        db_session.add(teacher)
        await db_session.commit()
        await db_session.refresh(teacher)

    teacher_record = await db_session.execute(
        text("SELECT teacher_id FROM teachers WHERE user_id = :user_id"),
        {"user_id": teacher_user_uuid},
    )
    teacher_id = teacher_record.scalar_one()

    return teacher_user_uuid, teacher_id


@pytest.mark.asyncio
async def test_create_single_mark_as_teacher(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests that a Teacher can create a single mark record.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # Create all necessary dependencies for the mark
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Marks {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {
        "school_id": SCHOOL_ID,
        "type_name": f"Mark Entry Test {uuid.uuid4()}",
    }
    et_response = await test_client.post("/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "Mark Creation Exam",
        "exam_type_id": exam_type_id,
        "start_date": "2025-10-01",
        "end_date": "2025-10-10",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    exam_response = await test_client.post("/v1/exams/", json=exam_payload)
    exam_id = exam_response.json()["id"]

    subject_payload = {"school_id": SCHOOL_ID, "name": f"Test Subject {uuid.uuid4()}"}
    subject_response = await test_client.post("/v1/subjects/", json=subject_payload)
    subject_id = subject_response.json()["subject_id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 1,
        "section": "C",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    # --- Step 2: Manually create the Student and its dependencies in the DB ---
    test_user_id = uuid.uuid4()
    test_email = f"test.student.{uuid.uuid4()}@schoolos.dev"

    # Insert a user into auth.users to satisfy
    # the foreign key and trigger profile creation
    await db_session.execute(
        text("INSERT INTO auth.users (id, email, created_at, updated_at)" " VALUES (:user_id, :email, NOW(), NOW())"),
        {"user_id": test_user_id, "email": test_email},
    )
    # The trigger will auto-create the profile, so we need to commit to see it
    await db_session.commit()

    # Create the Student record, which links to the auto-created profile
    student = Student(
        user_id=test_user_id,
        current_class_id=class_id,
        enrollment_date="2025-09-01",
    )
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)
    student_id = student.student_id

    # --- Step 3: Switch to Teacher for mark entry ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    await ensure_teacher_record(db_session, mock_teacher_profile)

    mark_payload = {
        "school_id": SCHOOL_ID,
        "student_id": student_id,
        "exam_id": exam_id,
        "subject_id": subject_id,
        "marks_obtained": 88.5,
        "max_marks": 100.0,
    }
    response = await test_client.post("/v1/marks/", json=mark_payload)

    # --- Step 4: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["student_id"] == mark_payload["student_id"]
    assert float(data["marks_obtained"]) == mark_payload["marks_obtained"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_bulk_marks_as_teacher(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests that a Teacher can create multiple mark records in a single bulk request.
    Verifies that the entered_by_teacher_id is correctly set.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    # Create common dependencies
    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY Bulk Marks {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {"school_id": SCHOOL_ID, "type_name": f"Bulk Mark Test {uuid.uuid4()}"}
    et_response = await test_client.post("/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "Bulk Mark Creation Exam",
        "exam_type_id": exam_type_id,
        "start_date": "2025-10-01",
        "end_date": "2025-10-10",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    exam_response = await test_client.post("/v1/exams/", json=exam_payload)
    exam_id = exam_response.json()["id"]

    subject_payload = {
        "school_id": SCHOOL_ID,
        "name": f"Bulk Test Subject {uuid.uuid4()}",
    }
    subject_response = await test_client.post("/v1/subjects/", json=subject_payload)
    subject_id = subject_response.json()["subject_id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 2,
        "section": "D",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    # --- Step 2: Manually create multiple Students in the DB ---
    student_ids = []
    for i in range(3):
        test_user_id = uuid.uuid4()
        test_email = f"test.student.bulk.{i}.{uuid.uuid4()}@schoolos.dev"
        await db_session.execute(
            text("INSERT INTO auth.users (id, email, created_at, updated_at) " "VALUES (:user_id, :email, NOW(), NOW())"),
            {"user_id": test_user_id, "email": test_email},
        )
        await db_session.commit()

        student = Student(
            user_id=test_user_id,
            current_class_id=class_id,
            enrollment_date="2025-09-01",
        )
        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)
        student_ids.append(student.student_id)

    # --- Step 3: Switch to Teacher for bulk mark entry ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile

    teacher_user_uuid, teacher_id = await ensure_teacher_record(db_session, mock_teacher_profile)

    bulk_marks_payload = [
        {
            "school_id": SCHOOL_ID,
            "student_id": student_ids[0],
            "exam_id": exam_id,
            "subject_id": subject_id,
            "marks_obtained": 95.0,
            "max_marks": 100.0,
        },
        {
            "school_id": SCHOOL_ID,
            "student_id": student_ids[1],
            "exam_id": exam_id,
            "subject_id": subject_id,
            "marks_obtained": 82.5,
            "max_marks": 100.0,
        },
        {
            "school_id": SCHOOL_ID,
            "student_id": student_ids[2],
            "exam_id": exam_id,
            "subject_id": subject_id,
            "marks_obtained": 76.0,
            "max_marks": 100.0,
        },
    ]
    response = await test_client.post("/v1/marks/bulk", json=bulk_marks_payload)

    # --- Step 4: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(bulk_marks_payload)

    # Verify entered_by_teacher_id is set correctly for all created marks
    for mark in data:
        assert mark["student_id"] in student_ids
        assert mark["entered_by_teacher_id"] == teacher_id

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_student_marks_for_report_card(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests retrieving all marks for a specific student and exam,
    simulating a report card generation request.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY Report Card {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    et_payload = {
        "school_id": SCHOOL_ID,
        "type_name": f"Report Card Test {uuid.uuid4()}",
    }
    et_response = await test_client.post("/v1/exam-types/", json=et_payload)
    exam_type_id = et_response.json()["exam_type_id"]

    exam_payload = {
        "school_id": SCHOOL_ID,
        "exam_name": "Final Exam for Report Card",
        "exam_type_id": exam_type_id,
        "start_date": "2026-03-01",
        "end_date": "2026-03-10",
        "marks": 100.0,
        "academic_year_id": academic_year_id,
    }
    exam_response = await test_client.post("/v1/exams/", json=exam_payload)
    exam_id = exam_response.json()["id"]

    # Create multiple subjects
    subject_1_payload = {"school_id": SCHOOL_ID, "name": f"Math Report {uuid.uuid4()}"}
    subject_1_response = await test_client.post("/v1/subjects/", json=subject_1_payload)
    subject_1_id = subject_1_response.json()["subject_id"]

    subject_2_payload = {
        "school_id": SCHOOL_ID,
        "name": f"Science Report {uuid.uuid4()}",
    }
    subject_2_response = await test_client.post("/v1/subjects/", json=subject_2_payload)
    subject_2_id = subject_2_response.json()["subject_id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 5,
        "section": "A",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    # --- Step 2: Manually create the Student ---
    test_user_id = uuid.uuid4()
    test_email = f"test.student.report.{uuid.uuid4()}@schoolos.dev"
    await db_session.execute(
        text("INSERT INTO auth.users (id, email, created_at, updated_at) " "VALUES (:user_id, :email, NOW(), NOW())"),
        {"user_id": test_user_id, "email": test_email},
    )
    await db_session.commit()

    student = Student(user_id=test_user_id, current_class_id=class_id, enrollment_date="2025-09-01")
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)
    student_id = student.student_id

    # --- Step 3: Switch to Teacher and create multiple marks for the student ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    _, teacher_id = await ensure_teacher_record(db_session, mock_teacher_profile)

    marks_to_create = [
        {"subject_id": subject_1_id, "marks_obtained": 92.0},
        {"subject_id": subject_2_id, "marks_obtained": 88.5},
    ]

    for mark in marks_to_create:
        mark_payload = {
            "school_id": SCHOOL_ID,
            "student_id": student_id,
            "exam_id": exam_id,
            "subject_id": mark["subject_id"],
            "marks_obtained": mark["marks_obtained"],
            "max_marks": 100.0,
        }
        await test_client.post("/v1/marks/", json=mark_payload)

    # --- Step 4: Make the GET request to fetch the report card data ---
    response = await test_client.get(f"/v1/marks/?student_id={student_id}&exam_id={exam_id}")

    # --- Step 5: Assertions ---
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2

    # Verify the contents of the fetched marks
    retrieved_marks = sorted(data, key=lambda x: x["subject_id"])
    assert retrieved_marks[0]["subject_id"] == subject_1_id
    assert float(retrieved_marks[0]["marks_obtained"]) == 92.0
    assert retrieved_marks[0]["student_id"] == student_id
    assert retrieved_marks[0]["exam_id"] == exam_id
    assert retrieved_marks[0]["entered_by_teacher_id"] == teacher_id

    assert retrieved_marks[1]["subject_id"] == subject_2_id
    assert float(retrieved_marks[1]["marks_obtained"]) == 88.5
    assert retrieved_marks[1]["student_id"] == student_id
    assert retrieved_marks[1]["exam_id"] == exam_id
    assert retrieved_marks[1]["entered_by_teacher_id"] == teacher_id

    app.dependency_overrides.clear()
