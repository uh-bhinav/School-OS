from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.academic_year_schema import (
    AcademicYearCreate,
    AcademicYearOut,
    AcademicYearUpdate,
)
from app.services import academic_year_service

router = APIRouter()


@router.get(
    "/",
    response_model=list[AcademicYearOut],
)
async def list_academic_years(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
    include_inactive: bool = False,
):
    """
    Retrieve all academic years for the user's school.
    (Any authenticated user can view).
    Admins can optionally include inactive years.
    """
    # Only Admins are allowed to see inactive years
    if not deps.is_school_admin(current_profile):
        include_inactive = False

    years = await academic_year_service.get_academic_years_for_school(db, school_id=current_profile.school_id, include_inactive=include_inactive)
    return years


@router.get(
    "/active",
    response_model=AcademicYearOut,
)
async def get_active_academic_year(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get the single currently active academic year for the user's school.
    (Any authenticated user can view).
    """
    year = await academic_year_service.get_active_academic_year(db, school_id=current_profile.school_id)
    if not year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active academic year found for this school.",
        )
    return year


@router.post(
    "/",
    response_model=AcademicYearOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],  # Admin Only
)
async def create_academic_year(
    year_in: AcademicYearCreate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),  # Ensures profile is Admin
):
    """
    (Admin Only) Create a new academic year.
    The school_id from the request body is validated against the user's token.
    """
    if year_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create academic years for your own school.",
        )

    year = await academic_year_service.create_academic_year(db, year_in=year_in)
    return year


# NEW: Get a single academic year by ID
@router.get(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def get_academic_year_by_id(
    year_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get a specific academic year by ID.
    Only returns the year if it belongs to the user's school.
    """
    year = await academic_year_service.get_academic_year(db, year_id)
    if not year or year.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found or you do not have permission to view it.",
        )
    return year


@router.put(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],  # Admin Only
)
async def update_academic_year(
    year_id: int,
    year_in: AcademicYearUpdate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    (Admin Only) Update an academic year.
    """
    db_obj = await academic_year_service.get_academic_year(db, year_id)
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found or you do not have permission to edit it.",
        )

    updated_year = await academic_year_service.update_academic_year(db, db_obj=db_obj, year_in=year_in)
    return updated_year


@router.post(
    "/{year_id}/set-active",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],  # Admin Only
)
async def set_active_academic_year(
    year_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    (Admin Only) Set a specific academic year as active.
    This will deactivate all other years for the school.
    """
    active_year = await academic_year_service.set_active_academic_year(db, school_id=current_profile.school_id, academic_year_id=year_id)
    if not active_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found or not in your school.",
        )
    return active_year


@router.delete(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],  # Admin Only
)
async def delete_academic_year(
    year_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    (Admin Only) Soft-delete an academic year.
    """
    db_obj = await academic_year_service.get_academic_year(db, year_id)
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found or you do not have permission to delete it.",
        )

    deleted_year = await academic_year_service.soft_delete_academic_year(db, year_id=year_id)
    if not deleted_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to delete academic year.",
        )

    # FIX: Refresh the object to load all attributes before serialization
    await db.refresh(deleted_year)

    return deleted_year


@router.get(
    "/school/{school_id}/all",
    response_model=list[AcademicYearOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_academic_years(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view academic years for your own school.",
        )
    return await academic_year_service.get_academic_years_for_school(db=db, school_id=school_id)


@router.get(
    "/school/{school_id}",
    response_model=list[AcademicYearOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def list_academic_years_for_school(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view academic years for your own school.",
        )
    return await academic_year_service.get_academic_years_for_school(db=db, school_id=school_id, include_inactive=True)


# RESTful GET for the current active year
@router.get(
    "/{school_id}/active",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_the_active_year(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get the currently active academic year for a school.
    """
    active_year = await academic_year_service.get_active_academic_year(db=db, school_id=school_id)
    if not active_year or active_year.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active academic year found for this school.",
        )
    return active_year


# RESTful PUT for setting the active year
@router.put(
    "/{school_id}/set-active/{academic_year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def set_the_active_year(
    school_id: int,
    academic_year_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Set a specific academic year as the active one for a school.
    """
    updated_year = await academic_year_service.set_active_academic_year(db=db, school_id=school_id, academic_year_id=academic_year_id)
    if not updated_year or updated_year.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=("Academic year not found or does not belong to the " "specified school."),
        )
    return updated_year
