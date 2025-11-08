import logging
from typing import Any

from langchain_core.tools import tool
from pydantic.v1 import BaseModel, Field

# Import the L2 orchestrator we just built
from app.agents.modules.academics.module_agent import academics_module_orchestrator_instance

logger = logging.getLogger(__name__)

# This map will hold all our L2 Orchestrators
L2_ORCHESTRATOR_MAP = {
    "AcademicsModule": academics_module_orchestrator_instance,
    # "FinanceModule": finance_module_instance, (etc.)
}

# --- L1 Tool Schemas ---


class L1ToolInputSchema(BaseModel):
    """Input schema for all L1 tools."""

    query: str = Field(..., description="The user's original query.")


# --- L1 Tool Definitions ---


@tool("academics_tool", args_schema=L1ToolInputSchema)
async def academics_tool(query: str) -> dict[str, Any]:
    """
    Use this tool for any query related to academics, including:
    - Students, Classes, Subjects, Teachers
    - Exams, Marks, Grades, Report Cards
    - Attendance, Timetables, Schedules
    - Clubs, Achievements, Leaderboards
    """
    logger.info("L1 Root: Routing to AcademicsModuleOrchestrator")

    # We don't need to route again. This tool *is* the router.
    # We will invoke the L2 agent directly.
    # This tool's 'description' is what the L1's *BaseAgent* LLM will use
    # to decide which tool to call.

    # We are calling the L2 agent's invoke method directly
    # Note: We must use .invoke() not await invoke() because
    # the BaseAgent's _run_coroutine handles the async call.
    return academics_module_orchestrator_instance.invoke(query)


# --- Export the list of tools ---
# These are the tools the L1 Root Orchestrator can use.
root_orchestrator_tools = [
    academics_tool,
    # When other modules are built, we will add:
    # finance_tool,
    # ecommerce_tool,
]

__all__ = ["root_orchestrator_tools"]
