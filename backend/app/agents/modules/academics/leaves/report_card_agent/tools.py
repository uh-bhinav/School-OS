import logging
from typing import Any

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


@tool("get_student_report_card")
async def get_student_report_card(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Retrieve a fully calculated JSON report card for a single student.
    Authorization (Admin, Teacher, Parent, Student) will be handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-card/student/{student_id} with params: {params}")
            response = await client.get(f"/report-card/student/{student_id}", params=params)
            return {"success": True, "report_card": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Report card not found for student_id={student_id}: {e.message}")
        return {
            "success": False,
            "error": f"Report card data not found for student {student_id} in that academic year.",
        }
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student report card: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_report_card: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_report_cards")
async def get_class_report_cards(class_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Retrieve a list of JSON report cards for an entire class.
    Authorization will be handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-card/class/{class_id} with params: {params}")
            response = await client.get(f"/report-card/class/{class_id}", params=params)
            return {"success": True, "count": len(response), "report_cards": response}
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting class report cards: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_report_cards: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("download_student_report_card_pdf")
async def download_student_report_card_pdf(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Retrieve a downloadable PDF of a student's report card.
    Authorization will be handled by the API.
    This tool returns a JSON success message, as the API handles the download.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-card/student/{student_id}/pdf with params: {params}")

            # This request will return PDF bytes, not JSON.
            # We will use the base _client to make the request and check status.

            # This is a different pattern, as we don't expect a JSON response.
            # We are just confirming the API call can be made.
            # In a real-world scenario, the agent would return this URL
            # to the frontend, and the frontend would open it.

            context = client._get_auth_headers()  # Get context for URL
            base_url = context.api_base_url.rstrip("/")
            url = f"{base_url}/report-card/student/{student_id}/pdf?academic_year_id={academic_year_id}"

            # For now, the agent's job is to provide the URL.
            return {
                "success": True,
                "message": "To download the PDF, please use this URL. (Note: The frontend client must handle this URL)",
                "download_url": url,
            }

    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error getting report card PDF URL: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in download_student_report_card_pdf: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_students")
async def search_students_for_report_card(name: str) -> dict[str, Any]:
    """
    Search for students by name to find their student_id.
    Used before fetching their report card.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /students/search with params={{'name': {name}}}")
            response = await client.get("/students/search", params={"name": name})
            if not response:
                return {
                    "success": False,
                    "error": f"No students found with name '{name}'",
                }
            return {"success": True, "count": len(response), "students": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"No students found for name='{name}': {e.message}")
        return {"success": False, "error": f"No students found with the name '{name}'."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching students: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_students_for_report_card: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_active_academic_year")
async def get_active_academic_year() -> dict[str, Any]:
    """
    Get the currently active academic year for the user's school.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /academic-years/active")
            response = await client.get("/academic-years/active")
            return {"success": True, "academic_year": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting active academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_active_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

report_card_agent_tools = [
    search_students_for_report_card,
    get_active_academic_year,
    get_student_report_card,
    get_class_report_cards,
    download_student_report_card_pdf,
]

__all__ = ["report_card_agent_tools"]
