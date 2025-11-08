from typing import Optional  # Added List and Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps  # Use the standard deps file
from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.exam_schema import ExamCreate, ExamOut, ExamUpdate
from app.services import exam_service

router = APIRouter()


# --- 1. AGENT-READY ENDPOINTS (NEW & REFACTORED) ---


@router.post("/", response_model=ExamOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role("Admin"))], summary="[Agent-Ready] Create Exam")
async def create_new_exam(
    exam_in: ExamCreate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Create a new exam.
    """
    # --- SECURITY FIX: Validate school_id ---
    if exam_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create exams for your own school.",
        )
    # --- END FIX ---
    return await exam_service.create_exam(db=db, exam_in=exam_in)


@router.get("/", response_model=list[ExamOut], dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))], summary="[Agent-Ready] List All Exams")
async def list_all_exams_for_school(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get all active exams for the user's school.
    Gets school_id from the user's token.
    """
    exams = await exam_service.get_all_exams_for_school(db=db, school_id=current_profile.school_id)
    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active exams found for this school.",
        )
    return exams


@router.get("/search", response_model=list[ExamOut], dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))], summary="[Agent-Ready] Search Exams")
async def search_exams(
    *,
    name: Optional[str] = None,
    exam_type_id: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Flexibly search for active exams in the user's school.
    Can search by name, exam type, or academic year.
    """
    exams = await exam_service.search_exams(db=db, school_id=current_profile.school_id, name=name, exam_type_id=exam_type_id, academic_year_id=academic_year_id)
    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No exams found matching the criteria.",
        )
    return exams


@router.get("/{exam_id}", response_model=ExamOut, dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))], summary="[Secured] Get Exam by ID")
async def get_exam_by_id(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get a single exam by its ID.
    """
    db_exam = await exam_service.get_exam_by_id(db=db, exam_id=exam_id)

    # --- SECURITY FIX ---
    if not db_exam or db_exam.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    # --- END FIX ---
    return db_exam


@router.put("/{exam_id}", response_model=ExamOut, dependencies=[Depends(require_role("Admin"))], summary="[Secured] Update Exam")
async def update_exam(
    exam_id: int,
    exam_in: ExamUpdate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Update an existing exam."""
    # --- SECURITY FIX ---
    db_exam = await exam_service.get_exam_by_id(db=db, exam_id=exam_id)
    if not db_exam or db_exam.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found.")
    # --- END FIX ---

    updated = await exam_service.update_exam(db, exam_id=exam_id, exam_in=exam_in)
    return updated


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("Admin"))], summary="[Secured] Delete Exam")
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Deactivate an exam (SOFT DELETE)."""
    # --- SECURITY FIX ---
    db_exam = await exam_service.get_exam_by_id(db=db, exam_id=exam_id)
    if not db_exam or db_exam.school_id != current_profile.school_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found.")
    # --- END FIX ---

    await exam_service.delete_exam(db, exam_id=exam_id)
    return None  # Return 204 No Content


@router.get(
    "/all/{school_id}",
    response_model=list[ExamOut],
    dependencies=[Depends(require_role("Admin", "Teacher", "Parent"))],
)
async def get_all_exams(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """Return all active exams for a school if the user belongs to that school."""

    if current_profile.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to exams for other schools is not permitted.",
        )

    # Service layer handles filtering by school_id AND is_active=True
    exams = await exam_service.get_all_exams_for_school(db=db, school_id=school_id)
    if not exams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active exams found for this school.",
        )
    return exams
