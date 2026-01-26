# backend/app/agents/modules/academics/leaves/class_agent/tools.py

import logging
from typing import Any, Optional

from langchain_core.tools import tool
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.agents.modules.academics.leaves.class_agent.schemas import (
    AssignClassTeacherSchema,
    CreateNewClassSchema,
    GetClassDetailsSchema,
    GetClassScheduleSchema,
    ListAllClassesSchema,
    ListStudentsInClassSchema,
)
from app.agents.tool_context import ToolContextError, get_tool_context
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student
from app.models.timetable import Timetable

# Set up logging for tool activity
logger = logging.getLogger(__name__)


def _get_runtime_dependencies() -> tuple[Optional[AsyncSession], Optional[Profile], Optional[dict[str, Any]]]:
    """Fetch the per-request dependencies that tools require."""
    try:
        context = get_tool_context()
    except ToolContextError:
        return (
            None,
            None,
            {
                "status": "context_unavailable",
                "message": "Runtime context missing. Authenticate and retry your request.",
            },
        )

    db = context.db
    current_profile = context.current_profile

    if db is None or current_profile is None:
        return (
            None,
            None,
            {
                "status": "context_unavailable",
                "message": "Database session or profile unavailable for this request.",
            },
        )

    return db, current_profile, None


def _is_admin_or_teacher(current_profile: Profile) -> bool:
    """Check if the current user has admin or teacher role."""
    role_names = {role.role_definition.role_name for role in current_profile.roles if getattr(role, "role_definition", None) and getattr(role.role_definition, "role_name", None)}
    return {"Admin", "Teacher"} & role_names


def _format_class_name(class_obj: Class) -> str:
    """Format class name for display."""
    section = (class_obj.section or "").strip()
    if not section:
        return str(class_obj.grade_level)
    if len(section) == 1:
        return f"{class_obj.grade_level}{section.upper()}"
    return f"{class_obj.grade_level} {section}".strip()


def _student_display_name(student: Student) -> str:
    """Get display name for a student."""
    if not student or not student.profile:
        return "Unknown Student"
    profile = student.profile
    first = profile.first_name or ""
    last = profile.last_name or ""
    full_name = f"{first} {last}".strip()
    return full_name if full_name else f"Student #{student.student_id}"


async def _resolve_class(
    db: AsyncSession,
    school_id: int,
    class_name: str,
) -> tuple[Optional[Class], Optional[dict[str, Any]]]:
    """Resolve a class by name."""
    import re

    cleaned = class_name.strip()
    if not cleaned:
        return None, {
            "status": "invalid_request",
            "message": "Class name is required.",
        }

    # Parse class name (e.g., "10A" -> grade=10, section="A")
    cleaned = re.sub(r"grade\s+", "", cleaned, flags=re.IGNORECASE)
    match = re.match(r"(?P<grade>\d{1,2})(?:\s*[-/]?\s*)?(?P<section>[A-Za-z0-9 ]+)?", cleaned)

    if not match:
        return None, {
            "status": "invalid_request",
            "message": "Invalid class name format. Use format like '10A' or 'Grade 10 A'.",
        }

    grade_str = match.group("grade")
    section = (match.group("section") or "").strip()

    try:
        grade_level = int(grade_str)
    except ValueError:
        return None, {
            "status": "invalid_request",
            "message": "Invalid grade level.",
        }

    # Query for the class
    stmt = (
        select(Class)
        .options(selectinload(Class.class_teacher).selectinload(Profile.roles))
        .where(
            Class.school_id == school_id,
            Class.grade_level == grade_level,
            Class.is_active.is_(True),
        )
    )

    if section:
        stmt = stmt.where(func.lower(Class.section) == section.lower())

    result = await db.execute(stmt)
    classes = list(result.scalars().all())

    if not classes:
        return None, {
            "status": "not_found",
            "message": f"No active class named '{class_name}' exists in your school.",
        }

    if len(classes) > 1:
        return None, {
            "status": "ambiguous",
            "message": "Multiple active classes matched. Please specify the academic year.",
            "candidates": [
                {
                    "class_id": c.class_id,
                    "grade_level": c.grade_level,
                    "section": c.section,
                    "academic_year_id": c.academic_year_id,
                }
                for c in classes
            ],
        }

    return classes[0], None


@tool("create_new_class", args_schema=CreateNewClassSchema)
async def create_new_class(
    class_name: str,
    academic_year: str,
    grade_level: Optional[int] = None,
    section: Optional[str] = None,
    max_students: Optional[int] = 40,
) -> dict[str, Any]:
    """
    Creates a new class or section for a specific academic year.
    Use this tool when a user wants to create or set up a new class.

    Args:
        class_name: Name of the class (e.g., '10A', 'Grade 12 Science')
        academic_year: Academic year (e.g., '2024-2025')
        grade_level: Optional grade level (e.g., 10)
        section: Optional section identifier (e.g., 'A', 'B')
        max_students: Maximum students allowed (default: 40)

    Returns:
        Dictionary containing success status or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for create_new_class")
        return context_error

    logger.info(f"[TOOL:create_new_class] User: '{current_profile.user_id}', Class: '{class_name}', " f"Academic Year: '{academic_year}', Grade: {grade_level}, Section: {section}")

    # Authorization check
    if not _is_admin_or_teacher(current_profile):
        return {
            "status": "forbidden",
            "message": "Only administrators or teachers can create classes.",
        }

    # Parse class name if grade_level and section not provided
    if not grade_level or not section:
        import re

        cleaned = re.sub(r"grade\s+", "", class_name.strip(), flags=re.IGNORECASE)
        match = re.match(r"(?P<grade>\d{1,2})(?:\s*[-/]?\s*)?(?P<section>[A-Za-z0-9 ]+)?", cleaned)

        if match:
            if not grade_level:
                grade_level = int(match.group("grade"))
            if not section:
                section = (match.group("section") or "").strip()

    if not grade_level or not section:
        return {
            "status": "invalid_request",
            "message": "Could not parse grade level and section from class name. Please provide them explicitly.",
        }

    # Check if class already exists
    existing_stmt = select(Class).where(
        Class.school_id == current_profile.school_id,
        Class.grade_level == grade_level,
        func.lower(Class.section) == section.lower(),
        Class.is_active.is_(True),
    )
    result = await db.execute(existing_stmt)
    existing_class = result.scalars().first()

    if existing_class:
        return {
            "status": "conflict",
            "message": f"Class '{_format_class_name(existing_class)}' already exists.",
            "class_id": existing_class.class_id,
        }

    # Create new class
    try:
        new_class = Class(
            school_id=current_profile.school_id,
            grade_level=grade_level,
            section=section,
            max_students=max_students,
            is_active=True,
        )
        db.add(new_class)
        await db.commit()
        await db.refresh(new_class)

        return {
            "status": "success",
            "message": f"Successfully created class '{_format_class_name(new_class)}' for academic year {academic_year}.",
            "class_details": {
                "class_id": new_class.class_id,
                "class_name": _format_class_name(new_class),
                "academic_year": academic_year,
                "grade_level": new_class.grade_level,
                "section": new_class.section,
                "max_students": new_class.max_students,
                "current_students": 0,
                "class_teacher": "Not assigned yet",
                "is_active": new_class.is_active,
            },
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating class: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Failed to create class: {str(e)}",
        }


@tool("get_class_details", args_schema=GetClassDetailsSchema)
async def get_class_details(class_name: str) -> dict[str, Any]:
    """
    Retrieves key details about a specific class.
    Use this tool when a user asks for information about a class.

    Args:
        class_name: Name of the class

    Returns:
        Dictionary containing class details or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for get_class_details")
        return context_error

    logger.info(f"[TOOL:get_class_details] User: '{current_profile.user_id}', Class: '{class_name}'")

    class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
    if class_error:
        return class_error

    # Count students in the class
    student_count_stmt = select(func.count(Student.student_id)).where(
        Student.current_class_id == class_obj.class_id,
        Student.is_active.is_(True),
    )
    student_count_result = await db.execute(student_count_stmt)
    total_students = student_count_result.scalar() or 0

    # Get class teacher details
    class_teacher_info = None
    if class_obj.class_teacher_id:
        teacher_stmt = select(Profile).where(Profile.profile_id == class_obj.class_teacher_id)
        teacher_result = await db.execute(teacher_stmt)
        teacher = teacher_result.scalars().first()

        if teacher:
            class_teacher_info = {
                "teacher_id": teacher.profile_id,
                "teacher_name": f"{teacher.first_name or ''} {teacher.last_name or ''}".strip(),
                "email": teacher.email,
                "phone": teacher.phone_number,
            }

    # Get subjects taught in this class (from timetable)
    subjects_stmt = select(Timetable.subject_id).where(Timetable.class_id == class_obj.class_id).distinct()
    subjects_result = await db.execute(subjects_stmt)
    subject_ids = subjects_result.scalars().all()

    return {
        "status": "success",
        "class_details": {
            "class_id": class_obj.class_id,
            "class_name": _format_class_name(class_obj),
            "academic_year_id": class_obj.academic_year_id,
            "grade_level": class_obj.grade_level,
            "section": class_obj.section,
            "class_teacher": class_teacher_info or "Not assigned",
            "total_students": total_students,
            "max_students": class_obj.max_students,
            "subjects_count": len(subject_ids),
            "room_number": class_obj.room_number,
            "is_active": class_obj.is_active,
        },
    }


@tool("list_students_in_class", args_schema=ListStudentsInClassSchema)
async def list_students_in_class(class_name: str, include_details: Optional[bool] = False) -> dict[str, Any]:
    """
    Provides a complete roster of all students enrolled in a specific class.
    Use this tool when a user asks for the student list or class roster.

    Args:
        class_name: Name of the class
        include_details: Whether to include detailed student information

    Returns:
        Dictionary containing student roster or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for list_students_in_class")
        return context_error

    logger.info(f"[TOOL:list_students_in_class] User: '{current_profile.user_id}', Class: '{class_name}', " f"Include Details: {include_details}")

    class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
    if class_error:
        return class_error

    # Query students in the class
    stmt = (
        select(Student)
        .options(selectinload(Student.profile))
        .where(
            Student.current_class_id == class_obj.class_id,
            Student.is_active.is_(True),
        )
        .order_by(Student.roll_number)
    )
    result = await db.execute(stmt)
    students = list(result.scalars().all())

    if not students:
        return {
            "status": "success",
            "class_name": _format_class_name(class_obj),
            "total_students": 0,
            "students": [],
            "message": "No students enrolled in this class.",
        }

    students_data = []
    for student in students:
        if include_details:
            students_data.append(
                {
                    "student_id": student.student_id,
                    "student_name": _student_display_name(student),
                    "roll_number": student.roll_number,
                    "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
                    "email": student.profile.email if student.profile else None,
                    "enrollment_date": student.enrollment_date.isoformat() if student.enrollment_date else None,
                }
            )
        else:
            students_data.append(
                {
                    "roll_number": student.roll_number,
                    "student_name": _student_display_name(student),
                }
            )

    return {
        "status": "success",
        "class_name": _format_class_name(class_obj),
        "total_students": len(students),
        "students": students_data,
    }


@tool("get_class_schedule", args_schema=GetClassScheduleSchema)
async def get_class_schedule(class_name: str, day_of_week: Optional[str] = None) -> dict[str, Any]:
    """
    Fetches the weekly schedule or timetable for a given class.
    Use this tool when a user asks for the class timetable or schedule.

    Args:
        class_name: Name of the class
        day_of_week: Optional specific day (e.g., 'Monday')

    Returns:
        Dictionary containing schedule data or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for get_class_schedule")
        return context_error

    logger.info(f"[TOOL:get_class_schedule] User: '{current_profile.user_id}', Class: '{class_name}', " f"Day: {day_of_week or 'Full week'}")

    class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
    if class_error:
        return class_error

    # Query timetable entries
    stmt = (
        select(Timetable)
        .options(
            selectinload(Timetable.subject),
            selectinload(Timetable.teacher).selectinload(Profile.roles),
        )
        .where(Timetable.class_id == class_obj.class_id)
        .order_by(Timetable.day_of_week, Timetable.period_number)
    )

    if day_of_week:
        stmt = stmt.where(func.lower(Timetable.day_of_week) == day_of_week.lower())

    result = await db.execute(stmt)
    timetable_entries = list(result.scalars().all())

    if not timetable_entries:
        return {
            "status": "not_found",
            "message": f"No timetable found for class '{_format_class_name(class_obj)}'" + (f" on {day_of_week}" if day_of_week else ""),
        }

    if day_of_week:
        # Return schedule for specific day
        periods = []
        for entry in timetable_entries:
            teacher_name = None
            if entry.teacher:
                teacher_name = f"{entry.teacher.first_name or ''} {entry.teacher.last_name or ''}".strip()

            periods.append(
                {
                    "period_number": entry.period_number,
                    "start_time": entry.start_time.isoformat() if entry.start_time else None,
                    "end_time": entry.end_time.isoformat() if entry.end_time else None,
                    "subject": entry.subject.name if entry.subject else "Unknown",
                    "teacher": teacher_name or "Not assigned",
                    "room": entry.room_number,
                }
            )

        return {
            "status": "success",
            "class_name": _format_class_name(class_obj),
            "day": day_of_week,
            "periods": periods,
        }
    else:
        # Return full week schedule
        week_schedule = {}
        for entry in timetable_entries:
            day = entry.day_of_week
            if day not in week_schedule:
                week_schedule[day] = []

            subject_name = entry.subject.name if entry.subject else "Unknown"
            week_schedule[day].append(subject_name)

        return {
            "status": "success",
            "class_name": _format_class_name(class_obj),
            "schedule_type": "Weekly",
            "week_schedule": week_schedule,
            "message": "Use day_of_week parameter to get detailed period timings for a specific day.",
        }


@tool("assign_class_teacher", args_schema=AssignClassTeacherSchema)
async def assign_class_teacher(class_name: str, teacher_name: str, effective_from: Optional[str] = None) -> dict[str, Any]:
    """
    Assigns or updates the main class teacher for a specific class.
    Use this tool when a user wants to assign a class teacher/proctor.

    Args:
        class_name: Name of the class
        teacher_name: Full name of the teacher
        effective_from: Optional effective date (YYYY-MM-DD)

    Returns:
        Dictionary containing success status or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for assign_class_teacher")
        return context_error

    logger.info(f"[TOOL:assign_class_teacher] User: '{current_profile.user_id}', Class: '{class_name}', " f"Teacher: '{teacher_name}', Effective: {effective_from or 'Immediately'}")

    # Authorization check
    if not _is_admin_or_teacher(current_profile):
        return {
            "status": "forbidden",
            "message": "Only administrators or teachers can assign class teachers.",
        }

    class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
    if class_error:
        return class_error

    # Find teacher by name
    teacher_parts = teacher_name.strip().split(maxsplit=1)
    first_name = teacher_parts[0] if teacher_parts else ""
    last_name = teacher_parts[1] if len(teacher_parts) > 1 else ""

    teacher_stmt = select(Profile).where(
        Profile.school_id == current_profile.school_id,
        Profile.is_active.is_(True),
    )

    if first_name and last_name:
        teacher_stmt = teacher_stmt.where(
            func.lower(Profile.first_name) == first_name.lower(),
            func.lower(Profile.last_name) == last_name.lower(),
        )
    else:
        teacher_stmt = teacher_stmt.where(func.lower(Profile.first_name).like(f"%{first_name.lower()}%") | func.lower(Profile.last_name).like(f"%{first_name.lower()}%"))

    result = await db.execute(teacher_stmt)
    teachers = list(result.scalars().all())

    if not teachers:
        return {
            "status": "not_found",
            "message": f"No teacher found with name '{teacher_name}' in your school.",
        }

    if len(teachers) > 1:
        return {
            "status": "ambiguous",
            "message": "Multiple teachers matched the provided name. Please provide a more specific name.",
            "candidates": [
                {
                    "profile_id": t.profile_id,
                    "name": f"{t.first_name or ''} {t.last_name or ''}".strip(),
                    "email": t.email,
                }
                for t in teachers
            ],
        }

    teacher = teachers[0]

    # Store previous teacher info
    previous_teacher = None
    if class_obj.class_teacher_id:
        prev_teacher_stmt = select(Profile).where(Profile.profile_id == class_obj.class_teacher_id)
        prev_result = await db.execute(prev_teacher_stmt)
        prev_teacher = prev_result.scalars().first()
        if prev_teacher:
            previous_teacher = f"{prev_teacher.first_name or ''} {prev_teacher.last_name or ''}".strip()

    # Update class teacher
    try:
        class_obj.class_teacher_id = teacher.profile_id
        await db.commit()
        await db.refresh(class_obj)

        return {
            "status": "success",
            "message": f"Successfully assigned {teacher_name} as class teacher for {_format_class_name(class_obj)}.",
            "assignment_details": {
                "class_name": _format_class_name(class_obj),
                "class_teacher": {
                    "teacher_id": teacher.profile_id,
                    "teacher_name": f"{teacher.first_name or ''} {teacher.last_name or ''}".strip(),
                    "email": teacher.email,
                },
                "effective_from": effective_from or "Immediately",
                "previous_teacher": previous_teacher or "None",
            },
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Error assigning class teacher: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Failed to assign class teacher: {str(e)}",
        }


@tool("list_all_classes", args_schema=ListAllClassesSchema)
async def list_all_classes(
    academic_year: Optional[str] = None,
    grade_level: Optional[int] = None,
    include_inactive: Optional[bool] = False,
) -> dict[str, Any]:
    """
    Returns a list of all classes currently active in the school.
    Use this tool when a user asks for all classes or class list.

    Args:
        academic_year: Optional filter by academic year
        grade_level: Optional filter by grade level
        include_inactive: Whether to include inactive classes

    Returns:
        Dictionary containing list of classes or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for list_all_classes")
        return context_error

    logger.info(f"[TOOL:list_all_classes] User: '{current_profile.user_id}', Academic Year: {academic_year or 'All'}, " f"Grade: {grade_level or 'All'}, Include Inactive: {include_inactive}")

    # Build query
    stmt = select(Class).options(selectinload(Class.class_teacher)).where(Class.school_id == current_profile.school_id).order_by(Class.grade_level, Class.section)

    if not include_inactive:
        stmt = stmt.where(Class.is_active.is_(True))

    if grade_level:
        stmt = stmt.where(Class.grade_level == grade_level)

    # Note: You'll need to add academic_year filter if you have an academic year table
    # For now, we'll skip that filter

    result = await db.execute(stmt)
    classes = list(result.scalars().all())

    classes_data = []
    for class_obj in classes:
        # Count students
        student_count_stmt = select(func.count(Student.student_id)).where(
            Student.current_class_id == class_obj.class_id,
            Student.is_active.is_(True),
        )
        student_count_result = await db.execute(student_count_stmt)
        total_students = student_count_result.scalar() or 0

        # Get teacher name
        teacher_name = "Not assigned"
        if class_obj.class_teacher:
            teacher_name = f"{class_obj.class_teacher.first_name or ''} {class_obj.class_teacher.last_name or ''}".strip()

        classes_data.append(
            {
                "class_id": class_obj.class_id,
                "class_name": _format_class_name(class_obj),
                "grade_level": class_obj.grade_level,
                "section": class_obj.section,
                "academic_year_id": class_obj.academic_year_id,
                "class_teacher": teacher_name,
                "total_students": total_students,
                "max_students": class_obj.max_students,
                "is_active": class_obj.is_active,
            }
        )

    return {
        "status": "success",
        "filters": {
            "academic_year": academic_year or "All",
            "grade_level": grade_level or "All",
            "include_inactive": include_inactive,
        },
        "total_classes": len(classes_data),
        "classes": classes_data,
    }


# Export all tools as a list for the agent to use
class_agent_tools = [
    create_new_class,
    get_class_details,
    list_students_in_class,
    get_class_schedule,
    assign_class_teacher,
    list_all_classes,
]

# Export tool names for easy reference
__all__ = [
    "class_agent_tools",
    "create_new_class",
    "get_class_details",
    "list_students_in_class",
    "get_class_schedule",
    "assign_class_teacher",
    "list_all_classes",
]
