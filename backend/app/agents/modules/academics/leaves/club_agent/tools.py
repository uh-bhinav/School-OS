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

from .schemas import AddStudentToClubSchema, CreateClubSchema, GetClubDetailsSchema, ListAllClubsSchema, ListClubMembersSchema

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


@tool("list_all_clubs", args_schema=ListAllClubsSchema)
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


@tool("get_club_details", args_schema=GetClubDetailsSchema)
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


@tool("create_club", args_schema=CreateClubSchema)
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


@tool("add_student_to_club", args_schema=AddStudentToClubSchema)
async def add_student_to_club(student_name: str, club_name: str) -> dict[str, Any]:
    """
    Adds a student to a club. This can be done by an Admin, a Teacher,
    or a Student (for themselves).
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"student_name": student_name, "club_name": club_name}
            logger.info(f"Calling API: POST /clubs/members/add with payload: {payload}")
            response = await client.post("/clubs/members/add", json=payload)
            return {"success": True, "membership": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error adding student to club: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in add_student_to_club: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("list_club_members", args_schema=ListClubMembersSchema)
async def list_club_members(club_name: str) -> dict[str, Any]:
    """
    Fetches a list of all student members for a specific club.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /clubs/members/{club_name}")
            response = await client.get(f"/clubs/members/{club_name}")
            return {"success": True, "club_name": club_name, "count": len(response), "members": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error listing club members: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_club_members: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

club_agent_tools = [
    list_all_clubs,
    get_club_details,
    create_club,
    add_student_to_club,
    list_club_members,
]

__all__ = ["club_agent_tools"]
