# backend/app/agents/modules/academics/leaves/attendance_agent/tools.py

import logging
from typing import Any, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.attendance_agent.schemas import (
    GetClassAttendanceForDateSchema,
    GetStudentAttendanceForDateRangeSchema,
    GetStudentAttendanceSummarySchema,
    MarkStudentAttendanceSchema,
)

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("mark_student_attendance", args_schema=MarkStudentAttendanceSchema)
def mark_student_attendance(
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
        student_id: Unique identifier of the student
        attendance_date: Date for marking attendance (YYYY-MM-DD format)
        status: Attendance status ('present', 'absent', 'late', 'excused')
        class_name: Optional class name for context
        remarks: Optional additional notes

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:mark_student_attendance] Student: '{student_id}', " f"Date: '{attendance_date}', Status: '{status}'")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "student_id": student_id,
    #         "attendance_date": attendance_date,
    #         "status": status,
    #         "class_name": class_name,
    #         "remarks": remarks
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/attendance/",
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
    #     return {"error": f"Failed to mark attendance: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully marked {status} for student {student_id} on {attendance_date}.",
        "attendance_record": {
            "attendance_id": "ATT-2025-001",
            "student_id": student_id,
            "attendance_date": attendance_date,
            "status": status,
            "class_name": class_name or "Not specified",
            "remarks": remarks or "No remarks",
            "marked_at": "2025-10-06T10:00:00Z",
            "marked_by": "System",
        },
    }


@tool(
    "get_student_attendance_for_date_range",
    args_schema=GetStudentAttendanceForDateRangeSchema,
)
def get_student_attendance_for_date_range(student_id: str, start_date: str, end_date: str, class_name: Optional[str] = None) -> dict[str, Any]:
    """
    Retrieves a student's complete attendance record between a specified start and end date.
    Use this tool when a user asks for a student's attendance history over a period.

    Args:
        student_id: Unique identifier of the student
        start_date: Start date of the range (YYYY-MM-DD format)
        end_date: End date of the range (YYYY-MM-DD format)
        class_name: Optional filter by class

    Returns:
        Dictionary containing attendance records or error information
    """
    logger.info(f"[TOOL:get_student_attendance_for_date_range] Student: '{student_id}', " f"Range: {start_date} to {end_date}, Class: {class_name or 'All'}")

    # Real implementation would be:
    # try:
    #     params = {
    #         "start_date": start_date,
    #         "end_date": end_date
    #     }
    #     if class_name:
    #         params["class_name"] = class_name
    #
    #     response = requests.get(
    #         f"{BASE_URL}/attendance/student/{student_id}",
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
    #     return {"error": f"Failed to fetch attendance records: {str(e)}"}

    # Placeholder attendance records for development/testing
    return {
        "status": "success",
        "student_id": student_id,
        "date_range": {"start": start_date, "end": end_date},
        "class_name": class_name or "All classes",
        "attendance_records": [
            {
                "attendance_id": "ATT-2025-001",
                "attendance_date": "2025-09-01",
                "status": "present",
                "class_name": class_name or "10A",
                "remarks": "On time",
            },
            {
                "attendance_id": "ATT-2025-002",
                "attendance_date": "2025-09-02",
                "status": "present",
                "class_name": class_name or "10A",
                "remarks": "On time",
            },
            {
                "attendance_id": "ATT-2025-003",
                "attendance_date": "2025-09-03",
                "status": "late",
                "class_name": class_name or "10A",
                "remarks": "Arrived 15 minutes late",
            },
            {
                "attendance_id": "ATT-2025-004",
                "attendance_date": "2025-09-04",
                "status": "absent",
                "class_name": class_name or "10A",
                "remarks": "Sick leave",
            },
            {
                "attendance_id": "ATT-2025-005",
                "attendance_date": "2025-09-05",
                "status": "present",
                "class_name": class_name or "10A",
                "remarks": "On time",
            },
        ],
        "summary": {
            "total_days": 5,
            "present": 3,
            "absent": 1,
            "late": 1,
            "excused": 0,
            "attendance_percentage": 80.0,
        },
    }


@tool("get_class_attendance_for_date", args_schema=GetClassAttendanceForDateSchema)
def get_class_attendance_for_date(class_name: str, attendance_date: str) -> dict[str, Any]:
    """
    Fetches the attendance records for all students in a specific class on a single given date.
    Use this tool when a user asks for class attendance on a particular day.

    Args:
        class_name: Name of the class
        attendance_date: Date for which attendance is required (YYYY-MM-DD format)

    Returns:
        Dictionary containing class attendance data or error information
    """
    logger.info(f"[TOOL:get_class_attendance_for_date] Class: '{class_name}', " f"Date: '{attendance_date}'")

    # Real implementation would be:
    # try:
    #     response = requests.get(
    #         f"{BASE_URL}/attendance/class/{class_name}/date/{attendance_date}",
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch class attendance: {str(e)}"}

    # Placeholder class attendance for development/testing
    return {
        "status": "success",
        "class_name": class_name,
        "attendance_date": attendance_date,
        "attendance_records": [
            {
                "student_id": "STU-2025-001",
                "student_name": "Priya Sharma",
                "status": "present",
                "remarks": "On time",
            },
            {
                "student_id": "STU-2025-002",
                "student_name": "Rohan Patel",
                "status": "present",
                "remarks": "On time",
            },
            {
                "student_id": "STU-2025-003",
                "student_name": "Anjali Kumar",
                "status": "late",
                "remarks": "Arrived 10 minutes late",
            },
            {
                "student_id": "STU-2025-004",
                "student_name": "Arjun Singh",
                "status": "absent",
                "remarks": "Medical leave",
            },
            {
                "student_id": "STU-2025-005",
                "student_name": "Sneha Reddy",
                "status": "present",
                "remarks": "On time",
            },
        ],
        "summary": {
            "total_students": 5,
            "present": 3,
            "absent": 1,
            "late": 1,
            "excused": 0,
            "attendance_percentage": 80.0,
        },
    }


@tool("get_student_attendance_summary", args_schema=GetStudentAttendanceSummarySchema)
def get_student_attendance_summary(
    student_id: str,
    academic_term: Optional[str] = "current",
    class_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Calculates and returns a student's overall attendance percentage for the current academic term.
    Use this tool when a user asks for a student's overall attendance or attendance percentage.

    Args:
        student_id: Unique identifier of the student
        academic_term: Academic term ('current', 'previous', or specific term identifier)
        class_name: Optional filter by class

    Returns:
        Dictionary containing attendance summary or error information
    """
    logger.info(f"[TOOL:get_student_attendance_summary] Student: '{student_id}', " f"Term: '{academic_term}', Class: {class_name or 'All'}")

    # Real implementation would be:
    # try:
    #     params = {"academic_term": academic_term}
    #     if class_name:
    #         params["class_name"] = class_name
    #
    #     response = requests.get(
    #         f"{BASE_URL}/attendance/student/{student_id}/summary",
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
    #     return {"error": f"Failed to fetch attendance summary: {str(e)}"}

    # Placeholder attendance summary for development/testing
    return {
        "status": "success",
        "student_id": student_id,
        "academic_term": academic_term,
        "class_name": class_name or "10A",
        "term_dates": {"start_date": "2025-08-01", "end_date": "2025-12-20"},
        "attendance_summary": {
            "total_school_days": 85,
            "days_present": 78,
            "days_absent": 5,
            "days_late": 2,
            "days_excused": 0,
            "attendance_percentage": 91.76,
            "status": "Good",
        },
        "monthly_breakdown": [
            {
                "month": "August 2025",
                "total_days": 22,
                "present": 20,
                "absent": 1,
                "late": 1,
                "percentage": 90.91,
            },
            {
                "month": "September 2025",
                "total_days": 21,
                "present": 19,
                "absent": 2,
                "late": 0,
                "percentage": 90.48,
            },
            {
                "month": "October 2025",
                "total_days": 6,
                "present": 6,
                "absent": 0,
                "late": 0,
                "percentage": 100.0,
            },
        ],
        "alerts": [
            "Student has good attendance overall",
            "2 late arrivals recorded this term",
        ],
    }


# Export all tools as a list for the agent to use
attendance_agent_tools = [
    mark_student_attendance,
    get_student_attendance_for_date_range,
    get_class_attendance_for_date,
    get_student_attendance_summary,
]

# Export tool names for easy reference
__all__ = [
    "attendance_agent_tools",
    "mark_student_attendance",
    "get_student_attendance_for_date_range",
    "get_class_attendance_for_date",
    "get_student_attendance_summary",
]
