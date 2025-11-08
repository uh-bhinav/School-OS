# backend/app/api/v1/endpoints/periods.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.class_model import Class
from app.models.period import Period
from app.models.profile import Profile
from app.schemas.period_schema import PeriodCreate, PeriodCreateRequest, PeriodOut, PeriodStructureCreate, PeriodUpdate
from app.services import period_service

# Required for direct DB access in DELETE/GET


router = APIRouter()


# 1. POST: Create New Period (Admin Only)
@router.post(
    "/",
    response_model=PeriodOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def create_new_period(
    *,
    db: AsyncSession = Depends(get_db),
    period_request: PeriodCreateRequest,  # <-- Use the new request schema
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Create a new period time slot. Admin only.
    The school_id is automatically taken from the authenticated user.
    """
    # Securely create the internal schema by merging the request
    # with the profile's trusted school_id.
    period_in = PeriodCreate(**period_request.model_dump(), school_id=current_profile.school_id)

    # The check for `period_in.school_id != ...` is NO LONGER NEEDED.
    # It's impossible for them to be different.
    return await period_service.create_period(db=db, period_in=period_in)


# 2. GET ALL: Get All Active Periods (Admin Only)
@router.get(
    "/school/{school_id}/all",
    response_model=list[PeriodOut],
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def get_all_periods_for_school_id(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get all active periods for a school. Admin only."""
    # Service layer applies is_active filter
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view periods for another school.",
        )
    return await period_service.get_all_periods_for_school(db=db, school_id=school_id)


# 2. GET ALL: Get All Active Periods (Admin Only) - SECURE VERSION
@router.get(
    "/",  # <-- REMOVED /school/{school_id}/all
    response_model=list[PeriodOut],
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def get_all_periods(
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get all active periods for YOUR school. Admin only."""
    # The school_id is taken directly from the profile.
    # The client does not need to supply it.
    return await period_service.get_all_periods_for_school(db=db, school_id=current_profile.school_id)


# 3. GET ONE: Get Single Active Period (Admin Only)
@router.get(
    "/{period_id}",
    response_model=PeriodOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def get_period_by_id(
    period_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get a single active period by ID. Admin only."""
    period = await period_service.get_period(db=db, period_id=period_id)
    if not period or period.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Period not found or inactive")
    return period


# 4. PUT: Update Existing Period (Admin Only)
@router.put(
    "/{period_id}",
    response_model=PeriodOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def update_existing_period(
    period_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    period_in: PeriodUpdate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Update period details (e.g., change start time). Admin only."""
    # The read filter is applied in get_period, but
    #  Admin should be able to update inactive periods too.
    # We fetch by PK directly here to allow
    # Admin to revive or modify inactive period objects.
    db_period = await db.get(Period, period_id)
    if not db_period or db_period.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Period not found")

    updated_period = await period_service.update_period(db=db, db_obj=db_period, period_in=period_in)
    return updated_period


# 5. DELETE: Soft-Delete Period (Admin Only)
@router.delete(
    "/{period_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def delete_period_by_id(
    period_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Deactivate a period (Soft Delete). Admin only."""
    # Fetch by PK directly to find the period,
    # even if it's already inactive.
    db_period = await db.get(Period, period_id)
    if not db_period or db_period.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Period not found")

    if not db_period.is_active:
        # If already inactive, confirm success and return 204
        return None

    # Call the service function to set is_active=False
    await period_service.delete_period(db=db, db_obj=db_period)
    return None


@router.get(
    "/class/{class_id}/periods",
    response_model=list[PeriodOut],
    # Teachers and Admins should be able to see this
    dependencies=[Depends(require_role("Admin", "Teacher"))],
    tags=["Periods"],
)
async def get_periods_for_a_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all active, non-recess periods for the school that a specific class belongs to.
    """
    target_class = await db.get(Class, class_id)
    if not target_class or target_class.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found in your school.",
        )

    # Now that we've verified access, we can fetch the periods.
    return await period_service.fetch_periods_for_class(db=db, class_id=class_id)


@router.get(
    "/school/{school_id}/recess",
    response_model=list[PeriodOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Student"))],
    tags=["Periods"],
)
async def get_recess_periods_for_a_school(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    # CRITICAL SECURITY FIX: Add the current user profile dependency
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all periods that are marked as recess/breaks for a specific school.
    """
    # CRITICAL SECURITY FIX: Ensure the user is requesting their own school's data.
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this school's information.",
        )
    return await period_service.get_recess_periods(db=db, school_id=school_id)


@router.get(
    "/recess",  # <-- REMOVED /school/{school_id}/recess
    response_model=list[PeriodOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Student"))],
    tags=["Periods"],
)
async def get_recess_periods_(
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all periods that are marked as recess/breaks for YOUR school.
    """
    # The check is GONE. We just USE the profile's school_id.
    return await period_service.get_recess_periods(db=db, school_id=current_profile.school_id)


@router.post(
    "/structure",
    response_model=list[PeriodOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def set_period_structure(
    *,
    db: AsyncSession = Depends(get_db),
    structure_in: PeriodStructureCreate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    (ROBUST) Replaces the ENTIRE period structure for your school.
    Deletes all existing periods and creates the new ones provided.
    """
    return await period_service.bulk_replace_period_structure(db=db, school_id=current_profile.school_id, structure_in=structure_in)
