# backend/app/agents/api_with_jwt.py
"""
Enhanced Agent API Endpoints with JWT Token Injection for HTTP-based Agents.

This module demonstrates how to update agent endpoints to support HTTP-based tools
that use JWT authentication. The key changes:

1. Extract JWT token from the request using FastAPI's security dependency
2. Inject JWT token and API base URL into ToolRuntimeContext
3. Tools use AgentHTTPClient to make authenticated API requests

This approach ensures agents act as external HTTP clients while maintaining
the same security and role-based access control as the rest of the API.

MIGRATION GUIDE:
===============
To migrate an agent endpoint from service-based to HTTP-based:

1. Add `token: str = Depends(oauth2_scheme)` to extract JWT from request
2. Add `jwt_token=token` and `api_base_url=get_api_base_url()` to ToolRuntimeContext
3. Update the agent's tools to use AgentHTTPClient instead of direct service calls
4. Remove database session and current_profile if using HTTP-only tools

Example:
--------
# OLD (Service-based):
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_active_user),
):
    context = ToolRuntimeContext(db=db, current_profile=current_profile)
    with use_tool_context(context):
        result = agent_app.invoke(request.query)
    return AgentChatResponse(response=result["response"])

# NEW (HTTP-based):
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # ← Extract JWT from request
):
    context = ToolRuntimeContext(
        jwt_token=token,  # ← Pass JWT to tools
        api_base_url=get_api_base_url(),  # ← Pass API base URL
    )
    with use_tool_context(context):
        result = agent_app.invoke(request.query)
    return AgentChatResponse(response=result["response"])
"""

import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from app.agents.modules.academics.leaves.academic_year_agent.main import (
    academic_year_agent_app,
)
from app.agents.modules.academics.leaves.attendance_agent.main import (
    attendance_agent_app,
)
from app.agents.modules.academics.leaves.class_agent.main import (
    class_agent_app,
)
from app.agents.modules.academics.leaves.exam_agent.main import (
    exam_agent_app,
)
from app.agents.modules.academics.leaves.exam_type_agent.main import (
    exam_type_agent_app,
)
from app.agents.modules.academics.leaves.mark_agent.main import (
    mark_agent_app,
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
from app.agents.root_orchestrator import root_orchestrator_app
from app.agents.tool_context import ToolRuntimeContext, use_tool_context

# Set up OAuth2 scheme for extracting Bearer tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/agents", tags=["Agents (HTTP-based)"])


# Request/Response models
class AgentChatRequest(BaseModel):
    query: str
    session_id: str = "default-session"


class AgentChatResponse(BaseModel):
    response: str
    session_id: str


def get_api_base_url() -> str:
    """
    Get the API base URL for HTTP client requests.

    Priority:
    1. Environment variable API_BASE_URL
    2. Constructed from BACKEND_HOST and BACKEND_PORT
    3. Default to http://localhost:8000/api/v1

    In production, set API_BASE_URL in your .env file:
        API_BASE_URL=https://api.yourdomain.com/api/v1

    For local development:
        API_BASE_URL=http://localhost:8000/api/v1
    """
    api_base_url = os.getenv("API_BASE_URL")

    if api_base_url:
        return api_base_url.rstrip("/")

    # Fallback: construct from host and port
    backend_host = os.getenv("BACKEND_HOST", "localhost")
    backend_port = os.getenv("BACKEND_PORT", "8000")
    api_version = os.getenv("API_V1_STR", "/api/v1")

    return f"http://{backend_host}:{backend_port}{api_version}".rstrip("/")


# ============================================================================
# HTTP-based Agent Endpoints
# ============================================================================


@router.post(
    "/chat",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the L1 Root Orchestrator (Main Entry Point)",
)
async def root_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    This is the main entry point for the entire agentic system.
    All frontend queries should be sent to this endpoint.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The L1 RootOrchestrator will receive the query.
    4. The L1 agent will route to the correct L2 Module (e.g., Academics).
    5. The L2 agent will route to the correct L3 Router.
    6. The L3 router will route to the correct L4 Leaf Agent.
    7. The L4 agent will make the authenticated HTTP call to the secure API.
    """
    logger.info(f"--- L1 RootOrchestrator Invoked --- (Session: {request.session_id})")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
    )

    # 2. Use the context for the entire duration of the agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the L1 Root Orchestrator
            result = root_orchestrator_app.invoke(request.query)

        logger.info(f"--- L1 RootOrchestrator Success --- (Session: {request.session_id})")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"CRITICAL: Error in L1 RootOrchestrator for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post("/chat/attendance", response_model=AgentChatResponse)
async def attendance_agent_chat_http(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # ← Extract JWT token from Authorization header
):
    """
    HTTP-based Attendance Agent endpoint.

    This endpoint demonstrates the new architecture where agents:
    1. Receive JWT token from the frontend
    2. Make HTTP requests to backend API endpoints
    3. Backend API validates JWT and enforces role-based access control

    Flow:
    -----
    Frontend → POST /agents/chat/attendance (with Bearer token)
    → Extract JWT token
    → Inject into ToolRuntimeContext
    → Agent tools use AgentHTTPClient
    → HTTP requests to /api/v1/attendance/* (with Bearer token)
    → Backend API validates token and checks permissions
    → Response returned to agent → Response to frontend

    Security:
    ---------
    - JWT token is passed from frontend (not from .env)
    - No database session or profile needed in agent layer
    - All authentication/authorization handled by backend API
    - Agents act as external HTTP clients

    Example Request:
    ----------------
    POST /agents/chat/attendance
    Headers:
        Authorization: Bearer <jwt_token_from_frontend>
    Body:
        {
            "query": "Mark student 123 as present today",
            "session_id": "user-session-123"
        }

    Example queries:
    - "Mark student 123 as present today"
    - "Show me attendance for class 10A on November 2nd"
    - "What is the attendance percentage for student John Doe?"
    - "Get attendance records for student 456 from September 1 to September 30"
    """
    try:
        logger.info(f"HTTP-based Attendance agent query: {request.query[:100]}...")
        logger.debug(f"JWT token received: {token[:20]}..." if token else "No token")

        # Get API base URL for HTTP requests
        api_base_url = get_api_base_url()
        logger.info(f"Using API base URL: {api_base_url}")

        # Create tool context with JWT token and API base URL
        # Note: No database session or current_profile needed for HTTP-based tools
        context = ToolRuntimeContext(
            jwt_token=token,  # JWT token from frontend for API authentication
            api_base_url=api_base_url,  # API base URL for HTTP requests
        )

        # Invoke agent with tool context
        with use_tool_context(context):
            result = attendance_agent_app.invoke(query=request.query, conversation_history=[])

            response_content = result.get("response", "No response generated")

            logger.info("Agent response generated successfully")

            return AgentChatResponse(
                response=response_content,
                session_id=request.session_id,
            )

    except Exception as e:
        logger.error(f"HTTP-based Attendance agent chat failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Attendance agent processing failed: {str(e)}",
        )


# ============================================================================
# Mixed Mode Endpoint (Supports both Service-based and HTTP-based) Only for attendance Agent
# ============================================================================


@router.post("/chat/attendance/mixed", response_model=AgentChatResponse)
async def attendance_agent_chat_mixed(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),
    use_http_mode: bool = True,  # ← Flag to toggle between modes
):
    """
    Mixed-mode endpoint that supports both service-based and HTTP-based tools.

    This is useful during migration when you want to:
    1. Test both approaches side-by-side
    2. Gradually migrate tools from service-based to HTTP-based
    3. Maintain backward compatibility during transition

    Parameters:
    -----------
    use_http_mode: If True, use HTTP-based tools. If False, use service-based tools.

    In production, you'll eventually remove the service-based path and only
    keep the HTTP-based implementation.
    """
    try:
        if use_http_mode:
            # HTTP-based mode
            api_base_url = get_api_base_url()
            context = ToolRuntimeContext(
                jwt_token=token,
                api_base_url=api_base_url,
            )
            logger.info("Using HTTP-based agent tools")
        else:
            # Service-based mode (legacy)
            # Note: This requires additional dependencies (db, current_profile)
            # which are not shown here for brevity
            raise HTTPException(
                status_code=400,
                detail="Service-based mode requires database session and current profile dependencies",
            )

        with use_tool_context(context):
            result = attendance_agent_app.invoke(query=request.query, conversation_history=[])

            return AgentChatResponse(
                response=result.get("response", "No response generated"),
                session_id=request.session_id,
            )

    except Exception as e:
        logger.error(f"Mixed-mode agent chat failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/chat/academic-year",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Academic Year Agent",
)
async def academic_year_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized Academic Year Agent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The AcademicYearAgent's tools will use this context to make
       authenticated HTTP calls to the backend API.
    4. The backend API (e.g., /api/v1/academic-years/) will enforce all
       role permissions (e.g., Admin-only for create/update/delete).
    """
    logger.info(f"Invoking AcademicYearAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = academic_year_agent_app.invoke(request.query)

        logger.info(f"AcademicYearAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in AcademicYearAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/student",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Student Profile Agent",
)
async def student_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized StudentAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The StudentAgent's tools (12 of them) will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/students/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for 'admit_new_student').
    """
    logger.info(f"Invoking StudentAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = student_agent_app.invoke(request.query)

        logger.info(f"StudentAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in StudentAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/class",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Class Management Agent",
)
async def class_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized ClassAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The ClassAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/classes/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for 'create_class').
    """
    logger.info(f"Invoking ClassAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = class_agent_app.invoke(request.query)

        logger.info(f"ClassAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in ClassAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/subject",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Subject Management Agent",
)
async def subject_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized SubjectAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The SubjectAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/subjects/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for 'create_subject').
    """
    logger.info(f"Invoking SubjectAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = subject_agent_app.invoke(request.query)

        logger.info(f"SubjectAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in SubjectAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/teacher",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Teacher Profile Agent",
)
async def teacher_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized TeacherAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The TeacherAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/teachers/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for all tools).
    """
    logger.info(f"Invoking TeacherAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = teacher_agent_app.invoke(request.query)

        logger.info(f"TeacherAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in TeacherAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/exam-type",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Exam Type Agent",
)
async def exam_type_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized ExamTypeAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The ExamTypeAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/exam-types/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for all tools).
    """
    logger.info(f"Invoking ExamTypeAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = exam_type_agent_app.invoke(request.query)

        logger.info(f"ExamTypeAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in ExamTypeAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/exam",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Exam Scheduling Agent",
)
async def exam_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized ExamAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The ExamAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/exams/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for 'create_exam').
    """
    logger.info(f"Invoking ExamAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = exam_agent_app.invoke(request.query)

        logger.info(f"ExamAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in ExamAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/mark",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Mark Management Agent",
)
async def mark_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized MarkAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The MarkAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/marks/).
    4. The backend API will enforce all role permissions
       (e.g., Admin-only for 'delete_mark', Parent/Student for 'search_marks').
    """
    logger.info(f"Invoking MarkAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = mark_agent_app.invoke(request.query)

        logger.info(f"MarkAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in MarkAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


@router.post(
    "/chat/report-card",
    response_model=AgentChatResponse,
    tags=["Agents - HTTP"],
    summary="Invoke the Report Card Agent",
)
async def report_card_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Get token from Authorization header
):
    """
    Run a query against the specialized ReportCardAgent.

    This endpoint is secure and role-aware:
    1. It extracts the user's JWT token.
    2. It injects the token and API_BASE_URL into the ToolRuntimeContext.
    3. The ReportCardAgent's tools will use this context to make
       authenticated HTTP calls to the backend API (e.g., /api/v1/report-cards/).
    4. The backend API will enforce all role permissions.
    """
    logger.info(f"Invoking ReportCardAgent for session: {request.session_id}")

    # 1. Create the runtime context with the user's JWT
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
        # db and current_profile are intentionally None for HTTP-based agents
    )

    # 2. Use the context for this agent's invocation
    try:
        with use_tool_context(context):
            # 3. Invoke the agent (using the instance from main.py)
            result = report_card_agent_app.invoke(request.query)

        logger.info(f"ReportCardAgent success for session: {request.session_id}")
        return AgentChatResponse(
            response=result.get("response", "No response generated."),
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(
            f"Error in ReportCardAgent invocation for session {request.session_id}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred while processing your request: {str(e)}",
        )


# ============================================================================
# Health Check Endpoint
# ============================================================================


@router.get("/health/http-client")
async def health_check_http_client():
    """
    Health check endpoint to verify HTTP client configuration.

    Returns:
    - api_base_url: The configured API base URL
    - status: ok or error
    """
    try:
        api_base_url = get_api_base_url()
        return {
            "status": "ok",
            "api_base_url": api_base_url,
            "message": "HTTP client configuration is valid",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to retrieve API base URL configuration",
        }
