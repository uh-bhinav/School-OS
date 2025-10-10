# backend/app/agents/modules/academics/leaves/attendance_agent/__init__.py

"""
Attendance Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Attendance sub-module.

This agent handles:
- Marking student attendance for specific dates
- Retrieving student attendance records over date ranges
- Fetching class attendance for specific dates
- Calculating student attendance summaries and percentages
"""

from app.agents.modules.academics.leaves.attendance_agent.main import (
    AttendanceAgent,
    attendance_agent_app,
    attendance_agent_instance,
    invoke_attendance_agent,
)

__all__ = [
    "AttendanceAgent",
    "attendance_agent_instance",
    "attendance_agent_app",
    "invoke_attendance_agent",
]
