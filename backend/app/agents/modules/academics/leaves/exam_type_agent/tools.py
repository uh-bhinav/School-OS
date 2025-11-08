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
    CreateExamTypeSchema,
    DeleteExamTypeSchema,
    GetExamTypeSchema,
    ListExamTypesSchema,
    UpdateExamTypeSchema,
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


@tool("list_exam_types", args_schema=ListExamTypesSchema)
async def list_exam_types() -> dict[str, Any]:
    """
    (Admin Only) Retrieves all exam type categories for the admin's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /exam-types/")
            # This calls the refactored GET /exam-types/ endpoint
            response = await client.get("/exam-types/")
            return {"success": True, "count": len(response), "exam_types": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing exam types: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_exam_types: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_exam_type_details", args_schema=GetExamTypeSchema)
async def get_exam_type_details(exam_type_id: int) -> dict[str, Any]:
    """
    (Admin Only) Get detailed information for a single exam type by its ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /exam-types/{exam_type_id}")
            response = await client.get(f"/exam-types/{exam_type_id}")
            return {"success": True, "exam_type_details": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Exam type not found for id={exam_type_id}: {e.message}")
        return {"success": False, "error": f"No exam type found with ID {exam_type_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting exam type details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_exam_type_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_exam_type", args_schema=CreateExamTypeSchema)
async def create_exam_type(school_id: int, type_name: str) -> dict[str, Any]:
    """
    (Admin Only) Creates a new exam type (e.g., 'Midterm', 'Final Exam').
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "type_name": type_name,
            }
            logger.info("Calling API: POST /exam-types/ with payload")
            response = await client.post("/exam-types/", json=payload)
            return {"success": True, "created_exam_type": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating exam type: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_exam_type: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_exam_type", args_schema=UpdateExamTypeSchema)
async def update_exam_type(exam_type_id: int, type_name: Optional[str] = None) -> dict[str, Any]:
    """
    (Admin Only) Updates an existing exam type's name.
    """
    try:
        async with AgentHTTPClient() as client:
            if type_name is None:
                return {"success": False, "error": "No new name provided for the update."}

            payload = {"type_name": type_name}

            logger.info(f"Calling API: PUT /exam-types/{exam_type_id} with payload")
            response = await client.put(f"/exam-types/{exam_type_id}", json=payload)
            return {"success": True, "updated_exam_type": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating exam type: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_exam_type: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_exam_type", args_schema=DeleteExamTypeSchema)
async def delete_exam_type(exam_type_id: int) -> dict[str, Any]:
    """
    (Admin Only) Deletes an exam type.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /exam-types/{exam_type_id}")
            # DELETE returns 204 No Content
            await client.delete(f"/exam-types/{exam_type_id}")
            return {"success": True, "message": f"Exam type {exam_type_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting exam type: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_exam_type: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

exam_type_agent_tools = [
    list_exam_types,
    get_exam_type_details,
    create_exam_type,
    update_exam_type,
    delete_exam_type,
]

__all__ = ["exam_type_agent_tools"]
