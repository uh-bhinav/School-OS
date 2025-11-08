import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.student_agent.prompts import (
    SYSTEM_PROMPT,
)
from app.agents.modules.academics.leaves.student_agent.tools import (
    student_agent_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class StudentAgent(BaseAgent):
    """
    A specialized leaf agent for managing Student Profiles and Contacts.

    This agent is part of the Academics module's Core sub-module.
    It operates at Layer 4 of the agentic architecture and is responsible for:
    - Admitting, updating, and searching for students
    - Managing student-parent/contact relationships
    - Retrieving academic summaries

    The agent uses a 'power' tier LLM due to the high number of tools (12)
    and the complexity of distinguishing between student and contact tools.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the StudentAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power'
                          to handle the large toolset.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing StudentAgent...")
        super().__init__(tools=student_agent_tools, llm_tier=llm_tier)
        logger.info(f"StudentAgent initialized with {len(student_agent_tools)} tools " f"and '{llm_tier}' tier LLM")

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
            logger.info(f"StudentAgent invoked with query: '{query[:100]}...'")

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

            logger.info("StudentAgent invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"StudentAgent invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing " "your request regarding student profiles. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance of the StudentAgent.
# This instance will be imported by the API layer and parent routers.
student_agent_instance = StudentAgent()


# For backward compatibility / consistency with your AttendanceAgent
student_agent_app = student_agent_instance


# Convenience function for direct invocation
def invoke_student_agent(query: str) -> str:
    """
    Convenience function to invoke the StudentAgent and return just the response string.
    """
    result = student_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "StudentAgent",
    "student_agent_instance",
    "student_agent_app",
    "invoke_student_agent",
]
