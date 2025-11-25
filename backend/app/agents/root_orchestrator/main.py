import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

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

    async def ainvoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the agent with a user query, automatically applying the system prompt.
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
            result = await super().ainvoke(messages)

            # Extract the final response
            final_messages = result.get("messages", [])
            response_content = ""

            if final_messages:
                # Work backwards through messages to find the actual response
                for message in reversed(final_messages):
                    logger.debug(f"Checking message type: {type(message).__name__}, has content: {hasattr(message, 'content')}")

                    if isinstance(message, AIMessage):
                        # If it has content and no pending tool calls, this is the final answer
                        if message.content and not getattr(message, "tool_calls", None):
                            response_content = message.content
                            logger.info(f"Found final AIMessage response: {message.content[:100]}...")
                            break
                    elif isinstance(message, ToolMessage):
                        # ToolMessage from nested agent - contains the actual response
                        if message.content and len(message.content) > 50:
                            response_content = message.content
                            logger.info(f"Found final ToolMessage response: {message.content[:100]}...")
                            break

            if not response_content:
                response_content = "I processed your request but couldn't generate a response. Please try again."

            logger.info(f"RootOrchestrator final response: {response_content[:100]}...")

            return {
                "response": response_content,
                "messages": final_messages,
                "success": True,
            }

        except Exception as e:
            logger.error(f"RootOrchestrator invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered a system-level error. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance
root_orchestrator_instance = RootOrchestrator()


# For backward compatibility / consistency
root_orchestrator_app = root_orchestrator_instance


# Convenience function for direct invocation
async def invoke_root_orchestrator(query: str) -> str:
    """
    Convenience function to invoke the RootOrchestrator.
    """
    result = await root_orchestrator_instance.ainvoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "RootOrchestrator",
    "root_orchestrator_instance",
    "root_orchestrator_app",
    "invoke_root_orchestrator",
]
