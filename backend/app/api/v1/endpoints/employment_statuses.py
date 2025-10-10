# backend/app/api/v1/endpoints/employment_statuses.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db

# CHANGED: Import all necessary schemas
from app.schemas.employment_status_schema import (
    EmploymentStatusCreate,
    EmploymentStatusOut,
    EmploymentStatusUpdate,
)
from app.services import employment_status_service

router = APIRouter()


@router.post(
    "/",
    response_model=EmploymentStatusOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_employment_status(*, db: AsyncSession = Depends(get_db), status_in: EmploymentStatusCreate):
    """Create a new employment status category for a school. Admin only."""
    return await employment_status_service.create_status(db=db, status_in=status_in)


@router.get(
    "/{school_id}/all",
    response_model=list[EmploymentStatusOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_statuses(school_id: int, db: AsyncSession = Depends(get_db)):
    """Get all employment status categories for a school. Admin only."""
    return await employment_status_service.get_all_statuses_for_school(db=db, school_id=school_id)


# ADDED: Endpoint to get a single status by its ID
@router.get(
    "/{status_id}",
    response_model=EmploymentStatusOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_status_by_id(status_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific employment status by its ID. Admin only."""
    status = await employment_status_service.get_status_by_id(db=db, status_id=status_id)
    if not status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employment status not found",
        )
    return status


# ADDED: Endpoint to update a status
@router.put(
    "/{status_id}",
    response_model=EmploymentStatusOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_status(
    status_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    status_in: EmploymentStatusUpdate,
):
    """Update an employment status. Admin only."""
    db_status = await employment_status_service.get_status_by_id(db=db, status_id=status_id)
    if not db_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employment status not found",
        )
    return await employment_status_service.update_status(db=db, db_obj=db_status, status_in=status_in)


# ADDED: Endpoint to delete a status
@router.delete(
    "/{status_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_existing_status(status_id: int, db: AsyncSession = Depends(get_db)):
    """Permanently delete an employment status. Admin only."""
    db_status = await employment_status_service.get_status_by_id(db=db, status_id=status_id)
    if not db_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employment status not found",
        )
    await employment_status_service.delete_status(db=db, db_obj=db_status)
    return None
