# backend/app/api/v1/endpoints/schools.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile  # We need the Profile model for type hinting
from app.schemas.school_schema import SchoolOut, SchoolUpdate
from app.services import school_service

router = APIRouter()


@router.get(
    "/{school_id}",
    response_model=SchoolOut,
)
async def get_school_details(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get details for a specific school.
    Users can only retrieve information for their own school.
    """
    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this school's information.",
        )

    db_school = await school_service.get_school(db=db, school_id=school_id)
    if not db_school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="School not found"
        )
    return db_school


@router.put(
    "/{school_id}",
    response_model=SchoolOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_school_details(
    school_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    school_in: SchoolUpdate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Update a school's details. Admins only.
    Admins can only update their own school.
    """
    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own school's information.",
        )

    db_school = await school_service.get_school(db=db, school_id=school_id)
    if not db_school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="School not found"
        )

    updated_school = await school_service.update_school(
        db=db, db_obj=db_school, school_in=school_in
    )
    return updated_school
