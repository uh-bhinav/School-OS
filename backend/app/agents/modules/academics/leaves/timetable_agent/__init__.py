# backend/app/agents/modules/academics/leaves/timetable_agent/__init__.py

"""
Timetable Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Scheduling sub-module.

This agent handles:
- Retrieving class timetables
- Retrieving teacher timetables
- Finding current period for classes
- Finding free teachers for substitutions
- Creating or updating timetable entries (Admin-only)
"""

from app.agents.modules.academics.leaves.timetable_agent.main import (
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
