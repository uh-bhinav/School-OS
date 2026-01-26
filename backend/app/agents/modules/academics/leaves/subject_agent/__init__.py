# backend/app/agents/modules/academics/leaves/subject_agent/__init__.py

"""
Subject Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Curriculum & Subjects sub-module.

This agent handles:
- Listing subjects in a class's curriculum
- Identifying teacher assignments for subjects
- Assigning subjects to classes (Admin function)
- Retrieving academic stream information (Science, Commerce, Arts, etc.)
- Assigning teachers to subjects (Admin function)
"""

from app.agents.modules.academics.leaves.subject_agent.main import (
    SubjectAgent,
    invoke_subject_agent,
    subject_agent_app,
    subject_agent_instance,
)

__all__ = [
    "SubjectAgent",
    "subject_agent_instance",
    "subject_agent_app",
    "invoke_subject_agent",
]
