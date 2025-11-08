"""
Subject Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core sub-module.

This agent handles:
- Subject management (create, search, update, delete)
- Listing teachers qualified for a subject
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
