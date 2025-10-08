# backend/app/services/mark_service.py
from typing import Optional

from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.exams import Exam
from app.models.mark import Mark
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.mark_schema import ClassPerformanceSummary, MarkCreate, MarkUpdate


def mark_relationship_options():
    return (
        selectinload(Mark.subject).selectinload(Subject.streams),
        selectinload(Mark.exam),
    )


async def create_mark(db: AsyncSession, mark_in: MarkCreate) -> Mark:
    db_obj = Mark(**mark_in.model_dump())
    db.add(db_obj)

    try:
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    await db.refresh(db_obj)
    # FIX: Re-fetch the object using our getter to eager-load relationships
    return await get_mark_by_id(db, db_obj.id)


async def bulk_create_marks(db: AsyncSession, *, marks_in: list[MarkCreate]) -> list[Mark]:
    """
    Creates multiple mark records.
    """
    if not marks_in:
        try:
            await db.commit()
        except SQLAlchemyError:
            await db.rollback()
            raise
        return []

    db_objects = [Mark(**mark.model_dump()) for mark in marks_in]
    db.add_all(db_objects)

    try:
        await db.flush()
        ids = [mark.id for mark in db_objects]
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise

    stmt = select(Mark).where(Mark.id.in_(ids)).options(*mark_relationship_options())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_student_report_card(db: AsyncSession, *, student_id: int, academic_year_id: int) -> list[Mark]:
    """
    Retrieves all marks for a student for a specific academic year.
    """
    stmt = select(Mark).join(Exam).where(Mark.student_id == student_id, Exam.academic_year_id == academic_year_id).options(*mark_relationship_options()).order_by(Exam.start_date, Mark.subject_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_mark_by_id(db: AsyncSession, mark_id: int) -> Optional[Mark]:
    """Gets a single mark, eager-loading its relationships."""
    stmt = (
        select(Mark).where(Mark.id == mark_id)
        # FIX: Eagerly load the 'subject' and 'exam' relationships.
        .options(*mark_relationship_options())
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_marks_by_student(db: AsyncSession, student_id: int) -> list[Mark]:
    stmt = select(Mark).where(Mark.student_id == student_id).options(*mark_relationship_options()).order_by(Mark.exam_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_marks_for_student_and_exam(db: AsyncSession, *, student_id: int, exam_id: Optional[int] = None) -> list[Mark]:
    stmt = select(Mark).where(Mark.student_id == student_id)
    if exam_id is not None:
        stmt = stmt.where(Mark.exam_id == exam_id)

    stmt = stmt.options(*mark_relationship_options()).order_by(Mark.exam_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_marks_for_exam(db: AsyncSession, exam_id: int) -> list[Mark]:
    stmt = select(Mark).where(Mark.exam_id == exam_id).options(*mark_relationship_options()).order_by(Mark.student_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_mark(db: AsyncSession, db_obj: Mark, mark_in: MarkUpdate) -> Mark:
    update_data = mark_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    # Re-fetch with relationships loaded
    return await get_mark_by_id(db, db_obj.id)


async def delete_mark(db: AsyncSession, db_obj: Mark) -> None:
    await db.delete(db_obj)
    await db.commit()


async def get_class_performance_in_exam(db: AsyncSession, *, class_id: int, exam_id: int, pass_mark: float = 40.0) -> Optional[ClassPerformanceSummary]:
    """
    Calculates and returns a performance summary for a class in a specific exam.
    """
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
    stmt = select(Mark).join(Exam).where(Mark.student_id == student_id, Mark.subject_id == subject_id).options(*mark_relationship_options()).order_by(Exam.start_date.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_teacher_id_for_user(db: AsyncSession, *, user_id: str) -> Optional[int]:
    stmt = select(Teacher.teacher_id).where(Teacher.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
