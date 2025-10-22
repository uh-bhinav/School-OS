import uuid
from datetime import date

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile
from app.main import app
from app.models.profile import Profile
from app.models.student import Student
from app.models.teacher import Teacher

SCHOOL_ID = 1


# Note: Using the same ensure_teacher_record helper from the previous test file.
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

    teacher_result = await db_session.execute(
        text("SELECT teacher_id FROM teachers WHERE user_id = :user_id"),
        {"user_id": teacher_user_uuid},
    )
    teacher_id = teacher_result.scalar_one_or_none()

    if not teacher_id:
        teacher = Teacher(user_id=teacher_user_uuid, school_id=SCHOOL_ID)
        db_session.add(teacher)
        await db_session.commit()
        await db_session.refresh(teacher)
        teacher_id = teacher.teacher_id

    return teacher_user_uuid, teacher_id


@pytest.mark.asyncio
async def test_create_single_attendance_record_as_teacher(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests that a Teacher can create a single attendance record for a student.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY for Attendance {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 3,
        "section": "A",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/api/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    period_payload = {
        "school_id": SCHOOL_ID,
        "period_number": 1,
        "period_name": "Morning Session",
        "start_time": "09:00:00",
        "end_time": "09:45:00",
    }
    period_response = await test_client.post("/api/v1/periods/", json=period_payload)
    period_id = period_response.json()["id"]

    # --- Step 2: Manually create the Student ---
    test_user_id = uuid.uuid4()
    test_email = f"test.student.att.{uuid.uuid4()}@schoolos.dev"
    await db_session.execute(
        text("INSERT INTO auth.users (id, email, created_at, updated_at)" " VALUES (:user_id, :email, NOW(), NOW())"),
        {"user_id": test_user_id, "email": test_email},
    )
    await db_session.commit()

    student = Student(user_id=test_user_id, current_class_id=class_id, enrollment_date="2025-09-01")
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)
    student_id = student.student_id

    # --- Step 3: Switch to Teacher and ensure teacher record exists ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    _, teacher_id = await ensure_teacher_record(db_session, mock_teacher_profile)

    # --- Step 4: Create the attendance record ---
    attendance_payload = {
        "student_id": student_id,
        "class_id": class_id,
        "date": date.today().isoformat(),
        "status": "Present",
        "period_id": period_id,
        "teacher_id": teacher_id,
    }

    response = await test_client.post("/api/v1/attendance/", json=attendance_payload)

    # --- Step 5: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["student_id"] == attendance_payload["student_id"]
    assert data["class_id"] == attendance_payload["class_id"]
    assert data["status"] == attendance_payload["status"]
    assert data["teacher_id"] == attendance_payload["teacher_id"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_bulk_attendance_records_as_teacher(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests that a Teacher can create multiple
    attendance records in a single bulk request.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY Bulk Attend {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 3,
        "section": "B",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/api/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    period_payload = {
        "school_id": SCHOOL_ID,
        "period_number": 2,
        "period_name": "Mid-Morning",
        "start_time": "10:00:00",
        "end_time": "10:45:00",
    }
    period_response = await test_client.post("/api/v1/periods/", json=period_payload)
    period_id = period_response.json()["id"]

    # --- Step 2: Manually create multiple Students ---
    student_ids = []
    for i in range(3):
        test_user_id = uuid.uuid4()
        test_email = f"test.student.bulk.att.{i}.{uuid.uuid4()}@schoolos.dev"
        await db_session.execute(
            text("INSERT INTO auth.users (id, email, created_at, updated_at)" " VALUES (:user_id, :email, NOW(), NOW())"),
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

    # --- Step 3: Switch to Teacher for bulk entry ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    _, teacher_id = await ensure_teacher_record(db_session, mock_teacher_profile)

    # --- Step 4: Create the bulk attendance payload ---
    today_str = date.today().isoformat()
    bulk_payload = [
        {
            "student_id": student_ids[0],
            "class_id": class_id,
            "date": today_str,
            "status": "Present",
            "period_id": period_id,
            "teacher_id": teacher_id,
        },
        {
            "student_id": student_ids[1],
            "class_id": class_id,
            "date": today_str,
            "status": "Absent",
            "period_id": period_id,
            "teacher_id": teacher_id,
        },
        {
            "student_id": student_ids[2],
            "class_id": class_id,
            "date": today_str,
            "status": "Late",
            "period_id": period_id,
            "teacher_id": teacher_id,
        },
    ]

    response = await test_client.post("/api/v1/attendance/bulk", json=bulk_payload)

    # --- Step 5: Assertions ---
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(bulk_payload)

    # Verify the contents of the created records
    response_map = {item["student_id"]: item for item in data}
    assert response_map[student_ids[0]]["status"] == "Present"
    assert response_map[student_ids[1]]["status"] == "Absent"
    assert response_map[student_ids[2]]["status"] == "Late"

    for item in data:
        assert item["teacher_id"] == teacher_id

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_attendance_records_by_date_range(
    test_client: AsyncClient,
    db_session: AsyncSession,
    mock_admin_profile: Profile,
    mock_teacher_profile: Profile,
):
    """
    Tests retrieving attendance records for a student within a specific date range.
    """
    # --- Step 1: Use Admin to set up dependencies ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_admin_profile

    ay_payload = {
        "school_id": SCHOOL_ID,
        "name": f"AY Attend Range {uuid.uuid4()}",
        "start_date": "2025-04-01",
        "end_date": "2026-03-31",
    }
    ay_response = await test_client.post("/api/v1/academic-years/", json=ay_payload)
    academic_year_id = ay_response.json()["id"]

    class_payload = {
        "school_id": SCHOOL_ID,
        "grade_level": 4,
        "section": "C",
        "academic_year_id": academic_year_id,
    }
    class_response = await test_client.post("/api/v1/classes/", json=class_payload)
    class_id = class_response.json()["class_id"]

    period_payload = {
        "school_id": SCHOOL_ID,
        "period_number": 3,
        "period_name": "Post-Break",
        "start_time": "11:00:00",
        "end_time": "11:45:00",
    }
    period_response = await test_client.post("/api/v1/periods/", json=period_payload)
    period_id = period_response.json()["id"]

    # --- Step 2: Manually create a Student ---
    test_user_id = uuid.uuid4()
    test_email = f"test.student.att.range.{uuid.uuid4()}@schoolos.dev"
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

    # --- Step 3: Switch to Teacher and create records on different dates ---
    app.dependency_overrides[get_current_user_profile] = lambda: mock_teacher_profile
    _, teacher_id = await ensure_teacher_record(db_session, mock_teacher_profile)

    dates_to_create = ["2025-10-01", "2025-10-03", "2025-10-05", "2025-10-10"]
    for record_date in dates_to_create:
        payload = {
            "student_id": student_id,
            "class_id": class_id,
            "date": record_date,
            "status": "Present",
            "period_id": period_id,
            "teacher_id": teacher_id,
        }
        await test_client.post("/api/v1/attendance/", json=payload)

    # --- Step 4: Make the GET request with a date range ---
    start_date = "2025-10-02"
    end_date = "2025-10-08"
    response = await test_client.get(f"/api/v1/attendance/?student_id={student_id}&start_date={start_date}&end_date={end_date}")

    # --- Step 5: Assertions ---
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

    # We expect to get records for Oct 3rd and Oct 5th, but not Oct 1st or Oct 10th
    assert len(data) == 2

    retrieved_dates = {item["date"] for item in data}
    assert "2025-10-03" in retrieved_dates
    assert "2025-10-05" in retrieved_dates
    assert "2025-10-01" not in retrieved_dates
    assert "2025-10-10" not in retrieved_dates

    app.dependency_overrides.clear()
