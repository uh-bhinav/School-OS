# backend/app/api/v1/endpoints/timetable_generation.py
"""
Timetable Generation API Endpoints.

These endpoints allow school admins to generate and validate timetables using AI.

Security:
- All endpoints require Admin role
- User can only generate timetables for their school
- Class/teacher/subject IDs are validated against school ownership

Architecture Pattern (matches carts.py):
- Endpoint validates auth and extracts user context (school_id)
- Service class is instantiated with db session
- All business logic delegated to service layer
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.timetable import Timetable
from app.schemas.timetable_schema import (
    ConflictCheckResponse,
    TeacherAvailabilityCheck,
    TimetableEntryOut,
    TimetableGenerateRequest,
    TimetableGenerateResponse,
    TimetableSwapRequest,
    TimetableSwapResponse,
)
from app.services.timetable_generation_service import TimetableGenerationService

router = APIRouter()


@router.post(
    "/generate",
    response_model=TimetableGenerateResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("Admin"))],
    summary="Generate Timetable with AI",
    description="""
    **Generate a complete timetable for a class using AI scheduling.**

    Features:
    - Validates all constraints before scheduling
    - Handles consecutive periods (labs)
    - Respects teacher availability
    - Enforces subject timing restrictions (e.g., PE in last 2 periods)
    - Ensures minimum gap between subject occurrences
    - Prioritizes core subjects in morning slots
    - Supports both dry-run (preview) and actual save

    Returns detailed metrics including:
    - Successfully placed entries
    - Unassigned subjects with reasons
    - Warnings (soft constraint violations)
    - Conflicts (hard constraint violations)
    - Optimization score (0-100)
    """,
)
async def generate_class_timetable(
    request: TimetableGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Generate a timetable for a class with intelligent constraint handling.

    **Request Body Example:**
    ```json
    {
      "class_id": 19,
      "academic_year_id": 2,
      "working_days": [1, 2, 3, 4, 5, 6],
      "subject_requirements": [
        {
          "subject_id": 2,
          "teacher_id": 13,
          "periods_per_week": 5,
          "is_core": true,
          "requires_consecutive": false,
          "min_gap_days": 1
        }
      ],
      "constraints": [],
      "dry_run": true
    }
    ```
    """
    # Security Validation 1: Verify class belongs to user's school
    target_class = await db.get(Class, request.class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The specified class does not belong to your school.",
        )

    # Security Validation 2: Verify all teachers belong to user's school
    for req in request.subject_requirements:
        teacher = await db.get(Teacher, req.teacher_id)
        if not teacher or teacher.school_id != current_profile.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Teacher {req.teacher_id} does not belong to your school.",
            )

    # Security Validation 3: Verify all subjects belong to user's school
    for req in request.subject_requirements:
        subject = await db.get(Subject, req.subject_id)
        if not subject or subject.school_id != current_profile.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Subject {req.subject_id} does not belong to your school.",
            )

    # Business Logic: Delegate to service
    try:
        service = TimetableGenerationService(db)
        response = await service.generate_timetable(request=request, school_id=current_profile.school_id)  # Security context from JWT
        return response
    except Exception as e:
        # If any exception occurs, the get_db() dependency will handle rollback
        # We just need to return a proper HTTP error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Timetable generation failed: {str(e)}")


@router.post(
    "/check-conflict",
    response_model=ConflictCheckResponse,
    dependencies=[Depends(require_role("Admin"))],
    summary="Check for Scheduling Conflicts",
    description="""
    **Validate if a teacher placement would create a conflict.**

    Use this before drag-and-drop operations or manual edits to prevent:
    - Teacher double-booking (same teacher, same time)
    - Invalid period assignments

    This is used by the frontend for real-time validation during manual edits.
    """,
)
async def check_scheduling_conflict(
    check: TeacherAvailabilityCheck,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Check if assigning a teacher to a slot creates a conflict.

    **Example Request:**
    ```json
    {
      "teacher_id": 13,
      "class_id": 19,
      "day_of_week": 1,
      "period_id": 2
    }
    ```
    """
    # Security: Verify teacher belongs to user's school
    teacher = await db.get(Teacher, check.teacher_id)
    if not teacher or teacher.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher does not belong to your school.",
        )

    # Security: Verify class belongs to user's school
    target_class = await db.get(Class, check.class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Class does not belong to your school.",
        )

    # Business Logic: Delegate to service
    service = TimetableGenerationService(db)
    has_conflict, details = await service.check_teacher_conflict(teacher_id=check.teacher_id, day_of_week=check.day_of_week, period_id=check.period_id)

    return ConflictCheckResponse(has_conflict=has_conflict, conflict_type="teacher_double_booking" if has_conflict else None, details=details)


@router.delete(
    "/clear/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    summary="Clear Timetable for Class",
    description="Soft-delete all timetable entries for a class (sets is_active=False)",
)
async def clear_class_timetable(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Clear all timetable entries for a class to start fresh.

    This is useful when:
    - Regenerating a timetable with different constraints
    - Starting a new academic year
    - Fixing major scheduling issues

    **Note:** This is a soft-delete (is_active=False), so data is preserved.
    """
    # Security check
    target_class = await db.get(Class, class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The specified class does not belong to your school.",
        )

    # Business Logic: Soft-delete timetable entries
    stmt = update(Timetable).where(Timetable.class_id == class_id, Timetable.is_active).values(is_active=False)

    await db.execute(stmt)
    await db.commit()

    return None


@router.post(
    "/swap",
    response_model=TimetableSwapResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("Admin"))],
    summary="Manually Swap Two Timetable Entries",
    description="""
    **Manually swap two timetable entries for principal-level adjustments.**

    This endpoint allows school administrators to fine-tune generated timetables
    without regenerating the entire schedule. The swap will be rejected if it
    creates teacher conflicts (double-booking).

    Use Cases:
    - Adjust generated timetable to match teacher preferences
    - Fix specific scheduling issues without full regeneration
    - Accommodate last-minute teacher availability changes

    Validation:
    - Both entries must belong to the same school
    - Both entries must be editable (is_editable=True)
    - Swap must not create teacher double-booking
    - All changes are logged with user ID and timestamp

    Returns:
    - Success response with updated entries
    - Failure response with conflict details
    """,
)
async def swap_timetable_entries(
    swap_request: TimetableSwapRequest,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Swap two timetable entries after validating no conflicts occur.

    **Request Body Example:**
    ```json
    {
      "class_id": 19,
      "entry_1_id": 145,
      "entry_2_id": 203
    }
    ```

    **Success Response:**
    ```json
    {
      "success": true,
      "message": "Timetable entries swapped successfully",
      "swapped_entries": [
        {"id": 145, "day_of_week": 2, "period_id": 3, ...},
        {"id": 203, "day_of_week": 4, "period_id": 5, ...}
      ],
      "conflict_details": null
    }
    ```

    **Failure Response:**
    ```json
    {
      "success": false,
      "message": "Cannot swap: Teacher 13 already teaching Class 20 at this time",
      "swapped_entries": null,
      "conflict_details": "Teacher double-booking detected"
    }
    ```
    """
    # Security Validation: Verify class belongs to user's school
    target_class = await db.get(Class, swap_request.class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The specified class does not belong to your school.",
        )

    # Business Logic: Delegate to service
    # Extract user_id from authenticated profile (JWT token)
    service = TimetableGenerationService(db)
    success, message, swapped_entries = await service.swap_timetable_entries(
        entry_1_id=swap_request.entry_1_id, entry_2_id=swap_request.entry_2_id, performed_by_user_id=current_profile.user_id, school_id=current_profile.school_id  # Extract from JWT
    )

    # Convert Timetable models to TimetableEntryOut schemas
    # The schema uses from_attributes=True so it will auto-map the relationships
    swapped_entries_out = None
    if swapped_entries:
        swapped_entries_out = [TimetableEntryOut.model_validate(entry) for entry in swapped_entries]

    return TimetableSwapResponse(success=success, message=message, swapped_entries=swapped_entries_out, conflict_details=None if success else message)
