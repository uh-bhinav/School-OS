# REPLACE the entire import block at the top of the file with this:
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

router = APIRouter()


@router.post(
    "/",
    response_model=AcademicYearOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_academic_year(
    year_in: AcademicYearCreate, db: AsyncSession = Depends(get_db)
):
    """
    Create a new academic year. Admin only.
    """
    return await academic_year_service.create_academic_year(db=db, year_in=year_in)


@router.get(
    "/{year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def get_academic_year_by_id(year_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a single academic year by its ID.
    """
    db_year = await academic_year_service.get_academic_year(db, year_id=year_id)
    if not db_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found",
        )
    return db_year


@router.get(
    "/school/{school_id}",
    response_model=list[AcademicYearOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_years_for_school(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all active academic years for a specific school.
    """
    return await academic_year_service.get_all_academic_years_for_school(
        db, school_id=school_id
    )


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
    """
    Update an academic year's details.
    """
    db_obj = await academic_year_service.get_academic_year(db, year_id=year_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found",
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
    """
    Soft-deletes an academic year.
    """
    deleted_year = await academic_year_service.soft_delete_academic_year(
        db, year_id=year_id
    )
    if not deleted_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active academic year with id {year_id} not found",
        )
    return None


@router.get(
    "/{school_id}/active",
    response_model=AcademicYearOut,
    # This can be accessed by any authenticated user of the school
    dependencies=[Depends(require_role("Admin"))],  # Or Teacher, Parent, etc.
)
async def get_the_active_year(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get the currently active academic year for a school.
    """
    active_year = await academic_year_service.get_active_academic_year(
        db=db, school_id=school_id
    )
    if not active_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active academic year found for this school.",
        )
    return active_year


@router.put(
    "/{school_id}/set-active/{academic_year_id}",
    response_model=AcademicYearOut,
    dependencies=[Depends(require_role("Admin"))],
)
# This is the corrected function
async def set_the_active_year(
    school_id: int, academic_year_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Set a specific academic year as the active one for a school.
    """
    updated_year = await academic_year_service.set_active_academic_year(
        db=db, school_id=school_id, academic_year_id=academic_year_id
    )
    if not updated_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            # The long line is broken into a multi-line string
            detail=(
                "Academic year not found or does not belong to the "
                "specified school."
            ),
        )
    return updated_year

# A newline character is implicitly added here at the end of the file.
