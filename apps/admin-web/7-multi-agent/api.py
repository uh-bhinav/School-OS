"""
FastAPI server for school management chatbot.
Provides REST API endpoints for session-aware conversations with ADK agents.
"""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from adk_router import process_message, create_session
from sessions import session_exists


# Initialize FastAPI app
app = FastAPI(
    title="School Management Chatbot API",
    description="Multi-agent chatbot backend using Google ADK",
    version="1.0.0",
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server (alternative)
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite development server (primary)
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChatRequest(BaseModel):
    """Request model for sending a message."""

    message: str
    session_id: Optional[str] = None


class SessionResponse(BaseModel):
    """Response model for session creation."""

    session_id: str


class ChatResponse(BaseModel):
    """Response model for chat messages."""

    message: str
    agentId: str
    timestamp: str
    session_id: str


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "School Management Chatbot API",
        "version": "1.0.0",
    }


@app.post("/api/chat/new_session", response_model=SessionResponse)
async def new_session():
    """
    Create a new chat session.

    Returns:
        SessionResponse with unique session_id
    """
    session_id = create_session()
    return SessionResponse(session_id=session_id)


@app.post("/api/chat/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the chatbot.

    If no session_id is provided, a new session will be created automatically.
    The full conversation context is maintained and sent to the ADK agent.

    Args:
        request: ChatRequest containing message and optional session_id

    Returns:
        ChatResponse with assistant's reply, metadata, and session_id

    Raises:
        HTTPException: If message processing fails
    """
    try:
        # Auto-create session if not provided
        session_id = request.session_id
        if not session_id or not session_exists(session_id):
            session_id = create_session()

        # Process message with full conversation context
        response = process_message(session_id, request.message)

        # Return formatted response
        return ChatResponse(
            message=response,
            agentId="school_management_agent",
            timestamp=datetime.now().isoformat(),
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process message: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns:
        Status information about the API
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8004, reload=True)
