# backend/app/api/v1/endpoints/subjects.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.subject_schema import SubjectCreate, SubjectOut, SubjectUpdate
from app.schemas.teacher_schema import TeacherOut
from app.services import subject_service

router = APIRouter()


@router.post(
    "/",
    response_model=SubjectOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_subject(
    *,
    db: AsyncSession = Depends(get_db),
    subject_in: SubjectCreate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Create a new subject. Admin only."""
    if subject_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create subjects for your own school.",
        )
    return await subject_service.create_subject(db=db, subject_in=subject_in)


@router.get(
    "/{school_id}/all",
    response_model=list[SubjectOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Allow Teachers too
)
async def get_all_subjects(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get all active subjects for a school."""
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view subjects for your own school.",
        )
    return await subject_service.get_all_subjects_for_school(db=db, school_id=school_id)


@router.get(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Allow Teachers too
)
async def get_subject_by_id(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Get a single subject by its ID."""
    db_subject = await subject_service.get_subject_with_streams(
        db=db, subject_id=subject_id
    )
    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
        )
    return db_subject


@router.get(
    "/{subject_id}/teachers",
    response_model=list[TeacherOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_teachers_for_subject_endpoint(
    subject_id: int,
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Find all teachers in a school qualified to teach a specific subject."""
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only search for teachers in your own school.",
        )

    teachers = await subject_service.get_teachers_for_subject(
        db=db, school_id=school_id, subject_id=subject_id
    )
    return teachers


@router.put(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_subject(
    subject_id: int,
    *,
    db: AsyncSession = Depends(get_db),
    subject_in: SubjectUpdate,
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Update a subject's details. Admin only."""
    db_subject = await subject_service.get_subject_with_streams(
        db=db, subject_id=subject_id
    )

    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
        )

    updated_subject = await subject_service.update_subject(
        db=db, db_obj=db_subject, subject_in=subject_in
    )
    return updated_subject


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Soft-deletes a subject. Admin only."""
    db_subject = await subject_service.get_subject_with_streams(
        db=db, subject_id=subject_id
    )
    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found"
        )

    await subject_service.soft_delete_subject(db, subject_id=subject_id)
    return None
