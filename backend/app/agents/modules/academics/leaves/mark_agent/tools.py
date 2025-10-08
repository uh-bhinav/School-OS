# backend/app/agents/modules/academics/leaves/mark_agent/tools.py

import logging
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.mark_agent.schemas import (
    GetClassPerformanceSchema,
    GetMarksheetSchema,
    GetStudentMarksSchema,
    MarkInput,
    RecordStudentMarksSchema,
    UpdateStudentMarksSchema,
)

# It's good practice to use a logger for tool activity
logger = logging.getLogger(__name__)

# This would typically be in a config file or environment variable
# TODO: Replace with actual API endpoint from environment variables
BASE_URL = "http://localhost:8000/api/v1"


@tool("get_student_marks_for_exam", args_schema=GetStudentMarksSchema)
def get_student_marks_for_exam(
    student_name: str,
    exam_name: Optional[str] = None,
    subject_name: Optional[str] = None,
) -> Dict[str, Any]:
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
    logger.info(f"[TOOL:get_student_marks_for_exam] Student: '{student_name}', " f"Exam: '{exam_name}', Subject: '{subject_name}'")

    # Real implementation would be:
    # try:
    #     params = {"exam_name": exam_name} if exam_name else {}
    #     if subject_name:
    #         params["subject_name"] = subject_name
    #
    #     response = requests.get(
    #         f"{BASE_URL}/marks/student/{student_name}",
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
    #     return {"error": f"Failed to fetch marks: {str(e)}"}

    # Placeholder data for development/testing
    if exam_name and subject_name:
        # Filtered by both exam and subject
        return {
            "status": "success",
            "student_name": student_name,
            "exam_name": exam_name,
            "marks": [{"subject": subject_name, "marks_obtained": 88, "max_marks": 100}],
        }
    elif exam_name:
        # Filtered by exam only
        return {
            "status": "success",
            "student_name": student_name,
            "exam_name": exam_name,
            "marks": [
                {"subject": "Mathematics", "marks_obtained": 95, "max_marks": 100},
                {"subject": "Physics", "marks_obtained": 88, "max_marks": 100},
                {"subject": "Chemistry", "marks_obtained": 91, "max_marks": 100},
            ],
            "overall_percentage": 91.3,
        }
    else:
        # All exams
        return {
            "status": "success",
            "student_name": student_name,
            "exams": [
                {
                    "exam_name": "Midterm",
                    "marks": [
                        {
                            "subject": "Mathematics",
                            "marks_obtained": 92,
                            "max_marks": 100,
                        },
                        {"subject": "Physics", "marks_obtained": 85, "max_marks": 100},
                    ],
                },
                {
                    "exam_name": "Final",
                    "marks": [
                        {
                            "subject": "Mathematics",
                            "marks_obtained": 95,
                            "max_marks": 100,
                        },
                        {"subject": "Physics", "marks_obtained": 88, "max_marks": 100},
                    ],
                },
            ],
        }


@tool("record_student_marks", args_schema=RecordStudentMarksSchema)
def record_student_marks(
    student_name: str,
    exam_name: str,
    marks: List[MarkInput],
    class_name: Optional[str] = None,
    exam_date: Optional[str] = None,
) -> Dict[str, Any]:
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
    logger.info(f"[TOOL:record_student_marks] Student: '{student_name}', " f"Exam: '{exam_name}', Class: '{class_name}'")

    # Convert Pydantic models to dictionaries for JSON serialization
    marks_data = [mark.model_dump() for mark in marks]
    logger.info(f"Marks to be recorded: {marks_data}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "student_name": student_name,
    #         "exam_name": exam_name,
    #         "marks": marks_data,
    #         "class_name": class_name,
    #         "exam_date": exam_date
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/marks/",
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
    #     return {"error": f"Failed to record marks: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully recorded {len(marks_data)} subject marks for {student_name} in {exam_name}.",
        "recorded_entries": len(marks_data),
        "details": {
            "student_name": student_name,
            "exam_name": exam_name,
            "class_name": class_name,
            "subjects_recorded": [m["subject_name"] for m in marks_data],
        },
    }


@tool("update_student_marks", args_schema=UpdateStudentMarksSchema)
def update_student_marks(
    student_name: str,
    exam_name: str,
    subject_name: str,
    new_marks: float,
    reason: Optional[str] = None,
) -> Dict[str, Any]:
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
    logger.info(f"[TOOL:update_student_marks] Student: '{student_name}', " f"Exam: '{exam_name}', Subject: '{subject_name}', New Marks: {new_marks}")

    if reason:
        logger.info(f"Update reason: {reason}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "student_name": student_name,
    #         "exam_name": exam_name,
    #         "subject_name": subject_name,
    #         "new_marks": new_marks,
    #         "reason": reason
    #     }
    #     response = requests.put(
    #         f"{BASE_URL}/marks/update",
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
    #     return {"error": f"Failed to update marks: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully updated {subject_name} marks for {student_name} in {exam_name}.",
        "details": {
            "student_name": student_name,
            "exam_name": exam_name,
            "subject_name": subject_name,
            "old_marks": 85.0,  # In real implementation, fetch this first
            "new_marks": new_marks,
            "reason": reason or "Not specified",
        },
    }


@tool("get_marksheet_for_exam", args_schema=GetMarksheetSchema)
def get_marksheet_for_exam(
    student_name: str,
    exam_name: str,
    include_percentage: bool = True,
    include_grade: bool = True,
) -> Dict[str, Any]:
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
    logger.info(f"[TOOL:get_marksheet_for_exam] Student: '{student_name}', " f"Exam: '{exam_name}'")

    # Real implementation would be:
    # try:
    #     params = {
    #         "include_percentage": include_percentage,
    #         "include_grade": include_grade
    #     }
    #     response = requests.get(
    #         f"{BASE_URL}/marks/marksheet/{student_name}/{exam_name}",
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
    #     return {"error": f"Failed to generate marksheet: {str(e)}"}

    # Placeholder marksheet for development/testing
    marksheet = {
        "status": "success",
        "student_name": student_name,
        "exam_name": exam_name,
        "class": "10A",
        "subjects": [
            {
                "subject": "Mathematics",
                "marks_obtained": 95,
                "max_marks": 100,
                "grade": "A+",
            },
            {
                "subject": "Physics",
                "marks_obtained": 88,
                "max_marks": 100,
                "grade": "A",
            },
            {
                "subject": "Chemistry",
                "marks_obtained": 91,
                "max_marks": 100,
                "grade": "A+",
            },
            {
                "subject": "Biology",
                "marks_obtained": 86,
                "max_marks": 100,
                "grade": "A",
            },
            {
                "subject": "English",
                "marks_obtained": 92,
                "max_marks": 100,
                "grade": "A+",
            },
        ],
        "total_marks_obtained": 452,
        "total_max_marks": 500,
    }

    if include_percentage:
        marksheet["percentage"] = 90.4

    if include_grade:
        marksheet["overall_grade"] = "A+"

    return marksheet


@tool("get_class_performance_in_subject", args_schema=GetClassPerformanceSchema)
def get_class_performance_in_subject(
    class_name: str,
    subject_name: str,
    exam_name: Optional[str] = None,
    include_statistics: bool = True,
) -> Dict[str, Any]:
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
    logger.info(f"[TOOL:get_class_performance_in_subject] Class: '{class_name}', " f"Subject: '{subject_name}', Exam: '{exam_name}'")

    # Real implementation would be:
    # try:
    #     params = {
    #         "exam_name": exam_name,
    #         "include_statistics": include_statistics
    #     }
    #     response = requests.get(
    #         f"{BASE_URL}/marks/class-performance/{class_name}/{subject_name}",
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
    #     return {"error": f"Failed to fetch class performance: {str(e)}"}

    # Placeholder performance data for development/testing
    performance = {
        "status": "success",
        "class_name": class_name,
        "subject_name": subject_name,
        "exam_name": exam_name or "All Exams",
        "total_students": 35,
    }

    if include_statistics:
        performance["statistics"] = {
            "average_marks": 78.5,
            "median_marks": 80.0,
            "highest_marks": 98.0,
            "lowest_marks": 45.0,
            "pass_percentage": 94.3,
            "grade_distribution": {"A+": 8, "A": 12, "B+": 10, "B": 3, "C": 1, "F": 1},
            "top_performers": [
                {"student_name": "Priya Sharma", "marks": 98},
                {"student_name": "Rohan Kumar", "marks": 96},
                {"student_name": "Anjali Singh", "marks": 94},
            ],
        }

    return performance


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
