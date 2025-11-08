# File: app/agents/modules/academics/leaves/achievement_agent/__init__.py

"""
Achievement Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Holistic sub-module.

This agent handles the workflow for recording and verifying
student co-curricular achievements.
"""

from .main import (
    AchievementAgent,
    achievement_agent_app,
    achievement_agent_instance,
    invoke_achievement_agent,
)

__all__ = [
    "AchievementAgent",
    "achievement_agent_instance",
    "achievement_agent_app",
    "invoke_achievement_agent",
]
