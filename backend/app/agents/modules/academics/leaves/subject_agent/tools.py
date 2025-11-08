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
    CreateSubjectSchema,
    DeleteSubjectSchema,
    GetSubjectDetailsSchema,
    GetSubjectTeachersSchema,
    ListAllSubjectsSchema,
    SearchSubjectsSchema,
    UpdateSubjectSchema,
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


@tool("list_all_subjects", args_schema=ListAllSubjectsSchema)
async def list_all_subjects() -> dict[str, Any]:
    """
    Retrieves all active subjects for the user's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /subjects/")
            # This calls the refactored GET /subjects/ endpoint
            response = await client.get("/subjects/")
            return {"success": True, "count": len(response), "subjects": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all subjects: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_subjects: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_subjects", args_schema=SearchSubjectsSchema)
async def search_subjects(
    name: Optional[str] = None,
    code: Optional[str] = None,
    category: Optional[str] = None,
) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Flexibly search for subjects by name, code, or category.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "name": name,
                "code": code,
                "category": category,
            }
            # Filter out None values
            params = {k: v for k, v in params.items() if v is not None}

            logger.info(f"Calling API: GET /subjects/search with params: {params}")
            # This calls the new GET /subjects/search endpoint
            response = await client.get("/subjects/search", params=params)
            return {"success": True, "count": len(response), "subjects": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching subjects: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_subjects: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_subject_details", args_schema=GetSubjectDetailsSchema)
async def get_subject_details(subject_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Get detailed information for a single subject by its ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /subjects/{subject_id}")
            response = await client.get(f"/subjects/{subject_id}")
            return {"success": True, "subject_details": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Subject not found for id={subject_id}: {e.message}")
        return {"success": False, "error": f"No subject found with ID {subject_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting subject details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_subject_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_teachers_for_subject", args_schema=GetSubjectTeachersSchema)
async def get_teachers_for_subject(subject_id: int) -> dict[str, Any]:
    """
    (Admin Only) Finds all teachers in the admin's school qualified for a subject.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /subjects/{subject_id}/teachers")
            # This calls the refactored GET /{subject_id}/teachers endpoint
            response = await client.get(f"/subjects/{subject_id}/teachers")
            return {"success": True, "subject_id": subject_id, "teacher_count": len(response), "teachers": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting teachers for subject: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_teachers_for_subject: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_subject", args_schema=CreateSubjectSchema)
async def create_subject(
    school_id: int,
    name: str,
    short_code: Optional[str] = None,
    category: Optional[str] = None,
) -> dict[str, Any]:
    """
    (Admin Only) Creates a new subject.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "name": name,
                "short_code": short_code,
                "category": category,
            }
            payload = {k: v for k, v in payload.items() if v is not None}

            logger.info("Calling API: POST /subjects/ with payload")
            response = await client.post("/subjects/", json=payload)
            return {"success": True, "created_subject": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating subject: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_subject: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_subject", args_schema=UpdateSubjectSchema)
async def update_subject(subject_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Updates an existing subject's details.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Filter out None values from the dynamic kwargs
            payload = {k: v for k, v in updates.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /subjects/{subject_id} with payload: {payload}")
            response = await client.put(f"/subjects/{subject_id}", json=payload)
            return {"success": True, "updated_subject": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating subject: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_subject: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_subject", args_schema=DeleteSubjectSchema)
async def delete_subject(subject_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-deletes a subject.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /subjects/{subject_id}")
            # DELETE returns 204 No Content
            await client.delete(f"/subjects/{subject_id}")
            return {"success": True, "message": f"Subject {subject_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting subject: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_subject: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

subject_agent_tools = [
    list_all_subjects,
    search_subjects,
    get_subject_details,
    get_teachers_for_subject,
    create_subject,
    update_subject,
    delete_subject,
]

__all__ = ["subject_agent_tools"]
