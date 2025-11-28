"""
Agent Router - Routes messages to specialized agents using Google ADK
"""

import uuid
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

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
    """Process user message through the agent system."""
    from agents import get_agent_response

    # Add user message to history
    add_to_history(session_id, "user", user_message)

    # Get conversation history for context
    history = get_session_history(session_id)

    # Get response from agents
    response = await get_agent_response(user_message, history)

    # Add assistant response to history
    add_to_history(session_id, "assistant", response["message"])

    return response
