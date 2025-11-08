# File: app/agents/modules/academics/leaves/achievement_agent/tools.py

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

from .schemas import AddStudentAchievementSchema, GetPointsForAchievementSchema, GetStudentAchievementsSchema, GetUnverifiedAchievementsSchema, VerifyAchievementSchema

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


@tool("get_student_achievements", args_schema=GetStudentAchievementsSchema)
async def get_student_achievements(student_name: str, verified_only: bool = True) -> dict[str, Any]:
    """
    Fetches a list of achievements for a specific student.
    By default, it only returns verified achievements.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"verified_only": verified_only}
            logger.info(f"Calling API: GET /achievements/student/{student_name} with params={params}")
            response = await client.get(f"/achievements/student/{student_name}", params=params)
            return {"success": True, "count": len(response), "achievements": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting student achievements: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_student_achievements: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("add_student_achievement", args_schema=AddStudentAchievementSchema)
async def add_student_achievement(student_name: str, title: str, achievement_type: str, level: Optional[str] = None, issued_by: Optional[str] = None) -> dict[str, Any]:
    """
    (Teacher Tool) Adds a new, unverified achievement for a student.
    This starts the verification workflow.
    """
    try:
        async with AgentHTTPClient() as client:
            payload = {"student_name": student_name, "title": title, "type": achievement_type, "level": level, "issued_by": issued_by}
            # Filter out None values
            payload = {k: v for k, v in payload.items() if v is not None}
            logger.info(f"Calling API: POST /achievements/add with payload: {payload}")
            response = await client.post("/achievements/add", json=payload)
            return {"success": True, "created_achievement": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error adding student achievement: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in add_student_achievement: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("verify_achievement", args_schema=VerifyAchievementSchema)
async def verify_achievement(achievement_id: int) -> dict[str, Any]:
    """
    (Admin Only) Verifies a pending achievement.
    This action is irreversible and may trigger point allocation.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info(f"Calling API: POST /achievements/verify/{achievement_id}")
            response = await client.post(f"/achievements/verify/{achievement_id}")
            return {"success": True, "verified_achievement": response}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error verifying achievement: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in verify_achievement: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_unverified_achievements_list", args_schema=GetUnverifiedAchievementsSchema)
async def get_unverified_achievements_list() -> dict[str, Any]:
    """
    (Admin Tool) Fetches a list of all achievements that are pending verification.
    This is the Admin's "to-do" list.
    """
    try:
        async with AgentHTTPClient() as client:
            logger.info("Calling API: GET /achievements/unverified")
            response = await client.get("/achievements/unverified")
            return {"success": True, "count": len(response), "unverified_achievements": response}
    except (AgentAuthenticationError, AgentValidationError, AgentHTTPClientError) as e:
        logger.error(f"Error getting unverified achievements: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_unverified_achievements_list: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


@tool("get_points_for_achievement", args_schema=GetPointsForAchievementSchema)
async def get_points_for_achievement(achievement_type: str, level: str) -> dict[str, Any]:
    """
    Looks up the points value for a specific type and level of achievement
    from the school's configuration.
    """
    try:
        async with AgentHTTPClient() as client:
            params = {"type": achievement_type, "level": level}
            logger.info(f"Calling API: GET /achievements/points-lookup with params={params}")
            response = await client.get("/achievements/points-lookup", params=params)
            return {"success": True, "points": response.get("points")}
    except (AgentAuthenticationError, AgentValidationError, AgentResourceNotFoundError, AgentHTTPClientError) as e:
        logger.error(f"Error getting achievement points: {e.message}", exc_info=True)
        return _format_error_response(e)
    except Exception as e:
        logger.exception(f"Unexpected error in get_points_for_achievement: {e}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}


# --- Export the list of tools ---

achievement_agent_tools = [
    get_student_achievements,
    add_student_achievement,
    verify_achievement,
    get_unverified_achievements_list,
    get_points_for_achievement,
]

__all__ = ["achievement_agent_tools"]
