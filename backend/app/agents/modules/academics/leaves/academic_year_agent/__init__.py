"""
Academic Year Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Core sub-module.

This agent handles:
- Fetching the active academic year
- Listing all academic years
- Creating, updating, and deleting academic years (Admin-only)
- Setting a specific year as active (Admin-only)
"""

from app.agents.modules.academics.leaves.academic_year_agent.main import (
    AcademicYearAgent,
    academic_year_agent_app,
    academic_year_agent_instance,
    invoke_academic_year_agent,
)

__all__ = [
    "AcademicYearAgent",
    "academic_year_agent_instance",
    "academic_year_agent_app",
    "invoke_academic_year_agent",
]
