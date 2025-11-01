# backend/app/agents/api.py

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.modules.academics.leaves.attendance_agent.main import (
    attendance_agent_app,
)
from app.agents.modules.academics.leaves.class_agent.main import class_agent_app
from app.agents.modules.academics.leaves.exam_agent.main import exam_agent_app

# Import the singleton instances of the agents we created
from app.agents.modules.academics.leaves.mark_agent.main import mark_agent_app
from app.agents.modules.academics.leaves.subject_agent.main import subject_agent_app
from app.agents.modules.academics.leaves.timetable_agent.main import timetable_agent_app
from app.agents.tool_context import ToolRuntimeContext, use_tool_context
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.profile import Profile

# Set up logging for this module
logger = logging.getLogger(__name__)

# Add prefix="/agents" to consolidate all agent endpoints
router = APIRouter(prefix="/agents", tags=["Agents (Development)"])


# Define the request and response models for our chat endpoint
class AgentChatRequest(BaseModel):
    query: str
    session_id: str = "default-session"


class AgentChatResponse(BaseModel):
    response: str
    session_id: str


# ===========================================================================
# Mark Agent Endpoint
# ===========================================================================


@router.post("/chat/marks", response_model=AgentChatResponse)
async def marks_agent_chat(
    request: AgentChatRequest,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_active_user),
):
    """
    Development endpoint to directly interact with the MarkAgent.
    This allows for isolated testing of the agent's capabilities.

    Endpoint: POST /agents/chat/marks

    Example queries:
    - "What were Priya's marks in the midterm exam?"
    - "Record marks for Rohan: Math 85, Science 90 in the final exam"
    - "Show me the marksheet for Anjali in the final exam"
    """
    try:
        logger.info(f"Received query for MarkAgent (session: {request.session_id}): '{request.query}'")

        # Provide per-request context to the tools before invoking the agent
        tool_context = ToolRuntimeContext(db=db, current_profile=current_profile)
        with use_tool_context(tool_context):
            result = mark_agent_app.invoke(request.query)

        # The final response from the agent is the last message in the state
        final_message = result["messages"][-1]
        response_content = final_message.content

        logger.info(f"Final response from MarkAgent: '{response_content}'")

        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        logger.error(f"Error during MarkAgent execution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Exam Agent Endpoint
# ============================================================================


@router.post("/chat/exams", response_model=AgentChatResponse)
async def exams_agent_chat(request: AgentChatRequest):
    """
    Development endpoint to directly interact with the ExamAgent.
    This allows for isolated testing of the agent's capabilities.

    Endpoint: POST /agents/chat/exams

    Example queries:
    - "When is the Math exam for Class 10A?"
    - "Schedule a midterm exam for Class 12 Physics on November 15th"
    - "What exams are coming up this week?"
    - "Show me the exam schedule for Class 10A"
    """
    try:
        logger.info(f"Received query for ExamAgent (session: {request.session_id}): '{request.query}'")

        # Invoke the agent with the user's query
        result = exam_agent_app.invoke(request.query)

        # The final response from the agent is the last message in the state
        final_message = result["messages"][-1]
        response_content = final_message.content

        logger.info(f"Final response from ExamAgent: '{response_content}'")

        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        logger.error(f"Error during ExamAgent execution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Class Agent Endpoint
# ============================================================================


@router.post("/chat/classes", response_model=AgentChatResponse)
async def classes_agent_chat(request: AgentChatRequest):
    """
    Development endpoint to directly interact with the ClassAgent.
    This allows for isolated testing of the agent's capabilities.

    Endpoint: POST /agents/chat/classes

    Example queries:
    - "List all students in class 10A"
    - "Create a new class called 'Grade 8 Section D' for the '2025-2026' academic year"
    - "What is the schedule for class 9B?"
    - "Assign Mrs. Geeta as the class teacher for 11C"
    """
    try:
        logger.info(f"Received query for ClassAgent (session: {request.session_id}): '{request.query}'")

        # Invoke the agent instance with the user's query
        # The invoke method returns a dictionary with the response and status
        result = class_agent_app.invoke(request.query)

        if not result.get("success"):
            # If the agent's internal error handling caught an issue, raise an exception
            raise Exception(result.get("error", "Unknown agent error"))

        response_content = result.get("response", "I'm sorry, I couldn't generate a response.")

        logger.info(f"Final response from ClassAgent: '{response_content}'")

        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        logger.error(f"Error during ClassAgent execution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Attendance Agent Endpoint
# ============================================================================


@router.post("/chat/attendance", response_model=AgentChatResponse)
async def attendance_agent_chat(request: AgentChatRequest):
    """
    Development endpoint to directly interact with the AttendanceAgent.
    This allows for isolated testing of the agent's capabilities.

    Endpoint: POST /agents/chat/attendance

    Example queries:
    - "Mark Priya as present today"
    - "What was Rohan's attendance in September?"
    - "Show me class 10A's attendance for October 5th"
    - "What is Anjali's overall attendance percentage?"
    """
    try:
        logger.info(f"Received query for AttendanceAgent (session: {request.session_id}): '{request.query}'")

        # Invoke the agent instance with the user's query
        # The invoke method returns a dictionary with the response and status
        result = attendance_agent_app.invoke(request.query)

        if not result.get("success"):
            # If the agent's internal error handling caught an issue, raise an exception
            raise Exception(result.get("error", "Unknown agent error"))

        response_content = result.get("response", "I'm sorry, I couldn't generate a response.")

        logger.info(f"Final response from AttendanceAgent: '{response_content}'")

        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        logger.error(f"Error during AttendanceAgent execution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Subject Agent Endpoint
# ============================================================================


@router.post("/chat/subjects", response_model=AgentChatResponse)
async def subject_agent_chat(request: AgentChatRequest):
    """
    Development endpoint to directly interact with the SubjectAgent.
    This allows for isolated testing of the agent's capabilities.

    Endpoint: POST /agents/chat/subjects

    Example queries:
    - "List all subjects for class 10A"
    - "Who teaches Physics to Grade 12?"
    - "What are the available academic streams?"
    - "Assign Mr. Sharma to teach Chemistry"
    """
    try:
        logger.info(f"Received query for SubjectAgent (session: {request.session_id}): '{request.query}'")

        # Invoke the agent instance with the user's query
        # The invoke method returns a dictionary with the response and status
        result = subject_agent_app.invoke(request.query)

        if not result.get("success"):
            # If the agent's internal error handling caught an issue, raise an exception
            raise Exception(result.get("error", "Unknown agent error"))

        response_content = result.get("response", "I'm sorry, I couldn't generate a response.")

        logger.info(f"Final response from SubjectAgent: '{response_content}'")

        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        logger.error(f"Error during SubjectAgent execution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Timetable Agent Endpoint
# ============================================================================


@router.post("/chat/timetable", response_model=AgentChatResponse)
async def timetable_agent_chat(request: AgentChatRequest):
    """
    Development endpoint to directly interact with the TimetableAgent.
    This allows for isolated testing of the agent's capabilities related to
    class schedules, teacher assignments, and period management.

    Endpoint: POST /agents/chat/timetable

    Example queries:
    - "What is the schedule for class 10A tomorrow?"
    - "Show me Mr. Sharma's timetable for this week."
    - "Which teachers are free during the 3rd period on Tuesday?"
    - "What subject is class 8B having right now?"
    - "Update the timetable: assign Mrs. Gupta to teach Math to 9C on Friday, 4th period."
    """
    try:
        # Detailed logging for incoming requests
        logger.info(f"Received query for TimetableAgent (session: {request.session_id}): '{request.query}'")

        # Invoke the agent instance with the user's query. The main.py of the agent
        # handles the entire graph execution and returns a final dictionary.
        result = timetable_agent_app.invoke(request.query)

        # Robust error checking based on the agent's own success flag
        if not result.get("success"):
            error_message = result.get("error", "Unknown agent error")
            logger.warning(f"TimetableAgent internal error for session {request.session_id}: {error_message}")
            # Propagate the internal agent error as a clear exception
            raise Exception(error_message)

        # Extract the final, user-facing response
        response_content = result.get("response", "I'm sorry, I couldn't generate a response.")

        logger.info(f"Final response from TimetableAgent for session {request.session_id}: '{response_content}'")

        # Return the successful response in the defined Pydantic model
        return AgentChatResponse(response=response_content, session_id=request.session_id)

    except Exception as e:
        # Catch any exception during the process for a graceful failure
        logger.error(
            f"Error during TimetableAgent execution for session {request.session_id}: {e}",
            exc_info=True,
        )
        # Return a standard 500 Internal Server Error
        raise HTTPException(status_code=500, detail=str(e))
