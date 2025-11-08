import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.root_orchestrator.prompts import (
    SYSTEM_PROMPT,
)
from app.agents.root_orchestrator.tools import (
    root_orchestrator_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class RootOrchestrator(BaseAgent):
    """
    The L1 Root Orchestrator Agent, the main entry point for the system.

    It operates at Layer 1 of the agentic architecture and is responsible for:
    - Receiving all user queries.
    - Classifying the query and routing it to the correct L2 Module Orchestrator
      (e.g., AcademicsModule, FinanceModule).
    - Decomposing complex queries that span multiple modules.

    It uses a 'power' tier LLM due to the high-level decomposition task.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the RootOrchestrator with its tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power'.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing RootOrchestrator...")
        super().__init__(tools=root_orchestrator_tools, llm_tier=llm_tier)
        logger.info(f"RootOrchestrator initialized with " f"{len(root_orchestrator_tools)} tools and '{llm_tier}' tier LLM")

    def invoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the agent with a user query, automatically applying the system prompt.

        Args:
            query (str): The user's question or command.
            conversation_history (Optional[list]): Previous conversation messages for context.

        Returns:
            dict[str, Any]: A dictionary containing the final response.
        """
        try:
            logger.info(f"RootOrchestrator invoked with query: '{query[:100]}...'")

            # Build the message list
            messages = [SystemMessage(content=SYSTEM_PROMPT)]

            if conversation_history:
                messages.extend(conversation_history)
                logger.debug(f"Added {len(conversation_history)} messages from conversation history")

            messages.append(HumanMessage(content=query))

            # Invoke the base agent's graph
            result = super().invoke(messages)

            # Extract the final response
            final_message = result["messages"][-1]
            response_content = ""

            if isinstance(final_message, AIMessage):
                if getattr(final_message, "tool_calls", None):
                    response_content = "I'm sorry, I encountered an issue decomposing the task. Please try rephrasing."
                    logger.error("L1 invoke finished with pending tool calls.")
                else:
                    response_content = final_message.content
            else:
                # This will be a ToolMessage from the last tool call (the L2 agent)
                # We need to extract the 'response' field from *within* that tool message.
                tool_output = result.get("messages", [])[-1].content
                if isinstance(tool_output, str):
                    try:
                        import json

                        tool_output = json.loads(tool_output)
                    except json.JSONDecodeError:
                        response_content = tool_output

                if isinstance(tool_output, dict):
                    # The L2 agent returns a dict: {"response": "...", "success": True}
                    response_content = tool_output.get("response", str(tool_output))
                else:
                    response_content = str(tool_output)

            logger.info("RootOrchestrator invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"RootOrchestrator invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered a system-level error. " "Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance
root_orchestrator_instance = RootOrchestrator()


# For backward compatibility / consistency
root_orchestrator_app = root_orchestrator_instance


# Convenience function for direct invocation
def invoke_root_orchestrator(query: str) -> str:
    """
    Convenience function to invoke the RootOrchestrator.
    """
    result = root_orchestrator_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "RootOrchestrator",
    "root_orchestrator_instance",
    "root_orchestrator_app",
    "invoke_root_orchestrator",
]
