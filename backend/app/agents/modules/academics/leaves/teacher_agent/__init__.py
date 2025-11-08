"""
Teacher Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core sub-module.

This agent handles:
- Teacher profile management (search, list, update, deactivate)
- Retrieving teacher qualifications

All tools in this agent are Admin-only.
"""

from app.agents.modules.academics.leaves.teacher_agent.main import (
    TeacherAgent,
    invoke_teacher_agent,
    teacher_agent_app,
    teacher_agent_instance,
)

__all__ = [
    "TeacherAgent",
    "teacher_agent_instance",
    "teacher_agent_app",
    "invoke_teacher_agent",
]
