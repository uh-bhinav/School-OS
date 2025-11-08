"""
Exam Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Assessment sub-module.

This agent handles:
- Exam schedule management (create, search, update, delete)
- Listing all exams for the school
"""

from app.agents.modules.academics.leaves.exam_agent.main import (
    ExamAgent,
    exam_agent_app,
    exam_agent_instance,
    invoke_exam_agent,
)

__all__ = [
    "ExamAgent",
    "exam_agent_instance",
    "exam_agent_app",
    "invoke_exam_agent",
]
