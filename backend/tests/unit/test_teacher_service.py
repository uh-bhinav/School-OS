# backend/tests/unit/test_teacher_service.py
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.timetable import Timetable
from app.schemas.teacher_schema import TeacherQualification, TeacherUpdate
from app.services import teacher_service

# --- Happy Path Tests ---


@pytest.mark.asyncio
async def test_get_teacher_happy_path():
    """
    Happy Path: Unit test for get_teacher when the teacher is found.
    """
    mock_db = AsyncMock()
    teacher_id = 1
    mock_teacher_instance = Teacher(
        teacher_id=teacher_id,
        user_id=uuid.uuid4(),
        department="Science",
        is_active=True,
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_teacher_instance
    mock_db.execute.return_value = mock_result

    result_teacher = await teacher_service.get_teacher(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert result_teacher is not None
    assert result_teacher.teacher_id == teacher_id


@pytest.mark.asyncio
async def test_get_all_teachers_for_school_happy_path():
    """
    Happy Path: Unit test for get_all_teachers_for_school.
    """
    mock_db = AsyncMock()
    school_id = 1
    mock_teachers = [
        Teacher(teacher_id=1, user_id=uuid.uuid4(), is_active=True),
        Teacher(teacher_id=2, user_id=uuid.uuid4(), is_active=True),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_teachers
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_all_teachers_for_school(db=mock_db, school_id=school_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].teacher_id == 1


@pytest.mark.asyncio
async def test_update_teacher_happy_path():
    """
    Happy Path: Unit test for update_teacher to ensure attributes are updated.
    """
    mock_db = AsyncMock()
    teacher_id = 1
    mock_db_teacher = MagicMock(spec=Teacher)
    mock_db_teacher.teacher_id = teacher_id
    mock_db_teacher.department = "Math"

    update_schema = TeacherUpdate(department="Science", subject_specialization="Physics")

    # Mock the re-fetch after commit
    mock_updated_teacher = MagicMock(spec=Teacher)
    mock_updated_teacher.teacher_id = teacher_id
    mock_updated_teacher.department = "Science"
    mock_updated_teacher.subject_specialization = "Physics"

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_updated_teacher
    mock_db.execute.return_value = mock_result

    updated_teacher = await teacher_service.update_teacher(db=mock_db, db_obj=mock_db_teacher, teacher_in=update_schema)

    assert mock_db_teacher.department == "Science"
    assert mock_db_teacher.subject_specialization == "Physics"
    mock_db.add.assert_called_with(mock_db_teacher)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_db_teacher)
    assert updated_teacher == mock_updated_teacher


@pytest.mark.asyncio
async def test_deactivate_teacher_happy_path():
    """
    Happy Path: Unit test for deactivate_teacher when the teacher is active.
    """
    mock_db = AsyncMock()
    teacher_id = 1

    mock_profile = MagicMock(spec=Profile)
    mock_profile.is_active = True

    mock_teacher = MagicMock(spec=Teacher)
    mock_teacher.teacher_id = teacher_id
    mock_teacher.is_active = True
    mock_teacher.profile = mock_profile

    # Mock the re-fetch after commit
    mock_deactivated_teacher = MagicMock(spec=Teacher)
    mock_deactivated_teacher.teacher_id = teacher_id
    mock_deactivated_teacher.is_active = False

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_deactivated_teacher
    mock_db.execute.return_value = mock_result

    result = await teacher_service.deactivate_teacher(db=mock_db, db_obj=mock_teacher)

    assert mock_teacher.is_active is False
    assert mock_profile.is_active is False
    mock_db.add.assert_any_call(mock_profile)
    mock_db.add.assert_any_call(mock_teacher)
    mock_db.commit.assert_awaited_once()
    assert result == mock_deactivated_teacher


@pytest.mark.asyncio
async def test_assign_class_teacher_happy_path():
    """
    Happy Path: Unit test for assign_class_teacher.
    """
    mock_db = AsyncMock()
    teacher_id = 1
    class_id = 5

    mock_teacher = MagicMock(spec=Teacher)
    mock_teacher.teacher_id = teacher_id

    mock_class = MagicMock(spec=Class)
    mock_class.class_id = class_id
    mock_class.class_teacher_id = None

    result = await teacher_service.assign_class_teacher(db=mock_db, teacher=mock_teacher, class_obj=mock_class)

    assert mock_class.class_teacher_id == teacher_id
    mock_db.add.assert_called_with(mock_class)
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once_with(mock_class)
    assert result == mock_class


@pytest.mark.asyncio
async def test_get_teacher_timetable_happy_path():
    """
    Happy Path: Unit test for get_teacher_timetable.
    """
    mock_db = AsyncMock()
    teacher_id = 1
    academic_year_id = 1

    mock_timetable_entries = [
        Timetable(
            id=1,
            teacher_id=teacher_id,
            academic_year_id=academic_year_id,
            day_of_week=1,
            school_id=1,
            is_active=True,
        ),
        Timetable(
            id=2,
            teacher_id=teacher_id,
            academic_year_id=academic_year_id,
            day_of_week=2,
            school_id=1,
            is_active=True,
        ),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_timetable_entries
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_teacher_timetable(db=mock_db, teacher_id=teacher_id, academic_year_id=academic_year_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].teacher_id == teacher_id
    assert result[1].teacher_id == teacher_id


@pytest.mark.asyncio
async def test_get_proctored_students_happy_path():
    """
    Happy Path: Unit test for get_proctored_students.
    """
    mock_db = AsyncMock()
    teacher_id = 1

    mock_students = [
        Student(
            student_id=1,
            user_id=uuid.uuid4(),
            proctor_teacher_id=teacher_id,
            is_active=True,
        ),
        Student(
            student_id=2,
            user_id=uuid.uuid4(),
            proctor_teacher_id=teacher_id,
            is_active=True,
        ),
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_students
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_proctored_students(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert all(s.proctor_teacher_id == teacher_id for s in result)


@pytest.mark.asyncio
async def test_get_teacher_qualifications_happy_path():
    """
    Happy Path: Unit test for get_teacher_qualifications when teacher exists.
    """
    mock_db = AsyncMock()
    teacher_id = 1

    mock_teacher = Teacher(
        teacher_id=teacher_id,
        user_id=uuid.uuid4(),
        years_of_experience=5,
        qualifications=[{"degree": "M.Sc. Physics", "institution": "University of Science"}],
        is_certified=True,
    )

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_teacher
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_teacher_qualifications(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert isinstance(result, TeacherQualification)


# --- Sad Path Tests ---


@pytest.mark.asyncio
async def test_get_teacher_not_found():
    """
    Sad Path: Unit test for get_teacher when the teacher does not exist.
    """
    mock_db = AsyncMock()
    teacher_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result_teacher = await teacher_service.get_teacher(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert result_teacher is None


@pytest.mark.asyncio
async def test_get_all_teachers_for_school_empty():
    """
    Sad Path: Unit test for get_all_teachers_for_school when no teachers exist.
    """
    mock_db = AsyncMock()
    school_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_all_teachers_for_school(db=mock_db, school_id=school_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 0


@pytest.mark.asyncio
async def test_deactivate_teacher_without_profile():
    """
    Sad Path: Unit test for deactivate_teacher when teacher has no profile.
    """
    mock_db = AsyncMock()
    teacher_id = 1

    mock_teacher = MagicMock(spec=Teacher)
    mock_teacher.teacher_id = teacher_id
    mock_teacher.is_active = True
    mock_teacher.profile = None

    mock_deactivated_teacher = MagicMock(spec=Teacher)
    mock_deactivated_teacher.teacher_id = teacher_id
    mock_deactivated_teacher.is_active = False

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = mock_deactivated_teacher
    mock_db.execute.return_value = mock_result

    result = await teacher_service.deactivate_teacher(db=mock_db, db_obj=mock_teacher)

    assert mock_teacher.is_active is False
    mock_db.add.assert_called_with(mock_teacher)
    mock_db.commit.assert_awaited_once()
    assert result == mock_deactivated_teacher


@pytest.mark.asyncio
async def test_get_teacher_timetable_empty():
    """
    Sad Path: Unit test for get_teacher_timetable when no timetable entries exist.
    """
    mock_db = AsyncMock()
    teacher_id = 999
    academic_year_id = 1

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_teacher_timetable(db=mock_db, teacher_id=teacher_id, academic_year_id=academic_year_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 0


@pytest.mark.asyncio
async def test_get_proctored_students_empty():
    """
    Sad Path: Unit test for get_proctored_students when teacher has no students.
    """
    mock_db = AsyncMock()
    teacher_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_proctored_students(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 0


@pytest.mark.asyncio
async def test_get_teacher_qualifications_not_found():
    """
    Sad Path: Unit test for get_teacher_qualifications when teacher doesn't exist.
    """
    mock_db = AsyncMock()
    teacher_id = 999

    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result

    result = await teacher_service.get_teacher_qualifications(db=mock_db, teacher_id=teacher_id)

    mock_db.execute.assert_awaited_once()
    assert result is None
