"""
Super Admin Router - Routes messages to super admin specialized agents
================================================================================
ROLE ISOLATION: This router handles ONLY super_admin role queries.
Sessions are completely isolated from principal orchestration.
Pattern mirrors existing agent_router.py for consistency.
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

# ============================================================================
# SUPER ADMIN SESSION STORAGE (Isolated from Principal Sessions)
# ============================================================================
# CRITICAL: These sessions are completely separate from principal sessions
# No cross-pollution between roles
super_admin_sessions = {}


def create_super_admin_session():
    """Create a new super admin session with unique ID."""
    session_id = f"super_admin_{uuid.uuid4()}"
    super_admin_sessions[session_id] = {"history": []}
    return session_id


def super_admin_session_exists(session_id):
    """Check if a super admin session exists."""
    return session_id in super_admin_sessions


def get_super_admin_session_history(session_id):
    """Get super admin session history."""
    if session_id not in super_admin_sessions:
        super_admin_sessions[session_id] = {"history": []}
    return super_admin_sessions[session_id]["history"]


def add_to_super_admin_history(session_id, role, content):
    """Add a message to super admin session history."""
    history = get_super_admin_session_history(session_id)
    history.append({"role": role, "content": content})


async def process_super_admin_message(session_id, user_message):
    """
    Process user message through the super admin agent system.
    Validates templated responses before returning.

    Args:
        session_id: Super admin session ID (prefixed with 'super_admin_')
        user_message: The user's query text

    Returns:
        dict: {
            "message": str,  # Agent response
            "agent_id": str  # Agent that handled the query
            "formatted": dict  # Optional templated format
        }
    """
    from super_admin_agents import get_super_admin_agent_response

    # Add user message to history
    add_to_super_admin_history(session_id, "user", user_message)

    # Get conversation history for context
    history = get_super_admin_session_history(session_id)

    # Get response from super admin agents
    response = await get_super_admin_agent_response(user_message, history)

    # Validate templated response if available
    if USE_RESPONSE_TEMPLATES and TEMPLATES_ENABLED:
        formatted = response.get("formatted")
        if formatted:
            is_valid, issues = validate_response(formatted)
            if not is_valid:
                logger.warning(
                    f"Response validation issues for super admin session {session_id}: {issues}"
                )
                # Still return response but log the issues

    # Add assistant response to history
    add_to_super_admin_history(session_id, "assistant", response["message"])

    return response
