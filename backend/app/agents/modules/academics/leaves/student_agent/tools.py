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
    AdmitNewStudentSchema,
    AssignParentSchema,
    DeleteStudentSchema,
    GetParentContactsSchema,
    GetStudentDetailsSchema,
    GetStudentSummarySchema,
    PromoteStudentsSchema,
    RemoveParentContactSchema,
    SearchStudentsSchema,
    UpdateParentContactSchema,
    UpdateStudentSchema,
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

# --- Student Profile Tools (from students.py) ---


@tool("list_all_students")
async def list_all_students() -> dict[str, Any]:
    """
    Retrieves all students for the current user's school.
    (Any authenticated user can use).
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /students/")
            response = await client.get("/students/")
            return {"success": True, "count": len(response), "students": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing all students: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_all_students: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("search_students", args_schema=SearchStudentsSchema)
async def search_students(name: str) -> dict[str, Any]:
    """
    Search for students by name.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /students/search with params={{'name': {name}}}")
            response = await client.get("/students/search", params={"name": name})
            return {"success": True, "count": len(response), "students": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"No students found for name='{name}': {e.message}")
        return {"success": False, "error": f"No students found with the name '{name}'."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error searching students: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in search_students: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_student_details", args_schema=GetStudentDetailsSchema)
async def get_student_details(student_id: int) -> dict[str, Any]:
    """
    Get detailed information for a single student by their ID.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /students/{student_id}")
            response = await client.get(f"/students/{student_id}")
            return {"success": True, "student": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"Student not found for id={student_id}: {e.message}")
        return {"success": False, "error": f"No student found with ID {student_id}."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student details: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_details: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("admit_new_student", args_schema=AdmitNewStudentSchema)
async def admit_new_student(
    email: str,
    school_id: int,
    first_name: str,
    last_name: str,
    password: Optional[str] = None,
    phone_number: Optional[str] = None,
    gender: Optional[str] = None,
    date_of_birth: Optional[str] = None,  # Passed as string from LLM
    current_class_id: Optional[int] = None,
) -> dict[str, Any]:
    """
    (Admin Only) Enroll a new student. This creates their user account and profile.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "email": email,
                "school_id": school_id,
                "first_name": first_name,
                "last_name": last_name,
                "password": password,
                "phone_number": phone_number,
                "gender": gender,
                "date_of_birth": str(date_of_birth) if date_of_birth else None,
                "current_class_id": current_class_id,
            }
            # Filter out None values
            payload = {k: v for k, v in payload.items() if v is not None}

            logger.info(f"Calling API: POST /students/ with payload: {payload['email']}")
            response = await client.post("/students/", json=payload)
            return {"success": True, "new_student": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error admitting new student: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in admit_new_student: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_student", args_schema=UpdateStudentSchema)
async def update_student(student_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Update an existing student's details.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Filter out None values from the dynamic kwargs
            payload = {k: str(v) if isinstance(v, date) else v for k, v in updates.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /students/{student_id} with payload: {payload}")
            response = await client.put(f"/students/{student_id}", json=payload)
            return {"success": True, "updated_student": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating student: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_student: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_student", args_schema=DeleteStudentSchema)
async def delete_student(student_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-delete a student.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /students/{student_id}")
            # DELETE returns 204 No Content, so response is None
            await client.delete(f"/students/{student_id}")
            return {"success": True, "message": f"Student {student_id} deleted successfully."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting student: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_student: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("promote_students", args_schema=PromoteStudentsSchema)
async def promote_students(student_ids: list[int], new_class_id: int) -> dict[str, Any]:
    """
    (Admin Only) Promote a list of students to a new class.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "student_ids": student_ids,
                "new_class_id": new_class_id,
            }
            logger.info(f"Calling API: POST /students/promote with {len(student_ids)} students")
            response = await client.post("/students/promote", json=payload)
            return {"success": True, "promotion_summary": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error promoting students: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in promote_students: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_student_academic_summary", args_schema=GetStudentSummarySchema)
async def get_student_academic_summary(student_id: int, academic_year_id: Optional[int] = None) -> dict[str, Any]:
    """
    (Admin Only) Get a consolidated academic summary (attendance/marks) for a student.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if academic_year_id:
                params["academic_year_id"] = academic_year_id

            logger.info(f"Calling API: GET /students/{student_id}/academic-summary")
            response = await client.get(f"/students/{student_id}/academic-summary", params=params)
            return {"success": True, "summary": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student summary: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_academic_summary: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Student Contact Tools (from student_contacts.py) ---


@tool("assign_parent_to_student", args_schema=AssignParentSchema)
async def assign_parent_to_student(
    student_id: int,
    profile_user_id: str,
    name: str,
    phone: str,
    relationship_type: str,
    email: Optional[str] = None,
    is_emergency_contact: Optional[bool] = False,
) -> dict[str, Any]:
    """
    (Admin Only) Assign a parent/contact profile to a student.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "student_id": student_id,
                "profile_user_id": profile_user_id,
                "name": name,
                "phone": phone,
                "relationship_type": relationship_type,
                "email": email,
                "is_emergency_contact": is_emergency_contact,
            }
            payload = {k: v for k, v in payload.items() if v is not None}

            logger.info("Calling API: POST /student-contacts/ with payload")
            response = await client.post("/student-contacts/", json=payload)
            return {"success": True, "new_contact_link": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error assigning parent: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in assign_parent_to_student: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_parent_contacts_for_student", args_schema=GetParentContactsSchema)
async def get_parent_contacts_for_student(student_id: int) -> dict[str, Any]:
    """
    (Admin/Teacher Only) Get all parent/contact links for a specific student.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /student-contacts/student/{student_id}")
            response = await client.get(f"/student-contacts/student/{student_id}")
            return {"success": True, "count": len(response), "contacts": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting parent contacts: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_parent_contacts_for_student: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_parent_contact", args_schema=UpdateParentContactSchema)
async def update_parent_contact(contact_id: int, **updates: Any) -> dict[str, Any]:
    """
    (Admin Only) Update a student's contact's information.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {k: v for k, v in updates.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /student-contacts/{contact_id} with payload")
            response = await client.put(f"/student-contacts/{contact_id}", json=payload)
            return {"success": True, "updated_contact": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating parent contact: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_parent_contact: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("remove_parent_contact", args_schema=RemoveParentContactSchema)
async def remove_parent_contact(contact_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-delete a student contact link.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /student-contacts/{contact_id}")
            # DELETE returns 204 No Content
            await client.delete(f"/student-contacts/{contact_id}")
            return {"success": True, "message": f"Contact link {contact_id} deleted."}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error removing parent contact: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in remove_parent_contact: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

student_agent_tools = [
    list_all_students,
    search_students,
    get_student_details,
    admit_new_student,
    update_student,
    delete_student,
    promote_students,
    get_student_academic_summary,
    assign_parent_to_student,
    get_parent_contacts_for_student,
    update_parent_contact,
    remove_parent_contact,
]

__all__ = ["student_agent_tools"]
