# File: app/agents/modules/academics/routers/holistic_schemas.py

from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact agent names this router is allowed to route to.
# These match your blueprint
AgentName = Literal["ClubAgent", "AchievementAgent", "LeaderboardAgent", "__self__"]  # For general greetings/questions


class HolisticRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    Holistic Development sub-module.
    """

    agent_name: AgentName = Field(..., description=("The name of the leaf agent to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["HolisticRoute"]
