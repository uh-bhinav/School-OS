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

# Import all schemas from our new file
from .schemas import (
    BulkCreateMarksSchema,
    CreateMarkSchema,
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
                return {
                    "success": False,
                    "error": f"No student found with name '{student_name}'",
                    "suggestion": "Check the spelling and try again.",
                }

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


@tool("create_mark")
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
            payload = CreateMarkSchema(
                school_id=school_id,
                student_id=student_id,
                exam_id=exam_id,
                subject_id=subject_id,
                marks_obtained=marks_obtained,
                max_marks=max_marks,
                remarks=remarks,
            )
            response = await client.post(
                "/marks/create",
                json=payload.model_dump(exclude_none=True),
            )
            return response
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("bulk_create_marks")
async def bulk_create_marks(marks_list: list[dict]) -> dict[str, Any]:
    """
    (Teacher/Admin Only) Submits marks for multiple students at once.
    The input is a list of mark creation objects.
    """
    try:
        async with AgentHTTPClient() as client:
            payloads = [BulkCreateMarksSchema(**mark).model_dump(exclude_none=True) for mark in marks_list]
            response = await client.post(
                "/marks/bulk-create",
                json={"marks": payloads},
            )
            return response
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error bulk creating marks: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in bulk_create_marks: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_marks")
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
            params = {"student_id": student_id}
            if exam_id:
                params["exam_id"] = exam_id
            if subject_id:
                params["subject_id"] = subject_id

            response = await client.get(
                "/marks/search",
                params=params,
            )
            return response
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching marks: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_marks: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_mark")
async def update_mark(mark_id: int, marks_obtained: Optional[float] = None, remarks: Optional[str] = None) -> dict[str, Any]:
    """
    (Teacher/Admin Only) Updates an existing mark record.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = UpdateMarkSchema(
                mark_id=mark_id,
                marks_obtained=marks_obtained,
                remarks=remarks,
            )
            response = await client.put(
                f"/marks/{mark_id}",
                json=payload.model_dump(exclude_none=True),
            )
            return response
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error updating mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_mark")
async def delete_mark(mark_id: int) -> dict[str, Any]:
    """
    (Admin Only) Deletes a mark record.
    """
    try:
        async with AgentHTTPClient() as client:
            response = await client.delete(f"/marks/{mark_id}")
            return response
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error deleting mark: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_mark: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_performance")
async def get_class_performance(class_id: int, exam_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Get a performance summary for a class in a specific exam.
    """
    try:
        async with AgentHTTPClient() as client:
            response = await client.get(f"/marks/class/{class_id}/exam/{exam_id}/performance")
            return response
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting class performance: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_performance: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_report_card")
async def get_report_card(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Get a student's full report card for an academic year.
    Authorization (Admin, Teacher, Parent, Student) is handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            response = await client.get(f"/marks/student/{student_id}/year/{academic_year_id}/report-card")
            return response
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting report card: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_report_card: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_grade_progression")
async def get_grade_progression(student_id: int, subject_id: int) -> dict[str, Any]:
    """
    (All Users) Get a student's grade progression in a single subject over time.
    Authorization (Admin, Teacher, Parent, Student) is handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            response = await client.get(f"/marks/student/{student_id}/subject/{subject_id}/progression")
            return response
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting grade progression: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_grade_progression: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

mark_agent_tools = [
    search_student_by_name,
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
