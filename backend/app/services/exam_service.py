import inspect
from typing import (
    Any,
    Optional,
)

# FIX 1: Import Dict, Any, List from typing
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.exams import Exam
from app.models.mark import Mark  # Assuming you have a Mark model
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

    # 1. Select the necessary data by joining Marks, Subjects, and Exams.
    stmt = (
        select(
            Mark.marks_obtained,
            Mark.total_marks,
            Mark.grade_letter,
            Subject.name.label("subject_name"),
            Exam.exam_name,
        )
        .join(Subject, Mark.subject_id == Subject.subject_id)
        .join(Exam, Mark.exam_id == Exam.id)
        .where(
            Mark.student_id == student_id,
            Mark.exam_id == exam_id,
            # FIX 2: Ensure filter is on a separate
            #  line if needed, but keeping it clean
            Exam.is_active.is_(True),
        )
    )

    result = await db.execute(stmt)
    mark_records = result.all()

    if not mark_records:
        return {
            "status": "not_found",
            "message": f"No active results- {student_id} in Exam {exam_id}.",
        }
    # 2. Format the results into a clean,
    #  structured dictionary for the Agent.
    summary = {
        "student_id": student_id,
        # FIX 3: E501 line break applied here
        "exam_name": mark_records[0].exam_name,
        "total_marks_obtained": sum(r.marks_obtained for r in mark_records),
        "performance_by_subject": [
            {
                "subject": r.subject_name,
                "obtained": float(r.marks_obtained),
                "total": float(r.total_marks),
                "grade": r.grade_letter,
            }
            for r in mark_records
        ],
        "status": "complete",
    }

    return summary


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
