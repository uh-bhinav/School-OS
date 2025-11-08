# File: app/agents/modules/academics/routers/scheduling_schemas.py

from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact agent names this router is allowed to route to.
# [cite_start]These match your blueprint [cite: 122]
AgentName = Literal["PeriodAgent", "TimetableAgent", "AttendanceAgent", "__self__"]  # For general greetings/questions


class SchedulingRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    Scheduling & Timetabling sub-module.
    """

    agent_name: AgentName = Field(..., description=("The name of the leaf agent to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["SchedulingRoute"]
