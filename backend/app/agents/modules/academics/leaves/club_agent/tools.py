# File: app/agents/modules/academics/leaves/club_agent/tools.py

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
@tool("search_student_by_name")
async def search_student_by_name(student_name: str) -> dict[str, Any]:
    """
    Search for a student by name and get their student_id.
    Returns student details including the numeric student_id needed for other tools.
    This is a helper tool - use it first to get the student_id before calling other tools.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Searching for student by name: {student_name}")
            response = await client.get("/students/search", params={"name": student_name})

            students = response.get("data", []) if isinstance(response, dict) else response

            if not students or len(students) == 0:
                return {"success": False, "error": f"No student found with name '{student_name}'", "suggestion": "Check the spelling and try again."}

            student = students[0]
            return {
                "success": True,
                "student_id": student.get("student_id"),
                "name": student.get("name") or f"{student.get('first_name', '')} {student.get('last_name', '')}",
                "email": student.get("email"),
                "grade_level": student.get("grade_level"),
                "section": student.get("section"),
            }

    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching for student: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_student_by_name: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# Add this tool:


@tool("get_student_clubs")
async def get_student_clubs(student_id: int) -> dict[str, Any]:
    """
    Gets all clubs that a specific student is a member of using their student_id.
    Shows the student's role, status, attendance, and contribution in each club.

    IMPORTANT: Use search_student_by_name first to get the student_id if you only have their name.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Fetching clubs for student ID: {student_id}")
            response = await client.get(f"/clubs/agent/student-clubs/{student_id}")

            return {"success": response.get("success", True), "student_id": student_id, "count": response.get("count", 0), "clubs": response.get("data", []), "message": response.get("message", "")}

    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student clubs: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_clubs: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("list_all_clubs")
async def list_all_clubs() -> dict[str, Any]:
    """
    Fetches a list of all official clubs available at the school.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /clubs/")
            response = await client.get("/clubs/")
            return {"success": True, "count": len(response), "clubs": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all clubs: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_clubs: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_club_details")
async def get_club_details(club_name: str) -> dict[str, Any]:
    """
    Fetches detailed information about a single club,
    such as its coordinator and description.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /clubs/details/{club_name}")
            response = await client.get(f"/clubs/details/{club_name}")
            return {"success": True, "club_details": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting club details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_club_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_club")
async def create_club(club_name: str, teacher_coordinator_name: str, description: Optional[str] = None) -> dict[str, Any]:
    """
    (Admin Only) Creates a new club and assigns a teacher as its coordinator.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"name": club_name, "coordinator_name": teacher_coordinator_name, "description": description}
            logger.info(f"Calling API: POST /clubs/ with payload: {payload}")
            response = await client.post("/clubs/", json=payload)
            return {"success": True, "created_club": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating club: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_club: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("add_student_to_club")
async def add_student_to_club(student_name: str, club_name: str) -> dict[str, Any]:
    """
    Add a student to a club using their full name and club name.

    Args:
        student_name: Full name of the student (e.g., "Ishita Nair")
        club_name: Name of the club (e.g., "Math Wizards Club")

    Returns:
        Success/failure response with membership details
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"student_name": student_name, "club_name": club_name}
            logger.info(f"Adding student '{student_name}' to club '{club_name}'")

            response = await client.post("/clubs/agent/add-member", json=payload)

            if response.get("success") or "id" in response:
                logger.info(f"✅ Successfully added {student_name} to {club_name}")
                return {"success": True, "message": f"Student {student_name} has been added to {club_name}", "membership_id": response.get("id"), "role": response.get("role", "member"), "status": response.get("status", "active")}
            else:
                logger.warning(f"❌ Failed to add student: {response}")
                return {"success": False, "error": response.get("detail", "Could not add student to club")}

    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError) as e:
        logger.error(f"❌ Agent Error: {e.message}", exc_info=True)
        return _format_error_response(e)
    except AgentHTTPClientError as e:
        logger.error(f"❌ HTTP Error adding student to club: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.error(f"❌ Unexpected error adding student to club: {e}", exc_info=True)
        return {"success": False, "error": f"Error adding student to club: {str(e)}"}


@tool("list_club_members")
async def list_club_members(club_name: str) -> dict[str, Any]:
    """
    Fetches a list of all student members for a specific club.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /clubs/agent/club-members/{club_name}")
            response = await client.get(f"/clubs/agent/club-members/{club_name}")
            return {"success": True, "club_name": club_name, "count": len(response), "members": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error listing club members: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_club_members: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_club_members_student_ids")
async def get_club_members_student_ids(club_name: str) -> dict[str, Any]:
    """
    Gets all student members of a specific club with their student_ids and names.
    Returns: List of members with student_id, name, role, email, and dates.

    Use this BEFORE search_marks when you need to get marks for club members.
    Example: "Which students are in Math Club and what are their marks?"
      1. Call this tool → Get list of student_ids
      2. Call search_marks for each student_id
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Fetching members for club: {club_name}")
            response = await client.get(f"/clubs/agent/club-members-list/{club_name}")

            return {
                "success": response.get("success", True),
                "club_name": club_name,
                "count": response.get("count", 0),
                "members": response.get("members", []),
                "error": response.get("error"),
            }

    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting club members: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_club_members_student_ids: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("remove_student_from_club")
async def remove_student_from_club(student_name: str, club_name: str) -> dict[str, Any]:
    """
    Remove a student from a club.

    Args:
        student_name: Full name of the student (e.g., "Priya Sharma")
        club_name: Name of the club (e.g., "Science Explorers")

    Returns:
        Success/failure response

    Examples:
        - remove_student_from_club("Priya Sharma", "Science Explorers")
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"student_name": student_name, "club_name": club_name}
            logger.info(f"Removing student '{student_name}' from club '{club_name}'")

            response = await client.post("/clubs/agent/remove-member", json=payload)

            if response.get("success"):
                logger.info(f"✅ Successfully removed {student_name} from {club_name}")
                return {"success": True, "message": f"Student {student_name} has been removed from {club_name}", "status": response.get("status", "removed")}
            else:
                logger.warning(f"❌ Failed to remove student: {response}")
                return {"success": False, "error": response.get("detail", "Could not remove student from club")}

    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError) as e:
        logger.error(f"❌ Agent Error: {e.message}", exc_info=True)
        return _format_error_response(e)
    except AgentHTTPClientError as e:
        logger.error(f"❌ HTTP Error removing student from club: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.error(f"❌ Unexpected error removing student from club: {e}", exc_info=True)
        return {"success": False, "error": f"Error removing student from club: {str(e)}"}


# --- Export the list of tools ---

club_agent_tools = [
    search_student_by_name,
    get_student_clubs,
    list_all_clubs,
    get_club_details,
    create_club,
    add_student_to_club,
    list_club_members,
    get_club_members_student_ids,
    remove_student_from_club,
]

__all__ = ["club_agent_tools"]
