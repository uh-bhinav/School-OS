from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.academic_year_schema import (
    AcademicYearCreate,
    AcademicYearOut,
    AcademicYearUpdate,
)
from app.services import academic_year_service

# --- Router Definition ---
router = APIRouter()


@router.post(
    "/",
    response_model=AcademicYearOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_academic_year(
    *,
    db: AsyncSession = Depends(get_db),
    year_in: AcademicYearCreate,
):
    return await academic_year_service.create_academic_year(db=db, year_in=year_in)


@router.get(
    "/all",
    response_model=list[AcademicYearOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_academic_years(db: AsyncSession = Depends(get_db)):
    return await academic_year_service.get_all_academic_years(db=db)


@router.get(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_academic_year_details(year_id: int, db: AsyncSession = Depends(get_db)):
    year = await academic_year_service.get_academic_year(db, year_id)
    if not year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Academic year not found"
        )
    return year


@router.put(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_academic_year_details(
    year_id: int,
    year_in: AcademicYearUpdate,
    db: AsyncSession = Depends(get_db),
):
    db_obj = await academic_year_service.get_academic_year(db, year_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Academic year not found"
        )
    return await academic_year_service.update_academic_year(
        db, db_obj=db_obj, year_in=year_in
    )


@router.delete(
    "/{year_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_academic_year(year_id: int, db: AsyncSession = Depends(get_db)):
    deleted_year = await academic_year_service.soft_delete_academic_year(
        db, year_id=year_id
    )
    if not deleted_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Academic year not found"
        )
    return None


@router.post(
    "/{academic_year_id}/activate",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def activate_academic_year_endpoint(
    academic_year_id: int,
    db: AsyncSession = Depends(get_db),
):
    updated_year = await academic_year_service.activate_academic_year(
        db, academic_year_id
    )
    if not updated_year:
        # E501 Fix: Breaking the detail string
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Academic year not found "
        )
    return updated_year
