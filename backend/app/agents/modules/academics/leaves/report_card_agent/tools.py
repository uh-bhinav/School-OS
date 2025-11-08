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

from .schemas import (
    DownloadReportCardPDFSchema,
    GetClassReportCardsSchema,
    GetStudentReportCardSchema,
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


@tool("get_student_report_card", args_schema=GetStudentReportCardSchema)
async def get_student_report_card(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Retrieve a fully calculated JSON report card for a single student.
    Authorization (Admin, Teacher, Parent, Student) will be handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-cards/student/{student_id} with params: {params}")
            response = await client.get(f"/report-cards/student/{student_id}", params=params)
            return {"success": True, "report_card": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Report card not found for student_id={student_id}: {e.message}")
        return {"success": False, "error": f"Report card data not found for student {student_id} in that academic year."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student report card: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_report_card: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_report_cards", args_schema=GetClassReportCardsSchema)
async def get_class_report_cards(class_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Retrieve a list of JSON report cards for an entire class.
    Authorization will be handled by the API.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-cards/class/{class_id} with params: {params}")
            response = await client.get(f"/report-cards/class/{class_id}", params=params)
            return {"success": True, "count": len(response), "report_cards": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class report cards: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_report_cards: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("download_student_report_card_pdf", args_schema=DownloadReportCardPDFSchema)
async def download_student_report_card_pdf(student_id: int, academic_year_id: int) -> dict[str, Any]:
    """
    (All Users) Retrieve a downloadable PDF of a student's report card.
    Authorization will be handled by the API.
    This tool returns a JSON success message, as the API handles the download.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"academic_year_id": academic_year_id}
            logger.info(f"Calling API: GET /report-cards/student/{student_id}/pdf with params: {params}")

            # This request will return PDF bytes, not JSON.
            # We will use the base _client to make the request and check status.

            # This is a different pattern, as we don't expect a JSON response.
            # We are just confirming the API call can be made.
            # In a real-world scenario, the agent would return this URL
            # to the frontend, and the frontend would open it.

            context = client._get_auth_headers()  # Get context for URL
            base_url = context.api_base_url.rstrip("/")
            url = f"{base_url}/report-cards/student/{student_id}/pdf?academic_year_id={academic_year_id}"

            # For now, the agent's job is to provide the URL.
            return {"success": True, "message": "To download the PDF, please use this URL. (Note: The frontend client must handle this URL)", "download_url": url}

    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting report card PDF URL: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in download_student_report_card_pdf: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

report_card_agent_tools = [
    get_student_report_card,
    get_class_report_cards,
    download_student_report_card_pdf,
]

__all__ = ["report_card_agent_tools"]
