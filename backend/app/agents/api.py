import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.modules.academics.leaves.academic_year_agent.main import (
    academic_year_agent_app,
)
from app.agents.modules.academics.leaves.achievement_agent.main import (
    achievement_agent_app,
)

# --- L4 Leaf Agents (for testing) ---
from app.agents.modules.academics.leaves.class_agent.main import (
    class_agent_app,
)
from app.agents.modules.academics.leaves.club_agent.main import (
    club_agent_app,
)
from app.agents.modules.academics.leaves.exam_agent.main import (
    exam_agent_app,
)
from app.agents.modules.academics.leaves.exam_type_agent.main import (
    exam_type_agent_app,
)
from app.agents.modules.academics.leaves.leaderboard_agent.main import (
    leaderboard_agent_app,
)
from app.agents.modules.academics.leaves.mark_agent.main import (
    mark_agent_app,
)
from app.agents.modules.academics.leaves.period_agent.main import (
    period_agent_app,
)
from app.agents.modules.academics.leaves.report_card_agent.main import (
    report_card_agent_app,
)
from app.agents.modules.academics.leaves.student_agent.main import (
    student_agent_app,
)
from app.agents.modules.academics.leaves.subject_agent.main import (
    subject_agent_app,
)
from app.agents.modules.academics.leaves.teacher_agent.main import (
    teacher_agent_app,
)
from app.agents.modules.academics.leaves.timetable_agent.main import (
    timetable_agent_app,
)

# --- L1 Root Orchestrator ---
from app.agents.root_orchestrator import root_orchestrator_app

# --- Core Dependencies ---
from app.agents.tool_context import ToolRuntimeContext, use_tool_context
from app.api.deps import get_db_session
from app.core.security import create_access_token, get_current_user_profile
from app.models.profile import Profile

# Set up logging
logger = logging.getLogger(__name__)

# This is the correct router prefix, as defined in main.py
router = APIRouter(prefix="/agents", tags=["Agents (HTTP-based)"])


# Request/Response models
class AgentChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = "default-session"


class AgentChatResponse(BaseModel):
    response: str
    session_id: Optional[str]


def get_api_base_url() -> str:
    """
    Get the API base URL for the AgentHTTPClient.
    This must point to the root of your v1 API.
    """
    api_base_url = os.getenv("API_BASE_URL")
    if api_base_url:
        return api_base_url.rstrip("/")

    backend_host = os.getenv("BACKEND_HOST", "localhost")
    backend_port = os.getenv("BACKEND_PORT", "8000")
    # This MUST point to your v1 API prefix
    api_v1_str = os.getenv("API_V1_STR", "/api/v1")

    return f"http://{backend_host}:{backend_port}{api_v1_str}".rstrip("/")


async def _get_agent_context(request: Request, profile: Profile, db: AsyncSession) -> ToolRuntimeContext:
    """
    Creates the ToolRuntimeContext for an HTTP-based agent.
    It generates a new, short-lived JWT token from the given profile.
    """
    # Create a new, internal access token from the user's profile
    # This token will be used by the AgentHTTPClient to authenticate.
    internal_token = create_access_token(subject=str(profile.user_id))
    test_client = getattr(request.app.state, "pytest_client", None)

    return ToolRuntimeContext(
        jwt_token=internal_token,
        api_base_url=get_api_base_url(),
        # We also pass the DB and profile for any potential
        # (rare) service-based tools or logging.
        db=db,
        current_profile=profile,
        client=test_client,
    )


# ============================================================================
# PRIMARY L1 AGENT ENDPOINT
# ============================================================================


@router.post(
    "/chat",
    response_model=AgentChatResponse,
    tags=["Agents - L1 Root"],
    summary="Invoke the L1 Root Orchestrator (Main Entry Point)",
)
async def root_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    """
    This is the main entry point for the entire agentic system.
    All frontend queries should be sent to this endpoint.
    This endpoint uses the user's authenticated profile to
    generate an internal token for the agentic flow.
    """
    logger.info(f"--- L1 RootOrchestrator Invoked --- (User: {current_profile.user_id}, Session: {chat_request.session_id})")

    # 1. Create the runtime context
    context = await _get_agent_context(request=request, profile=current_profile, db=db)

    # 2. Use the context for the entire duration of the agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the L1 Root Orchestrator
            result = root_orchestrator_app.invoke(chat_request.query)

        logger.info(f"--- L1 RootOrchestrator Success --- (Session: {chat_request.session_id})")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )

    except Exception as e:
        logger.error(
            f"CRITICAL: Error in L1 RootOrchestrator for session {chat_request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


# ============================================================================
# L4 Agent Endpoints (For Isolated Testing)
# ============================================================================

# All L4 test endpoints will follow the same pattern as root_chat


@router.post(
    "/chat/academic-year",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Academic Year Agent",
)
async def academic_year_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking AcademicYearAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = academic_year_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in AcademicYearAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/student",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Student Profile Agent",
)
async def student_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking StudentAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = student_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in StudentAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/class",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Class Management Agent",
)
async def class_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking ClassAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = class_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in ClassAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/subject",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Subject Management Agent",
)
async def subject_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking SubjectAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = subject_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in SubjectAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/teacher",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Teacher Profile Agent",
)
async def teacher_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking TeacherAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = teacher_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in TeacherAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/exam-type",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Exam Type Agent",
)
async def exam_type_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking ExamTypeAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = exam_type_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in ExamTypeAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/exam",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Exam Scheduling Agent",
)
async def exam_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking ExamAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = exam_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in ExamAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/mark",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Mark Management Agent",
)
async def mark_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking MarkAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = mark_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in MarkAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/report-card",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Report Card Agent",
)
async def report_card_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking ReportCardAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = report_card_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in ReportCardAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/period",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Period Structure Agent",
)
async def period_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking PeriodAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = period_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in PeriodAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/timetable",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Timetable Agent",
)
async def timetable_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking TimetableAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = timetable_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in TimetableAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/club",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Club Agent",
)
async def club_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking ClubAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = club_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in ClubAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/achievement",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Achievement Agent",
)
async def achievement_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking AchievementAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = achievement_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in AchievementAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/leaderboard",
    response_model=AgentChatResponse,
    tags=["Agents - L4 Testing"],
    summary="Invoke the Leaderboard Agent",
)
async def leaderboard_chat(
    chat_request: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    current_profile: Profile = Depends(get_current_user_profile),
):
    logger.info(f"Invoking LeaderboardAgent for session: {chat_request.session_id}")
    context = await _get_agent_context(request=request, profile=current_profile, db=db)
    try:
        with use_tool_context(context):
            result = leaderboard_agent_app.invoke(chat_request.query)
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=chat_request.session_id,
        )
    except Exception as e:
        logger.error(f"Error in LeaderboardAgent: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
