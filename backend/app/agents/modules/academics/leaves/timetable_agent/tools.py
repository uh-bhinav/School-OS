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


@tool("get_my_timetable")
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


@tool("get_class_schedule")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting class schedule: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_schedule: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_timetable_entry")
async def search_timetable_entry(class_name: str, day: str, period_number: int) -> dict[str, Any]:
    """
    Finds a timetable entry by class, day, and period number.
    Returns the entry_id, subject_name, teacher_name, etc.

    Useful for: "What's in slot 2 on Monday for Class 1A?"
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "day": day,
                "period_number": period_number,
            }
            logger.info(f"Calling API: GET /timetable/class/{class_name}/entry with params={params}")
            response = await client.get(f"/timetable/class/{class_name}/entry", params=params)
            return {"success": True, "entry": response}
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error searching timetable entry: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_timetable_entry: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("swap_timetable_entries")
async def swap_timetable_entries(entry_id_1: int, entry_id_2: int) -> dict[str, Any]:
    """
    (Admin Only) Swaps two timetable entries (swaps their period numbers, teachers, subjects, etc.).

    Example: Swap entry 2 (Math in slot 2) with entry 5 (Science in slot 6).
    After swap: entry 2 is in slot 6, entry 5 is in slot 2.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "entry_id_1": entry_id_1,
                "entry_id_2": entry_id_2,
            }
            logger.info(f"Calling API: POST /timetable/swap with payload={payload}")
            response = await client.post("/timetable/swap", json=payload)
            return {"success": True, "swapped": response}
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error swapping timetable entries: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in swap_timetable_entries: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("generate_timetable_for_class")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error generating timetable: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in generate_timetable_for_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("manually_update_timetable_slot")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error updating timetable slot: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in manually_update_timetable_slot: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("check_timetable_conflicts_for_teacher")
async def check_timetable_conflicts_for_teacher(teacher_name: str) -> dict[str, Any]:
    """
    Checks a specific teacher's schedule for any conflicts (e.g., double-booked).
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /timetable/teacher/{teacher_name}/conflicts")
            response = await client.get(f"/timetable/teacher/{teacher_name}/conflicts")
            return {"success": True, "conflicts": response}
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error checking teacher conflicts: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in check_timetable_conflicts_for_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("find_free_slot_for_teacher")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error finding free slots: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in find_free_slot_for_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

timetable_agent_tools = [
    get_my_timetable,
    get_class_schedule,
    search_timetable_entry,
    swap_timetable_entries,
    generate_timetable_for_class,
    manually_update_timetable_slot,
    check_timetable_conflicts_for_teacher,
    find_free_slot_for_teacher,
]

__all__ = ["timetable_agent_tools"]
