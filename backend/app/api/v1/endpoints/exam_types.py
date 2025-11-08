# backend/app/api/v1/endpoints/exam_types.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps  # Use the standard deps file
from app.core.security import require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.exam_type_schema import ExamTypeCreate, ExamTypeOut, ExamTypeUpdate
from app.services import exam_type_service

router = APIRouter()

# Dependency for Admin role check
AdminUser = Depends(require_role("Admin"))


@router.post(
    "/",
    response_model=ExamTypeOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[AdminUser],
)
async def create_new_exam_type(
    *,
    db: AsyncSession = Depends(deps.get_db_session),
    exam_type_in: ExamTypeCreate,
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Create a new exam type category for a school.
    """
    # --- SECURITY FIX: Validate school_id ---
    if exam_type_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create exam types for your own school.",
        )
    # --- END FIX ---
    return await exam_type_service.create_exam_type(db=db, exam_type_in=exam_type_in)


# --- REFACTORED ENDPOINT ---
# Old Path: /{school_id}/all
# New Path: /
@router.get(
    "/",
    response_model=List[ExamTypeOut],
    dependencies=[AdminUser],  # Only Admins should manage this
)
async def get_all_exam_types(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Get all exam type categories for the admin's school.
    """
    return await exam_type_service.get_all_exam_types_for_school(db=db, school_id=current_profile.school_id)


# --- END REFACTOR ---


# --- NEW, ESSENTIAL ENDPOINT ---
@router.get(
    "/{exam_type_id}",
    response_model=ExamTypeOut,
    dependencies=[AdminUser],
)
async def get_exam_type_by_id(
    exam_type_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Get a single exam type by its ID.
    """
    db_obj = await exam_type_service.get_exam_type_by_id(db=db, exam_type_id=exam_type_id)

    # CRITICAL SECURITY CHECK
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam type not found")
    return db_obj


# --- END NEW ENDPOINT ---


# --- NEW, ESSENTIAL ENDPOINT ---
@router.put(
    "/{exam_type_id}",
    response_model=ExamTypeOut,
    dependencies=[AdminUser],
)
async def update_exam_type(
    exam_type_id: int,
    exam_type_in: ExamTypeUpdate,  # Assumes ExamTypeUpdate schema exists
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Update an exam type's details.
    """
    db_obj = await exam_type_service.get_exam_type_by_id(db=db, exam_type_id=exam_type_id)

    # CRITICAL SECURITY CHECK
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam type not found")

    return await exam_type_service.update_exam_type(db=db, db_obj=db_obj, exam_type_in=exam_type_in)


# --- END NEW ENDPOINT ---


# --- NEW, ESSENTIAL ENDPOINT ---
@router.delete(
    "/{exam_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[AdminUser],
)
async def delete_exam_type(
    exam_type_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Deletes an exam type.
    """
    db_obj = await exam_type_service.get_exam_type_by_id(db=db, exam_type_id=exam_type_id)

    # CRITICAL SECURITY CHECK
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam type not found")

    await exam_type_service.delete_exam_type(db=db, exam_type_id=exam_type_id)
    return None


# --- END NEW ENDPOINT ---


@router.get(
    "/{school_id}/all",
    response_model=list[ExamTypeOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_exam_types_for_school_id(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all exam type categories for a school. Admin only.
    """
    return await exam_type_service.get_all_exam_types_for_school(db=db, school_id=school_id)
