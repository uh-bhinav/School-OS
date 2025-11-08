# File: app/agents/modules/academics/leaves/attendance_agent/tools.py

import logging
from datetime import date
from typing import Any, List, Optional

from langchain_core.tools import tool

from app.agents.http_client import (
    AgentAuthenticationError,
    AgentHTTPClient,
    AgentHTTPClientError,
    AgentResourceNotFoundError,
    AgentValidationError,
)

from .schemas import GetAllAbsenteesTodaySchema, GetClassAttendanceSheetSchema, GetLowAttendanceReportSchema, GetMyAttendanceReportSchema, TakeClassAttendanceSchema

logger = logging.getLogger(__name__)


def _format_error_response(error: AgentHTTPClientError) -> dict[str, Any]:
    """Helper to format HTTP client errors into user-friendly responses for the LLM."""
    return {
        "success": False,
        "error": error.message,
        "status_code": error.status_code,
        **error.detail,
    }


# --- Tool Definitions ---


@tool("get_my_attendance_report", args_schema=GetMyAttendanceReportSchema)
async def get_my_attendance_report(start_date: Optional[date] = None, end_date: Optional[date] = None) -> dict[str, Any]:
    """
    (Student/Parent Tool) Fetches the personal attendance report for the authenticated user
    (or their linked child). You can optionally provide a start_date and end_date
    in YYYY-MM-DD format. If no dates are given, it may default to a range.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if start_date:
                params["start_date"] = str(start_date)
            if end_date:
                params["end_date"] = str(end_date)

            logger.info(f"Calling API: GET /attendance/agent/my-report with params={params}")
            response = await client.get("/attendance/agent/my-report", params=params)
            return {"success": True, "report": response}

    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting personal attendance report: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_my_attendance_report: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_attendance_sheet", args_schema=GetClassAttendanceSheetSchema)
async def get_class_attendance_sheet(class_name: str, date: str) -> dict[str, Any]:
    """
    (Teacher Tool) Fetches the 'to-do' list of students for a class.
    This is the *first step* before taking attendance.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"target_date": str(date)}
            logger.info(f"Calling API: GET /attendance/agent/sheet/{class_name} with params={params}")
            response = await client.get(f"/attendance/agent/sheet/{class_name}", params=params)
            return {"success": True, "attendance_sheet": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class attendance sheet: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_attendance_sheet: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("take_class_attendance", args_schema=TakeClassAttendanceSchema)
async def take_class_attendance(class_name: str, date: str, present_student_ids: List[int], absent_student_ids: List[int], late_student_ids: Optional[List[int]] = None) -> dict[str, Any]:
    """
    (Teacher Tool) Submits the attendance for a class.
    This is the *second step* after getting the student IDs from the sheet.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "class_name": class_name,
                "date": str(date),
                "present_student_ids": present_student_ids,
                "absent_student_ids": absent_student_ids,
                "late_student_ids": late_student_ids or [],
            }
            logger.info(f"Calling API: POST /attendance/agent/take with {len(present_student_ids)} present, {len(absent_student_ids)} absent")
            response = await client.post("/attendance/agent/take", json=payload)
            return {"success": True, "submission_status": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error taking class attendance: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in take_class_attendance: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_all_absentees_today", args_schema=GetAllAbsenteesTodaySchema)
async def get_all_absentees_today() -> dict[str, Any]:
    """
    (Admin Tool) Fetches a list of all students marked absent or late
    across the entire school for today.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /attendance/agent/absentees/today")
            response = await client.get("/attendance/agent/absentees/today")
            return {"success": True, "absent_students": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting all absentees: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_all_absentees_today: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_students_with_low_attendance_report", args_schema=GetLowAttendanceReportSchema)
async def get_students_with_low_attendance_report(threshold_percent: float, start_date: str, end_date: str) -> dict[str, Any]:
    """
    (Admin/Teacher Tool) Generates a report of students whose attendance
    is below a given percentage for a date range.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"threshold_percent": threshold_percent, "start_date": str(start_date), "end_date": str(end_date)}
            logger.info(f"Calling API: GET /attendance/agent/report/low-attendance with params={params}")
            response = await client.get("/attendance/agent/report/low-attendance", params=params)
            return {"success": True, "low_attendance_report": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting low attendance report: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_students_with_low_attendance_report: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---
# We are replacing your old tool list with this new, robust list
attendance_agent_tools = [
    get_my_attendance_report,
    get_class_attendance_sheet,
    take_class_attendance,
    get_all_absentees_today,
    get_students_with_low_attendance_report,
]

__all__ = ["attendance_agent_tools"]
