import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

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

    def invoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the agent with a user query, automatically applying the system prompt.

        Args:
            query (str): The user's question or command.
            conversation_history (Optional[list]): Previous conversation messages for context.
                                                   Each item should be a LangChain message object.

        Returns:
            dict[str, Any]: A dictionary containing:
                - 'response' (str): The final natural language response
                - 'messages' (list): All messages including tool calls
                - 'success' (bool): Whether the invocation was successful
                - 'error' (str, optional): Error message if invocation failed
        """
        try:
            logger.info(f"AcademicsModuleOrchestrator invoked with query: '{query[:100]}...'")

            # Build the message list
            messages = [SystemMessage(content=SYSTEM_PROMPT)]

            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)
                logger.debug(f"Added {len(conversation_history)} messages from conversation history")

            # Add the current query
            messages.append(HumanMessage(content=query))

            # Invoke the base agent's graph
            result = super().invoke(messages)

            # Extract the final response
            final_message = result["messages"][-1]

            # Determine if it's an AI message with content
            if isinstance(final_message, AIMessage):
                # If the AI message contains tool calls, it means the graph
                # execution failed or was interrupted. We must not return
                # a message that looks like it's trying to call a tool.
                if getattr(final_message, "tool_calls", None):
                    response_content = "I'm sorry, I encountered an issue decomposing the task. Please try rephrasing."
                    logger.error("L2 invoke finished with pending tool calls.")
                else:
                    response_content = final_message.content
            else:
                # This will likely be a ToolMessage from the last tool call
                # We need to extract the 'response' field from *within* that tool message.
                # The L4 agents return a dict: {"response": "...", "success": True}

                tool_output = result.get("messages", [])[-1].content
                if isinstance(tool_output, str):
                    try:
                        # Try to parse the string as JSON
                        import json

                        tool_output = json.loads(tool_output)
                    except json.JSONDecodeError:
                        # It's just a raw string, return it
                        response_content = tool_output

                if isinstance(tool_output, dict):
                    response_content = tool_output.get("response", str(tool_output))
                else:
                    response_content = str(tool_output)

            logger.info("AcademicsModuleOrchestrator invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"AcademicsModuleOrchestrator invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing " "your academic request. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance
academics_module_orchestrator_instance = AcademicsModuleOrchestrator()


# For backward compatibility / consistency
academics_module_orchestrator_app = academics_module_orchestrator_instance


# Convenience function for direct invocation
def invoke_academics_module(query: str) -> str:
    """
    Convenience function to invoke the AcademicsModuleOrchestrator.
    """
    result = academics_module_orchestrator_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "AcademicsModuleOrchestrator",
    "academics_module_orchestrator_instance",
    "academics_module_orchestrator_app",
    "invoke_academics_module",
]
