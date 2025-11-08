# File: app/agents/modules/academics/leaves/attendance_agent/__init__.py

"""
Attendance Agent Module - Layer 4 Leaf Agent
Part of the Academics Module's Scheduling sub-module.

Handles the full workflow for taking, reporting, and analyzing attendance.
"""

from .main import (
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
