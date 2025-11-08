# File: app/agents/modules/academics/leaves/leaderboard_agent/__init__.py

"""
Leaderboard Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Holistic sub-module.

This agent handles:
- Displaying school, class, and club leaderboards.
- Triggering the recalculation of all rankings.
"""

from .main import (
    LeaderboardAgent,
    invoke_leaderboard_agent,
    leaderboard_agent_app,
    leaderboard_agent_instance,
)

__all__ = [
    "LeaderboardAgent",
    "leaderboard_agent_instance",
    "leaderboard_agent_app",
    "invoke_leaderboard_agent",
]
