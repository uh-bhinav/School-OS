# backend/app/api/v1/endpoints/timetable.py

import re
from datetime import date
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.class_model import Class
from app.models.period import Period
from app.models.profile import Profile
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.timetable_schema import (
    TeacherFreeSlotResponse,
    TimetableEntryCreate,
    TimetableEntryOut,
    TimetableEntryUpdate,
)
from app.schemas.timetable_schema import TimetableEntryOut as TimetableOut
from app.services import timetable_service

router = APIRouter()


class ScheduleTargetType(str, Enum):
    CLASS = "class"
    TEACHER = "teacher"
    STUDENT = "student"


# Admin only: Create a new timetable entry
@router.post(
    "/",
    response_model=TimetableEntryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_timetable_entry(
    timetable_in: TimetableEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Create a new timetable entry. Admin only.
    """
    timetable_in.school_id = current_profile.school_id

    # CRITICAL SECURITY FIX: Verify that all foreign keys belong to the user's school.
    # We fetch each parent object to confirm its existence and school_id.

    # Verify Class
    target_class = await db.get(Class, timetable_in.class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=403,
            detail="The specified class does not belong to your school.",
        )

    # Verify Subject
    target_subject = await db.get(Subject, timetable_in.subject_id)
    if not target_subject or target_subject.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=403,
            detail="The specified subject does not belong to your school.",
        )

    # Verify Teacher
    target_teacher = await db.get(Teacher, timetable_in.teacher_id)
    if not target_teacher or target_teacher.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=403,
            detail="The specified teacher does not belong to your school.",
        )

    # Verify Period
    target_period = await db.get(Period, timetable_in.period_id)
    if not target_period or target_period.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=403,
            detail="The specified period does not belong to your school.",
        )

    return await timetable_service.create_timetable_entry(db=db, timetable_in=timetable_in)


# Student/Parent only: Get timetable for a specific class
@router.get(
    "/classes/{class_id}",
    response_model=list[TimetableEntryOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Student", "Parent"))],
)
async def get_timetable_for_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get the timetable for a specific class.
    """
    target_class = await db.get(Class, class_id)
    if target_class and target_class.school_id != current_profile.school_id:
        return []
    if target_class is None:
        return []

    timetable = await timetable_service.get_class_timetable(db=db, class_id=class_id)
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found for this class.")
    return timetable


# ADD THIS NEW ENDPOINT - MUST BE BEFORE THE /{entry_id} endpoint
@router.get(
    "/class/{class_identifier}",
    response_model=list[TimetableEntryOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Student", "Parent"))],
)
async def get_timetable_by_class_name(
    class_identifier: str,
    day: str | None = Query(None, description="Day name (Monday, Tuesday, etc.) or day_of_week (1-7)"),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get timetable for a class by name/identifier like '11A'.
    Optionally filter by day.
    """
    # Parse identifier like "11A" into grade_level and section
    match = re.match(r"^(\d+)([A-Z])$", class_identifier.upper())

    if not match:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid class identifier. Use format like '11A', '10B', etc.")

    grade_level = int(match.group(1))
    section = match.group(2)

    # Find the class by grade and section in user's school
    stmt = select(Class).where(Class.school_id == current_profile.school_id, Class.grade_level == grade_level, Class.section == section, Class.is_active)
    result = await db.execute(stmt)
    target_class = result.scalar_one_or_none()

    if not target_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Class {class_identifier} not found in your school.")

    # Get timetable for this class
    timetable = await timetable_service.get_class_timetable(db=db, class_id=target_class.class_id)

    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found for this class.")

    # Filter by day if provided
    if day:
        day_num = _parse_day(day)
        timetable = [entry for entry in timetable if entry.day_of_week == day_num]

    return timetable


# Helper function to convert day names to numbers
def _parse_day(day: str) -> int:
    """Convert day name or number to day_of_week (1=Monday, 7=Sunday)"""
    day_map = {
        "monday": 1,
        "mon": 1,
        "tuesday": 2,
        "tue": 2,
        "wednesday": 3,
        "wed": 3,
        "thursday": 4,
        "thu": 4,
        "friday": 5,
        "fri": 5,
        "saturday": 6,
        "sat": 6,
        "sunday": 7,
        "sun": 7,
        "1st day": 1,
        "2nd day": 2,
        "3rd day": 3,
        "4th day": 4,
        "5th day": 5,
        "6th day": 6,
    }

    day_lower = day.lower().strip()

    # Try direct lookup first
    if day_lower in day_map:
        return day_map[day_lower]

    # Try parsing as integer
    try:
        num = int(day_lower)
        if 1 <= num <= 7:
            return num
    except ValueError:
        pass

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid day: {day}. Use day names (Monday-Sunday) or numbers (1-7).")


# Teacher only: Get personalized timetable
@router.get(
    "/teachers/{teacher_id}",
    response_model=list[TimetableEntryOut],
    dependencies=[Depends(require_role("Teacher"))],
)
async def get_timetable_for_teacher(
    teacher_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get the personalized timetable for a specific teacher.
    """
    target_teacher = await db.get(Teacher, teacher_id)
    if not target_teacher or target_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    timetable = await timetable_service.get_teacher_timetable(db=db, teacher_id=teacher_id)
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found for this teacher.")
    return timetable


@router.get(
    "/teacher/{teacher_id}/schedule",
    response_model=list[TimetableOut],
    dependencies=[Depends(require_role("Teacher"))],
)
async def get_teacher_schedule(
    teacher_id: int,
    schedule_date: date
    | None = Query(
        None,
        description="Optional date filter (YYYY-MM-DD) to retrieve a specific day's schedule.",
    ),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Return either the full timetable or a specific day's schedule for a teacher."""

    target_teacher = await db.get(Teacher, teacher_id)
    if not target_teacher or target_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    if schedule_date:
        return await timetable_service.get_schedule_for_day(
            db=db,
            school_id=current_profile.school_id,
            target_type="teacher",
            target_id=teacher_id,
            schedule_date=schedule_date,
        )

    return await timetable_service.get_teacher_timetable(db=db, teacher_id=teacher_id)


# Admin only: Update an existing timetable entry
@router.put(
    "/{entry_id}",
    response_model=TimetableEntryOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_timetable_entry(
    entry_id: int,
    timetable_in: TimetableEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    db_obj = await timetable_service.get_timetable_entry_by_id(db, entry_id)
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")
    return await timetable_service.update_timetable_entry(db, db_obj=db_obj, timetable_in=timetable_in)


# Admin only: Soft-delete an existing timetable entry
@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_timetable_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Soft-deletes a timetable entry by setting its is_active flag to false.
    """
    db_obj = await timetable_service.get_entry_with_details(db, entry_id)
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")

    deleted_entry = await timetable_service.soft_delete_timetable_entry(db, entry_id=entry_id)
    if not deleted_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active timetable entry with id {entry_id} not found",
        )
    return None  # Return 204 No Content on success


@router.get("/schedule-for-day", response_model=list[TimetableOut])
async def get_schedule(
    target_type: ScheduleTargetType,
    target_id: int,
    schedule_date: date = Query(..., description="The date for the schedule in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get the daily schedule for a specific class, teacher, or student.
    """

    return await timetable_service.get_schedule_for_day(
        db=db,
        school_id=current_profile.school_id,
        target_type=target_type.value,
        target_id=target_id,
        schedule_date=schedule_date,
    )


@router.get("/teacher/{teacher_id}/free-slots", response_model=TeacherFreeSlotResponse, dependencies=[Depends(require_role("Admin", "Teacher"))], tags=["Timetable"], summary="Find all free slots for a teacher on a given day")
async def get_teacher_free_slots(
    teacher_id: int,
    target_date: date = Query(..., description="The date to check in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    (ROBUST) Get a list of all non-recess periods where a teacher is NOT booked.
    """
    # Security Check: Verify teacher belongs to this school
    target_teacher = await db.get(Teacher, teacher_id)
    if not target_teacher or target_teacher.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found in your school.",
        )

    return await timetable_service.find_teacher_free_slots(db=db, teacher_id=teacher_id, school_id=current_profile.school_id, target_date=target_date)
