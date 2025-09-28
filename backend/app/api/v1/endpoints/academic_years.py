# backend/app/api/v1/endpoints/academic_years.py
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.academic_year_schema import (
    AcademicYearCreate,
    AcademicYearOut,
)
from app.services import academic_year_service

router = APIRouter()


@router.post(
    "/",
    response_model=AcademicYearOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_academic_year(
    *, db: AsyncSession = Depends(get_db), year_in: AcademicYearCreate
):
    """
    Create a new academic year for a school. Admin only.
    """
    return await academic_year_service.create_academic_year(db=db, year_in=year_in)


@router.get(
    "/{school_id}/all",
    response_model=List[AcademicYearOut],
    dependencies=[Depends(require_role("Admin"))],  # Or any authenticated user
)
async def get_all_years(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all academic years for a specific school.
    """
    return await academic_year_service.get_all_academic_years_for_school(
        db=db, school_id=school_id
    )
