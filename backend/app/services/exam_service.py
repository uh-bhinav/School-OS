import inspect
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.exams import Exam
from app.models.mark import Mark
from app.models.student import Student
from app.models.subject import Subject
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
    """Return aggregate exam results for a single student."""

    exam_stmt = select(Exam).where(Exam.id == exam_id, Exam.is_active.is_(True))
    exam = (await db.execute(exam_stmt)).scalar_one_or_none()
    if not exam:
        raise ValueError(f"Active exam {exam_id} was not found.")

    student_stmt = select(Student).options(selectinload(Student.profile)).where(Student.student_id == student_id, Student.is_active.is_(True))
    student = (await db.execute(student_stmt)).scalar_one_or_none()
    if not student:
        raise ValueError(f"Active student {student_id} was not found.")

    if not student.profile:
        raise ValueError("Student profile is required to summarise exam marks.")

    marks_stmt = (
        select(
            Mark.marks_obtained,
            Mark.max_marks,
            Subject.name.label("subject_name"),
        )
        .join(Subject, Mark.subject_id == Subject.subject_id)
        .where(Mark.exam_id == exam_id, Mark.student_id == student_id)
    )
    mark_rows = (await db.execute(marks_stmt)).all()

    if not mark_rows:
        raise ValueError("No marks found for the requested exam/student combination.")

    total_obtained = sum(_to_decimal(row.marks_obtained) for row in mark_rows)
    max_total_marks = sum(_to_decimal(row.max_marks) for row in mark_rows)

    percentage = Decimal("0")
    if max_total_marks:
        percentage = (total_obtained / max_total_marks) * Decimal("100")

    student_name = " ".join(part for part in [student.profile.first_name, student.profile.last_name] if part).strip()
    if not student_name:
        student_name = "Unknown Student"

    subject_breakdown = [
        {
            "subject_name": row.subject_name,
            "score": _format_decimal(_to_decimal(row.marks_obtained)),
            "max_marks": _format_decimal(_to_decimal(row.max_marks)),
        }
        for row in mark_rows
    ]

    return {
        "student_id": student_id,
        "student_name": student_name,
        "exam_id": exam_id,
        "exam_name": exam.exam_name,
        "total_marks_obtained": _format_decimal(total_obtained),
        "max_total_marks": _format_decimal(max_total_marks),
        "percentage": _format_decimal(percentage),
        "result": "Pass" if percentage >= 50 else "Fail",
        "marks_by_subject": subject_breakdown,
    }


def _to_decimal(value: Any) -> Decimal:
    """Convert DB numeric values into a Decimal for precise aggregation."""

    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError("Numeric value could not be converted to Decimal.") from exc


def _format_decimal(value: Decimal) -> float | int:
    """Round to two decimal places and drop trailing zeros when integral."""

    quantized = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if quantized == quantized.to_integral():
        return int(quantized)
    return float(quantized)


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
