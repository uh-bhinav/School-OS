"""
Session management for multi-agent chatbot.
Stores conversation history per session in memory.
"""

from typing import Dict, List

# Global in-memory session storage
# Structure: { session_id: [{"role": "user/assistant", "content": "..."}] }
sessions: Dict[str, List[Dict[str, str]]] = {}


def get_session_history(session_id: str) -> List[Dict[str, str]]:
    """
    Get or create session history for a given session ID.

    Args:
        session_id: Unique identifier for the session

    Returns:
        List of message dictionaries with 'role' and 'content' keys
    """
    return sessions.setdefault(session_id, [])


def clear_session(session_id: str) -> bool:
    """
    Clear a specific session from memory.

    Args:
        session_id: Session to clear

    Returns:
        True if session was cleared, False if session didn't exist
    """
    if session_id in sessions:
        del sessions[session_id]
        return True
    return False


def get_all_sessions() -> List[str]:
    """
    Get all active session IDs.

    Returns:
        List of session IDs
    """
    return list(sessions.keys())


def session_exists(session_id: str) -> bool:
    """
    Check if a session exists.

    Args:
        session_id: Session to check

    Returns:
        True if session exists, False otherwise
    """
    return session_id in sessions
