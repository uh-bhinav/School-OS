# backend/app/api/v1/endpoints/teachers.py
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import require_role
from app.db.session import get_db
from app.models.profile import Profile

# CHANGED: Import the new TeacherQualification schema
from app.schemas.teacher_schema import TeacherOut, TeacherQualification, TeacherUpdate
from app.services import teacher_service

router = APIRouter()

AdminUser = Depends(require_role("Admin"))


@router.get(
    "/school/{school_id}",
    response_model=list[TeacherOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_teachers_for_school_id(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all teacher records for a specific school. Admin only.
    """
    return await teacher_service.get_all_teachers_for_school(db=db, school_id=school_id)


@router.get(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[AdminUser],
)
async def get_teacher_by_id(
    teacher_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Get a specific teacher by their teacher_id.
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)

    # CRITICAL SECURITY CHECK
    if not db_teacher or db_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return db_teacher


# ADDED: New endpoint for getting qualifications
@router.get(
    "/{teacher_id}/qualifications",
    response_model=TeacherQualification,
    dependencies=[AdminUser],
)
async def get_teacher_qualifications_by_id(
    teacher_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Get a teacher's specific qualifications and experience.
    """
    # CRITICAL SECURITY CHECK
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)
    if not db_teacher or db_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    qualifications = await teacher_service.get_teacher_qualifications(db=db, teacher_id=teacher_id)
    if not qualifications:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualifications not found for this teacher",
        )
    return qualifications


@router.put(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[AdminUser],
)
async def update_existing_teacher(
    teacher_id: int,
    teacher_in: TeacherUpdate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Update a teacher's employment details.
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)

    # CRITICAL SECURITY CHECK
    if not db_teacher or db_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return await teacher_service.update_teacher(db=db, db_obj=db_teacher, teacher_in=teacher_in)


# --- END REFACTOR ---


@router.delete(
    "/{teacher_id}",
    response_model=TeacherOut,
    dependencies=[AdminUser],
)
async def deactivate_existing_teacher(
    teacher_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Deactivate a teacher (soft delete).
    """
    db_teacher = await teacher_service.get_teacher(db=db, teacher_id=teacher_id)

    # CRITICAL SECURITY CHECK
    if not db_teacher or db_teacher.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return await teacher_service.deactivate_teacher(db=db, db_obj=db_teacher)


# --- END REFACTOR ---


@router.get(
    "/",
    response_model=list[TeacherOut],
    dependencies=[AdminUser],
)
async def get_all_teachers(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Get all teacher records for the admin's school.
    Gets school_id from the user's token.
    """
    return await teacher_service.get_all_teachers_for_school(db=db, school_id=current_profile.school_id)


# --- END REFACTOR ---


# --- NEW, ESSENTIAL ENDPOINT ---
@router.get(
    "/search",
    response_model=list[TeacherOut],
    dependencies=[AdminUser],
)
async def search_teachers(
    *,
    name: Optional[str] = None,
    department: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Flexibly search for teachers in the admin's school.
    Can search by name or department.
    """
    # Build the filters dictionary
    filters = {}
    if name is not None:
        filters["name"] = name
    if department is not None:
        filters["department"] = department

    # This assumes a 'search_teachers' function exists in your service
    # similar to the one we planned for 'subject_service'.
    teachers = await teacher_service.search_teachers(db=db, school_id=current_profile.school_id, filters=filters)

    if not teachers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No teachers found matching the criteria.",
        )
    return teachers


# --- END NEW ENDPOINT ---
