from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact agent names this router is allowed to route to.
# These match the agent instances we've already built.
AgentName = Literal["AcademicYearAgent", "StudentAgent", "ClassAgent", "SubjectAgent", "TeacherAgent", "__self__"]  # A route for when the query is a general greeting


class CoreCurriculumRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    Core Curriculum sub-module.
    """

    agent_name: AgentName = Field(..., description=("The name of the leaf agent to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["CoreCurriculumRoute"]
