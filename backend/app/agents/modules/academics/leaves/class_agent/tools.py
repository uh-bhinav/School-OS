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

from .schemas import (
    AssignSubjectsSchema,
    CreateClassSchema,
    DeleteClassSchema,
    GetClassDetailsSchema,
    GetClassStudentsSchema,
    ListAllClassesSchema,
    SearchClassesSchema,
    UpdateClassSchema,
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


@tool("list_all_classes", args_schema=ListAllClassesSchema)
async def list_all_classes() -> dict[str, Any]:
    """
    Retrieves all active classes for the user's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /classes/")
            # This calls the refactored GET /classes/ endpoint
            response = await client.get("/classes/")
            return {"success": True, "count": len(response), "classes": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all classes: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_classes: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_classes", args_schema=SearchClassesSchema)
async def search_classes(
    name: Optional[str] = None,
    grade_level: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Flexibly search for classes by name, grade, year, or teacher.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {
                "name": name,
                "grade_level": grade_level,
                "academic_year_id": academic_year_id,
                "teacher_id": teacher_id,
            }
            # Filter out None values
            params = {k: v for k, v in params.items() if v is not None}

            logger.info(f"Calling API: GET /classes/search with params: {params}")
            # This calls the refactored GET /classes/search endpoint
            response = await client.get("/classes/search", params=params)
            return {"success": True, "count": len(response), "classes": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching classes: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_classes: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_details", args_schema=GetClassDetailsSchema)
async def get_class_details(class_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Get detailed information for a single class by its ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /classes/{class_id}")
            response = await client.get(f"/classes/{class_id}")
            return {"success": True, "class_details": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Class not found for id={class_id}: {e.message}")
        return {"success": False, "error": f"No class found with ID {class_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_students_in_class", args_schema=GetClassStudentsSchema)
async def get_students_in_class(class_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Lists all students enrolled in a specific class.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /classes/{class_id}/students")
            response = await client.get(f"/classes/{class_id}/students")
            return {"success": True, "class_id": class_id, "student_count": len(response), "students": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting students in class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_students_in_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_class", args_schema=CreateClassSchema)
async def create_class(
    school_id: int,
    grade_level: int,
    section: str,
    academic_year_id: int,
    class_teacher_id: Optional[int] = None,
) -> dict[str, Any]:
    """
    (Admin Only) Creates a new class.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "grade_level": grade_level,
                "section": section,
                "academic_year_id": academic_year_id,
                "class_teacher_id": class_teacher_id,
            }
            payload = {k: v for k, v in payload.items() if v is not None}

            logger.info("Calling API: POST /classes/ with payload")
            response = await client.post("/classes/", json=payload)
            return {"success": True, "created_class": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_class", args_schema=UpdateClassSchema)
async def update_class(class_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Updates an existing class's details.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Filter out None values from the dynamic kwargs
            payload = {k: v for k, v in updates.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /classes/{class_id} with payload: {payload}")
            response = await client.put(f"/classes/{class_id}", json=payload)
            return {"success": True, "updated_class": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_class", args_schema=DeleteClassSchema)
async def delete_class(class_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-deletes a class.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /classes/{class_id}")
            # DELETE returns 204 No Content
            await client.delete(f"/classes/{class_id}")
            return {"success": True, "message": f"Class {class_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("assign_subjects_to_class", args_schema=AssignSubjectsSchema)
async def assign_subjects_to_class(class_id: int, subject_ids: List[int]) -> dict[str, Any]:
    """
    (Admin Only) Assigns a list of subjects to a class.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"subject_ids": subject_ids}
            logger.info(f"Calling API: POST /classes/{class_id}/subjects with {len(subject_ids)} subjects")
            response = await client.post(f"/classes/{class_id}/subjects", json=payload)
            return {"success": True, "updated_class": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error assigning subjects to class: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in assign_subjects_to_class: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

class_agent_tools = [
    list_all_classes,
    search_classes,
    get_class_details,
    get_students_in_class,
    create_class,
    update_class,
    delete_class,
    assign_subjects_to_class,
]

__all__ = ["class_agent_tools"]
