import logging
from datetime import date
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
    CreateExamSchema,
    DeleteExamSchema,
    GetExamDetailsSchema,
    ListAllExamsSchema,
    SearchExamsSchema,
    UpdateExamSchema,
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


@tool("list_all_exams", args_schema=ListAllExamsSchema)
async def list_all_exams() -> dict[str, Any]:
    """
    (All Users) Retrieves all active exams for the user's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /exams/")
            # This calls the agent-ready GET /exams/ endpoint
            response = await client.get("/exams/")
            return {"success": True, "count": len(response), "exams": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all exams: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_exams: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_exams", args_schema=SearchExamsSchema)
async def search_exams(
    name: Optional[str] = None,
    exam_type_id: Optional[int] = None,
    academic_year_id: Optional[int] = None,
) -> dict[str, Any]:
    """
    (All Users) Flexibly search for active exams by name, exam type ID, or academic year ID.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "name": name,
                "exam_type_id": exam_type_id,
                "academic_year_id": academic_year_id,
            }
            # Filter out None values
            params = {k: v for k, v in params.items() if v is not None}

            logger.info(f"Calling API: GET /exams/search with params: {params}")
            # This calls the new GET /exams/search endpoint
            response = await client.get("/exams/search", params=params)
            return {"success": True, "count": len(response), "exams": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"No exams found for criteria: {params}, {e.message}")
        return {"success": False, "error": "No exams found matching your criteria."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching exams: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_exams: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_exam_details", args_schema=GetExamDetailsSchema)
async def get_exam_details(exam_id: int) -> dict[str, Any]:
    """
    (All Users) Get detailed information for a single exam by its ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /exams/{exam_id}")
            response = await client.get(f"/exams/{exam_id}")
            return {"success": True, "exam_details": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Exam not found for id={exam_id}: {e.message}")
        return {"success": False, "error": f"No exam found with ID {exam_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting exam details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_exam_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_exam", args_schema=CreateExamSchema)
async def create_exam(
    school_id: int,
    exam_name: str,
    exam_type_id: int,
    start_date: date,
    end_date: date,
    total_marks: float,
    academic_year_id: int,
) -> dict[str, Any]:
    """
    (Admin Only) Creates a new exam.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "exam_name": exam_name,
                "exam_type_id": exam_type_id,
                "start_date": str(start_date),
                "end_date": str(end_date),
                "total_marks": total_marks,
                "academic_year_id": academic_year_id,
            }

            logger.info("Calling API: POST /exams/ with payload")
            response = await client.post("/exams/", json=payload)
            return {"success": True, "created_exam": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating exam: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_exam: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_exam", args_schema=UpdateExamSchema)
async def update_exam(exam_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Updates an existing exam's details.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Build payload, converting date objects to strings
            payload = {}
            for k, v in updates.items():
                if v is not None:
                    if isinstance(v, date):
                        payload[k] = str(v)
                    else:
                        payload[k] = v

            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /exams/{exam_id} with payload: {payload}")
            response = await client.put(f"/exams/{exam_id}", json=payload)
            return {"success": True, "updated_exam": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating exam: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_exam: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_exam", args_schema=DeleteExamSchema)
async def delete_exam(exam_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-deletes an exam.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /exams/{exam_id}")
            # DELETE returns 204 No Content
            await client.delete(f"/exams/{exam_id}")
            return {"success": True, "message": f"Exam {exam_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting exam: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_exam: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

exam_agent_tools = [
    list_all_exams,
    search_exams,
    get_exam_details,
    create_exam,
    update_exam,
    delete_exam,
]

__all__ = ["exam_agent_tools"]
