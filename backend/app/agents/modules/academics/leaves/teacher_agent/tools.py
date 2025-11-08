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

from .schemas import (
    DeactivateTeacherSchema,
    GetTeacherDetailsSchema,
    GetTeacherQualificationsSchema,
    ListAllTeachersSchema,
    SearchTeachersSchema,
    UpdateTeacherSchema,
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


@tool("list_all_teachers", args_schema=ListAllTeachersSchema)
async def list_all_teachers() -> dict[str, Any]:
    """
    (Admin Only) Retrieves all active teacher records for the admin's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /teachers/")
            # This calls the new agent-ready GET /teachers/ endpoint
            response = await client.get("/teachers/")
            return {"success": True, "count": len(response), "teachers": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all teachers: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_teachers: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_teachers", args_schema=SearchTeachersSchema)
async def search_teachers(
    name: Optional[str] = None,
    department: Optional[str] = None,
) -> dict[str, Any]:
    """
    (Admin Only) Flexibly search for teachers by name or department.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "name": name,
                "department": department,
            }
            # Filter out None values
            params = {k: v for k, v in params.items() if v is not None}

            logger.info(f"Calling API: GET /teachers/search with params: {params}")
            # This calls the new GET /teachers/search endpoint
            response = await client.get("/teachers/search", params=params)
            return {"success": True, "count": len(response), "teachers": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"No teachers found for criteria: {params}, {e.message}")
        return {"success": False, "error": "No teachers found matching your criteria."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching teachers: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_teachers: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_teacher_details", args_schema=GetTeacherDetailsSchema)
async def get_teacher_details(teacher_id: int) -> dict[str, Any]:
    """
    (Admin Only) Get detailed information for a single teacher by their ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /teachers/{teacher_id}")
            response = await client.get(f"/teachers/{teacher_id}")
            return {"success": True, "teacher_details": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Teacher not found for id={teacher_id}: {e.message}")
        return {"success": False, "error": f"No teacher found with ID {teacher_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting teacher details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_teacher_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_teacher_qualifications", args_schema=GetTeacherQualificationsSchema)
async def get_teacher_qualifications(teacher_id: int) -> dict[str, Any]:
    """
    (Admin Only) Gets a teacher's specific qualifications and experience.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /teachers/{teacher_id}/qualifications")
            response = await client.get(f"/teachers/{teacher_id}/qualifications")
            return {"success": True, "qualifications_info": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Qualifications not found for teacher id={teacher_id}: {e.message}")
        return {"success": False, "error": f"No qualifications found for teacher ID {teacher_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting teacher qualifications: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_teacher_qualifications: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_teacher", args_schema=UpdateTeacherSchema)
async def update_teacher(teacher_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Updates an existing teacher's details.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Filter out None values from the dynamic kwargs
            payload = {k: v for k, v in updates.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /teachers/{teacher_id} with payload: {payload}")
            response = await client.put(f"/teachers/{teacher_id}", json=payload)
            return {"success": True, "updated_teacher": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating teacher: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("deactivate_teacher", args_schema=DeactivateTeacherSchema)
async def deactivate_teacher(teacher_id: int) -> dict[str, Any]:
    """
    (Admin Only) Deactivates a teacher (soft-delete).
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /teachers/{teacher_id}")
            # DELETE returns a 200 OK with the deactivated object in our refactored API
            response = await client.delete(f"/teachers/{teacher_id}")
            return {"success": True, "message": f"Teacher {teacher_id} deactivated successfully.", "deactivated_teacher": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deactivating teacher: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in deactivate_teacher: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

teacher_agent_tools = [
    list_all_teachers,
    search_teachers,
    get_teacher_details,
    get_teacher_qualifications,
    update_teacher,
    deactivate_teacher,
]

__all__ = ["teacher_agent_tools"]
