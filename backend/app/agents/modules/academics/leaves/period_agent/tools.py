# File: app/agents/modules/academics/leaves/period_agent/tools.py

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

from .schemas import CreatePeriodStructureSchema, ListPeriodsSchema, PeriodDefinition, UpdatePeriodTimingSchema

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


@tool("list_periods", args_schema=ListPeriodsSchema)
async def list_periods(school_id: Optional[int] = None) -> dict[str, Any]:
    """
    Fetches the defined period structure (e.g., Period 1, Period 2, Lunch)
    for the user's school.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {}
            if school_id:
                params["school_id"] = school_id

            logger.info(f"Calling API: GET /periods/ with params={params}")
            response = await client.get("/periods/", params=params)
            return {"success": True, "count": len(response), "periods": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error listing periods: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in list_periods: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("create_period_structure", args_schema=CreatePeriodStructureSchema)
async def create_period_structure(periods: list[PeriodDefinition]) -> dict[str, Any]:
    """
    (Admin Only) Creates or entirely replaces the period structure for the school.
    Takes a list of period definitions.
    """
    try:
        async with AgentHTTPClient() as client:
            # Convert Pydantic models to dicts for the JSON payload
            payload = {"periods": [p.dict() for p in periods]}
            logger.info(f"Calling API: POST /periods/bulk with {len(periods)} periods")
            response = await client.post("/periods/bulk", json=payload)
            return {"success": True, "created_structure": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error creating period structure: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in create_period_structure: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("update_period_timing", args_schema=UpdatePeriodTimingSchema)
async def update_period_timing(period_number: int, start_time: str, end_time: str, name: Optional[str] = None) -> dict[str, Any]:
    """
    (Admin Only) Updates the timing or name of a single existing period,
    identified by its period number.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {
                "start_time": start_time,
                "end_time": end_time,
            }
            if name:
                payload["name"] = name

            logger.info(f"Calling API: PUT /periods/{period_number} with payload: {payload}")
            response = await client.put(f"/periods/{period_number}", json=payload)
            return {"success": True, "updated_period": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error updating period: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in update_period_timing: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

period_agent_tools = [
    list_periods,
    create_period_structure,
    update_period_timing,
]

__all__ = ["period_agent_tools"]
