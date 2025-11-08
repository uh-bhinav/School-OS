# File: app/agents/modules/academics/leaves/period_agent/__init__.py

"""
Period Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Scheduling sub-module.

This agent handles:
- Listing the school's period structure
- Creating or replacing the period structure (Admin-only)
- Updating timings for individual periods (Admin-only)
"""

from .main import (
    PeriodAgent,
    invoke_period_agent,
    period_agent_app,
    period_agent_instance,
)

__all__ = [
    "PeriodAgent",
    "period_agent_instance",
    "period_agent_app",
    "invoke_period_agent",
]
