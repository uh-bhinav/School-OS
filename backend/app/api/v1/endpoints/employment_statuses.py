# backend/app/api/v1/endpoints/employment_statuses.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role

# No longer need 'from typing import List'
from app.db.session import get_db
from app.schemas.employment_status_schema import (
    EmploymentStatusCreate,
    EmploymentStatusOut,
)
from app.services import employment_status_service

router = APIRouter()


# ... (POST endpoint is unchanged) ...
@router.post(
    "/",
    response_model=EmploymentStatusOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_employment_status(
    *, db: AsyncSession = Depends(get_db), status_in: EmploymentStatusCreate
):
    return await employment_status_service.create_status(db=db, status_in=status_in)


@router.get(
    "/{school_id}/all",
    response_model=list[EmploymentStatusOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_statuses(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all employment status categories for a school. Admin only.
    """
    return await employment_status_service.get_all_statuses_for_school(
        db=db, school_id=school_id
    )
