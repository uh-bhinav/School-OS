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
    CreateYearSchema,
    DeleteYearSchema,
    ListYearsSchema,
    SetActiveYearSchema,
    UpdateYearSchema,
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


@tool("get_active_academic_year")
async def get_active_academic_year() -> dict[str, Any]:
    """
    Fetches the single currently active academic year for the user's school.
    This tool takes no arguments.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /academic-years/active")
            response = await client.get("/academic-years/active")
            return {"success": True, "academic_year": response}
    except AgentResourceNotFoundError as e:
        logger.warn(f"No active academic year found: {e.message}")
        return {"success": False, "error": "No active academic year is set for this school."}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting active academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_active_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("list_academic_years", args_schema=ListYearsSchema)
async def list_academic_years(include_inactive: bool = False) -> dict[str, Any]:
    """
    Lists all academic years for the user's school.
    Admins can set 'include_inactive' to True to see all years.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: GET /academic-years/ with params={{'include_inactive': {include_inactive}}}")
            params = {"include_inactive": include_inactive}
            response = await client.get("/academic-years/", params=params)
            return {"success": True, "count": len(response), "academic_years": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing academic years: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_academic_years: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_academic_year", args_schema=CreateYearSchema)
async def create_academic_year(school_id: int, name: str, start_date: str, end_date: str) -> dict[str, Any]:
    """
    (Admin Only) Creates a new academic year.
    The user must be an Admin to perform this action.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "school_id": school_id,
                "name": name,
                "start_date": str(start_date),
                "end_date": str(end_date),
            }
            logger.info(f"Calling API: POST /academic-years/ with payload: {payload}")
            response = await client.post("/academic-years/", json=payload)
            return {"success": True, "created_year": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_academic_year", args_schema=UpdateYearSchema)
async def update_academic_year(year_id: int, name: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None, is_active: Optional[bool] = None) -> dict[str, Any]:
    """
    (Admin Only) Updates the details of a specific academic year.
    Only provided fields will be updated.
    """
    try:
        async with AgentHTTPClient() as client:
            # Build the payload only with fields that are not None
            payload = {k: v for k, v in {"name": name, "start_date": str(start_date) if start_date else None, "end_date": str(end_date) if end_date else None, "is_active": is_active}.items() if v is not None}
            if not payload:
                return {"success": False, "error": "No update information provided."}

            logger.info(f"Calling API: PUT /academic-years/{year_id} with payload: {payload}")
            response = await client.put(f"/academic-years/{year_id}", json=payload)
            return {"success": True, "updated_year": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("set_active_academic_year", args_schema=SetActiveYearSchema)
async def set_active_academic_year(year_id: int) -> dict[str, Any]:
    """
    (Admin Only) Sets a specific academic year as the active one.
    This will deactivate all other years for the school.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: POST /academic-years/{year_id}/set-active")
            response = await client.post(f"/academic-years/{year_id}/set-active")
            return {"success": True, "activated_year": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error setting active academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in set_active_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("delete_academic_year", args_schema=DeleteYearSchema)
async def delete_academic_year(year_id: int) -> dict[str, Any]:
    """
    (Admin Only) Soft-deletes an academic year.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: DELETE /academic-years/{year_id}")
            response = await client.delete(f"/academic-years/{year_id}")
            return {"success": True, "deleted_year": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error deleting academic year: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in delete_academic_year: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

academic_year_agent_tools = [
    get_active_academic_year,
    list_academic_years,
    create_academic_year,
    update_academic_year,
    set_active_academic_year,
    delete_academic_year,
]

__all__ = ["academic_year_agent_tools"]
