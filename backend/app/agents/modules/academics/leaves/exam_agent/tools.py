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


@tool("list_all_exams")
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


@tool("search_exams")
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


@tool("get_exam_details")
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


@tool("create_exam")
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


@tool("update_exam")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error updating exam: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_exam: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_exam")
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
    except (
        AgentAuthenticationError,
        AgentValidationError,
        AgentResourceNotFoundError,
        AgentHTTPClientError,
    ) as e:
        logger.error(f"Error deleting exam: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_exam: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_exam_type")
async def search_exam_type(exam_type_name: str) -> dict[str, Any]:
    """
    Search for an exam type by name (e.g., 'Final Term', 'Mid-Term').
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"🔍 Searching for exam type: {exam_type_name}")

            # Get all exam types
            response = await client.get("/exam-types/")

            # ✅ Handle both cases: dict with "exam_types" key OR direct list
            if isinstance(response, dict):
                exam_types = response.get("exam_types", [])
            elif isinstance(response, list):
                exam_types = response  # ✅ API returns list directly
            else:
                exam_types = []

            if not exam_types:
                logger.warning("❌ No exam types available")
                return {
                    "success": False,
                    "error": "No exam types available in the system",
                }

            # Search by partial match (case-insensitive)
            for exam_type in exam_types:
                if exam_type_name.lower() in exam_type["type_name"].lower():
                    logger.info(f"✅ Found exam type: {exam_type['type_name']} (ID: {exam_type['exam_type_id']})")
                    return {
                        "success": True,
                        "exam_type_id": exam_type["exam_type_id"],
                        "exam_type_name": exam_type["type_name"],
                        "school_id": exam_type["school_id"],
                    }

            logger.warning(f"❌ Exam type not found: {exam_type_name}")
            available = ", ".join([et["type_name"] for et in exam_types[:5]])
            return {
                "success": False,
                "error": f"No exam type matching '{exam_type_name}'. Available: {available}",
            }
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"❌ API Error searching exam type: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.error(f"❌ Unexpected error searching exam type: {e}", exc_info=True)
        return {"success": False, "error": f"Error searching exam types: {str(e)}"}


# ...existing imports...


# Helper function (NOT decorated)
# Helper function (NOT decorated)
async def _search_exam_and_class(exam_name: str, class_name: str) -> dict[str, Any]:
    """
    Internal helper to search for exam and class by name.
    Returns their IDs for use in delete operations.
    """
    try:
        async with AgentHTTPClient() as client:
            # Step 1: Search for exam by name
            logger.info(f"Searching for exam: {exam_name}")
            exam_response = await client.get("/exams/search", params={"name": exam_name})

            # Handle list response
            exams = exam_response if isinstance(exam_response, list) else []

            if not exams:
                logger.warning(f"No exam found with name: {exam_name}")
                return {"success": False, "error": f"Exam '{exam_name}' not found"}

            # Get first matching exam
            exam = exams[0]
            exam_id = exam.get("id")
            school_id = exam.get("school_id")  # ✅ Get school_id from exam

            # Step 2: Search for class by name
            logger.info(f"Searching for class: {class_name}")
            class_response = await client.get("/classes/search", params={"name": class_name})

            # Handle list response
            classes = class_response if isinstance(class_response, list) else []

            if not classes:
                logger.warning(f"No class found with name: {class_name}")
                return {"success": False, "error": f"Class '{class_name}' not found"}

            # Get first matching class
            class_obj = classes[0]
            class_id = class_obj.get("class_id")

            logger.info(f"Found exam_id={exam_id}, class_id={class_id}, school_id={school_id}")

            return {
                "success": True,
                "exam_id": exam_id,
                "exam_name": exam.get("exam_name"),
                "class_id": class_id,
                "class_name": class_name,
                "school_id": school_id,
            }

    except AgentResourceNotFoundError as e:
        logger.warn(f"Resource not found: {e.message}")
        return {"success": False, "error": f"Could not find exam or class: {e.message}"}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching exam and class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search: {e}")
        return {"success": False, "error": str(e)}


# Tool wrapper (decorated for agent use)
@tool("search_exam_by_name_and_class")
async def search_exam_by_name_and_class(exam_name: str, class_name: str) -> dict[str, Any]:
    """
    Search for exam and class by name to get their IDs.
    Used internally by delete_exam_from_class.
    """
    return await _search_exam_and_class(exam_name, class_name)


@tool("delete_exam_from_class")
async def delete_exam_from_class(exam_name: str, class_name: str) -> dict[str, Any]:
    """
    (Admin Only) Delete (remove) an exam from a specific class.

    Example: delete_exam_from_class("First Unit Test 2025", "Class 1B")
    """
    try:
        async with AgentHTTPClient() as client:
            # Step 1: Find exam and class IDs using helper function
            logger.info(f"Attempting to remove exam '{exam_name}' from class '{class_name}'")
            search_response = await _search_exam_and_class(exam_name, class_name)

            if not search_response.get("success"):
                logger.warn(f"Search failed: {search_response.get('error')}")
                return search_response

            exam_id = search_response["exam_id"]
            class_id = search_response["class_id"]

            # Step 2: Delete the exam-class mapping
            # ✅ FIXED: Use correct endpoint path
            logger.info(f"Deleting mapping: exam_id={exam_id}, class_id={class_id}")

            await client.delete(
                "/exam-class-mappings/remove",
                params={"exam_id": exam_id, "class_id": class_id},
            )  # ✅ Changed from /exams/classes/remove

            logger.info(f"Successfully deleted exam {exam_id} from class {class_id}")

            return {
                "success": True,
                "message": f"Exam '{exam_name}' has been successfully removed from class '{class_name}'",
                "exam_id": exam_id,
                "class_id": class_id,
            }

    except AgentResourceNotFoundError as e:
        logger.warn(f"Exam-class mapping not found: {e.message}")
        return {
            "success": False,
            "error": "Exam-class mapping not found. The exam may not be assigned to this class.",
        }
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting exam from class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_exam_from_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

exam_agent_tools = [
    search_exam_type,
    list_all_exams,
    search_exams,
    get_exam_details,
    create_exam,
    update_exam,
    delete_exam,
    search_exam_by_name_and_class,
    delete_exam_from_class,
]

__all__ = ["exam_agent_tools"]
