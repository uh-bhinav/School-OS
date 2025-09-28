# backend/app/api/v1/endpoints/periods.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role

# No longer need 'from typing import List'
from app.db.session import get_db
from app.schemas.period_schema import PeriodCreate, PeriodOut, PeriodUpdate
from app.services import period_service

router = APIRouter()


# ... (POST and PUT endpoints are unchanged) ...
@router.post(
    "/",
    response_model=PeriodOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_period(
    *, db: AsyncSession = Depends(get_db), period_in: PeriodCreate
):
    return await period_service.create_period(db=db, period_in=period_in)


@router.get(
    "/{school_id}/all",
    response_model=list[PeriodOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_periods(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all periods for a school. Admin only.
    """
    return await period_service.get_all_periods_for_school(db=db, school_id=school_id)


@router.put(
    "/{period_id}",
    response_model=PeriodOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_period(
    period_id: int, *, db: AsyncSession = Depends(get_db), period_in: PeriodUpdate
):
    db_period = await period_service.get_period(db=db, period_id=period_id)
    if not db_period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Period not found"
        )

    updated_period = await period_service.update_period(
        db=db, db_obj=db_period, period_in=period_in
    )
    return updated_period
