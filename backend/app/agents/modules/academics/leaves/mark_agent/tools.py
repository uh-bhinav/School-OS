# backend/app/agents/modules/academics/leaves/mark_agent/tools.py

import logging
import re
from collections import defaultdict
from statistics import median
from typing import Any, Optional
from uuid import UUID

from langchain_core.tools import tool
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.agents.modules.academics.leaves.mark_agent.schemas import (
    GetClassPerformanceSchema,
    GetMarksheetSchema,
    GetStudentMarksSchema,
    MarkInput,
    RecordStudentMarksSchema,
    UpdateStudentMarksSchema,
)
from app.agents.tool_context import ToolContextError, get_tool_context
from app.models.class_model import Class
from app.models.exams import Exam
from app.models.mark import Mark
from app.models.profile import Profile
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.mark_schema import MarkCreate, MarkUpdate
from app.services import mark_service, student_contact_service, student_service

# It's good practice to use a logger for tool activity
logger = logging.getLogger(__name__)

PASS_MARK_THRESHOLD = 40.0


def _normalized_search_text(value: str) -> str:
    return " ".join(value.strip().lower().split())


def _student_display_name(student: Optional[Student]) -> str:
    if not student:
        return "Unknown Student"
    profile = student.profile
    if profile:
        first = profile.first_name or ""
        last = profile.last_name or ""
        full_name = f"{first} {last}".strip()
        if full_name:
            return full_name
    return f"Student #{student.student_id}"


def _format_class_name(class_obj: Optional[Class]) -> Optional[str]:
    if not class_obj:
        return None
    section = (class_obj.section or "").strip()
    if not section:
        return str(class_obj.grade_level)
    if len(section) == 1:
        return f"{class_obj.grade_level}{section.upper()}"
    return f"{class_obj.grade_level} {section}".strip()


def _grade_from_percentage(percentage: float) -> str:
    if percentage >= 90:
        return "A+"
    if percentage >= 80:
        return "A"
    if percentage >= 70:
        return "B+"
    if percentage >= 60:
        return "B"
    if percentage >= 50:
        return "C"
    return "F"


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_class_name(class_name: str) -> Optional[tuple[int, str]]:
    cleaned = class_name.strip()
    if not cleaned:
        return None
    cleaned = re.sub(r"grade\s+", "", cleaned, flags=re.IGNORECASE)
    match = re.match(r"(?P<grade>\d{1,2})(?:\s*[-/]?\s*)?(?P<section>[A-Za-z0-9 ]+)?", cleaned)
    if not match:
        return None
    grade_str = match.group("grade")
    section = (match.group("section") or "").strip()
    if not grade_str or not section:
        return None
    try:
        grade_level = int(grade_str)
    except ValueError:
        return None
    return grade_level, section


def _subject_name_from_mark(mark: Mark, subject_lookup: dict[int, Subject]) -> Optional[str]:
    subject = getattr(mark, "subject", None)
    if subject and getattr(subject, "name", None):
        return subject.name
    fallback = subject_lookup.get(mark.subject_id)
    return fallback.name if fallback else None


async def _resolve_student(
    db: AsyncSession,
    current_profile: Profile,
    student_lookup: str,
) -> tuple[Optional[Student], Optional[dict[str, Any]]]:
    lookup = student_lookup.strip()
    if not lookup:
        return None, {
            "status": "invalid_request",
            "message": "Student name or ID is required.",
        }

    async def _fetch_student_by_id(student_id: int) -> Optional[Student]:
        stmt = select(Student).options(selectinload(Student.profile)).where(Student.student_id == student_id)
        result = await db.execute(stmt)
        student_obj = result.scalars().first()
        if student_obj and student_obj.profile and student_obj.profile.school_id == current_profile.school_id:
            return student_obj
        return None

    async def _fetch_student_by_user_id(user_id: str) -> Optional[Student]:
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            return None

        stmt = select(Student).options(selectinload(Student.profile)).where(Student.user_id == user_uuid)
        result = await db.execute(stmt)
        student_obj = result.scalars().first()
        if student_obj and student_obj.profile and student_obj.profile.school_id == current_profile.school_id:
            return student_obj
        return None

    student: Optional[Student] = None
    normalized_query = _normalized_search_text(lookup)

    if lookup.isdigit():
        student = await _fetch_student_by_id(int(lookup))
        if not student:
            return None, {
                "status": "not_found",
                "message": "No student found with the provided student_id in your school.",
            }
    else:
        student = await _fetch_student_by_user_id(lookup)
        if student:
            return student, None
        search_results = await student_service.search_students(
            db,
            school_id=current_profile.school_id,
            name=lookup,
            limit=5,
        )

        if not search_results:
            return None, {
                "status": "not_found",
                "message": "No student matched the provided name. Please check the spelling or try including the last name.",
            }

        exact_matches: list[Student] = []
        candidate_list: list[dict[str, Any]] = []

        for candidate in search_results:
            if not candidate.profile:
                continue
            candidate_full_name = f"{candidate.profile.first_name or ''} {candidate.profile.last_name or ''}".strip()
            normalized_candidate = _normalized_search_text(candidate_full_name)
            if normalized_candidate == normalized_query:
                exact_matches.append(candidate)
            candidate_list.append(
                {
                    "student_id": candidate.student_id,
                    "student_name": candidate_full_name,
                    "class_id": candidate.current_class_id,
                }
            )

        if len(exact_matches) == 1:
            student = exact_matches[0]
        elif len(exact_matches) > 1:
            return None, {
                "status": "ambiguous",
                "message": "Multiple students share the same full name. Please specify the student_id.",
                "candidates": candidate_list,
            }
        elif len(search_results) == 1:
            student = search_results[0]
        else:
            return None, {
                "status": "ambiguous",
                "message": "Multiple students matched the provided name. Please refine your query or provide the student_id.",
                "candidates": candidate_list,
            }

    if not student or not student.profile:
        return None, {
            "status": "error",
            "message": "Unable to resolve the student's profile. Please try again or contact support.",
        }

    return student, None


async def _is_authorized_for_student(
    db: AsyncSession,
    current_profile: Profile,
    student: Student,
    *,
    allow_student: bool,
    allow_parent: bool,
) -> tuple[bool, Optional[dict[str, Any]]]:
    role_names = {role.role_definition.role_name for role in current_profile.roles if getattr(role, "role_definition", None) and getattr(role.role_definition, "role_name", None)}

    if {"Admin", "Teacher"} & role_names:
        return True, None

    if allow_student and "Student" in role_names:
        if current_profile.student and current_profile.student.student_id == student.student_id:
            return True, None
        return False, {
            "status": "forbidden",
            "message": "You can only access your own marks.",
        }

    if allow_parent and "Parent" in role_names:
        linked = await student_contact_service.is_user_linked_to_student(
            db,
            user_id=current_profile.user_id,
            student_id=student.student_id,
        )
        if linked:
            return True, None
        return False, {
            "status": "forbidden",
            "message": "You are not linked to this student.",
        }

    logger.warning(
        "[MARK_AGENT] Access denied for user '%s' on student '%s'",
        current_profile.user_id,
        student.student_id,
    )
    return False, {
        "status": "forbidden",
        "message": "You are not authorized to access this student's marks.",
    }


async def _resolve_exam(
    db: AsyncSession,
    school_id: int,
    exam_name: str,
) -> tuple[Optional[Exam], Optional[dict[str, Any]]]:
    cleaned = exam_name.strip()
    if not cleaned:
        return None, {
            "status": "invalid_request",
            "message": "Exam name is required.",
        }

    normalized = _normalized_search_text(cleaned)
    stmt = (
        select(Exam)
        .where(
            Exam.school_id == school_id,
            Exam.is_active.is_(True),
            Exam.exam_name.isnot(None),
            func.lower(Exam.exam_name) == normalized,
        )
        .order_by(Exam.start_date.desc())
    )
    result = await db.execute(stmt)
    exams = list(result.scalars().all())

    if not exams:
        return None, {
            "status": "not_found",
            "message": f"No active exam named '{exam_name}' exists for this school.",
        }

    if len(exams) > 1:
        return None, {
            "status": "ambiguous",
            "message": "Multiple exams matched the name. Please provide a more specific exam identifier.",
            "candidates": [
                {
                    "exam_id": exam.id,
                    "exam_name": exam.exam_name,
                    "start_date": exam.start_date.isoformat() if getattr(exam, "start_date", None) else None,
                    "end_date": exam.end_date.isoformat() if getattr(exam, "end_date", None) else None,
                }
                for exam in exams
            ],
        }

    return exams[0], None


async def _resolve_subject(
    db: AsyncSession,
    school_id: int,
    subject_name: str,
) -> tuple[Optional[Subject], Optional[dict[str, Any]]]:
    cleaned = subject_name.strip()
    if not cleaned:
        return None, {
            "status": "invalid_request",
            "message": "Subject name is required.",
        }

    normalized = _normalized_search_text(cleaned)
    stmt = (
        select(Subject)
        .where(
            Subject.school_id == school_id,
            Subject.is_active.is_(True),
            func.lower(Subject.name) == normalized,
        )
        .order_by(Subject.name.asc())
    )
    result = await db.execute(stmt)
    subjects = list(result.scalars().all())

    if not subjects:
        return None, {
            "status": "not_found",
            "message": f"Subject '{subject_name}' was not found in your school.",
        }

    if len(subjects) > 1:
        return None, {
            "status": "ambiguous",
            "message": "Multiple subjects matched the provided name. Please use the subject code or provide a more specific name.",
            "candidates": [
                {
                    "subject_id": subject.subject_id,
                    "subject_name": subject.name,
                }
                for subject in subjects
            ],
        }

    return subjects[0], None


async def _resolve_class(
    db: AsyncSession,
    school_id: int,
    class_name: str,
) -> tuple[Optional[Class], Optional[dict[str, Any]]]:
    parsed = _parse_class_name(class_name)
    if not parsed:
        return None, {
            "status": "invalid_request",
            "message": "Class name should include both grade and section (e.g., '10A').",
        }

    grade_level, section = parsed
    stmt = (
        select(Class)
        .where(
            Class.school_id == school_id,
            Class.is_active.is_(True),
            Class.grade_level == grade_level,
            func.lower(Class.section) == section.lower(),
        )
        .order_by(Class.academic_year_id.desc())
    )
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
            "message": "Multiple active classes matched the provided name. Please specify the academic year.",
            "candidates": [
                {
                    "class_id": class_obj.class_id,
                    "grade_level": class_obj.grade_level,
                    "section": class_obj.section,
                    "academic_year_id": class_obj.academic_year_id,
                }
                for class_obj in classes
            ],
        }

    return classes[0], None


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


@tool("get_student_marks_for_exam", args_schema=GetStudentMarksSchema)
async def get_student_marks_for_exam(
    student_name: str,
    exam_name: Optional[str] = None,
    subject_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Fetches the marks for a specific student in a given exam.
    Use this tool when a user asks for a student's marks, grades, scores, or performance in an exam.

    Args:
        student_name: Full name of the student
        exam_name: Name of the exam (optional, if not provided returns all exams)
        subject_name: Specific subject to filter by (optional)

    Returns:
        Dictionary containing student marks data or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for get_student_marks_for_exam")
        return context_error

    logger.info(
        "[TOOL:get_student_marks_for_exam] User: '%s', Student query: '%s', Exam filter: '%s', Subject filter: '%s'",
        current_profile.user_id,
        student_name,
        exam_name,
        subject_name,
    )

    student, student_error = await _resolve_student(db, current_profile, student_name)
    if student_error:
        return student_error

    authorized, auth_error = await _is_authorized_for_student(
        db,
        current_profile,
        student,
        allow_student=True,
        allow_parent=True,
    )
    if not authorized:
        return auth_error

    marks = await mark_service.get_marks_by_student(db, student_id=student.student_id)

    if exam_name:
        marks = [mark for mark in marks if mark.exam and mark.exam.exam_name and mark.exam.exam_name.lower() == exam_name.lower()]

    if subject_name:
        marks = [mark for mark in marks if mark.subject and mark.subject.name and mark.subject.name.lower() == subject_name.lower()]

    if not marks:
        return {
            "status": "not_found",
            "message": "No marks found for the requested filters.",
            "student_id": student.student_id,
            "student_name": f"{student.profile.first_name or ''} {student.profile.last_name or ''}".strip(),
        }

    exams_index: dict[str, dict[str, Any]] = {}
    exams_totals: dict[str, dict[str, float]] = defaultdict(lambda: {"obtained": 0.0, "max": 0.0})

    for mark in marks:
        exam_obj = mark.exam
        subject_obj = mark.subject
        exam_label = exam_obj.exam_name if exam_obj and exam_obj.exam_name else "Unknown Exam"
        exam_key = exam_label.lower()

        if exam_key not in exams_index:
            exams_index[exam_key] = {
                "exam_id": getattr(exam_obj, "id", None),
                "exam_name": exam_label,
                "exam_start_date": exam_obj.start_date.isoformat() if getattr(exam_obj, "start_date", None) else None,
                "exam_end_date": exam_obj.end_date.isoformat() if getattr(exam_obj, "end_date", None) else None,
                "marks": [],
            }

        mark_entry = {
            "mark_id": mark.id,
            "subject_id": mark.subject_id,
            "subject_name": subject_obj.name if subject_obj else None,
            "marks_obtained": _to_float(mark.marks_obtained),
            "max_marks": _to_float(mark.max_marks),
            "remarks": mark.remarks,
        }

        exams_index[exam_key]["marks"].append(mark_entry)

        obtained = mark_entry["marks_obtained"] or 0.0
        max_marks_val = mark_entry["max_marks"] or 0.0
        exams_totals[exam_key]["obtained"] += obtained
        exams_totals[exam_key]["max"] += max_marks_val

    exams_payload: list[dict[str, Any]] = []

    for key, exam_data in exams_index.items():
        totals = exams_totals[key]
        total_obtained = totals["obtained"]
        total_max = totals["max"]
        percentage = None
        if total_max > 0:
            percentage = round((total_obtained / total_max) * 100, 2)

        exam_payload = {
            **exam_data,
            "total_marks_obtained": round(total_obtained, 2),
            "total_max_marks": round(total_max, 2),
        }

        if percentage is not None:
            exam_payload["percentage"] = percentage

        exams_payload.append(exam_payload)

    exams_payload.sort(key=lambda exam: exam.get("exam_start_date") or "")

    response: dict[str, Any] = {
        "status": "success",
        "student_id": student.student_id,
        "student_name": _student_display_name(student),
        "filters": {
            "exam_name": exam_name,
            "subject_name": subject_name,
        },
    }

    if exam_name:
        matching_exam = next((exam for exam in exams_payload if exam["exam_name"].lower() == exam_name.lower()), None)
        response["exam"] = matching_exam
        if matching_exam and matching_exam.get("total_max_marks"):
            response["overall_percentage"] = matching_exam.get("percentage")
    else:
        response["exams"] = exams_payload

    return response


@tool("record_student_marks", args_schema=RecordStudentMarksSchema)
async def record_student_marks(
    student_name: str,
    exam_name: str,
    marks: list[MarkInput],
    class_name: Optional[str] = None,
    exam_date: Optional[str] = None,
) -> dict[str, Any]:
    """
    Records new marks for a student for a specific exam.
    Use this tool when you need to save new marks/grades for a student.
    This is a data-modification tool - ensure all information is correct before calling.

    Args:
        student_name: Full name of the student
        exam_name: Name of the exam
        marks: List of subject marks (MarkInput objects)
        class_name: Optional class/grade of the student
        exam_date: Optional date when exam was conducted

    Returns:
        Dictionary containing success status or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for record_student_marks")
        return context_error

    logger.info(
        "[TOOL:record_student_marks] User: '%s', Student: '%s', Exam: '%s', Class: '%s'",
        current_profile.user_id,
        student_name,
        exam_name,
        class_name,
    )

    student, student_error = await _resolve_student(db, current_profile, student_name)
    if student_error:
        return student_error

    authorized, auth_error = await _is_authorized_for_student(
        db,
        current_profile,
        student,
        allow_student=False,
        allow_parent=False,
    )
    if not authorized:
        return auth_error

    exam, exam_error = await _resolve_exam(db, current_profile.school_id, exam_name)
    if exam_error:
        return exam_error

    if class_name:
        class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
        if class_error:
            return class_error
        if student.current_class_id and student.current_class_id != class_obj.class_id:
            return {
                "status": "validation_error",
                "message": f"{_student_display_name(student)} is not enrolled in {class_name}.",
                "student_class_id": student.current_class_id,
                "expected_class_id": class_obj.class_id,
            }

    subject_cache: dict[str, Subject] = {}
    for mark in marks:
        normalized_subject = _normalized_search_text(mark.subject_name)
        if normalized_subject in subject_cache:
            continue
        subject, subject_error = await _resolve_subject(db, current_profile.school_id, mark.subject_name)
        if subject_error:
            return subject_error
        subject_cache[normalized_subject] = subject

    subject_by_id = {subject.subject_id: subject for subject in subject_cache.values()}

    existing_marks = await mark_service.get_marks_for_student_and_exam(
        db,
        student_id=student.student_id,
        exam_id=exam.id,
    )
    existing_subject_ids = {mark.subject_id for mark in existing_marks}

    duplicate_subjects = [subject_cache[_normalized_search_text(mark_input.subject_name)].name for mark_input in marks if subject_cache[_normalized_search_text(mark_input.subject_name)].subject_id in existing_subject_ids]

    if duplicate_subjects:
        return {
            "status": "conflict",
            "message": "Marks already exist for the listed subjects. Use the update tool to modify them.",
            "subjects": duplicate_subjects,
        }

    mark_payloads = []
    for mark_input in marks:
        subject = subject_cache[_normalized_search_text(mark_input.subject_name)]
        mark_payloads.append(
            MarkCreate(
                school_id=current_profile.school_id,
                student_id=student.student_id,
                exam_id=exam.id,
                subject_id=subject.subject_id,
                marks_obtained=float(mark_input.marks_obtained),
                max_marks=float(mark_input.max_marks if mark_input.max_marks is not None else 100.0),
            )
        )

    created_marks = await mark_service.bulk_create_marks(db, marks_in=mark_payloads)

    student_class = None
    if student.current_class_id:
        student_class = await db.get(Class, student.current_class_id)

    response_details = {
        "student_name": _student_display_name(student),
        "exam_name": exam.exam_name,
        "class_name": _format_class_name(student_class) or class_name,
    }
    if exam_date:
        response_details["exam_date"] = exam_date

    return {
        "status": "success",
        "message": f"Successfully recorded {len(created_marks)} subject marks for {_student_display_name(student)} in {exam.exam_name}.",
        "student_id": student.student_id,
        "exam_id": exam.id,
        "recorded_entries": len(created_marks),
        "details": response_details,
        "subjects_recorded": [
            {
                "mark_id": mark.id,
                "subject_id": mark.subject_id,
                "subject_name": _subject_name_from_mark(mark, subject_by_id),
                "marks_obtained": _to_float(mark.marks_obtained),
                "max_marks": _to_float(mark.max_marks),
            }
            for mark in created_marks
        ],
    }


@tool("update_student_marks", args_schema=UpdateStudentMarksSchema)
async def update_student_marks(
    student_name: str,
    exam_name: str,
    subject_name: str,
    new_marks: float,
    reason: Optional[str] = None,
) -> dict[str, Any]:
    """
    Updates existing marks for a student in a specific subject and exam.
    Use this tool when correcting or modifying previously recorded marks.
    This is a data-modification tool - use only when explicitly requested.

    Args:
        student_name: Full name of the student
        exam_name: Name of the exam
        subject_name: Subject whose marks need updating
        new_marks: The corrected marks value
        reason: Optional reason for the update (for audit trail)

    Returns:
        Dictionary containing success status or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for update_student_marks")
        return context_error

    logger.info(
        "[TOOL:update_student_marks] User: '%s', Student: '%s', Exam: '%s', Subject: '%s', New Marks: %s",
        current_profile.user_id,
        student_name,
        exam_name,
        subject_name,
        new_marks,
    )

    student, student_error = await _resolve_student(db, current_profile, student_name)
    if student_error:
        return student_error

    authorized, auth_error = await _is_authorized_for_student(
        db,
        current_profile,
        student,
        allow_student=False,
        allow_parent=False,
    )
    if not authorized:
        return auth_error

    exam, exam_error = await _resolve_exam(db, current_profile.school_id, exam_name)
    if exam_error:
        return exam_error

    subject, subject_error = await _resolve_subject(db, current_profile.school_id, subject_name)
    if subject_error:
        return subject_error

    marks_for_exam = await mark_service.get_marks_for_student_and_exam(
        db,
        student_id=student.student_id,
        exam_id=exam.id,
    )

    target_mark = next((mark for mark in marks_for_exam if mark.subject_id == subject.subject_id), None)
    if not target_mark:
        return {
            "status": "not_found",
            "message": f"No mark record found for {subject.name} in {exam.exam_name}.",
        }

    max_marks_value = _to_float(target_mark.max_marks)
    if max_marks_value is not None and new_marks > max_marks_value:
        return {
            "status": "validation_error",
            "message": f"New marks ({new_marks}) cannot exceed the recorded maximum marks ({max_marks_value}).",
        }

    old_marks = _to_float(target_mark.marks_obtained)
    update_payload = MarkUpdate(marks_obtained=float(new_marks))
    updated_mark = await mark_service.update_mark(db, db_obj=target_mark, mark_in=update_payload)

    response_details = {
        "student_name": _student_display_name(student),
        "exam_name": exam.exam_name,
        "subject_name": subject.name,
        "old_marks": old_marks,
        "new_marks": _to_float(updated_mark.marks_obtained),
        "max_marks": _to_float(updated_mark.max_marks),
        "reason": reason or "Not specified",
    }

    return {
        "status": "success",
        "message": f"Successfully updated {subject.name} marks for {_student_display_name(student)} in {exam.exam_name}.",
        "details": response_details,
    }


@tool("get_marksheet_for_exam", args_schema=GetMarksheetSchema)
async def get_marksheet_for_exam(
    student_name: str,
    exam_name: str,
    include_percentage: bool = True,
    include_grade: bool = True,
) -> dict[str, Any]:
    """
    Generates a complete marksheet for a student for a specific exam.
    Use this tool when a user asks for a full marksheet, report card, or complete performance summary.

    Args:
        student_name: Full name of the student
        exam_name: Name of the exam
        include_percentage: Whether to calculate overall percentage
        include_grade: Whether to calculate overall grade

    Returns:
        Dictionary containing complete marksheet data or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for get_marksheet_for_exam")
        return context_error

    logger.info(
        "[TOOL:get_marksheet_for_exam] User: '%s', Student: '%s', Exam: '%s'",
        current_profile.user_id,
        student_name,
        exam_name,
    )

    student, student_error = await _resolve_student(db, current_profile, student_name)
    if student_error:
        return student_error

    authorized, auth_error = await _is_authorized_for_student(
        db,
        current_profile,
        student,
        allow_student=True,
        allow_parent=True,
    )
    if not authorized:
        return auth_error

    exam, exam_error = await _resolve_exam(db, current_profile.school_id, exam_name)
    if exam_error:
        return exam_error

    marks = await mark_service.get_marks_for_student_and_exam(
        db,
        student_id=student.student_id,
        exam_id=exam.id,
    )

    if not marks:
        return {
            "status": "not_found",
            "message": f"No marks recorded for {_student_display_name(student)} in {exam.exam_name}.",
        }

    subjects_output: list[dict[str, Any]] = []
    total_obtained = 0.0
    total_max = 0.0

    for mark in marks:
        obtained = _to_float(mark.marks_obtained) or 0.0
        max_marks_val = _to_float(mark.max_marks) or 0.0
        total_obtained += obtained
        total_max += max_marks_val

        subject_payload: dict[str, Any] = {
            "subject_name": mark.subject.name if mark.subject else None,
            "marks_obtained": obtained,
            "max_marks": max_marks_val,
        }

        subject_percentage = None
        if include_percentage and max_marks_val > 0:
            subject_percentage = round((obtained / max_marks_val) * 100, 2)
            subject_payload["percentage"] = subject_percentage

        if include_grade:
            if subject_percentage is not None:
                subject_payload["grade"] = _grade_from_percentage(subject_percentage)
            else:
                subject_payload["grade"] = None

        subjects_output.append(subject_payload)

    marksheet: dict[str, Any] = {
        "status": "success",
        "student_name": _student_display_name(student),
        "student_id": student.student_id,
        "exam_id": exam.id,
        "exam_name": exam.exam_name,
        "subjects": subjects_output,
        "total_marks_obtained": round(total_obtained, 2),
        "total_max_marks": round(total_max, 2),
    }

    if exam.start_date:
        marksheet["exam_start_date"] = exam.start_date.isoformat()
    if exam.end_date:
        marksheet["exam_end_date"] = exam.end_date.isoformat()

    student_class = None
    if student.current_class_id:
        student_class = await db.get(Class, student.current_class_id)
    if student_class:
        marksheet["class"] = _format_class_name(student_class)

    if include_percentage and total_max > 0:
        overall_percentage = round((total_obtained / total_max) * 100, 2)
        marksheet["percentage"] = overall_percentage
        if include_grade:
            marksheet["overall_grade"] = _grade_from_percentage(overall_percentage)
    elif include_grade:
        marksheet["overall_grade"] = None

    return marksheet


@tool("get_class_performance_in_subject", args_schema=GetClassPerformanceSchema)
async def get_class_performance_in_subject(
    class_name: str,
    subject_name: str,
    exam_name: Optional[str] = None,
    include_statistics: bool = True,
) -> dict[str, Any]:
    """
    Retrieves performance analytics for an entire class in a specific subject.
    Use this tool when asked about class average, class performance, top performers, or grade distribution.

    Args:
        class_name: Name of the class (e.g., '10A', '12 Science')
        subject_name: Subject to analyze
        exam_name: Optional specific exam (if not provided, returns aggregate)
        include_statistics: Whether to include detailed statistics

    Returns:
        Dictionary containing class performance data or error information
    """
    db, current_profile, context_error = _get_runtime_dependencies()
    if context_error:
        logger.warning("Tool context unavailable for get_class_performance_in_subject")
        return context_error

    logger.info(
        "[TOOL:get_class_performance_in_subject] User: '%s', Class: '%s', Subject: '%s', Exam: '%s'",
        current_profile.user_id,
        class_name,
        subject_name,
        exam_name,
    )

    role_names = {role.role_definition.role_name for role in current_profile.roles if getattr(role, "role_definition", None) and getattr(role.role_definition, "role_name", None)}
    if not ({"Admin", "Teacher"} & role_names):
        return {
            "status": "forbidden",
            "message": "Only teachers or administrators can access class performance analytics.",
        }

    class_obj, class_error = await _resolve_class(db, current_profile.school_id, class_name)
    if class_error:
        return class_error

    subject, subject_error = await _resolve_subject(db, current_profile.school_id, subject_name)
    if subject_error:
        return subject_error

    exam = None
    if exam_name:
        exam, exam_error = await _resolve_exam(db, current_profile.school_id, exam_name)
        if exam_error:
            return exam_error

    stmt = (
        select(Mark)
        .join(Student, Mark.student_id == Student.student_id)
        .where(
            Student.current_class_id == class_obj.class_id,
            Mark.subject_id == subject.subject_id,
        )
        .options(
            selectinload(Mark.student).selectinload(Student.profile),
            selectinload(Mark.exam),
            selectinload(Mark.subject),
        )
    )

    if exam:
        stmt = stmt.where(Mark.exam_id == exam.id)

    result = await db.execute(stmt)
    marks = list(result.scalars().all())

    if not marks:
        scope = exam.exam_name if exam else "the requested filters"
        return {
            "status": "not_found",
            "message": f"No marks recorded for {subject.name} in {scope}.",
        }

    entries: list[dict[str, Any]] = []
    percentages: list[float] = []
    grades_count: dict[str, int] = defaultdict(int)
    pass_count = 0
    unique_student_ids: set[int] = set()

    for mark in marks:
        obtained = _to_float(mark.marks_obtained)
        max_marks_val = _to_float(mark.max_marks)
        percentage = None

        if obtained is not None and max_marks_val and max_marks_val > 0:
            percentage = round((obtained / max_marks_val) * 100, 2)
            percentages.append(percentage)
            if percentage >= PASS_MARK_THRESHOLD:
                pass_count += 1
            grade = _grade_from_percentage(percentage)
            grades_count[grade] += 1
        else:
            grade = None

        unique_student_ids.add(mark.student_id)

        entries.append(
            {
                "student_id": mark.student_id,
                "student_name": _student_display_name(mark.student),
                "marks_obtained": obtained,
                "max_marks": max_marks_val,
                "percentage": percentage,
                "grade": grade,
                "exam_name": mark.exam.exam_name if mark.exam else None,
            }
        )

    response: dict[str, Any] = {
        "status": "success",
        "class_id": class_obj.class_id,
        "class_name": _format_class_name(class_obj),
        "subject_id": subject.subject_id,
        "subject_name": subject.name,
        "exam_name": (exam.exam_name if exam else "All Exams"),
        "total_students": len(unique_student_ids),
        "entries": entries,
    }

    if percentages:
        response["class_average_percentage"] = round(sum(percentages) / len(percentages), 2)

    if include_statistics:
        score_values = [entry["marks_obtained"] for entry in entries if entry["marks_obtained"] is not None]
        if score_values:
            average_marks = round(sum(score_values) / len(score_values), 2)
            median_marks = round(median(score_values), 2)
            highest_marks = round(max(score_values), 2)
            lowest_marks = round(min(score_values), 2)
        else:
            average_marks = median_marks = highest_marks = lowest_marks = None

        pass_percentage = round((pass_count / len(entries)) * 100, 2) if entries else 0.0
        ordered_grades = ["A+", "A", "B+", "B", "C", "F"]
        grade_distribution = {grade: grades_count.get(grade, 0) for grade in ordered_grades}

        top_performers = sorted(
            [entry for entry in entries if entry["percentage"] is not None],
            key=lambda item: item["percentage"],
            reverse=True,
        )[:3]

        response["statistics"] = {
            "average_marks": average_marks,
            "median_marks": median_marks,
            "highest_marks": highest_marks,
            "lowest_marks": lowest_marks,
            "pass_percentage": pass_percentage,
            "grade_distribution": grade_distribution,
            "top_performers": [
                {
                    "student_id": performer["student_id"],
                    "student_name": performer["student_name"],
                    "marks_obtained": performer["marks_obtained"],
                    "percentage": performer["percentage"],
                }
                for performer in top_performers
            ],
        }

    if not exam:
        exam_groups: dict[int | None, list[tuple[dict[str, Any], Mark]]] = defaultdict(list)
        for entry, mark in zip(entries, marks):
            exam_groups[mark.exam_id].append((entry, mark))

        exam_breakdown: list[dict[str, Any]] = []
        for exam_id, items in exam_groups.items():
            exam_obj = items[0][1].exam
            group_entry = {
                "exam_id": exam_id,
                "exam_name": exam_obj.exam_name if exam_obj else "Unknown Exam",
                "entries": [entry for entry, _ in items],
            }

            if include_statistics:
                group_scores = [entry["marks_obtained"] for entry, _ in items if entry["marks_obtained"] is not None]
                group_percentages = [entry["percentage"] for entry, _ in items if entry["percentage"] is not None]
                group_entry["average_marks"] = round(sum(group_scores) / len(group_scores), 2) if group_scores else None
                group_entry["average_percentage"] = round(sum(group_percentages) / len(group_percentages), 2) if group_percentages else None

            if exam_obj and exam_obj.start_date:
                group_entry["exam_start_date"] = exam_obj.start_date.isoformat()
            if exam_obj and exam_obj.end_date:
                group_entry["exam_end_date"] = exam_obj.end_date.isoformat()

            exam_breakdown.append(group_entry)

        if exam_breakdown:
            exam_breakdown.sort(key=lambda item: item.get("exam_start_date") or "")
            response["exam_breakdown"] = exam_breakdown

    return response


# Export all tools as a list for the agent to use
mark_agent_tools = [
    get_student_marks_for_exam,
    record_student_marks,
    update_student_marks,
    get_marksheet_for_exam,
    get_class_performance_in_subject,
]

# Export tool names for easy reference
__all__ = [
    "mark_agent_tools",
    "get_student_marks_for_exam",
    "record_student_marks",
    "update_student_marks",
    "get_marksheet_for_exam",
    "get_class_performance_in_subject",
]
