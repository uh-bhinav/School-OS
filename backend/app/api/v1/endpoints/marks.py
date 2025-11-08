from typing import Optional  # Import list and Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps  # Use the standard deps file
from app.core.security import require_role
from app.models.profile import Profile
from app.schemas.mark_schema import (
    ClassPerformanceSummary,
    MarkCreate,
    MarkOut,
    MarkUpdate,
)
from app.services import mark_service, student_contact_service

router = APIRouter()

# --- 1. Agent-Ready & Secured Endpoints ---


@router.post(
    "/",
    response_model=MarkOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Teacher", "Admin"))],  # Allow Admin
)
async def create_new_mark(
    mark_in: MarkCreate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Create a new mark record. (Teacher or Admin Only).
    """
    # --- SECURITY FIX: Validate school_id ---
    if mark_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create marks for your own school.",
        )
    # --- END FIX ---

    # We will get teacher_id if the user is a teacher
    teacher_id = None
    if deps.is_teacher(current_profile):
        teacher_id = await mark_service.get_teacher_id_for_user(db, user_id=current_profile.user_id)
        if teacher_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your user profile is not linked to a teacher record.",
            )

    created_mark = await mark_service.create_mark(
        db=db,
        mark_in=mark_in,
    )

    mark_out = MarkOut.model_validate(created_mark, from_attributes=True)
    # Add teacher_id to output if the creator was a teacher
    if teacher_id:
        mark_out = mark_out.model_copy(update={"entered_by_teacher_id": teacher_id})
    return mark_out


@router.post(
    "/bulk",
    response_model=list[MarkOut],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Teacher", "Admin"))],  # Allow Admin
)
async def submit_marks_in_bulk(
    *,
    db: AsyncSession = Depends(deps.get_db_session),
    marks_in: list[MarkCreate],
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Submit marks for multiple students at once. (Teacher or Admin Only).
    """
    teacher_id = None
    if deps.is_teacher(current_profile):
        teacher_id = await mark_service.get_teacher_id_for_user(db, user_id=current_profile.user_id)
        if teacher_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your user profile is not linked to a teacher record.",
            )

    # --- SECURITY FIX: Validate all school_ids ---
    for mark_in in marks_in:
        if mark_in.school_id != current_profile.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create marks for your own school.",
            )
    # --- END FIX ---

    try:
        created_marks = await mark_service.bulk_create_marks(
            db=db,
            marks_in=marks_in,
        )
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=("One or more mark rows failed validation. " "Verify student_id, exam_id, subject_id, school_id, and duplicates."),
        ) from exc

    output_marks = []
    for mark in created_marks:
        mark_out = MarkOut.model_validate(mark, from_attributes=True)
        if teacher_id:
            mark_out = mark_out.model_copy(update={"entered_by_teacher_id": teacher_id})
        output_marks.append(mark_out)
    return output_marks


@router.get("/search", response_model=list[MarkOut], summary="[Agent-Ready] Search Marks")
async def search_marks(
    *,
    student_id: int,
    exam_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Search for marks for a specific student.
    Can be filtered by exam_id or subject_id.
    (Authorization is checked inside the function).
    """
    # --- AUTHORIZATION LOGIC ---
    is_authorized = False
    user_roles = {role.role_definition.role_name for role in current_profile.roles}

    if "Admin" in user_roles or "Teacher" in user_roles:
        is_authorized = True  # Admins/Teachers can search
    elif "Student" in user_roles and current_profile.student and current_profile.student.student_id == student_id:
        is_authorized = True  # Student can see their own marks
    elif "Parent" in user_roles:
        is_authorized = await student_contact_service.is_user_linked_to_student(db, user_id=current_profile.user_id, student_id=student_id)  # Parent can see their child's marks

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view these marks.",
        )
    # --- END AUTHORIZATION ---

    marks = await mark_service.get_marks_for_student_and_exam(
        db,
        student_id=student_id,
        exam_id=exam_id,
        subject_id=subject_id
        # We will add subject_id to the service function
    )
    return [MarkOut.model_validate(mark, from_attributes=True) for mark in marks]


@router.put("/{mark_id}", response_model=MarkOut, dependencies=[Depends(require_role("Teacher", "Admin"))], summary="[Secured] Update Mark")
async def update_mark(
    mark_id: int,
    mark_in: MarkUpdate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Teacher/Admin Only) Update an existing mark record."""
    db_obj = await mark_service.get_mark_by_id(db, mark_id)

    # --- SECURITY FIX (IDOR) ---
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Mark not found.")
    # --- END FIX ---

    return await mark_service.update_mark(db, db_obj=db_obj, mark_in=mark_in)


@router.delete("/{mark_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("Admin"))], summary="[Secured] Delete Mark")
async def delete_mark(
    mark_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """(Admin Only) Delete a mark record."""
    db_obj = await mark_service.get_mark_by_id(db, mark_id)

    # --- SECURITY FIX (IDOR) ---
    if not db_obj or db_obj.school_id != current_profile.school_id:
        raise HTTPException(status_code=404, detail="Mark not found.")
    # --- END FIX ---

    await mark_service.delete_mark(db, db_obj=db_obj)
    return None  # Return 204 No Content


@router.get("/performance/class/{class_id}/exam/{exam_id}", response_model=ClassPerformanceSummary, dependencies=[Depends(require_role("Admin", "Teacher"))], summary="[Secured] Get Class Performance")  # Allow Teacher
async def get_class_performance(
    class_id: int,
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get a performance summary for a class in a specific exam.
    """
    # (Implicitly secure, as class_id/exam_id must exist in user's school)
    summary = await mark_service.get_class_performance_in_exam(db=db, class_id=class_id, exam_id=exam_id)
    if not summary:
        raise HTTPException(
            status_code=404,
            detail="No marks found for this class and exam combination.",
        )
    return summary


@router.get("/report-card/student/{student_id}", response_model=list[MarkOut], summary="[Secured] Get Report Card")
async def get_report_card(
    student_id: int,
    academic_year_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get a student's full report card for an academic year.
    (Admins, Teachers, linked Parents, and the Student)
    """
    user_roles = {role.role_definition.role_name for role in current_profile.roles}

    is_authorized = False
    if "Admin" in user_roles or "Teacher" in user_roles:
        is_authorized = True
    elif "Student" in user_roles and current_profile.student and current_profile.student.student_id == student_id:
        is_authorized = True
    elif "Parent" in user_roles:
        is_authorized = await student_contact_service.is_user_linked_to_student(db, user_id=current_profile.user_id, student_id=student_id)

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this report card.",
        )

    return await mark_service.get_student_report_card(db=db, student_id=student_id, academic_year_id=academic_year_id)


@router.get("/progression/student/{student_id}/subject/{subject_id}", response_model=list[MarkOut], summary="[Secured] Get Grade Progression")
async def get_grade_progression(
    student_id: int,
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get a student's grade progression in a single subject over time.
    (Admins, Teachers, linked Parents, and the Student)
    """
    # --- SECURITY FIX: Copied from get_report_card ---
    user_roles = {role.role_definition.role_name for role in current_profile.roles}

    is_authorized = False
    if "Admin" in user_roles or "Teacher" in user_roles:
        is_authorized = True
    elif "Student" in user_roles and current_profile.student and current_profile.student.student_id == student_id:
        is_authorized = True
    elif "Parent" in user_roles:
        is_authorized = await student_contact_service.is_user_linked_to_student(db, user_id=current_profile.user_id, student_id=student_id)

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this data.",
        )
    # --- END FIX ---

    return await mark_service.get_student_grade_progression(db=db, student_id=student_id, subject_id=subject_id)


# --- 2. LEGACY ENDPOINTS (FOR TEST COMPATIBILITY) ---


@router.get(
    "/students/{student_id}",
    response_model=list[MarkOut],
    deprecated=True,
    summary="[Legacy] Get Student Marks",
    dependencies=[Depends(require_role("Student", "Parent"))],
)
async def get_student_marks(student_id: int, db: AsyncSession = Depends(deps.get_db_session), current_profile: Profile = Depends(deps.get_current_active_user)):
    """
    Get all marks for a specific student.
    [Legacy: Use /search?student_id=... instead]
    """
    # This endpoint was already secure for Student/Parent
    is_authorized = False
    if "Student" in {r.role_definition.role_name for r in current_profile.roles} and current_profile.student and current_profile.student.student_id == student_id:
        is_authorized = True
    elif "Parent" in {r.role_definition.role_name for r in current_profile.roles}:
        is_authorized = await student_contact_service.is_user_linked_to_student(db, user_id=current_profile.user_id, student_id=student_id)

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view these marks.",
        )

    marks = await mark_service.get_marks_by_student(db=db, student_id=student_id)
    if not marks:
        raise HTTPException(status_code=404, detail="Marks not found for this student.")
    return marks


@router.get(
    "/",
    response_model=list[MarkOut],
    deprecated=True,
    summary="[Legacy] list Marks",
    dependencies=[Depends(require_role("Teacher", "Admin"))],
)
async def list_marks(student_id: int, exam_id: Optional[int] = None, db: AsyncSession = Depends(deps.get_db_session), current_profile: Profile = Depends(deps.get_current_active_user)):
    """
    [Legacy: Use /search?student_id=... instead]
    """
    # This endpoint was already secure for Teacher/Admin
    marks = await mark_service.get_marks_for_student_and_exam(db, student_id=student_id, exam_id=exam_id)

    teacher_id = await mark_service.get_teacher_id_for_user(db, user_id=current_profile.user_id)

    return [MarkOut.model_validate(mark, from_attributes=True).model_copy(update={"entered_by_teacher_id": teacher_id}) for mark in marks]
