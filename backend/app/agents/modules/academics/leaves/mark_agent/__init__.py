"""
Mark Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Assessment sub-module.

This agent handles:
- Entering, updating, and deleting student marks
- Bulk-uploading marks
- Retrieving marks for students, classes, and report cards
- Analyzing class performance and student grade progression
"""

from app.agents.modules.academics.leaves.mark_agent.main import (
    MarkAgent,
    invoke_mark_agent,
    mark_agent_app,
    mark_agent_instance,
)

__all__ = [
    "MarkAgent",
    "mark_agent_instance",
    "mark_agent_app",
    "invoke_mark_agent",
]
