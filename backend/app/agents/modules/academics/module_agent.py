import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.module_prompts import (
    SYSTEM_PROMPT,
)
from app.agents.modules.academics.module_tools import (
    academics_module_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class AcademicsModuleOrchestrator(BaseAgent):
    """
    A specialized L2 Orchestrator Agent for the entire Academics Module.

    It operates at Layer 2 of the agentic architecture and is responsible for:
    - Receiving all academic-related queries.
    - Classifying the query and routing it to the correct L3 sub-module router
      (e.g., CoreCurriculumRouter, AssessmentRouter).
    - Decomposing complex queries that span multiple sub-modules.
    - Synthesizing final answers from the results of its tools.

    It uses a 'power' tier LLM due to the complexity of task decomposition.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the AcademicsModuleOrchestrator with its tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power'
                          for complex routing and decomposition.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing AcademicsModuleOrchestrator...")
        super().__init__(tools=academics_module_tools, llm_tier=llm_tier)
        logger.info(f"AcademicsModuleOrchestrator initialized with " f"{len(academics_module_tools)} tools and '{llm_tier}' tier LLM")

    async def ainvoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the orchestrator with a user query.
        """
        try:
            logger.info(f"AcademicsModuleOrchestrator invoked with query: '{query[:100]}...'")

            messages = [SystemMessage(content=SYSTEM_PROMPT)]

            if conversation_history:
                messages.extend(conversation_history)
                logger.debug(f"Added {len(conversation_history)} messages from conversation history")

            messages.append(HumanMessage(content=query))

            result = await super().ainvoke(messages)

            final_messages = result.get("messages", [])
            response_content = ""

            if final_messages:
                # Work backwards to find the BEST response
                # Priority: Detailed ToolMessage > Generic AIMessage
                for message in reversed(final_messages):
                    if isinstance(message, ToolMessage):
                        # Tool result - check if it's substantial (real data, not error)
                        if message.content and len(message.content) > 100:
                            response_content = message.content
                            logger.info(f"Found detailed ToolMessage: {message.content[:80]}...")
                            break
                    elif isinstance(message, AIMessage):
                        # AI response without tool calls
                        if message.content and not getattr(message, "tool_calls", None):
                            # Only use if we haven't found a detailed tool response
                            if not response_content:
                                response_content = message.content
                                logger.info(f"Found AIMessage: {message.content[:80]}...")

            if not response_content:
                response_content = "I couldn't process that request. Please try again."

            logger.info(f"AcademicsModuleOrchestrator returning: {response_content[:80]}...")

            return {
                "response": response_content,
                "messages": final_messages,
                "success": True,
            }

        except Exception as e:
            logger.error(f"AcademicsModuleOrchestrator invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing your academic request. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance
academics_module_orchestrator_instance = AcademicsModuleOrchestrator()


# For backward compatibility / consistency
academics_module_orchestrator_app = academics_module_orchestrator_instance


# Convenience function for direct invocation
async def invoke_academics_module(query: str) -> str:
    """
    Convenience function to invoke the AcademicsModuleOrchestrator.
    """
    result = await academics_module_orchestrator_instance.ainvoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "AcademicsModuleOrchestrator",
    "academics_module_orchestrator_instance",
    "academics_module_orchestrator_app",
    "invoke_academics_module",
]
