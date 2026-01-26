# backend/app/agents/modules/academics/leaves/mark_agent/__init__.py

"""
Mark Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Assessment & Grading sub-module.

This agent handles:
- Retrieving student marks and grades
- Recording new marks
- Updating existing marks
- Generating marksheets
- Providing class performance analytics
"""

from app.agents.modules.academics.leaves.mark_agent.main import (
    MarkAgent,
    invoke_mark_agent,
    mark_agent_app,
    mark_agent_instance,
)

__all__ = ["MarkAgent", "mark_agent_instance", "mark_agent_app", "invoke_mark_agent"]
