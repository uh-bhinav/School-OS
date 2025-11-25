import logging

from langchain_core.tools import tool
from pydantic import BaseModel, Field

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


@tool("academics_tool")
async def academics_tool(query: str) -> str:
    """Routes query to the Academics Module Orchestrator."""
    try:
        logger.info("L1 Root: Routing to AcademicsModuleOrchestrator")
        # ainvoke returns {"messages": [...]} - extract the response
        result = await academics_module_orchestrator_instance.ainvoke(query)

        # The nested agent returns a dict with keys like "response" or "messages"
        # Extract the final response string
        if isinstance(result, dict):
            response = result.get("response") or result.get("messages", "")
            if isinstance(response, list):
                # If it's a list of messages, extract the last one
                response = response[-1].content if response else ""
            return str(response)
        return str(result)
    except Exception as e:
        logger.error(f"Error in academics_tool: {e}", exc_info=True)
        return f"Error: {str(e)}"


# --- Export the list of tools ---
# These are the tools the L1 Root Orchestrator can use.
root_orchestrator_tools = [
    academics_tool,
    # When other modules are built, we will add:
    # finance_tool,
    # ecommerce_tool,
]

__all__ = ["root_orchestrator_tools"]
