# File: app/agents/modules/academics/leaves/timetable_agent/tools.py

import logging
from typing import Any, Optional

from langchain_core.tools import tool

from app.agents.http_client import (
    AgentAuthenticationError,
    AgentHTTPClient,
    AgentHTTPClientError,
    AgentResourceNotFoundError,
    AgentValidationError,
)

from .schemas import CheckConflictsSchema, FindFreeSlotSchema, GenerateTimetableSchema, GetClassScheduleSchema, GetMyTimetableSchema, ManualUpdateSlotSchema

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


@tool("get_my_timetable", args_schema=GetMyTimetableSchema)
async def get_my_timetable(date: Optional[str] = None, date_range: Optional[str] = None) -> dict[str, Any]:
    """
    Fetches the personal timetable for the authenticated user (Student, Parent, or Teacher).
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if date:
                params["date"] = str(date)
            if date_range:
                params["date_range"] = date_range

            logger.info(f"Calling API: GET /timetable/my-schedule with params={params}")
            response = await client.get("/timetable/my-schedule", params=params)
            return {"success": True, "schedule": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting personal timetable: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_my_timetable: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_schedule", args_schema=GetClassScheduleSchema)
async def get_class_schedule(class_name: str, day: Optional[str] = None) -> dict[str, Any]:
    """
    Fetches the timetable for a specific class on a specific day.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if day:
                params["day"] = str(day)

            logger.info(f"Calling API: GET /timetable/class/{class_name} with params={params}")
            response = await client.get(f"/timetable/class/{class_name}", params=params)
            return {"success": True, "class_schedule": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class schedule: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_schedule: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("generate_timetable_for_class", args_schema=GenerateTimetableSchema)
async def generate_timetable_for_class(class_name: str) -> dict[str, Any]:
    """
    (Admin Only) Triggers a complex backend service to auto-generate a new
    timetable for a class, resolving conflicts.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: POST /timetable/class/{class_name}/generate")
            response = await client.post(f"/timetable/class/{class_name}/generate")
            return {"success": True, "generation_job": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error generating timetable: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in generate_timetable_for_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("manually_update_timetable_slot", args_schema=ManualUpdateSlotSchema)
async def manually_update_timetable_slot(class_name: str, day: str, period_number: int, subject_name: str, teacher_name: str) -> dict[str, Any]:
    """
    (Admin Only) Manually overrides a single slot in the timetable.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "day": day,
                "period_number": period_number,
                "subject_name": subject_name,
                "teacher_name": teacher_name,
            }
            logger.info(f"Calling API: PUT /timetable/class/{class_name}/update-slot with payload={payload}")
            response = await client.put(f"/timetable/class/{class_name}/update-slot", json=payload)
            return {"success": True, "updated_slot": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating timetable slot: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in manually_update_timetable_slot: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("check_timetable_conflicts_for_teacher", args_schema=CheckConflictsSchema)
async def check_timetable_conflicts_for_teacher(teacher_name: str) -> dict[str, Any]:
    """
    Checks a specific teacher's schedule for any conflicts (e.g., double-booked).
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /timetable/teacher/{teacher_name}/conflicts")
            response = await client.get(f"/timetable/teacher/{teacher_name}/conflicts")
            return {"success": True, "conflicts": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error checking teacher conflicts: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in check_timetable_conflicts_for_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("find_free_slot_for_teacher", args_schema=FindFreeSlotSchema)
async def find_free_slot_for_teacher(teacher_name: str, day: Optional[str] = None) -> dict[str, Any]:
    """
    Finds all available (un-booked) slots for a specific teacher, optionally on a specific day.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if day:
                params["day"] = str(day)

            logger.info(f"Calling API: GET /timetable/teacher/{teacher_name}/free-slots with params={params}")
            response = await client.get(f"/timetable/teacher/{teacher_name}/free-slots", params=params)
            return {"success": True, "free_slots": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error finding free slots: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in find_free_slot_for_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

timetable_agent_tools = [
    get_my_timetable,
    get_class_schedule,
    generate_timetable_for_class,
    manually_update_timetable_slot,
    check_timetable_conflicts_for_teacher,
    find_free_slot_for_teacher,
]

__all__ = ["timetable_agent_tools"]
