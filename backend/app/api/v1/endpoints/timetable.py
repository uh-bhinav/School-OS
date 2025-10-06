# backend/app/api/v1/endpoints/timetable.py

from datetime import date
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.timetable_schema import (
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
    timetable_in: TimetableEntryCreate, db: AsyncSession = Depends(get_db)
):
    """
    Create a new timetable entry. Admin only.
    """
    return await timetable_service.create_timetable_entry(
        db=db, timetable_in=timetable_in
    )


# Student/Parent only: Get timetable for a specific class
@router.get(
    "/classes/{class_id}",
    response_model=list[TimetableEntryOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Student", "Parent"))],
)
async def get_timetable_for_class(class_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get the timetable for a specific class.
    """
    timetable = await timetable_service.get_class_timetable(db=db, class_id=class_id)
    if not timetable:
        raise HTTPException(
            status_code=404, detail="Timetable not found for this class."
        )
    return timetable


# Teacher only: Get personalized timetable
@router.get(
    "/teachers/{teacher_id}",
    response_model=list[TimetableEntryOut],
    dependencies=[Depends(require_role("Teacher"))],
)
async def get_timetable_for_teacher(
    teacher_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Get the personalized timetable for a specific teacher.
    """
    timetable = await timetable_service.get_teacher_timetable(
        db=db, teacher_id=teacher_id
    )
    if not timetable:
        raise HTTPException(
            status_code=404, detail="Timetable not found for this teacher."
        )
    return timetable


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
):
    db_obj = await timetable_service.get_timetable_entry_by_id(db, entry_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")
    return await timetable_service.update_timetable_entry(
        db, db_obj=db_obj, timetable_in=timetable_in
    )


# Admin only: Soft-delete an existing timetable entry
@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_timetable_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    """
    Soft-deletes a timetable entry by setting its is_active flag to false.
    """
    deleted_entry = await timetable_service.soft_delete_timetable_entry(
        db, entry_id=entry_id
    )
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
    schedule_date: date = Query(
        ..., description="The date for the schedule in YYYY-MM-DD format"
    ),
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
