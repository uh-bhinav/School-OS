# backend/app/services/timetable_service.py
from datetime import date
from typing import Optional

from sqlalchemy import false, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.period import Period
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.timetable import Timetable
from app.schemas.timetable_schema import TeacherFreeSlot, TeacherFreeSlotResponse, TimetableEntryCreate, TimetableEntryUpdate


def get_timetable_with_details_options():
    """
    Returns selectinload options for timetable entries.
    Defined as a function to avoid model configuration issues at module import time.
    """
    return [
        selectinload(Timetable.subject).selectinload(Subject.streams),
        selectinload(Timetable.teacher).selectinload(Teacher.profile),
        selectinload(Timetable.period),
    ]


async def get_entry_with_details(db: AsyncSession, entry_id: int) -> Optional[Timetable]:
    """
    Gets a single timetable entry, preloading all nested relationships
    required by the TimetableEntryOut schema to prevent lazy-loading errors.
    """
    stmt = select(Timetable).where(Timetable.id == entry_id, Timetable.is_active).options(*get_timetable_with_details_options())

    result = await db.execute(stmt)
    return result.scalars().first()


async def create_timetable_entry(db: AsyncSession, timetable_in: TimetableEntryCreate) -> Timetable:
    db_obj = Timetable(**timetable_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_entry_with_details(db=db, entry_id=db_obj.id)


async def get_timetable_entry_by_id(db: AsyncSession, entry_id: int) -> Optional[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.id == entry_id, Timetable.is_active)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_class_timetable(db: AsyncSession, class_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.class_id == class_id, Timetable.is_active).options(*get_timetable_with_details_options()).order_by(Timetable.day_of_week, Timetable.period_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_teacher_timetable(db: AsyncSession, teacher_id: int) -> list[Timetable]:
    # Use 'Timetable.is_active' directly for the boolean check
    stmt = select(Timetable).where(Timetable.teacher_id == teacher_id, Timetable.is_active).options(*get_timetable_with_details_options()).order_by(Timetable.day_of_week, Timetable.period_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_timetable_entry(db: AsyncSession, db_obj: Timetable, timetable_in: TimetableEntryUpdate) -> Timetable:
    update_data = timetable_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_entry_with_details(db=db, entry_id=db_obj.id)


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
            Timetable.school_id == school_id,
            Timetable.day_of_week == day_of_week,
            Timetable.is_active,
        )
        .options(*get_timetable_with_details_options())
        .join(Period)
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


async def find_teacher_free_slots(db: AsyncSession, *, teacher_id: int, school_id: int, target_date: date) -> TeacherFreeSlotResponse:
    """
    Finds all free (un-booked) periods for a teacher on a specific date.
    """
    day_of_week = target_date.weekday() + 1  # Monday=1, Sunday=7

    # 1. Get all *possible* teaching periods for that day at that school
    all_periods_stmt = select(Period).where(
        Period.school_id == school_id,
        Period.is_active,
        Period.is_recess.is_(false()),  # We only care about teaching periods
        Period.day_of_week == day_of_week,  # For day-specific structures
    )
    # Fallback for day-agnostic structures
    all_periods_day_agnostic_stmt = select(Period).where(
        Period.school_id == school_id,
        Period.is_active,
        Period.is_recess.is_(false()),
        Period.day_of_week.is_(None),  # For day-agnostic structures
    )

    all_periods_res = await db.execute(all_periods_stmt)
    all_periods = all_periods_res.scalars().all()

    if not all_periods:
        all_periods_res_agnostic = await db.execute(all_periods_day_agnostic_stmt)
        all_periods = all_periods_res_agnostic.scalars().all()

    all_period_map = {p.id: p for p in all_periods}

    # 2. Get all *busy* periods for that teacher on that day
    busy_periods_stmt = select(Timetable.period_id).where(
        Timetable.teacher_id == teacher_id,
        Timetable.day_of_week == day_of_week,
        Timetable.is_active,
    )

    busy_periods_res = await db.execute(busy_periods_stmt)
    busy_period_ids = set(busy_periods_res.scalars().all())

    # 3. Find the difference
    free_slots = []
    for period_id, period in all_period_map.items():
        if period_id not in busy_period_ids:
            free_slots.append(TeacherFreeSlot(period_id=period.id, period_number=period.period_number, period_name=period.period_name, start_time=period.start_time, end_time=period.end_time, day_of_week=day_of_week))

    # Sort by start time
    free_slots.sort(key=lambda x: x.start_time)

    return TeacherFreeSlotResponse(teacher_id=teacher_id, day_of_week=day_of_week, free_slots=free_slots)
