"""
School Management Multi-Agent API
==================================
FastAPI server for the SchoolOS chatbot interface.
Runs on port 8004 (separate from backend on 8000).

ROLE-BASED ORCHESTRATION:
- role="principal" → Existing principal orchestration (UNTOUCHED)
- role="super_admin" → New super admin orchestration (ISOLATED)
"""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import uvicorn

# Principal orchestration imports (EXISTING - DO NOT MODIFY)
from agent_router import (
    create_session,
    session_exists,
    process_message,
    get_session_history,
)

# Super Admin orchestration imports (NEW - ISOLATED)
from super_admin_router import (
    create_super_admin_session,
    super_admin_session_exists,
    process_super_admin_message,
    get_super_admin_session_history,
)

# ============================================================================
# FASTAPI APP SETUP
# ============================================================================

app = FastAPI(
    title="SchoolOS Multi-Agent API",
    description="AI-powered school management assistant with specialized agents",
    version="2.0.0",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PYDANTIC MODELS
# ============================================================================


class ChatRequest(BaseModel):
    """
    Chat request with role-based routing support.

    Attributes:
        message: The user's query text
        session_id: Optional session ID for conversation continuity
        role: User role determines which orchestration to use
              - "principal" → Existing principal agents (DEFAULT)
              - "super_admin" → New super admin group-level agents
    """

    message: str
    session_id: Optional[str] = None
    role: Literal["principal", "super_admin"] = "principal"  # DEFAULT: principal


class ChatResponse(BaseModel):
    message: str
    session_id: str
    agentId: str
    timestamp: str
    chart: Optional[dict] = None  # Optional chart data for visualizations
    formatted: Optional[dict] = None  # Optional templated response format
    governed: Optional[
        bool
    ] = None  # NEW: True if response was processed by Response Governor
    bullets: Optional[
        list[str]
    ] = None  # NEW: Structured bullet points for UI rendering


class NewSessionRequest(BaseModel):
    """Request for creating a new session with role specification."""

    role: Literal["principal", "super_admin"] = "principal"


class NewSessionResponse(BaseModel):
    session_id: str
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    agents: list[str]
    super_admin_agents: list[str]  # NEW: Include super admin agents


# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API info."""
    return {
        "name": "SchoolOS Multi-Agent API",
        "version": "3.0.0",  # Bumped version for role-based routing
        "status": "running",
        "docs": "/docs",
        "roles_supported": ["principal", "super_admin"],
        "endpoints": {
            "health": "/health",
            "new_session": "/api/chat/new_session",
            "send_message": "/api/chat/send",
        },
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="3.1.0",  # Version bump for chart capabilities
        agents=[
            "school_management_agent",
            "attendance_agent (charts)",
            "marks_agent (charts)",
            "fees_agent (charts)",
            "timetable_agent",
            "hr_agent",
            "budget_agent (charts)",
            "email_agent",
        ],
        super_admin_agents=[
            "group_overview_agent (charts)",
            "group_finance_agent (charts)",
            "group_attendance_agent (charts)",
            "compliance_risk_agent (charts)",
            "group_communication_agent (charts)",
            "schools_overview_agent (charts)",
        ],
    )


@app.post("/api/chat/new_session", response_model=NewSessionResponse)
async def new_session(request: Optional[NewSessionRequest] = None):
    """
    Create a new chat session.

    Role-based session creation:
    - role="principal" (default) → Creates principal session
    - role="super_admin" → Creates isolated super admin session
    """
    role = request.role if request else "principal"

    if role == "super_admin":
        # Create super admin session (isolated from principal)
        session_id = create_super_admin_session()
        return NewSessionResponse(
            session_id=session_id,
            message="Super Admin session created. You can now query group-level insights.",
        )
    else:
        # Default: Create principal session (EXISTING BEHAVIOR - UNCHANGED)
        session_id = create_session()
        return NewSessionResponse(
            session_id=session_id,
            message="Session created successfully. You can now send messages.",
        )


@app.post("/api/chat/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the chatbot and get a response.

    ROLE-BASED ROUTING:
    - role="principal" (default) → Routes to existing principal orchestration
    - role="super_admin" → Routes to new super admin orchestration

    Sessions are role-isolated:
    - Principal sessions cannot access super admin agents
    - Super admin sessions cannot access principal agents
    """
    role = request.role  # "principal" or "super_admin"

    # ========================================================================
    # SUPER ADMIN ORCHESTRATION (NEW - ISOLATED)
    # ========================================================================
    if role == "super_admin":
        session_id = request.session_id

        # Auto-create super admin session if not provided
        if not session_id:
            session_id = create_super_admin_session()
        elif not super_admin_session_exists(session_id):
            session_id = create_super_admin_session()

        try:
            # Process through super admin orchestration
            response = await process_super_admin_message(session_id, request.message)

            return ChatResponse(
                message=response["message"],
                session_id=session_id,
                agentId=response.get("agent_id", "group_overview_agent"),
                timestamp=datetime.now().isoformat(),
                chart=response.get("chart"),  # Include chart if present
                formatted=response.get("formatted"),  # Include templated format
                governed=response.get("governed"),  # Include governor flag
                bullets=response.get("bullets"),  # Include extracted bullets
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing super admin message: {str(e)}",
            )

    # ========================================================================
    # PRINCIPAL ORCHESTRATION (EXISTING - UNCHANGED)
    # ========================================================================
    else:
        session_id = request.session_id

        if not session_id:
            session_id = create_session()
        elif not session_exists(session_id):
            session_id = create_session()

        try:
            # Process through existing principal orchestration
            response = await process_message(session_id, request.message)

            return ChatResponse(
                message=response["message"],
                session_id=session_id,
                agentId=response.get("agent_id", "school_management_agent"),
                timestamp=datetime.now().isoformat(),
                chart=response.get("chart"),  # Include chart if present
                formatted=response.get("formatted"),  # Include templated format
                governed=response.get("governed"),  # Include governor flag
                bullets=response.get("bullets"),  # Include extracted bullets
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing message: {str(e)}"
            )


@app.get("/api/chat/history/{session_id}")
async def get_history(session_id: str):
    """
    Get chat history for a session.
    Automatically detects if it's a super admin or principal session.
    """
    # Check if it's a super admin session
    if session_id.startswith("super_admin_"):
        if not super_admin_session_exists(session_id):
            raise HTTPException(status_code=404, detail="Super admin session not found")
        history = get_super_admin_session_history(session_id)
        return {"session_id": session_id, "role": "super_admin", "history": history}

    # Default: Principal session
    if not session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    history = get_session_history(session_id)
    return {"session_id": session_id, "role": "principal", "history": history}


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("🎓 SchoolOS Multi-Agent API Server (v3.0 - Role-Based Routing)")
    print("=" * 70)
    print("📍 Running on: http://localhost:8004")
    print("📚 API Docs: http://localhost:8004/docs")
    print("=" * 70)
    print("\n👨‍🏫 PRINCIPAL AGENTS (role='principal'):")
    print("   • Attendance Agent - Track student attendance")
    print("   • Marks Agent - Academic performance insights")
    print("   • Fees Agent - Payment status & dues")
    print("   • Timetable Agent - Class schedules")
    print("   • HR Agent - Staff management & leaves")
    print("   • Budget Agent - Expense tracking & approvals")
    print("   • Email Agent - Send notifications")
    print("\n👑 SUPER ADMIN AGENTS (role='super_admin'):")
    print("   • Group Overview Agent - Multi-school health summary")
    print("   • Group Finance Agent - Revenue & collection trends")
    print("   • Group Attendance Agent - Attendance health across schools")
    print("   • Compliance Risk Agent - Licenses, audits, violations")
    print("   • Group Communication Agent - Message delivery & engagement")
    print("   • Schools Overview Agent - Rankings & comparisons")
    print("=" * 70 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8004, log_level="info")
