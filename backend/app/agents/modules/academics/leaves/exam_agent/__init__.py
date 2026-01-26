# backend/app/agents/modules/academics/leaves/exam_agent/__init__.py

"""
Exam Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Examinations & Grading sub-module.

This agent handles:
- Scheduling exams
- Retrieving exam schedules
- Fetching upcoming exams
- Defining new exam types
"""

from app.agents.modules.academics.leaves.exam_agent.main import (
    ExamAgent,
    exam_agent_app,
    exam_agent_instance,
    invoke_exam_agent,
)

__all__ = ["ExamAgent", "exam_agent_instance", "exam_agent_app", "invoke_exam_agent"]
