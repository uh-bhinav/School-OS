"""
Student Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core sub-module.

This agent handles:
- Student profile management (admit, update, search, delete)
- Student-parent/contact relationship management
- Student academic summaries
- Bulk student operations like promotion
"""

from app.agents.modules.academics.leaves.student_agent.main import (
    StudentAgent,
    invoke_student_agent,
    student_agent_app,
    student_agent_instance,
)

__all__ = [
    "StudentAgent",
    "student_agent_instance",
    "student_agent_app",
    "invoke_student_agent",
]
