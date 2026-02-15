"""
Agent Router - Routes messages to specialized agents using Google ADK
Includes response template validation for consistent formatting.
"""

import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# Import template validation utilities
try:
    from .graph_helpers import (
        validate_response,
        USE_RESPONSE_TEMPLATES,
        TEMPLATES_ENABLED,
    )
except ImportError:
    try:
        from graph_helpers import (
            validate_response,
            USE_RESPONSE_TEMPLATES,
            TEMPLATES_ENABLED,
        )
    except ImportError:
        USE_RESPONSE_TEMPLATES = False
        TEMPLATES_ENABLED = False

        def validate_response(x):
            """Fallback validation when templates not available."""
            return (True, [])


logger = logging.getLogger(__name__)

# Session storage
sessions = {}


def create_session():
    """Create a new session with unique ID."""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {"history": []}
    return session_id


def session_exists(session_id):
    """Check if a session exists."""
    return session_id in sessions


def get_session_history(session_id):
    """Get session history."""
    if session_id not in sessions:
        sessions[session_id] = {"history": []}
    return sessions[session_id]["history"]


def add_to_history(session_id, role, content):
    """Add a message to session history."""
    history = get_session_history(session_id)
    history.append({"role": role, "content": content})


async def process_message(session_id, user_message):
    """
    Process user message through the agent system.
    Validates templated responses before returning.
    """
    from agents import get_agent_response

    # Add user message to history
    add_to_history(session_id, "user", user_message)

    # Get conversation history for context
    history = get_session_history(session_id)

    # Get response from agents
    response = await get_agent_response(user_message, history)

    # Validate templated response if available
    if USE_RESPONSE_TEMPLATES and TEMPLATES_ENABLED:
        formatted = response.get("formatted")
        if formatted:
            is_valid, issues = validate_response(formatted)
            if not is_valid:
                logger.warning(
                    f"Response validation issues for session {session_id}: {issues}"
                )
                # Still return response but log the issues

    # Add assistant response to history
    add_to_history(session_id, "assistant", response["message"])

    return response
