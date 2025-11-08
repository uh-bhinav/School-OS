"""
Class Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core sub-module.

This agent handles:
- Class profile management (create, search, update, delete)
- Listing students within a class
- Assigning subjects to a class
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
