"""
School Management Multi-Agent API
==================================
FastAPI server for the SchoolOS chatbot interface.
Runs on port 8004 (separate from backend on 8000).
"""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from agent_router import (
    create_session,
    session_exists,
    process_message,
    get_session_history,
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
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    agentId: str
    timestamp: str


class NewSessionResponse(BaseModel):
    session_id: str
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    agents: list[str]


# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API info."""
    return {
        "name": "SchoolOS Multi-Agent API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
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
        version="2.0.0",
        agents=[
            "school_management_agent",
            "attendance_agent",
            "marks_agent",
            "fees_agent",
            "timetable_agent",
            "hr_agent",
            "budget_agent",
            "email_agent",
        ],
    )


@app.post("/api/chat/new_session", response_model=NewSessionResponse)
async def new_session():
    """Create a new chat session."""
    session_id = create_session()
    return NewSessionResponse(
        session_id=session_id,
        message="Session created successfully. You can now send messages.",
    )


@app.post("/api/chat/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to the chatbot and get a response."""

    # Validate session
    session_id = request.session_id
    if not session_id:
        # Auto-create session if not provided
        session_id = create_session()
    elif not session_exists(session_id):
        # Create session if it doesn't exist
        session_id = create_session()

    try:
        # Process the message
        response = await process_message(session_id, request.message)

        return ChatResponse(
            message=response["message"],
            session_id=session_id,
            agentId=response.get("agent_id", "school_management_agent"),
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing message: {str(e)}"
        )


@app.get("/api/chat/history/{session_id}")
async def get_history(session_id: str):
    """Get chat history for a session."""
    if not session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    history = get_session_history(session_id)
    return {"session_id": session_id, "history": history}


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🎓 SchoolOS Multi-Agent API Server")
    print("=" * 60)
    print("📍 Running on: http://localhost:8004")
    print("📚 API Docs: http://localhost:8004/docs")
    print("=" * 60)
    print("\n🤖 Available Agents:")
    print("   • Attendance Agent - Track student attendance")
    print("   • Marks Agent - Academic performance insights")
    print("   • Fees Agent - Payment status & dues")
    print("   • Timetable Agent - Class schedules")
    print("   • HR Agent - Staff management & leaves")
    print("   • Budget Agent - Expense tracking & approvals")
    print("   • Email Agent - Send notifications")
    print("=" * 60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8004, log_level="info")
