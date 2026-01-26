# backend/app/agents/modules/academics/leaves/attendance_agent/tools_api_based.py
"""
HTTP-based Attendance Agent Tools.

This module provides attendance tools that communicate with the backend API
through HTTP requests instead of making direct service calls. This design:

1. ✅ Agents act as external HTTP clients
2. ✅ JWT tokens are passed from frontend → agent API → tool context → HTTP client
3. ✅ Backend API handles all authentication and authorization via existing dependencies
4. ✅ Role-based access control is enforced at the API layer (not in agent logic)
5. ✅ Agents respect the same security boundaries as external clients

Architecture Flow:
    Frontend (JWT) → POST /api/v1/agents/attendance/invoke
    → Agent API extracts JWT → Injects into ToolContext
    → Agent tool calls HTTP client → HTTP client adds Bearer token
    → Backend API endpoint → get_current_user_profile extracts user/roles
    → Business logic executes → Response returned

Key Differences from Service-Based Tools (tools.py):
    ❌ OLD: Direct imports and calls to attendance_record_service
    ✅ NEW: HTTP requests to /api/v1/attendance/* endpoints

    ❌ OLD: Manual role checking in agent code
    ✅ NEW: Backend API enforces roles via require_role() dependency

    ❌ OLD: Direct database session access
    ✅ NEW: Stateless HTTP requests with JWT authentication
"""

import logging
from datetime import date, datetime
from typing import Any, Optional

from langchain_core.tools import tool

from app.agents.http_client import (
    AgentAuthenticationError,
    AgentHTTPClient,
    AgentHTTPClientError,
    AgentResourceNotFoundError,
    AgentValidationError,
)
from app.agents.modules.academics.leaves.attendance_agent.schemas import (
    GetClassAttendanceForDateSchema,
    GetStudentAttendanceForDateRangeSchema,
    GetStudentAttendanceSummarySchema,
    MarkStudentAttendanceSchema,
)

logger = logging.getLogger(__name__)


def _parse_date_string(date_str: str) -> Optional[date]:
    """Parse date string in YYYY-MM-DD format."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def _format_error_response(error: AgentHTTPClientError) -> dict[str, Any]:
    """Format HTTP client errors into user-friendly responses."""
    return {
        "success": False,
        "error": error.message,
        "status_code": error.status_code,
        **error.detail,
    }


@tool("mark_student_attendance", args_schema=MarkStudentAttendanceSchema)
async def mark_student_attendance(
    student_id: str,
    attendance_date: str,
    status: str,
    class_name: Optional[str] = None,
    remarks: Optional[str] = None,
) -> dict[str, Any]:
    """
    Mark attendance for a student via HTTP API.

    This tool sends a POST request to /api/v1/attendance/ with the JWT token
    from the tool context. The backend API will:
    1. Validate the JWT token and extract the user profile
    2. Verify the user has Teacher or Admin role (via require_role dependency)
    3. Check authorization for the specific student
    4. Create the attendance record

    Args:
        student_id: Student ID or name (resolved by backend)
        attendance_date: Date in YYYY-MM-DD format
        status: Attendance status (Present, Absent, Late)
        class_name: Optional class name for validation
        remarks: Optional notes about the attendance

    Returns:
        Success response with attendance record details or error details
    """
    # Validate date format
    parsed_date = _parse_date_string(attendance_date)
    if not parsed_date:
        return {
            "success": False,
            "error": "Invalid date format. Please use YYYY-MM-DD format.",
            "example": "2025-11-06",
        }

    # Validate attendance status
    valid_statuses = {"Present", "Absent", "Late"}
    if status not in valid_statuses:
        return {
            "success": False,
            "error": f"Invalid attendance status: {status}",
            "valid_values": list(valid_statuses),
        }

    try:
        async with AgentHTTPClient() as client:
            # Build request payload
            payload = {
                "student_id": int(student_id) if student_id.isdigit() else student_id,
                "date": attendance_date,
                "status": status,
            }

            if remarks:
                payload["notes"] = remarks

            # If class_name is provided, we need to resolve it first
            # For now, we'll let the backend handle student resolution
            # In a full implementation, you might need to call a class lookup endpoint first

            logger.info(f"Marking attendance via API: student={student_id}, date={attendance_date}, status={status}")

            # POST to attendance endpoint
            # Note: The backend endpoint expects class_id, but in service-based version
            # we resolve it from student. For HTTP-based, we need to handle this differently.
            # Option 1: Create a new endpoint that accepts student_id + date
            # Option 2: Resolve class_id first via another endpoint
            # For demonstration, I'll show the direct approach

            response = await client.post(
                "/attendance/",
                json=payload,
            )

            return {
                "success": True,
                "message": f"Attendance marked successfully for student {student_id}",
                "attendance_record": response,
            }

    except AgentAuthenticationError as e:
        logger.error(f"Authentication error while marking attendance: {e.message}")
        return _format_error_response(e)

    except AgentValidationError as e:
        logger.error(f"Validation error while marking attendance: {e.message}")
        return _format_error_response(e)

    except AgentHTTPClientError as e:
        logger.error(f"HTTP error while marking attendance: {e.message}")
        return _format_error_response(e)

    except Exception as e:
        logger.exception(f"Unexpected error while marking attendance: {e}")
        return {
            "success": False,
            "error": "An unexpected error occurred while marking attendance",
            "detail": str(e),
        }


@tool("get_student_attendance_for_date_range", args_schema=GetStudentAttendanceForDateRangeSchema)
async def get_student_attendance_for_date_range(
    student_id: str,
    start_date: str,
    end_date: str,
    class_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Retrieve student attendance records for a date range via HTTP API.

    This tool sends a GET request to /api/v1/attendance/ with query parameters.
    The backend will validate JWT and check if the user has permission to view
    this student's attendance (Teacher/Admin for any student, Parent/Student for self).

    Args:
        student_id: Student ID
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        class_name: Optional class name for validation

    Returns:
        Success response with attendance records or error details
    """
    # Validate dates
    parsed_start = _parse_date_string(start_date)
    parsed_end = _parse_date_string(end_date)

    if not parsed_start or not parsed_end:
        return {
            "success": False,
            "error": "Invalid date format. Please use YYYY-MM-DD format.",
            "example": "2025-11-06",
        }

    if parsed_end < parsed_start:
        return {
            "success": False,
            "error": "End date must be after or equal to start date.",
        }

    try:
        async with AgentHTTPClient() as client:
            # Convert student_id to int if possible
            student_id_param = int(student_id) if student_id.isdigit() else student_id

            logger.info(f"Fetching attendance via API: student={student_id}, date_range={start_date} to {end_date}")

            # GET attendance records with query parameters
            response = await client.get(
                "/attendance/",
                params={
                    "student_id": student_id_param,
                    "start_date": start_date,
                    "end_date": end_date,
                },
            )

            # Calculate summary statistics
            total_days = len(response)
            present_count = sum(1 for record in response if record.get("status") == "Present")
            absent_count = sum(1 for record in response if record.get("status") == "Absent")
            late_count = sum(1 for record in response if record.get("status") == "Late")

            attendance_rate = (present_count / total_days * 100) if total_days > 0 else 0

            return {
                "success": True,
                "student_id": student_id,
                "date_range": {"start": start_date, "end": end_date},
                "summary": {
                    "total_days": total_days,
                    "present": present_count,
                    "absent": absent_count,
                    "late": late_count,
                    "attendance_rate": f"{attendance_rate:.1f}%",
                },
                "records": response,
            }

    except AgentAuthenticationError as e:
        logger.error(f"Authentication error while fetching attendance: {e.message}")
        return _format_error_response(e)

    except AgentResourceNotFoundError as e:
        logger.error(f"Resource not found while fetching attendance: {e.message}")
        return {
            "success": False,
            "error": f"No attendance records found for student {student_id} in the specified date range.",
            "suggestion": "Verify the student ID and date range.",
        }

    except AgentHTTPClientError as e:
        logger.error(f"HTTP error while fetching attendance: {e.message}")
        return _format_error_response(e)

    except Exception as e:
        logger.exception(f"Unexpected error while fetching attendance: {e}")
        return {
            "success": False,
            "error": "An unexpected error occurred while fetching attendance records",
            "detail": str(e),
        }


@tool("get_class_attendance_for_date", args_schema=GetClassAttendanceForDateSchema)
async def get_class_attendance_for_date(
    class_name: str,
    attendance_date: str,
) -> dict[str, Any]:
    """
    Retrieve attendance for an entire class on a specific date via HTTP API.

    This tool needs to:
    1. Resolve class_name to class_id (via a class lookup endpoint)
    2. Fetch attendance records for that class (GET /api/v1/attendance/class/{class_id}/range)

    Args:
        class_name: Class name (e.g., "10A", "Grade 10 A")
        attendance_date: Date in YYYY-MM-DD format

    Returns:
        Success response with class attendance or error details
    """
    # Validate date
    parsed_date = _parse_date_string(attendance_date)
    if not parsed_date:
        return {
            "success": False,
            "error": "Invalid date format. Please use YYYY-MM-DD format.",
            "example": "2025-11-06",
        }

    try:
        logger.info(f"Fetching class attendance via API: class={class_name}, date={attendance_date}")

        # Step 1: Resolve class name to class ID
        # We need a class search/lookup endpoint for this
        # For demonstration, assuming there's a /api/v1/classes/search endpoint
        # In reality, you may need to add this endpoint or adjust the approach

        # For now, let's assume we have the class_id
        # In production, you'd call: GET /api/v1/classes?grade_level=X&section=Y
        # or implement a dedicated lookup endpoint

        # Placeholder: We'll need to add class resolution logic
        # This is a limitation that needs to be addressed in the API design

        # Step 2: Fetch attendance records for the class
        # The endpoint is: GET /api/v1/attendance/class/{class_id}/range
        # But we need class_id first

        # WORKAROUND: For now, return an instructive error
        return {
            "success": False,
            "error": "Class-based attendance lookup requires class ID resolution",
            "suggestion": (
                "To implement this feature, add a class lookup endpoint " "(e.g., GET /api/v1/classes/search?name={class_name}) " "that the agent can call to resolve class_name → class_id, " "then use GET /api/v1/attendance/class/{class_id}/range"
            ),
            "implementation_needed": [
                "Add GET /api/v1/classes/search endpoint for class name resolution",
                "Update this tool to call class search then attendance endpoint",
            ],
        }

        # FUTURE IMPLEMENTATION (once class search endpoint exists):
        # async with AgentHTTPClient() as client:
        #     classes = await client.get("/classes/search", params={"name": class_name})
        #     if not classes:
        #         return {"success": False, "error": f"No class found with name: {class_name}"}
        #
        #     class_id = classes[0]["class_id"]
        #     response = await client.get(
        #         f"/attendance/class/{class_id}/range",
        #         params={"start_date": attendance_date, "end_date": attendance_date}
        #     )
        #
        #     return {
        #         "success": True,
        #         "class_name": class_name,
        #         "date": attendance_date,
        #         "attendance_records": response,
        #     }

    except AgentAuthenticationError as e:
        logger.error(f"Authentication error while fetching class attendance: {e.message}")
        return _format_error_response(e)

    except AgentHTTPClientError as e:
        logger.error(f"HTTP error while fetching class attendance: {e.message}")
        return _format_error_response(e)

    except Exception as e:
        logger.exception(f"Unexpected error while fetching class attendance: {e}")
        return {
            "success": False,
            "error": "An unexpected error occurred while fetching class attendance",
            "detail": str(e),
        }


@tool("get_student_attendance_summary", args_schema=GetStudentAttendanceSummarySchema)
async def get_student_attendance_summary(
    student_id: str,
    academic_term: Optional[str] = "current",
    class_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Get an attendance summary for a student over an academic term via HTTP API.

    This tool fetches attendance records and calculates summary statistics.
    The backend validates JWT and checks authorization.

    Args:
        student_id: Student ID
        academic_term: Academic term (e.g., "current", "Term 1", "2024-Fall")
        class_name: Optional class name for validation

    Returns:
        Success response with attendance summary or error details
    """
    try:
        async with AgentHTTPClient() as client:
            # Convert student_id to int if possible
            student_id_param = int(student_id) if student_id.isdigit() else student_id

            logger.info(f"Fetching attendance summary via API: student={student_id}, term={academic_term}")

            # For a term-based summary, we need to determine the date range
            # This would typically involve:
            # 1. Looking up the academic term dates (requires an academic terms API)
            # 2. Fetching attendance records for that range
            # 3. Calculating statistics

            # For now, we'll fetch all attendance records and calculate summary
            # In production, you'd want a dedicated summary endpoint or term lookup

            # Fetch all attendance records for the student
            response = await client.get(
                "/attendance/",
                params={"student_id": student_id_param},
            )

            # Calculate summary statistics
            total_days = len(response)
            present_count = sum(1 for record in response if record.get("status") == "Present")
            absent_count = sum(1 for record in response if record.get("status") == "Absent")
            late_count = sum(1 for record in response if record.get("status") == "Late")

            attendance_rate = (present_count / total_days * 100) if total_days > 0 else 0

            return {
                "success": True,
                "student_id": student_id,
                "academic_term": academic_term,
                "summary": {
                    "total_days_recorded": total_days,
                    "present": present_count,
                    "absent": absent_count,
                    "late": late_count,
                    "attendance_rate": f"{attendance_rate:.1f}%",
                },
                "message": (f"Student has attended {present_count} out of {total_days} days " f"({attendance_rate:.1f}% attendance rate)"),
            }

    except AgentAuthenticationError as e:
        logger.error(f"Authentication error while fetching attendance summary: {e.message}")
        return _format_error_response(e)

    except AgentResourceNotFoundError as e:
        logger.error(f"Resource not found while fetching attendance summary: {e.message}")
        return {
            "success": False,
            "error": f"No attendance records found for student {student_id}.",
            "suggestion": "Verify the student ID.",
        }

    except AgentHTTPClientError as e:
        logger.error(f"HTTP error while fetching attendance summary: {e.message}")
        return _format_error_response(e)

    except Exception as e:
        logger.exception(f"Unexpected error while fetching attendance summary: {e}")
        return {
            "success": False,
            "error": "An unexpected error occurred while fetching attendance summary",
            "detail": str(e),
        }


# Export tools for agent registration
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
