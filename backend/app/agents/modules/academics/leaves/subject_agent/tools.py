# backend/app/agents/modules/academics/leaves/subject_agent/tools.py

import logging
from typing import Any, Dict, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.subject_agent.schemas import (
    AssignSubjectToClassSchema,
    AssignTeacherToSubjectSchema,
    GetTeacherForSubjectSchema,
    ListAcademicStreamsSchema,
    ListSubjectsForClassSchema,
)

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("list_subjects_for_class", args_schema=ListSubjectsForClassSchema)
def list_subjects_for_class(class_name: str, academic_year: Optional[str] = None) -> Dict[str, Any]:
    """
    Lists all the subjects that are part of the curriculum for a specific class.
    Use this tool when a user asks about what subjects a class studies or what subjects are taught to a class.

    Args:
        class_name: Name of the class (e.g., '10A', 'Grade 12 Science')
        academic_year: Optional academic year filter (e.g., '2025-2026')

    Returns:
        Dictionary containing list of subjects or error information
    """
    logger.info(f"[TOOL:list_subjects_for_class] Class: '{class_name}', " f"Academic Year: {academic_year or 'Current'}")

    # Real implementation would be:
    # try:
    #     params = {}
    #     if academic_year:
    #         params["academic_year"] = academic_year
    #
    #     response = requests.get(
    #         f"{BASE_URL}/subjects/class/{class_name}",
    #         params=params,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch subjects: {str(e)}"}

    # Placeholder data for development/testing
    return {
        "status": "success",
        "class_name": class_name,
        "academic_year": academic_year or "2025-2026",
        "subjects": [
            {
                "subject_id": "SUB-2025-001",
                "subject_name": "Mathematics",
                "subject_code": "MATH-10",
                "weekly_hours": 6,
                "is_mandatory": True,
                "description": "Advanced Mathematics including Algebra, Geometry, and Trigonometry",
            },
            {
                "subject_id": "SUB-2025-002",
                "subject_name": "Physics",
                "subject_code": "PHY-10",
                "weekly_hours": 5,
                "is_mandatory": True,
                "description": "Fundamental concepts of mechanics, heat, light, and electricity",
            },
            {
                "subject_id": "SUB-2025-003",
                "subject_name": "Chemistry",
                "subject_code": "CHEM-10",
                "weekly_hours": 5,
                "is_mandatory": True,
                "description": "Chemical reactions, periodic table, and basic organic chemistry",
            },
            {
                "subject_id": "SUB-2025-004",
                "subject_name": "English",
                "subject_code": "ENG-10",
                "weekly_hours": 5,
                "is_mandatory": True,
                "description": "English language, literature, and communication skills",
            },
            {
                "subject_id": "SUB-2025-005",
                "subject_name": "Social Studies",
                "subject_code": "SS-10",
                "weekly_hours": 4,
                "is_mandatory": True,
                "description": "History, Geography, Political Science, and Economics",
            },
        ],
        "total_subjects": 5,
    }


@tool("get_teacher_for_subject", args_schema=GetTeacherForSubjectSchema)
def get_teacher_for_subject(subject_name: str, class_name: str, academic_year: Optional[str] = None) -> Dict[str, Any]:
    """
    Identifies which teacher is assigned to teach a specific subject to a particular class.
    Use this tool when a user asks who teaches a subject, which teacher is assigned, or teacher information for a subject.

    Args:
        subject_name: Name of the subject
        class_name: Name of the class
        academic_year: Optional academic year filter

    Returns:
        Dictionary containing teacher information or error information
    """
    logger.info(f"[TOOL:get_teacher_for_subject] Subject: '{subject_name}', " f"Class: '{class_name}', Academic Year: {academic_year or 'Current'}")

    # Real implementation would be:
    # try:
    #     params = {"subject_name": subject_name, "class_name": class_name}
    #     if academic_year:
    #         params["academic_year"] = academic_year
    #
    #     response = requests.get(
    #         f"{BASE_URL}/subjects/teacher-assignment",
    #         params=params,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch teacher assignment: {str(e)}"}

    # Placeholder teacher assignment for development/testing
    return {
        "status": "success",
        "subject_name": subject_name,
        "class_name": class_name,
        "academic_year": academic_year or "2025-2026",
        "teacher": {
            "teacher_id": "TCH-2025-042",
            "teacher_name": "Mrs. Geeta Sharma",
            "email": "geeta.sharma@school.edu",
            "phone": "+91-9876543210",
            "qualification": "M.Sc. in Mathematics, B.Ed.",
            "experience_years": 12,
            "is_primary_teacher": True,
            "assignment_start_date": "2025-04-01",
        },
        "subject_details": {
            "subject_code": "MATH-10",
            "weekly_hours": 6,
            "total_periods_per_week": 6,
        },
    }


@tool("assign_subject_to_class", args_schema=AssignSubjectToClassSchema)
def assign_subject_to_class(
    subject_name: str,
    class_name: str,
    academic_year: str,
    weekly_hours: Optional[int] = None,
    is_mandatory: Optional[bool] = True,
) -> Dict[str, Any]:
    """
    Assigns a subject to a class's curriculum for the academic year. (Admin-only operation)
    Use this tool when an administrator wants to add a subject to a class's curriculum.

    Args:
        subject_name: Name of the subject to assign
        class_name: Name of the class
        academic_year: Academic year for this assignment (format: YYYY-YYYY)
        weekly_hours: Optional number of weekly hours for the subject
        is_mandatory: Whether the subject is mandatory (default: True)

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:assign_subject_to_class] Subject: '{subject_name}', " f"Class: '{class_name}', Year: '{academic_year}', Weekly Hours: {weekly_hours}, " f"Mandatory: {is_mandatory}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "subject_name": subject_name,
    #         "class_name": class_name,
    #         "academic_year": academic_year,
    #         "weekly_hours": weekly_hours,
    #         "is_mandatory": is_mandatory
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/subjects/assign-to-class",
    #         json=payload,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to assign subject to class: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully assigned {subject_name} to {class_name} for academic year {academic_year}.",
        "assignment_details": {
            "assignment_id": "SUBASSIGN-2025-001",
            "subject_name": subject_name,
            "class_name": class_name,
            "academic_year": academic_year,
            "weekly_hours": weekly_hours or 4,
            "is_mandatory": is_mandatory,
            "created_at": "2025-10-06T10:00:00Z",
            "created_by": "ADMIN-001",
        },
    }


@tool("list_academic_streams", args_schema=ListAcademicStreamsSchema)
def list_academic_streams(grade_level: Optional[str] = None, include_inactive: Optional[bool] = False) -> Dict[str, Any]:
    """
    Retrieves the available academic streams in the school (e.g., Science, Commerce, Arts).
    Use this tool when a user asks about available streams, specializations, or academic tracks.

    Args:
        grade_level: Optional filter by grade level (e.g., '11', '12')
        include_inactive: Whether to include inactive streams (default: False)

    Returns:
        Dictionary containing list of academic streams or error information
    """
    logger.info(f"[TOOL:list_academic_streams] Grade Level: {grade_level or 'All'}, " f"Include Inactive: {include_inactive}")

    # Real implementation would be:
    # try:
    #     params = {"include_inactive": include_inactive}
    #     if grade_level:
    #         params["grade_level"] = grade_level
    #
    #     response = requests.get(
    #         f"{BASE_URL}/subjects/academic-streams",
    #         params=params,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch academic streams: {str(e)}"}

    # Placeholder academic streams for development/testing
    all_streams = [
        {
            "stream_id": "STREAM-001",
            "stream_name": "Science",
            "stream_code": "SCI",
            "description": "Science stream with Physics, Chemistry, Biology/Mathematics",
            "applicable_grades": ["11", "12"],
            "core_subjects": ["Physics", "Chemistry", "Mathematics", "English"],
            "optional_subjects": ["Biology", "Computer Science", "Electronics"],
            "is_active": True,
            "total_students": 156,
        },
        {
            "stream_id": "STREAM-002",
            "stream_name": "Commerce",
            "stream_code": "COM",
            "description": "Commerce stream with Accountancy, Business Studies, Economics",
            "applicable_grades": ["11", "12"],
            "core_subjects": [
                "Accountancy",
                "Business Studies",
                "Economics",
                "English",
            ],
            "optional_subjects": ["Mathematics", "Informatics Practices"],
            "is_active": True,
            "total_students": 98,
        },
        {
            "stream_id": "STREAM-003",
            "stream_name": "Arts/Humanities",
            "stream_code": "ARTS",
            "description": "Arts stream with History, Political Science, Psychology",
            "applicable_grades": ["11", "12"],
            "core_subjects": ["History", "Political Science", "English"],
            "optional_subjects": ["Psychology", "Economics", "Sociology", "Geography"],
            "is_active": True,
            "total_students": 67,
        },
    ]

    # Filter by grade level if specified
    if grade_level:
        all_streams = [s for s in all_streams if grade_level in s["applicable_grades"]]

    # Filter inactive streams if needed
    if not include_inactive:
        all_streams = [s for s in all_streams if s["is_active"]]

    return {
        "status": "success",
        "grade_level_filter": grade_level or "All grades",
        "include_inactive": include_inactive,
        "streams": all_streams,
        "total_streams": len(all_streams),
    }


@tool("assign_teacher_to_subject", args_schema=AssignTeacherToSubjectSchema)
def assign_teacher_to_subject(
    teacher_id: str,
    subject_name: str,
    class_name: Optional[str] = None,
    academic_year: Optional[str] = None,
    is_primary_teacher: Optional[bool] = True,
) -> Dict[str, Any]:
    """
    Creates an association between a teacher and a subject, indicating their qualification to teach it. (Admin-only operation)
    Use this tool when an administrator wants to assign a teacher to teach a subject.

    Args:
        teacher_id: Unique identifier of the teacher
        subject_name: Name of the subject
        class_name: Optional specific class for this assignment
        academic_year: Optional academic year for this assignment
        is_primary_teacher: Whether this is the primary teacher (default: True)

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:assign_teacher_to_subject] Teacher ID: '{teacher_id}', " f"Subject: '{subject_name}', Class: {class_name or 'General'}, " f"Year: {academic_year or 'Current'}, Primary: {is_primary_teacher}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "teacher_id": teacher_id,
    #         "subject_name": subject_name,
    #         "class_name": class_name,
    #         "academic_year": academic_year,
    #         "is_primary_teacher": is_primary_teacher
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/subjects/assign-teacher",
    #         json=payload,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to assign teacher to subject: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully assigned teacher {teacher_id} to teach {subject_name}" + (f" for class {class_name}" if class_name else "") + ".",
        "assignment_details": {
            "assignment_id": "TCHASSIGN-2025-001",
            "teacher_id": teacher_id,
            "teacher_name": "Mrs. Geeta Sharma",
            "subject_name": subject_name,
            "class_name": class_name or "Not class-specific",
            "academic_year": academic_year or "2025-2026",
            "is_primary_teacher": is_primary_teacher,
            "assignment_date": "2025-10-06",
            "created_by": "ADMIN-001",
        },
    }


# Export all tools as a list for the agent to use
subject_agent_tools = [
    list_subjects_for_class,
    get_teacher_for_subject,
    assign_subject_to_class,
    list_academic_streams,
    assign_teacher_to_subject,
]

# Export tool names for easy reference
__all__ = [
    "subject_agent_tools",
    "list_subjects_for_class",
    "get_teacher_for_subject",
    "assign_subject_to_class",
    "list_academic_streams",
    "assign_teacher_to_subject",
]
