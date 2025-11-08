# File: app/agents/modules/academics/leaves/club_agent/__init__.py

"""
Club Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Holistic sub-module.

This agent handles:
- Listing, creating, and managing school clubs.
- Managing student memberships in clubs.
"""

from .main import (
    ClubAgent,
    club_agent_app,
    club_agent_instance,
    invoke_club_agent,
)

__all__ = [
    "ClubAgent",
    "club_agent_instance",
    "club_agent_app",
    "invoke_club_agent",
]
