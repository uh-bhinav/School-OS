# File: app/agents/modules/academics/leaves/leaderboard_agent/tools.py

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

from .schemas import Category, GetClassLeaderboardSchema, GetClubLeaderboardSchema, GetSchoolLeaderboardSchema, RunLeaderboardComputationSchema

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


@tool("get_school_leaderboard", args_schema=GetSchoolLeaderboardSchema)
async def get_school_leaderboard(category: Category = "overall", top_n: int = 10) -> dict[str, Any]:
    """
    Fetches the school-wide leaderboard for a specific category (e.g., 'academic', 'overall').
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"category": category, "top_n": top_n}
            logger.info(f"Calling API: GET /leaderboard/school with params={params}")
            response = await client.get("/leaderboard/school", params=params)
            return {"success": True, "category": category, "leaderboard": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting school leaderboard: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_school_leaderboard: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_class_leaderboard", args_schema=GetClassLeaderboardSchema)
async def get_class_leaderboard(class_name: str, category: Category = "academic", top_n: int = 10) -> dict[str, Any]:
    """
    Fetches the leaderboard for a single class, usually for 'academic' or 'overall' categories.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"category": category, "top_n": top_n}
            logger.info(f"Calling API: GET /leaderboard/class/{class_name} with params={params}")
            response = await client.get(f"/leaderboard/class/{class_name}", params=params)
            return {"success": True, "class_name": class_name, "category": category, "leaderboard": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting class leaderboard: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_class_leaderboard: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_club_leaderboard", args_schema=GetClubLeaderboardSchema)
async def get_club_leaderboard(club_name: str, top_n: int = 5) -> dict[str, Any]:
    """
    Fetches the points-based leaderboard for members of a specific club.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"top_n": top_n}
            logger.info(f"Calling API: GET /leaderboard/club/{club_name} with params={params}")
            response = await client.get(f"/leaderboard/club/{club_name}", params=params)
            return {"success": True, "club_name": club_name, "leaderboard": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting club leaderboard: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_club_leaderboard: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("run_leaderboard_computation", args_schema=RunLeaderboardComputationSchema)
async def run_leaderboard_computation() -> dict[str, Any]:
    """
    (Admin Only) Triggers a complex backend service to aggregate all marks and
    achievement points and recalculate all leaderboards.
    This is an intensive operation.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: POST /leaderboard/compute")
            response = await client.post("/leaderboard/compute")
            return {"success": True, "computation_job": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error running leaderboard computation: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in run_leaderboard_computation: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

leaderboard_agent_tools = [
    get_school_leaderboard,
    get_class_leaderboard,
    get_club_leaderboard,
    run_leaderboard_computation,
]

__all__ = ["leaderboard_agent_tools"]
