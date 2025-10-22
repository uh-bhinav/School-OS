from __future__ import annotations

import uuid
from datetime import date

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.academic_year import AcademicYear
from app.models.exams import Exam
from app.models.mark import Mark
from app.models.profile import Profile
from app.models.school import School
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.teacher_schema import TeacherQualification
from app.services import get_exam_mark_summary
from app.services.exam_service import fetch_exams_by_academic_year
from app.services.teacher_service import get_teacher_qualifications


async def _ensure_school(db: AsyncSession) -> School:
    school = (await db.execute(select(School).limit(1))).scalars().first()
    if school:
        return school

    school = School(
        school_id=9999,
        name="Agentic Test School",
        city="Test City",
        state="Test State",
        country="Test Country",
        is_active=True,
    )
    db.add(school)
    await db.flush()
    return school


async def _get_active_student(db: AsyncSession) -> Student:
    stmt = select(Student).options(selectinload(Student.profile)).where(Student.is_active.is_(True)).limit(1)
    student = (await db.execute(stmt)).scalars().first()
    if student and student.profile:
        return student

    school = await _ensure_school(db)

    profile = Profile(
        user_id=uuid.uuid4(),
        school_id=school.school_id,
        first_name="Test",
        last_name="Student",
        is_active=True,
    )
    db.add(profile)
    await db.flush()

    student = Student(
        user_id=profile.user_id,
        roll_number="A001",
        is_active=True,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student, attribute_names=["profile"])
    return student


async def _create_academic_year(
    db: AsyncSession,
    school_id: int,
    *,
    name: str = "2025",
    start_date_value: date = date(2025, 1, 1),
    end_date_value: date = date(2025, 12, 31),
) -> AcademicYear:
    existing = (
        (
            await db.execute(
                select(AcademicYear).where(
                    AcademicYear.school_id == school_id,
                    AcademicYear.name == name,
                )
            )
        )
        .scalars()
        .first()
    )
    if existing:
        return existing

    academic_year = AcademicYear(
        school_id=school_id,
        name=name,
        start_date=start_date_value,
        end_date=end_date_value,
        is_active=True,
    )
    db.add(academic_year)
    await db.flush()
    return academic_year


async def _create_exam(
    db: AsyncSession,
    school_id: int,
    academic_year: AcademicYear,
    *,
    name: str = "Mid-Term Exam",
    marks: float = 200,
    is_active: bool = True,
) -> Exam:
    exam = Exam(
        school_id=school_id,
        exam_name=name,
        academic_year_id=academic_year.id,
        start_date=date(2025, 3, 1),
        end_date=date(2025, 3, 10),
        marks=marks,
        is_active=is_active,
    )
    db.add(exam)
    await db.flush()
    return exam


async def _create_subject(db: AsyncSession, school_id: int, name: str) -> Subject:
    subject = Subject(
        school_id=school_id,
        name=name,
        is_active=True,
    )
    db.add(subject)
    await db.flush()
    return subject


async def _create_mark(
    db: AsyncSession,
    *,
    school_id: int,
    student_id: int,
    exam: Exam,
    subject: Subject,
    score: float,
    max_marks: float,
) -> Mark:
    mark = Mark(
        school_id=school_id,
        student_id=student_id,
        exam_id=exam.id,
        subject_id=subject.subject_id,
        marks_obtained=score,
        max_marks=max_marks,
    )
    db.add(mark)
    await db.flush()
    return mark


@pytest.mark.asyncio
async def test_get_exam_mark_summary(db_session: AsyncSession) -> None:
    db = db_session
    student = await _get_active_student(db)
    student.profile.first_name = "Jane"
    student.profile.last_name = "Doe"
    await db.flush()

    school_id = student.profile.school_id
    academic_year = await _create_academic_year(db, school_id)
    exam = await _create_exam(db, school_id, academic_year)

    physics = await _create_subject(db, school_id, "Physics")
    chemistry = await _create_subject(db, school_id, "Chemistry")

    await _create_mark(
        db,
        school_id=school_id,
        student_id=student.student_id,
        exam=exam,
        subject=physics,
        score=85,
        max_marks=100,
    )
    await _create_mark(
        db,
        school_id=school_id,
        student_id=student.student_id,
        exam=exam,
        subject=chemistry,
        score=92,
        max_marks=100,
    )

    summary = await get_exam_mark_summary(db, exam_id=exam.id, student_id=student.student_id)

    assert summary["student_name"] == "Jane Doe"
    assert summary["exam_name"] == "Mid-Term Exam"
    assert summary["total_marks_obtained"] == 177
    assert summary["max_total_marks"] == 200
    assert summary["percentage"] == 88.5
    assert summary["result"] == "Pass"

    breakdown = {item["subject_name"]: item for item in summary["marks_by_subject"]}
    assert breakdown["Physics"]["score"] == 85
    assert breakdown["Physics"]["max_marks"] == 100
    assert breakdown["Chemistry"]["score"] == 92
    assert breakdown["Chemistry"]["max_marks"] == 100


@pytest.mark.asyncio
async def test_get_teacher_qualifications(db_session: AsyncSession) -> None:
    db = db_session
    teacher = (await db.execute(select(Teacher).options(selectinload(Teacher.profile)).where(Teacher.is_active.is_(True)).limit(1))).scalars().first()

    if not teacher:
        profile = (await db.execute(select(Profile).options(selectinload(Profile.teacher)).where(Profile.teacher.is_(None)).limit(1))).scalars().first()
        if not profile:
            profile = (await db.execute(select(Profile).limit(1))).scalars().first()
        assert profile is not None, "At least one profile must exist for teacher tests."

        teacher = Teacher(
            user_id=profile.user_id,
            school_id=profile.school_id,
            is_active=True,
        )
        db.add(teacher)
        await db.flush()

    teacher.years_of_experience = 10
    teacher.qualifications = [{"degree": "B.Ed", "institution": "Edu College"}]
    await db.flush()

    qualification = await get_teacher_qualifications(db, teacher_id=teacher.teacher_id)

    assert isinstance(qualification, TeacherQualification)
    assert qualification.years_of_experience == 10
    assert qualification.qualifications == [{"degree": "B.Ed", "institution": "Edu College"}]


@pytest.mark.asyncio
async def test_get_teacher_qualifications_returns_none_for_missing(db_session: AsyncSession) -> None:
    result = await get_teacher_qualifications(db_session, teacher_id=999_999)
    assert result is None


@pytest.mark.asyncio
async def test_fetch_exams_by_academic_year(db_session: AsyncSession) -> None:
    """Ensure only active exams for the requested academic year are returned."""

    db = db_session
    school = await _ensure_school(db)

    ay_one = await _create_academic_year(
        db,
        school.school_id,
        name="2025-2026",
        start_date_value=date(2025, 1, 1),
        end_date_value=date(2025, 12, 31),
    )
    ay_two = await _create_academic_year(
        db,
        school.school_id,
        name="2026-2027",
        start_date_value=date(2026, 1, 1),
        end_date_value=date(2026, 12, 31),
    )

    exam_one = await _create_exam(db, school.school_id, ay_one, name="Mid-Term Exam")
    await _create_exam(db, school.school_id, ay_two, name="Final Exam")
    inactive_exam = await _create_exam(db, school.school_id, ay_one, name="Retest")
    inactive_exam.is_active = False
    await db.flush()

    retrieved_exams = await fetch_exams_by_academic_year(db, academic_year_id=ay_one.id)

    assert len(retrieved_exams) == 1
    result_exam = retrieved_exams[0]
    assert result_exam.id == exam_one.id
    assert result_exam.exam_name == "Mid-Term Exam"
    assert result_exam.academic_year_id == ay_one.id
    assert result_exam.is_active is True
