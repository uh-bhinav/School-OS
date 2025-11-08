import logging
from typing import Any, List, Optional

from langchain_core.tools import tool

from app.agents.http_client import (
    AgentAuthenticationError,
    AgentHTTPClient,
    AgentHTTPClientError,
    AgentResourceNotFoundError,
    AgentValidationError,
)

# Import all schemas from our new file
from .schemas import (
    BulkCreateMarksSchema,
    CreateMarkSchema,
    DeleteMarkSchema,
    GetClassPerformanceSchema,
    GetGradeProgressionSchema,
    GetReportCardSchema,
    SearchMarksSchema,
    UpdateMarkSchema,
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


@tool("create_mark", args_schema=CreateMarkSchema)
async def create_mark(
    school_id: int,
    student_id: int,
    exam_id: int,
    subject_id: int,
    marks_obtained: float,
    max_marks: float = 100.0,
    remarks: Optional[str] = None,
) -> dict[str, Any]:
    """
    (Teacher/Admin Only) Creates a new mark record for a single student.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "student_id": student_id,
                "exam_id": exam_id,
                "subject_id": subject_id,
                "marks_obtained": marks_obtained,
                "max_marks": max_marks,
                "remarks": remarks,
            }
            payload = {k: v for k, v in payload.items() if v is not None}

            logger.info("Calling API: POST /marks/ with payload")
            response = await client.post("/marks/", json=payload)
            return {"success": True, "created_mark": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("bulk_create_marks", args_schema=BulkCreateMarksSchema)
async def bulk_create_marks(marks_list: List[dict]) -> dict[str, Any]:
    """
    (Teacher/Admin Only) Submits marks for multiple students at once.
    The input is a list of mark creation objects.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: POST /marks/bulk with {len(marks_list)} records")
            response = await client.post("/marks/bulk", json=marks_list)
            return {"success": True, "count_created": len(response), "created_marks": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error bulk creating marks: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in bulk_create_marks: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_marks", args_schema=SearchMarksSchema)
async def search_marks(
    student_id: int,
    exam_id: Optional[int] = None,
    subject_id: Optional[int] = None,
) -> dict[str, Any]:
    """
    (All Users) Search for marks for a specific student.
    Can be filtered by exam_id or subject_id.
    Authorization (Admin, Teacher, Parent, Student) is handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "student_id": student_id,
                "exam_id": exam_id,
                "subject_id": subject_id,
            }
            params = {k: v for k, v in params.items() if v is not None}

            logger.info(f"Calling API: GET /marks/search with params: {params}")
            response = await client.get("/marks/search", params=params)
            return {"success": True, "count": len(response), "marks": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching marks: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_marks: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_mark", args_schema=UpdateMarkSchema)
async def update_mark(mark_id: int, marks_obtained: Optional[float] = None, remarks: Optional[str] = None) -> dict[str, Any]:
    """
    (Teacher/Admin Only) Updates an existing mark record.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "marks_obtained": marks_obtained,
                "remarks": remarks,
            }
            payload = {k: v for k, v in payload.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /marks/{mark_id} with payload")
            response = await client.put(f"/marks/{mark_id}", json=payload)
            return {"success": True, "updated_mark": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_mark", args_schema=DeleteMarkSchema)
async def delete_mark(mark_id: int) -> dict[str, Any]:
    """
    (Admin Only) Deletes a mark record.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /marks/{mark_id}")
            await client.delete(f"/marks/{mark_id}")
            return {"success": True, "message": f"Mark {mark_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_performance", args_schema=GetClassPerformanceSchema)
async def get_class_performance(class_id: int, exam_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Get a performance summary for a class in a specific exam.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /marks/performance/class/{class_id}/exam/{exam_id}")
            response = await client.get(f"/marks/performance/class/{class_id}/exam/{exam_id}")
            return {"success": True, "summary": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class performance: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_performance: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_report_card", args_schema=GetReportCardSchema)
async def get_report_card(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Get a student's full report card for an academic year.
    Authorization (Admin, Teacher, Parent, Student) is handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /marks/report-card/student/{student_id}")
            params = {"academic_year_id": academic_year_id}
            response = await client.get(f"/marks/report-card/student/{student_id}", params=params)
            return {"success": True, "count": len(response), "marks": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting report card: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_report_card: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_grade_progression", args_schema=GetGradeProgressionSchema)
async def get_grade_progression(student_id: int, subject_id: int) -> dict[str, Any]:
    """
    (All Users) Get a student's grade progression in a single subject over time.
    Authorization (Admin, Teacher, Parent, Student) is handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /marks/progression/student/{student_id}/subject/{subject_id}")
            response = await client.get(f"/marks/progression/student/{student_id}/subject/{subject_id}")
            return {"success": True, "count": len(response), "marks": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting grade progression: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_grade_progression: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

mark_agent_tools = [
    create_mark,
    bulk_create_marks,
    search_marks,
    update_mark,
    delete_mark,
    get_class_performance,
    get_report_card,
    get_grade_progression,
]

__all__ = ["mark_agent_tools"]
