# backend/app/api/v1/endpoints/classes.py
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.class_schema import (
    ClassCreate,
    ClassOut,
    ClassSubjectsAssign,
    ClassUpdate,
)
from app.services import class_service

router = APIRouter()


@router.post(
    "/",
    response_model=ClassOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_class(class_in: ClassCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new class. Admin only.
    """
    return await class_service.create_class(db=db, class_in=class_in)


@router.get(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_class_by_id(class_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a single class by its ID.
    """
    db_class = await class_service.get_class(db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    return db_class


@router.get(
    "/school/{school_id}",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_classes_for_school(
    school_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Get all active classes for a specific school.
    """
    return await class_service.get_all_classes_for_school(db, school_id=school_id)


# NEW: Endpoint to assign subjects to a class
@router.post(
    "/{class_id}/subjects",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def assign_subjects(
    class_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    subjects_in: ClassSubjectsAssign,
    current_profile: Profile = Depends(get_current_user_profile),
):
    db_class = await class_service.get_class(
        db=db, class_id=class_id, school_id=current_profile.school_id
    )
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
        )
    return await class_service.assign_subjects_to_class(
        db=db, db_class=db_class, subject_ids=subjects_in.subject_ids
    )


@router.get(
    "/search/{school_id}",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def search_for_classes(
    school_id: int,
    *,
    grade_level: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Flexibly search for classes within the admin's school based on query parameters.
    """
    # Security check: Ensure the admin is searching within their own school
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot search in other schools.",
        )

    # Build the filters dictionary from the provided query parameters
    filters = {}
    if grade_level is not None:
        filters["grade_level"] = grade_level
    if academic_year_id is not None:
        filters["academic_year_id"] = academic_year_id
    if teacher_id is not None:
        filters["teacher_id"] = teacher_id

    return await class_service.search_classes(
        db=db, school_id=school_id, filters=filters
    )


@router.put(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_class_details(
    class_id: int,
    class_in: ClassUpdate,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update a class's details.
    """

    db_obj = await class_service.get_class(
        db, class_id=class_id, school_id=current_profile.school_id
    )
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    return await class_service.update_class(db=db, db_obj=db_obj, class_in=class_in)


@router.delete(
    "/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    """
    Soft-deletes a class.
    """
    deleted_class = await class_service.soft_delete_class(db, class_id=class_id)
    if not deleted_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active class with id {class_id} not found",
        )
    return None
