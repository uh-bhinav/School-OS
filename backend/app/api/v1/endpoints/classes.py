import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps  # Using the consistent deps file
from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.class_schema import (
    ClassCreate,
    ClassOut,
    ClassSubjectsAssign,
    ClassUpdate,
)
from app.schemas.student_schema import StudentOut
from app.services import class_service, student_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/",
    response_model=ClassOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def create_new_class(
    class_in: ClassCreate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Create a new class. Admin only.
    """
    if class_in.school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create classes for your own school.",
        )
    return await class_service.create_class(db=db, class_in=class_in)


# --- REFACTORED ENDPOINT 2 ---
# Old Path: /search/{school_id}
# New Path: /search
@router.get(
    "/search",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def search_for_classes(
    *,
    name: Optional[str] = None,
    grade_level: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """Search for classes within the user's school."""
    filters = {}
    if name is not None:
        filters["name"] = name
    if grade_level is not None:
        filters["grade_level"] = grade_level
    if academic_year_id is not None:
        filters["academic_year_id"] = academic_year_id
    if teacher_id is not None:
        filters["teacher_id"] = teacher_id

    return await class_service.search_classes(db=db, school_id=current_profile.school_id, filters=filters)


# --- REFACTORED ENDPOINT 1 ---
# Old Path: /school/{school_id}
# New Path: /
@router.get(
    "/",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Made accessible to Teachers too
)
async def get_all_classes(
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get all active classes for the user's school.
    Gets school_id from the user's token.
    """
    # No need to check school_id, service is scoped to the user's school
    return await class_service.get_all_classes_for_school(db, school_id=current_profile.school_id)


# --- END REFACTOR ---


@router.get(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin", "Teacher"))],  # Made accessible to Teachers
)
async def get_class_by_id(
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get a single class by its ID.
    """
    db_class = await class_service.get_class(db, class_id=class_id, school_id=current_profile.school_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    return db_class


@router.get(
    "/{class_id}/students",
    response_model=list[StudentOut],
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def get_students_for_class(
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Allow admins or the assigned class teacher to view the students in a class.
    """
    db_class = await class_service.get_class(db=db, class_id=class_id, school_id=current_profile.school_id)
    if not db_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    # Use the helper function from deps.py for clean role checks
    if not deps.is_school_admin(current_profile):
        teacher_record = getattr(current_profile, "teacher", None)
        if not teacher_record or db_class.class_teacher_id != teacher_record.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view students for this class.",
            )

    return await student_service.get_all_students_for_class(db=db, class_id=class_id)


@router.post(
    "/{class_id}/subjects",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def assign_subjects(
    class_id: int,
    *,
    db: AsyncSession = Depends(deps.get_db_session),
    subjects_in: ClassSubjectsAssign,
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Assign a list of subject IDs to a class.
    """
    db_class = await class_service.get_class(db=db, class_id=class_id, school_id=current_profile.school_id)
    if not db_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return await class_service.assign_subjects_to_class(db=db, db_class=db_class, subject_ids=subjects_in.subject_ids)


@router.put(
    "/{class_id}",
    response_model=ClassOut,
    dependencies=[Depends(require_role("Admin"))],
)
async def update_class_details(
    class_id: int,
    class_in: ClassUpdate,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Update a class's details.
    """
    db_obj = await class_service.get_class(db, class_id=class_id, school_id=current_profile.school_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    return await class_service.update_class(db=db, db_obj=db_obj, class_in=class_in)


@router.delete(
    "/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
)
async def delete_class(
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    (Admin Only) Soft-deletes a class.
    """
    db_obj = await class_service.get_class(db, class_id=class_id, school_id=current_profile.school_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    deleted_class = await class_service.soft_delete_class(db, class_id=class_id)
    if not deleted_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active class with id {class_id} not found",
        )
    return None


@router.get(
    "/search/{school_id}",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def search_for_classes_for_school_id(
    school_id: int,
    *,
    grade_level: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Flexibly search for classes within the admin's school based on query parameters.
    """
    # Security check: Ensure the admin is searching within their own school
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot search in other schools.",
        )

    # Build the filters dictionary from the provided query parameters
    filters = {}
    if grade_level is not None:
        filters["grade_level"] = grade_level
    if academic_year_id is not None:
        filters["academic_year_id"] = academic_year_id
    if teacher_id is not None:
        filters["teacher_id"] = teacher_id

    return await class_service.search_classes(db=db, school_id=school_id, filters=filters)


@router.get(
    "/school/{school_id}",
    response_model=list[ClassOut],
    dependencies=[Depends(require_role("Admin"))],
)
async def get_all_classes_for_school_id(
    school_id: int,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    Get all active classes for a specific school.
    """
    if school_id != current_profile.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view classes for your own school.",
        )
    return await class_service.get_all_classes_for_school(db, school_id=school_id)


@router.get(
    "/{class_id}/complete-info",
    response_model=dict,
    dependencies=[Depends(require_role("Admin", "Teacher"))],
)
async def get_class_complete_info(
    class_id: int,
    db: AsyncSession = Depends(deps.get_db_session),
    current_profile: Profile = Depends(deps.get_current_active_user),
):
    """
    Get COMPLETE class information in ONE call:
    - Class details
    - All subjects in the class
    - Teachers who teach each subject
    - Class teacher details
    """

    try:
        # Step 1: Get the class
        db_class = await class_service.get_class(db, class_id=class_id, school_id=current_profile.school_id)
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found",
            )

        # Step 2: Get subjects for this class + their teachers
        subjects_query = text(
            """
            SELECT
                s.subject_id,
                s.name,
                s.short_code,
                s.description,
                s.category,
                t.teacher_id,
                p.first_name,
                p.last_name,
                p.phone_number,
                t.department,
                t.subject_specialization,
                t.years_of_experience,
                t.qualifications
            FROM subjects s
            LEFT JOIN class_subjects cs ON s.subject_id = cs.subject_id
            LEFT JOIN teacher_subjects ts ON s.subject_id = ts.subject_id
            LEFT JOIN teachers t ON ts.teacher_id = t.teacher_id
            LEFT JOIN profiles p ON t.user_id = p.user_id
            WHERE cs.class_id = :class_id
            ORDER BY s.name
        """
        )

        subjects_result = await db.execute(subjects_query, {"class_id": class_id})
        subjects_rows = subjects_result.fetchall()

        # Step 3: Get class teacher details
        class_teacher = None
        if db_class.class_teacher_id:
            class_teacher_query = text(
                """
                SELECT
                    t.teacher_id,
                    p.first_name,
                    p.last_name,
                    p.phone_number,
                    t.department,
                    t.subject_specialization,
                    t.years_of_experience,
                    t.qualifications
                FROM teachers t
                LEFT JOIN profiles p ON t.user_id = p.user_id
                WHERE t.teacher_id = :teacher_id
            """
            )
            class_teacher_result = await db.execute(class_teacher_query, {"teacher_id": db_class.class_teacher_id})
            class_teacher_row = class_teacher_result.fetchone()
            if class_teacher_row:
                class_teacher = dict(class_teacher_row._mapping)

        # Step 4: Build subjects list with their teachers
        subjects_dict = {}

        for row in subjects_rows:
            subject_id = row.subject_id

            if subject_id not in subjects_dict:
                subjects_dict[subject_id] = {"subject_id": row.subject_id, "name": row.name, "short_code": row.short_code, "description": row.description, "category": row.category, "teachers": []}

            if row.teacher_id:
                teacher_info = {
                    "teacher_id": row.teacher_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "phone_number": row.phone_number,
                    "department": row.department,
                    "subject_specialization": row.subject_specialization,
                    "years_of_experience": row.years_of_experience,
                    "qualifications": row.qualifications,
                }

                if not any(t["teacher_id"] == row.teacher_id for t in subjects_dict[subject_id]["teachers"]):
                    subjects_dict[subject_id]["teachers"].append(teacher_info)

        subjects_list = list(subjects_dict.values())

        # Step 5: Build all unique teachers list
        all_teachers = {}

        if class_teacher:
            all_teachers[class_teacher["teacher_id"]] = {
                "teacher_id": class_teacher["teacher_id"],
                "first_name": class_teacher["first_name"],
                "last_name": class_teacher["last_name"],
                "phone_number": class_teacher["phone_number"],
                "department": class_teacher["department"],
                "subject_specialization": class_teacher["subject_specialization"],
                "years_of_experience": class_teacher["years_of_experience"],
                "qualifications": class_teacher["qualifications"],
                "role": "Class Teacher",
            }

        for subject in subjects_list:
            for teacher in subject["teachers"]:
                if teacher["teacher_id"] not in all_teachers:
                    all_teachers[teacher["teacher_id"]] = {
                        **teacher,
                        "role": "Subject Teacher",
                    }

        # Step 6: Return complete information
        return {
            "success": True,
            "class": {
                "class_id": db_class.class_id,
                "grade_level": db_class.grade_level,
                "section": db_class.section,
                "class_name": f"{db_class.grade_level}{db_class.section}",
                "class_teacher_id": db_class.class_teacher_id,
            },
            "subjects": subjects_list,
            "teachers": list(all_teachers.values()),
            "class_teacher": class_teacher if class_teacher else None,
            "summary": {
                "class_name": f"{db_class.grade_level}{db_class.section}",
                "total_subjects": len(subjects_list),
                "total_teachers": len(all_teachers),
                "class_teacher_name": f"{class_teacher['first_name']} {class_teacher['last_name']}" if class_teacher else "Not Assigned",
                "subject_teachers": [f"{s['name']}: {_get_teacher_names(s['teachers'])}" for s in subjects_list if s["teachers"]],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in get_class_complete_info: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching class info: {str(e)}")


def _get_teacher_names(teachers):
    """Helper to format teacher names."""
    return ", ".join([f"{t['first_name']} {t['last_name']}" for t in teachers])
