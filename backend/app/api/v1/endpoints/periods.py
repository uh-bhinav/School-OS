# backend/app/api/v1/endpoints/periods.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.models.period import Period
from app.schemas.period_schema import PeriodCreate, PeriodOut, PeriodUpdate
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
async def create_new_period(*, db: AsyncSession = Depends(get_db), period_in: PeriodCreate):
    """Create a new period time slot (e.g., add
    9:00 AM - 9:45 AM slot). Admin only."""
    return await period_service.create_period(db=db, period_in=period_in)


# 2. GET ALL: Get All Active Periods (Admin Only)
@router.get(
    "/school/{school_id}/all",
    response_model=list[PeriodOut],
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def get_all_periods(school_id: int, db: AsyncSession = Depends(get_db)):
    """Get all active periods for a school. Admin only."""
    # Service layer applies is_active filter
    return await period_service.get_all_periods_for_school(db=db, school_id=school_id)


# 3. GET ONE: Get Single Active Period (Admin Only)
@router.get(
    "/{period_id}",
    response_model=PeriodOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def get_period_by_id(period_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single active period by ID. Admin only."""
    period = await period_service.get_period(db=db, period_id=period_id)
    if not period:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Period not found or inactive")
    return period


# 4. PUT: Update Existing Period (Admin Only)
@router.put(
    "/{period_id}",
    response_model=PeriodOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Periods"],
)
async def update_existing_period(period_id: int, *, db: AsyncSession = Depends(get_db), period_in: PeriodUpdate):
    """Update period details (e.g., change start time). Admin only."""
    # The read filter is applied in get_period, but
    #  Admin should be able to update inactive periods too.
    # We fetch by PK directly here to allow
    # Admin to revive or modify inactive period objects.
    db_period = await db.get(Period, period_id)
    if not db_period:
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
async def delete_period_by_id(period_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivate a period (Soft Delete). Admin only."""
    # Fetch by PK directly to find the period,
    # even if it's already inactive.
    db_period = await db.get(Period, period_id)
    if not db_period:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Period not found")

    if not db_period.is_active:
        # If already inactive, confirm success and return 204
        return None

    # Call the service function to set is_active=False
    await period_service.delete_period(db=db, db_obj=db_period)
    return None
