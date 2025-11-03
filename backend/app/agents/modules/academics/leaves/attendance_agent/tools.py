# backend/app/agents/modules/academics/leaves/attendance_agent/tools.py

import logging
import re
from datetime import date, datetime, timedelta
from typing import Any, Optional

from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.agents.modules.academics.leaves.attendance_agent.schemas import (
    GetClassAttendanceForDateSchema,
    GetStudentAttendanceForDateRangeSchema,
    GetStudentAttendanceSummarySchema,
    MarkStudentAttendanceSchema,
)
from app.agents.tool_context import ToolContextError, get_tool_context
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student
from app.schemas.attendance_record_schema import (
    AttendanceRecordCreate,
    AttendanceRecordUpdate,
    AttendanceStatus,
)
from app.services import attendance_record_service, student_contact_service, student_service

logger = logging.getLogger(__name__)


def _normalized_search_text(value: str) -> str:
    """Normalize text for searching by removing extra whitespace and lowercasing."""
    return " ".join(value.strip().lower().split())


def _student_display_name(student: Optional[Student]) -> str:
    """Generate a readable display name for a student."""
    if not student:
        return "Unknown Student"
    profile = student.profile
    if profile:
        parts = []
        if profile.first_name:
            parts.append(profile.first_name)
        if profile.last_name:
            parts.append(profile.last_name)
        if parts:
            return " ".join(parts)
    return f"Student #{student.student_id}"


def _format_class_name(class_obj: Optional[Class]) -> Optional[str]:
    """Format class name in a readable way."""
    if not class_obj:
        return None
    section = (class_obj.section or "").strip()
    if not section:
        return str(class_obj.grade_level)
    if len(section) == 1:
        return f"{class_obj.grade_level}{section}"
    return f"{class_obj.grade_level} {section}".strip()


def _parse_class_name(class_name: str) -> Optional[tuple[int, str]]:
    """Parse class name like '10A' or 'Grade 10 A' into (grade_level, section)."""
    cleaned = class_name.strip()
    if not cleaned:
        return None
    cleaned = re.sub(r"grade\s+", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"class\s+", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()

    match = re.match(r"^(\d+)\s*([A-Za-z]?)$", cleaned)
    if match:
        grade = int(match.group(1))
        section = match.group(2).upper() if match.group(2) else ""
        return (grade, section)

    return None


def _parse_date_string(date_str: str) -> Optional[date]:
    """Parse date string in YYYY-MM-DD format."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def _get_user_roles(profile: Profile) -> set[str]:
    """Extract role names from a Profile object."""
    return {role.role_definition.role_name for role in profile.roles}


async def _resolve_student(
    db: AsyncSession,
    current_profile: Profile,
    student_lookup: str,
) -> tuple[Optional[Student], Optional[dict[str, Any]]]:
    """
    Resolve student by ID, name, or profile information.
    Returns (Student, error_dict) where error_dict is None on success.
    """
    school_id = current_profile.school_id

    try:
        student_id = int(student_lookup)
        # Eagerly load relationships to avoid lazy loading issues
        stmt = select(Student).options(selectinload(Student.profile), selectinload(Student.current_class)).where(Student.student_id == student_id)
        result = await db.execute(stmt)
        student = result.scalars().first()

        if student and student.profile and student.profile.school_id == school_id:
            return (student, None)
        return (
            None,
            {
                "error": f"No student found with ID {student_id} in your school.",
                "suggestion": "Please check the student ID and try again.",
            },
        )
    except ValueError:
        pass

    # Search by name - but we need to reload with proper eager loading
    results = await student_service.search_students(db, search_query=student_lookup, school_id=school_id, skip=0, limit=10)

    if not results:
        return (
            None,
            {
                "error": f"No student found matching '{student_lookup}'.",
                "suggestion": "Please verify the student name or ID and try again.",
            },
        )

    # Reload the results with eager loading to avoid lazy loading issues
    student_ids = [s.student_id for s in results]
    stmt = select(Student).options(selectinload(Student.profile), selectinload(Student.current_class)).where(Student.student_id.in_(student_ids))
    reload_result = await db.execute(stmt)
    results = list(reload_result.scalars().all())

    if len(results) == 1:
        return (results[0], None)

    matches = []
    for s in results[:5]:
        display_name = _student_display_name(s)
        class_info = f" (Class: {_format_class_name(s.current_class)})" if s.current_class else ""
        matches.append(f"  - ID {s.student_id}: {display_name}{class_info}")

    return (
        None,
        {
            "error": f"Multiple students match '{student_lookup}'. Please specify:",
            "matches": matches,
            "suggestion": "Use the student ID or provide a more specific name.",
        },
    )


async def _is_authorized_for_student(
    db: AsyncSession,
    current_profile: Profile,
    student: Student,
    *,
    allow_student: bool,
    allow_parent: bool,
) -> tuple[bool, Optional[dict[str, Any]]]:
    """
    Check if current profile is authorized to access this student's attendance.
    """
    user_roles = _get_user_roles(current_profile)

    if user_roles.intersection({"Admin", "Teacher"}):
        if student.profile.school_id == current_profile.school_id:
            return (True, None)
        return (False, {"error": "You cannot access attendance for students outside your school."})

    if allow_student and "Student" in user_roles:
        if current_profile.student and current_profile.student.student_id == student.student_id:
            return (True, None)

    if allow_parent and "Parent" in user_roles:
        contacts = await student_contact_service.get_contacts_for_student(db, student_id=student.student_id)
        for contact in contacts:
            if contact.profile_user_id == current_profile.user_id:
                return (True, None)

    return (
        False,
        {
            "error": f"You are not authorized to access attendance for {_student_display_name(student)}.",
            "suggestion": "Contact your school administrator if you believe this is an error.",
        },
    )


async def _resolve_class(
    db: AsyncSession,
    school_id: int,
    class_name: str,
) -> tuple[Optional[Class], Optional[dict[str, Any]]]:
    """
    Resolve class by name.
    Returns (Class, error_dict) where error_dict is None on success.
    """
    parsed = _parse_class_name(class_name)
    if not parsed:
        return (
            None,
            {
                "error": f"Could not parse class name '{class_name}'.",
                "suggestion": "Use format like '10A' or 'Grade 10 A'.",
            },
        )

    grade_level, section = parsed

    stmt = select(Class).where(
        Class.school_id == school_id,
        Class.grade_level == grade_level,
        Class.section == section if section else True,
        Class.is_active.is_(True),
    )

    result = await db.execute(stmt)
    class_obj = result.scalars().first()

    if not class_obj:
        return (
            None,
            {
                "error": f"No active class found matching '{class_name}' in your school.",
                "suggestion": "Please verify the class name and try again.",
            },
        )

    return (class_obj, None)


def _get_runtime_dependencies() -> tuple[Optional[AsyncSession], Optional[Profile], Optional[dict[str, Any]]]:
    """
    Retrieve database session and current profile from tool context.
    Returns (db, profile, error_dict).
    """
    try:
        context = get_tool_context()

        if context.db is None:
            logger.error("Database session not available in tool context")
            return (None, None, {"error": "Database connection not available.", "suggestion": "Please try again later."})

        if context.current_profile is None:
            logger.error("Current profile not available in tool context")
            return (
                None,
                None,
                {"error": "Authentication information not available.", "suggestion": "Please ensure you are logged in."},
            )

        return (context.db, context.current_profile, None)

    except ToolContextError as e:
        logger.error(f"Tool context error: {e}")
        return (
            None,
            None,
            {"error": "System configuration error.", "suggestion": "This tool requires proper authentication context."},
        )


@tool("mark_student_attendance", args_schema=MarkStudentAttendanceSchema)
async def mark_student_attendance(
    student_id: str,
    attendance_date: str,
    status: str,
    class_name: Optional[str] = None,
    remarks: Optional[str] = None,
) -> dict[str, Any]:
    """
    Marks a student's attendance status for a specific date.
    Use this tool when a user wants to record or update a student's attendance.

    Args:
        student_id: Unique identifier of the student (ID or name)
        attendance_date: Date for marking attendance (YYYY-MM-DD format)
        status: Attendance status ('present', 'absent', 'late')
        class_name: Optional class name for context
        remarks: Optional additional notes

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:mark_student_attendance] Student: '{student_id}', Date: '{attendance_date}', Status: '{status}'")

    db, current_profile, error = _get_runtime_dependencies()
    if error:
        return error

    user_roles = _get_user_roles(current_profile)
    if not user_roles.intersection({"Teacher", "Admin"}):
        return {
            "error": "You do not have permission to mark attendance.",
            "suggestion": "Only teachers and administrators can mark student attendance.",
        }

    student, error = await _resolve_student(db, current_profile, student_id)
    if error:
        return error

    target_date = _parse_date_string(attendance_date)
    if not target_date:
        return {
            "error": f"Invalid date format: '{attendance_date}'",
            "suggestion": "Please use YYYY-MM-DD format (e.g., '2025-11-02').",
        }

    if target_date > date.today():
        return {
            "error": "Cannot mark attendance for future dates.",
            "suggestion": f"Today is {date.today()}. Please use a date from the past or today.",
        }

    status_lower = status.lower()
    status_map = {
        "present": AttendanceStatus.present,
        "absent": AttendanceStatus.absent,
        "late": AttendanceStatus.late,
    }

    if status_lower not in status_map:
        return {"error": f"Invalid attendance status: '{status}'", "suggestion": "Valid statuses are: present, absent, late."}

    attendance_status = status_map[status_lower]

    existing_records = await attendance_record_service.get_attendance_by_class(db, class_id=student.current_class_id, target_date=target_date)

    existing_record = None
    for record in existing_records:
        if record.student_id == student.student_id:
            existing_record = record
            break

    try:
        if existing_record:
            update_data = AttendanceRecordUpdate(status=attendance_status, notes=remarks)
            updated_record = await attendance_record_service.update_attendance_record(db, db_obj=existing_record, attendance_in=update_data)

            return {
                "status": "success",
                "message": f"Updated attendance for {_student_display_name(student)} on {attendance_date} to '{status}'.",
                "attendance_record": {
                    "attendance_id": updated_record.id,
                    "student_id": updated_record.student_id,
                    "student_name": _student_display_name(student),
                    "class_name": _format_class_name(student.current_class) or "N/A",
                    "attendance_date": str(updated_record.date),
                    "status": updated_record.status,
                    "remarks": updated_record.notes or "No remarks",
                    "marked_by": f"{current_profile.first_name or ''} {current_profile.last_name or ''}".strip(),
                },
            }
        else:
            create_data = AttendanceRecordCreate(
                student_id=student.student_id,
                class_id=student.current_class_id,
                date=target_date,
                status=attendance_status,
                teacher_id=current_profile.teacher.teacher_id if current_profile.teacher else None,
                notes=remarks,
            )
            new_record = await attendance_record_service.create_attendance_record(db, attendance_in=create_data)

            return {
                "status": "success",
                "message": f"Successfully marked {_student_display_name(student)} as '{status}' on {attendance_date}.",
                "attendance_record": {
                    "attendance_id": new_record.id,
                    "student_id": new_record.student_id,
                    "student_name": _student_display_name(student),
                    "class_name": _format_class_name(student.current_class) or "N/A",
                    "attendance_date": str(new_record.date),
                    "status": new_record.status,
                    "remarks": new_record.notes or "No remarks",
                    "marked_by": f"{current_profile.first_name or ''} {current_profile.last_name or ''}".strip(),
                },
            }

    except Exception as e:
        logger.error(f"Failed to mark attendance: {e}", exc_info=True)
        return {"error": "Failed to mark attendance due to a system error.", "suggestion": "Please try again or contact support if the issue persists."}


@tool("get_student_attendance_for_date_range", args_schema=GetStudentAttendanceForDateRangeSchema)
async def get_student_attendance_for_date_range(student_id: str, start_date: str, end_date: str, class_name: Optional[str] = None) -> dict[str, Any]:
    """
    Retrieves a student's complete attendance record between a specified start and end date.
    Use this tool when a user asks for a student's attendance history over a period.

    Args:
        student_id: Unique identifier of the student (ID or name)
        start_date: Start date of the range (YYYY-MM-DD format)
        end_date: End date of the range (YYYY-MM-DD format)
        class_name: Optional filter by class

    Returns:
        Dictionary containing attendance records or error information
    """
    logger.info(f"[TOOL:get_student_attendance_for_date_range] Student: '{student_id}', Range: {start_date} to {end_date}")

    db, current_profile, error = _get_runtime_dependencies()
    if error:
        return error

    student, error = await _resolve_student(db, current_profile, student_id)
    if error:
        return error

    authorized, error = await _is_authorized_for_student(db, current_profile, student, allow_student=True, allow_parent=True)
    if not authorized:
        return error

    start_date_obj = _parse_date_string(start_date)
    end_date_obj = _parse_date_string(end_date)

    if not start_date_obj or not end_date_obj:
        return {"error": "Invalid date format.", "suggestion": "Please use YYYY-MM-DD format for dates."}

    if end_date_obj < start_date_obj:
        return {"error": "End date cannot be before start date.", "suggestion": f"Start: {start_date}, End: {end_date}"}

    try:
        records = await attendance_record_service.get_attendance_by_student_in_range(db, student_id=student.student_id, start_date=start_date_obj, end_date=end_date_obj)

        total_days = len(records)
        present_count = sum(1 for r in records if r.status == "Present")
        absent_count = sum(1 for r in records if r.status == "Absent")
        late_count = sum(1 for r in records if r.status == "Late")

        attendance_percentage = (present_count + late_count) / total_days * 100 if total_days > 0 else 0.0

        attendance_records = []
        for record in records:
            attendance_records.append(
                {
                    "attendance_id": record.id,
                    "attendance_date": str(record.date),
                    "status": record.status,
                    "class_name": _format_class_name(student.current_class) or "N/A",
                    "remarks": record.notes or "No remarks",
                }
            )

        return {
            "status": "success",
            "student_id": student.student_id,
            "student_name": _student_display_name(student),
            "date_range": {"start": start_date, "end": end_date},
            "class_name": _format_class_name(student.current_class) or "N/A",
            "attendance_records": attendance_records,
            "summary": {
                "total_days": total_days,
                "present": present_count,
                "absent": absent_count,
                "late": late_count,
                "attendance_percentage": round(attendance_percentage, 2),
            },
        }

    except Exception as e:
        logger.error(f"Failed to fetch attendance records: {e}", exc_info=True)
        return {"error": "Failed to retrieve attendance records.", "suggestion": "Please try again or contact support."}


@tool("get_class_attendance_for_date", args_schema=GetClassAttendanceForDateSchema)
async def get_class_attendance_for_date(class_name: str, attendance_date: str) -> dict[str, Any]:
    """
    Fetches the attendance records for all students in a specific class on a single given date.
    Use this tool when a user asks for class attendance on a particular day.

    Args:
        class_name: Name of the class (e.g., '10A', 'Grade 10 A')
        attendance_date: Date for which attendance is required (YYYY-MM-DD format)

    Returns:
        Dictionary containing class attendance data or error information
    """
    logger.info(f"[TOOL:get_class_attendance_for_date] Class: '{class_name}', Date: '{attendance_date}'")

    db, current_profile, error = _get_runtime_dependencies()
    if error:
        return error

    user_roles = _get_user_roles(current_profile)
    if not user_roles.intersection({"Teacher", "Admin"}):
        return {
            "error": "You do not have permission to view class attendance.",
            "suggestion": "Only teachers and administrators can view class attendance.",
        }

    class_obj, error = await _resolve_class(db, current_profile.school_id, class_name)
    if error:
        return error

    target_date = _parse_date_string(attendance_date)
    if not target_date:
        return {"error": f"Invalid date format: '{attendance_date}'", "suggestion": "Please use YYYY-MM-DD format."}

    try:
        records = await attendance_record_service.get_attendance_by_class(db, class_id=class_obj.class_id, target_date=target_date)

        all_students = await student_service.get_all_students_for_class(db, class_id=class_obj.class_id)

        present_count = sum(1 for r in records if r.status == "Present")
        absent_count = sum(1 for r in records if r.status == "Absent")
        late_count = sum(1 for r in records if r.status == "Late")
        total_students = len(all_students)

        attendance_percentage = (present_count + late_count) / total_students * 100 if total_students > 0 else 0.0

        attendance_map = {record.student_id: record for record in records}

        attendance_records = []
        for student in all_students:
            record = attendance_map.get(student.student_id)
            attendance_records.append(
                {
                    "student_id": student.student_id,
                    "student_name": _student_display_name(student),
                    "status": record.status if record else "Not Marked",
                    "remarks": record.notes if record else "No attendance record",
                }
            )

        return {
            "status": "success",
            "class_name": _format_class_name(class_obj),
            "attendance_date": attendance_date,
            "attendance_records": attendance_records,
            "summary": {
                "total_students": total_students,
                "present": present_count,
                "absent": absent_count,
                "late": late_count,
                "not_marked": total_students - len(records),
                "attendance_percentage": round(attendance_percentage, 2),
            },
        }

    except Exception as e:
        logger.error(f"Failed to fetch class attendance: {e}", exc_info=True)
        return {"error": "Failed to retrieve class attendance.", "suggestion": "Please try again or contact support."}


@tool("get_student_attendance_summary", args_schema=GetStudentAttendanceSummarySchema)
async def get_student_attendance_summary(
    student_id: str,
    academic_term: Optional[str] = "current",
    class_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Calculates and returns a student's overall attendance percentage for the current academic term.
    Use this tool when a user asks for a student's overall attendance or attendance percentage.

    Args:
        student_id: Unique identifier of the student (ID or name)
        academic_term: Academic term ('current' or specific term identifier)
        class_name: Optional filter by class

    Returns:
        Dictionary containing attendance summary or error information
    """
    logger.info(f"[TOOL:get_student_attendance_summary] Student: '{student_id}', Term: '{academic_term}'")

    db, current_profile, error = _get_runtime_dependencies()
    if error:
        return error

    student, error = await _resolve_student(db, current_profile, student_id)
    if error:
        return error

    authorized, error = await _is_authorized_for_student(db, current_profile, student, allow_student=True, allow_parent=True)
    if not authorized:
        return error

    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=90)

        records = await attendance_record_service.get_attendance_by_student_in_range(db, student_id=student.student_id, start_date=start_date, end_date=end_date)

        total_days = len(records)
        present_count = sum(1 for r in records if r.status == "Present")
        absent_count = sum(1 for r in records if r.status == "Absent")
        late_count = sum(1 for r in records if r.status == "Late")

        attendance_percentage = (present_count + late_count) / total_days * 100 if total_days > 0 else 0.0

        if attendance_percentage >= 90:
            status = "Excellent"
        elif attendance_percentage >= 75:
            status = "Good"
        elif attendance_percentage >= 60:
            status = "Fair"
        else:
            status = "Poor"

        monthly_data = {}
        for record in records:
            month_key = record.date.strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = {"present": 0, "absent": 0, "late": 0, "total": 0}
            monthly_data[month_key]["total"] += 1
            if record.status == "Present":
                monthly_data[month_key]["present"] += 1
            elif record.status == "Absent":
                monthly_data[month_key]["absent"] += 1
            elif record.status == "Late":
                monthly_data[month_key]["late"] += 1

        monthly_breakdown = []
        for month_key, data in sorted(monthly_data.items()):
            month_date = datetime.strptime(month_key, "%Y-%m")
            month_percentage = (data["present"] + data["late"]) / data["total"] * 100 if data["total"] > 0 else 0.0
            monthly_breakdown.append(
                {
                    "month": month_date.strftime("%B %Y"),
                    "total_days": data["total"],
                    "present": data["present"],
                    "absent": data["absent"],
                    "late": data["late"],
                    "percentage": round(month_percentage, 2),
                }
            )

        alerts = []
        if attendance_percentage >= 90:
            alerts.append("Student has excellent attendance!")
        elif attendance_percentage < 75:
            alerts.append(f"Warning: Attendance is below 75% ({attendance_percentage:.1f}%)")

        if late_count > 0:
            alerts.append(f"{late_count} late arrival(s) recorded this term")

        if absent_count > 5:
            alerts.append(f"{absent_count} absences recorded - consider follow-up")

        return {
            "status": "success",
            "student_id": student.student_id,
            "student_name": _student_display_name(student),
            "academic_term": academic_term,
            "class_name": _format_class_name(student.current_class) or "N/A",
            "term_dates": {"start_date": str(start_date), "end_date": str(end_date)},
            "attendance_summary": {
                "total_school_days": total_days,
                "days_present": present_count,
                "days_absent": absent_count,
                "days_late": late_count,
                "attendance_percentage": round(attendance_percentage, 2),
                "status": status,
            },
            "monthly_breakdown": monthly_breakdown,
            "alerts": alerts if alerts else ["No alerts"],
        }

    except Exception as e:
        logger.error(f"Failed to calculate attendance summary: {e}", exc_info=True)
        return {"error": "Failed to calculate attendance summary.", "suggestion": "Please try again or contact support."}


attendance_agent_tools = [
    mark_student_attendance,
    get_student_attendance_for_date_range,
    get_class_attendance_for_date,
    get_student_attendance_summary,
]

__all__ = [
    "attendance_agent_tools",
    "mark_student_attendance",
    "get_student_attendance_for_date_range",
    "get_class_attendance_for_date",
    "get_student_attendance_summary",
]
