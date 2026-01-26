# backend/app/agents/modules/academics/leaves/class_agent/__init__.py

"""
Class Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core & Scheduling sub-module.

This agent handles all tasks related to class management, including:
- Creating new classes and sections.
- Retrieving class details and student rosters.
- Fetching class timetables and schedules.
- Assigning and updating class teachers (proctors).
"""

from app.agents.modules.academics.leaves.class_agent.main import (
    ClassAgent,
    class_agent_app,
    class_agent_instance,
    invoke_class_agent,
)

__all__ = [
    "ClassAgent",
    "class_agent_instance",
    "class_agent_app",
    "invoke_class_agent",
]
