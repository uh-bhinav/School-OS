import inspect
from typing import Any, Optional

# FIX 1: Import Dict, Any, List from typing
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.exams import Exam
from app.models.mark import Mark
from app.models.profile import Profile
from app.models.student import Student
from app.models.subject import Subject

# Assuming you have a Subject model
from app.schemas.exam_schema import ExamCreate, ExamUpdate


async def _maybe_await(result):
    if inspect.isawaitable(result):
        return await result
    return result


async def create_exam(db: AsyncSession, exam_in: ExamCreate) -> Exam:
    db_obj = Exam(**exam_in.model_dump())
    await _maybe_await(db.add(db_obj))
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    await db.refresh(db_obj)
    return db_obj


async def get_exam_by_id(db: AsyncSession, exam_id: int) -> Optional[Exam]:
    """Retrieves an active exam by ID (READ FILTER APPLIED)."""
    exam = await db.get(Exam, exam_id)
    if not exam or getattr(exam, "is_active", True) is False:
        return None
    return exam


async def get_all_exams_for_school(db: AsyncSession, school_id: int) -> list[Exam]:
    stmt = select(Exam).where(Exam.school_id == school_id).order_by(Exam.start_date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_exam(db: AsyncSession, exam_id: int, exam_in: ExamUpdate) -> Optional[Exam]:
    db_obj = await db.get(Exam, exam_id)
    if not db_obj or getattr(db_obj, "is_active", True) is False:
        return None

    update_data = exam_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    await _maybe_await(db.add(db_obj))
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    await db.refresh(db_obj)
    return db_obj


async def delete_exam(db: AsyncSession, exam_id: int) -> Optional[Exam]:
    db_obj = await db.get(Exam, exam_id)
    if not db_obj:
        return None

    if getattr(db_obj, "is_active", True) is False:
        return db_obj

    db_obj.is_active = False
    await _maybe_await(db.add(db_obj))
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    await db.refresh(db_obj)
    return db_obj


async def get_exam_mark_summary(db: AsyncSession, exam_id: int, student_id: int) -> dict[str, Any]:
    """
    Agentic Function: Retrieves a student's
      consolidated results for all subjects
    in a specific, active exam.
    """
    exam = await db.get(Exam, exam_id)
    if not exam or getattr(exam, "is_active", True) is not True:
        return {
            "status": "not_found",
            "message": f"Exam {exam_id} is inactive or does not exist.",
        }

    student_stmt = select(Student).where(Student.student_id == student_id).options(selectinload(Student.profile)).limit(1)
    student_result = await db.execute(student_stmt)
    student = student_result.scalars().first()
    student_profile: Profile | None = getattr(student, "profile", None)

    marks_stmt = (
        select(
            Subject.name.label("subject_name"),
            Mark.marks_obtained,
            Mark.max_marks,
        )
        .join(Subject, Subject.subject_id == Mark.subject_id)
        .where(
            Mark.exam_id == exam_id,
            Mark.student_id == student_id,
        )
    )

    marks_result = await db.execute(marks_stmt)
    mark_rows = marks_result.all()

    if not mark_rows:
        return {
            "status": "not_found",
            "message": f"No marks recorded for student {student_id} in exam {exam_id}.",
        }

    total_obtained = float(sum(row.marks_obtained for row in mark_rows))
    max_total = float(sum(row.max_marks for row in mark_rows))
    percentage = round((total_obtained / max_total) * 100, 2) if max_total else 0.0
    result_label = "Pass" if percentage >= 40 else "Fail"

    marks_by_subject = [
        {
            "subject_name": row.subject_name,
            "score": float(row.marks_obtained),
            "max_marks": float(row.max_marks),
        }
        for row in mark_rows
    ]

    student_name = "Unknown Student"
    if student_profile:
        first = student_profile.first_name or ""
        last = student_profile.last_name or ""
        student_name = (f"{first} {last}").strip() or student_name

    return {
        "status": "complete",
        "student_id": student_id,
        "student_name": student_name,
        "exam_id": exam_id,
        "exam_name": exam.exam_name,
        "total_marks_obtained": total_obtained,
        "max_total_marks": max_total,
        "percentage": percentage,
        "result": result_label,
        "marks_by_subject": marks_by_subject,
    }


# --- Agentic Function ---
# NOTE: The subsequent functions were moved from the bottom of the file
# to resolve E402 and F811 errors (Imports must be at the top).


async def fetch_exams_by_academic_year(db: AsyncSession, academic_year_id: int) -> list[Exam]:
    """
    Agentic Function: Retrieves all active
    exams scheduled within a specific academic year.
    """
    stmt = (
        select(Exam)
        .where(
            # Filter 1: Match the required academic year
            Exam.academic_year_id == academic_year_id,
            # Filter 2: Apply the mandatory soft-delete filter
            Exam.is_active.is_(True),
        )
        .order_by(Exam.start_date.asc())
    )
    result = await db.execute(stmt)
    # Return a list of Exam objects
    return result.scalars().all()


async def search_exams(db: AsyncSession, school_id: int, name: Optional[str] = None, exam_type_id: Optional[int] = None, academic_year_id: Optional[int] = None) -> list[Exam]:
    """
    Flexibly searches for active exams by name, type, or academic year.
    """
    stmt = select(Exam).where(Exam.school_id == school_id, Exam.is_active.is_(True)).order_by(Exam.start_date.desc())

    if name:
        stmt = stmt.where(Exam.exam_name.ilike(f"%{name}%"))
    if exam_type_id:
        stmt = stmt.where(Exam.exam_type_id == exam_type_id)
    if academic_year_id:
        stmt = stmt.where(Exam.academic_year_id == academic_year_id)

    result = await db.execute(stmt)
    return list(result.scalars().all())
