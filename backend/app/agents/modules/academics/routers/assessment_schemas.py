from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact agent names this router is allowed to route to.
AgentName = Literal["ExamTypeAgent", "ExamAgent", "MarkAgent", "ReportCardAgent", "__self__"]  # For general greetings/questions


class AssessmentRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    Assessment & Grading sub-module.
    """

    agent_name: AgentName = Field(..., description=("The name of the leaf agent to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["AssessmentRoute"]
