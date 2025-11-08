# File: app/agents/modules/academics/leaves/timetable_agent/__init__.py

"""
Timetable Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Scheduling sub-module.

This agent handles:
- Fetching personal, class, and teacher schedules
- Finding free slots and checking conflicts
- Triggering timetable generation (Admin-only)
- Manually updating schedule slots (Admin-only)
"""

from .main import (
    TimetableAgent,
    invoke_timetable_agent,
    timetable_agent_app,
    timetable_agent_instance,
)

__all__ = [
    "TimetableAgent",
    "timetable_agent_instance",
    "timetable_agent_app",
    "invoke_timetable_agent",
]
