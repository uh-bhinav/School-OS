# backend/app/services/mark_service.py
from typing import Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.exams import Exam
from app.models.mark import Mark
from app.models.student import Student
from app.schemas.mark_schema import ClassPerformanceSummary, MarkCreate, MarkUpdate


async def create_mark(db: AsyncSession, mark_in: MarkCreate) -> Mark:
    db_obj = Mark(**mark_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def bulk_create_marks(db: AsyncSession, *, marks_in: list[MarkCreate], entered_by_teacher_id: int) -> list[Mark]:
    """
    Creates multiple mark records, associating them with the teacher who entered them.
    """
    db_objects = [Mark(**mark.model_dump(), entered_by_teacher_id=entered_by_teacher_id) for mark in marks_in]
    db.add_all(db_objects)
    await db.commit()
    # To return the full objects with IDs, we need to re-fetch them.
    # For now, this is sufficient.
    return db_objects


async def get_student_report_card(db: AsyncSession, *, student_id: int, academic_year_id: int) -> list[Mark]:
    """
    Retrieves all marks for a student for a specific academic year.
    """
    stmt = select(Mark).join(Exam).where(Mark.student_id == student_id, Exam.academic_year_id == academic_year_id).options(selectinload(Mark.subject), selectinload(Mark.exam)).order_by(Exam.start_date, Mark.subject_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_mark_by_id(db: AsyncSession, mark_id: int) -> Optional[Mark]:
    stmt = select(Mark).where(Mark.id == mark_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_marks_by_student(db: AsyncSession, student_id: int) -> list[Mark]:
    stmt = select(Mark).where(Mark.student_id == student_id).order_by(Mark.exam_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_marks_for_exam(db: AsyncSession, exam_id: int) -> list[Mark]:
    stmt = select(Mark).where(Mark.exam_id == exam_id).order_by(Mark.student_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_mark(db: AsyncSession, db_obj: Mark, mark_in: MarkUpdate) -> Mark:
    update_data = mark_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_mark(db: AsyncSession, db_obj: Mark) -> None:
    await db.delete(db_obj)
    await db.commit()


async def get_class_performance_in_exam(db: AsyncSession, *, class_id: int, exam_id: int, pass_mark: float = 40.0) -> Optional[ClassPerformanceSummary]:
    """
    Calculates and returns a performance summary for a class in a specific exam.
    """
    # Query to calculate average, max, min, and total students
    stmt = (
        select(
            func.avg(Mark.marks_obtained),
            func.max(Mark.marks_obtained),
            func.min(Mark.marks_obtained),
            func.count(Mark.student_id),
        )
        .join(Student)
        .where(Student.current_class_id == class_id, Mark.exam_id == exam_id)
    )

    result = await db.execute(stmt)
    avg_score, max_score, min_score, total_count = result.one_or_none()

    if total_count == 0:
        return None

    # Query to count students who passed
    passed_stmt = (
        select(func.count(Mark.student_id))
        .join(Student)
        .where(
            Student.current_class_id == class_id,
            Mark.exam_id == exam_id,
            Mark.marks_obtained >= pass_mark,
        )
    )
    passed_count = await db.scalar(passed_stmt)

    failure_rate = ((total_count - passed_count) / total_count) * 100 if total_count > 0 else 0

    return ClassPerformanceSummary(
        class_average=avg_score,
        highest_score=max_score,
        lowest_score=min_score,
        total_students=total_count,
        students_passed=passed_count,
        failure_rate=failure_rate,
    )


async def get_student_grade_progression(db: AsyncSession, *, student_id: int, subject_id: int) -> list[Mark]:
    """
    Retrieves a student's marks in a specific subject across all exams over time.
    """
    stmt = select(Mark).join(Exam).where(Mark.student_id == student_id, Mark.subject_id == subject_id).options(selectinload(Mark.exam)).order_by(Exam.start_date.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
