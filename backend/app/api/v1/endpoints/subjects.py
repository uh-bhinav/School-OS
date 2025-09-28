# backend/app/api/v1/endpoints/subjects.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role

# No longer need 'from typing import List'
from app.db.session import get_db
from app.schemas.subject_schema import SubjectCreate, SubjectOut, SubjectUpdate
from app.services import subject_service

router = APIRouter()


# ... (POST, GET by id, and PUT endpoints are unchanged) ...
@router.post(
    "/",
    response_model=SubjectOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_subject(
    *, db: AsyncSession = Depends(get_db), subject_in: SubjectCreate
):
    return await subject_service.create_subject(db=db, subject_in=subject_in)


@router.get(
    "/{school_id}/all",
    response_model=list[SubjectOut],  # Changed from List to list
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_subjects(school_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get all subjects for a school. Admin only.
    """
    return await subject_service.get_all_subjects_for_school(db=db, school_id=school_id)


@router.get(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def get_subject_by_id(subject_id: int, db: AsyncSession = Depends(get_db)):
    db_subject = await subject_service.get_subject(db=db, subject_id=subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
        )
    return db_subject


@router.put(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_subject(
    subject_id: int, *, db: AsyncSession = Depends(get_db), subject_in: SubjectUpdate
):
    db_subject = await subject_service.get_subject(db=db, subject_id=subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
        )

    updated_subject = await subject_service.update_subject(
        db=db, db_obj=db_subject, subject_in=subject_in
    )
    return updated_subject
