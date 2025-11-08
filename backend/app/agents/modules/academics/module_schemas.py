from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact L3 routers this agent can route to.
RouterName = Literal["CoreCurriculumRouter", "AssessmentRouter", "SchedulingRouter", "HolisticRouter", "__self__"]  # <-- ADDED  # For general greetings/questions


class AcademicsRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    main L2 Academics Module Orchestrator.
    """

    router_name: RouterName = Field(..., description=("The name of the L3 sub-module router to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["AcademicsRoute"]
