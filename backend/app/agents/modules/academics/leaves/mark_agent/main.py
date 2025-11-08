import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.mark_agent.prompts import (
    SYSTEM_PROMPT,
)
from app.agents.modules.academics.leaves.mark_agent.tools import (
    mark_agent_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class MarkAgent(BaseAgent):
    """
    A specialized leaf agent for managing student Marks and Grades.

    This agent is part of the Academics module's Assessment sub-module.
    It operates at Layer 4 of the agentic architecture and is responsible for:
    - Entering single and bulk marks (Teacher/Admin)
    - Searching and viewing marks (All Users, with API-level authorization)
    - Generating report cards and performance summaries

    The agent uses a 'power' tier LLM due to the high number of tools (8)
    and the complexity of handling user requests.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the MarkAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power'.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing MarkAgent...")
        super().__init__(tools=mark_agent_tools, llm_tier=llm_tier)
        logger.info(f"MarkAgent initialized with {len(mark_agent_tools)} tools " f"and '{llm_tier}' tier LLM")

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
            logger.info(f"MarkAgent invoked with query: '{query[:100]}...'")

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
                response_content = final_message.content
            else:
                response_content = str(final_message.content) if hasattr(final_message, "content") else str(final_message)

            logger.info("MarkAgent invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"MarkAgent invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing " "your request regarding student marks. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance of the MarkAgent.
# This instance will be imported by the API layer and parent routers.
mark_agent_instance = MarkAgent()


# For backward compatibility / consistency with your AttendanceAgent
mark_agent_app = mark_agent_instance


# Convenience function for direct invocation
def invoke_mark_agent(query: str) -> str:
    """
    Convenience function to invoke the MarkAgent and return just the response string.
    """
    result = mark_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "MarkAgent",
    "mark_agent_instance",
    "mark_agent_app",
    "invoke_mark_agent",
]
