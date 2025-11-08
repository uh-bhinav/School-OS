from typing import Literal

from pydantic.v1 import BaseModel, Field

# Define the exact L2 modules this router can route to.
# For now, it's only "Academics".
ModuleName = Literal[
    "AcademicsModule",
    # We will add "FinanceModule", "ECommerceModule", etc. here later.
    "__self__",  # For general greetings/questions
]


class RootRoute(BaseModel):
    """
    A Pydantic model representing the routing decision for the
    main L1 Root Orchestrator.
    """

    module_name: ModuleName = Field(..., description=("The name of the L2 module to route the query to. " "Use '__self__' for simple greetings or general questions."))


__all__ = ["RootRoute"]
