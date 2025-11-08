from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps  # Use the standard deps file
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
    db: AsyncSession = Depends(deps.get_db_session),
    subject_in: SubjectCreate,
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Create a new subject."""
    if subject_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create subjects for your own school.",
        )
    return await subject_service.create_subject(db=db, subject_in=subject_in)


# --- REFACTORED ENDPOINT 1 ---
# Old Path: /{school_id}/all
# New Path: /
@router.get(
    "/",
    response_model=list[SubjectOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Allow Teachers too
)
async def get_all_subjects(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """Get all active subjects for the user's school."""
    # The school_id is now taken from the user's token, not the URL.
    return await subject_service.get_all_subjects_for_school(db=db, school_id=current_profile.school_id)


# --- END REFACTOR ---


@router.get(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Allow Teachers too
)
async def get_subject_by_id(
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """Get a single subject by its ID."""
    db_subject = await subject_service.get_subject_with_streams(db=db, subject_id=subject_id)
    # Secure: Checks that the fetched subject belongs to the user's school
    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return db_subject


# --- REFACTORED ENDPOINT 2 ---
# Old Path: /{subject_id}/teachers?school_id=...
# New Path: /{subject_id}/teachers
@router.get(
    "/{subject_id}/teachers",
    response_model=list[TeacherOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_teachers_for_subject_endpoint(
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Find all teachers in the admin's school qualified for a subject."""

    # 1. Verify the subject belongs to the admin's school
    db_subject = await subject_service.get_subject_with_streams(db=db, subject_id=subject_id)
    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    # 2. Get teachers, using the school_id from the token
    teachers = await subject_service.get_teachers_for_subject(db=db, school_id=current_profile.school_id, subject_id=subject_id)
    return teachers


# --- END REFACTOR ---


@router.put(
    "/{subject_id}",
    response_model=SubjectOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_existing_subject(
    subject_id: int,
    *,
    db: AsyncSession = Depends(deps.get_db_session),
    subject_in: SubjectUpdate,
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Update a subject's details."""
    db_subject = await subject_service.get_subject_with_streams(db=db, subject_id=subject_id)

    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    updated_subject = await subject_service.update_subject(db=db, db_obj=db_subject, subject_in=subject_in)
    return updated_subject


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Soft-deletes a subject."""
    db_subject = await subject_service.get_subject_with_streams(db=db, subject_id=subject_id)
    if not db_subject or db_subject.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    await subject_service.soft_delete_subject(db, subject_id=subject_id)
    return None


@router.get(
    "/search",
    response_model=list[SubjectOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def search_subjects(
    *,
    name: Optional[str] = None,
    code: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Flexibly search for subjects within the user's school.
    Gets school_id from the user's token.
    Can search by name, code, or category.
    """
    # Build the filters dictionary
    filters = {}
    if name is not None:
        filters["name"] = name
    if code is not None:
        filters["code"] = code
    if category is not None:
        filters["category"] = category

    # We need to ensure your subject_service has a 'search_subjects' function.
    # For now, we assume it does or will.
    # If it doesn't, this will be a Phase 4 task to implement the service logic.
    # For now, we'll make it call the 'get_all_subjects_for_school' and filter in Python
    # This is INEFFICIENT but works as a placeholder without service changes.

    # --- Placeholder logic (replace later with service.search_subjects) ---
    all_subjects = await subject_service.get_all_subjects_for_school(db=db, school_id=current_profile.school_id)

    if not filters:
        return all_subjects

    filtered_subjects = []
    for subject in all_subjects:
        matches = True
        if name and name.lower() not in subject.name.lower():
            matches = False
        if code and subject.short_code and code.lower() not in subject.short_code.lower():
            matches = False
        if category and subject.category and category.lower() not in subject.category.lower():
            matches = False

        if matches:
            filtered_subjects.append(subject)

    return filtered_subjects


# --- END NEW ENDPOINT ---


@router.get(
    "/{school_id}/all",
    response_model=list[SubjectOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Allow Teachers too
)
async def get_all_subjects_for_school_id(
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
