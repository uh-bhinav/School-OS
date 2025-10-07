# backend/app/services/timetable_service.py
from datetime import date
from typing import Optional

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.period import Period
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.timetable import Timetable
from app.schemas.timetable_schema import TimetableEntryCreate, TimetableEntryUpdate


async def create_timetable_entry(db: AsyncSession, timetable_in: TimetableEntryCreate) -> Timetable:
    db_obj = Timetable(**timetable_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_timetable_entry_by_id(db: AsyncSession, entry_id: int) -> Optional[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.id == entry_id, Timetable.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_class_timetable(db: AsyncSession, class_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.class_id == class_id, Timetable.is_active).order_by(Timetable.day_of_week, Timetable.period_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_teacher_timetable(db: AsyncSession, teacher_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.teacher_id == teacher_id, Timetable.is_active).order_by(Timetable.day_of_week, Timetable.period_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_timetable_entry(db: AsyncSession, db_obj: Timetable, timetable_in: TimetableEntryUpdate) -> Timetable:
    update_data = timetable_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def soft_delete_timetable_entry(db: AsyncSession, entry_id: int) -> Optional[Timetable]:
    """
    Soft-deletes a timetable entry by setting its is_active flag to False.
    """
    stmt = update(Timetable).where(Timetable.id == entry_id, Timetable.is_active).values(is_active=False).returning(Timetable)  # Use 'Timetable.is_active' directly
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()


async def get_schedule_for_day(
    db: AsyncSession,
    *,
    school_id: int,
    target_type: str,
    target_id: int,
    schedule_date: date,
) -> list[Timetable]:
    """
    Gets the detailed schedule for a specific day for a class, teacher, or student.
    It ensures that the data is scoped to the correct school.
    """
    # 1. Calculate the day of the week (Monday=1, ..., Sunday=7)
    day_of_week = schedule_date.weekday() + 1

    # 2. Build the base query with security and performance in mind
    base_query = (
        select(Timetable)
        .where(
            Timetable.school_id == school_id,  # Multi-tenancy security
            Timetable.day_of_week == day_of_week,
            Timetable.is_active,
        )
        .options(
            # Eagerly load related data to prevent extra DB queries
            selectinload(Timetable.subject),
            selectinload(Timetable.teacher).selectinload(Teacher.profile),
            selectinload(Timetable.period),
        )
        .join(Period)  # Join to allow ordering by period start_time
        .order_by(Period.start_time)
    )

    # 3. Apply the specific filter based on the target type
    if target_type == "class":
        stmt = base_query.where(Timetable.class_id == target_id)

    elif target_type == "teacher":
        stmt = base_query.where(Timetable.teacher_id == target_id)

    elif target_type == "student":
        # For a student, first find their class ID
        student_class_id_res = await db.execute(select(Student.current_class_id).where(Student.student_id == target_id))
        student_class_id = student_class_id_res.scalar_one_or_none()

        if not student_class_id:
            return []  # Return empty list if student is not in a class

        stmt = base_query.where(Timetable.class_id == student_class_id)

    else:
        return []  # Invalid target type

    # Execute the final query and return the results
    result = await db.execute(stmt)
    return list(result.scalars().all())
