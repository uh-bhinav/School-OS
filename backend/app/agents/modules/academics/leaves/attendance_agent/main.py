# backend/app/agents/modules/academics/leaves/attendance_agent/main.py

import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.attendance_agent.prompts import SYSTEM_PROMPT
from app.agents.modules.academics.leaves.attendance_agent.tools import (
    attendance_agent_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class AttendanceAgent(BaseAgent):
    """
    A specialized leaf agent for handling student attendance tracking and management.
    This agent uses the secure, robust, agent-ready backend endpoints.
    """

    def __init__(self, llm_tier: str = "medium"):  # Changed to medium, 'power' is not standard
        """
        Initializes the AttendanceAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'medium'.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing AttendanceAgent...")
        super().__init__(tools=attendance_agent_tools, llm_tier=llm_tier)  # Uses new tools
        logger.info(f"AttendanceAgent initialized with {len(attendance_agent_tools)} tools and '{llm_tier}' tier LLM")

    def invoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the agent with a user query, automatically applying the system prompt.
        """
        try:
            logger.info(f"AttendanceAgent invoked with query: '{query[:100]}...'")

            # Build the message list
            messages = [SystemMessage(content=SYSTEM_PROMPT)]  # Uses new prompt

            if conversation_history:
                messages.extend(conversation_history)
                logger.debug(f"Added {len(conversation_history)} messages from conversation history")

            messages.append(HumanMessage(content=query))

            result = super().invoke(messages)

            final_message = result["messages"][-1]
            if isinstance(final_message, AIMessage):
                response_content = final_message.content
            else:
                response_content = str(final_message.content) if hasattr(final_message, "content") else str(final_message)

            logger.info("AttendanceAgent invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"AttendanceAgent invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing your request. Please try again or rephrase your query.",
                "messages": [],
                "success": False,
                "error": str(e),
            }

    def invoke_with_retry(self, query: str, max_retries: int = 1) -> dict[str, Any]:
        """
        Invokes the agent with automatic retry logic for failed attempts.

        This implements the retry logic mentioned in the architectural plan's
        "Fallback and Retry Logic" section.

        Args:
            query (str): The user's question or command.
            max_retries (int): Maximum number of retry attempts. Defaults to 1.

        Returns:
            dict[str, Any]: Same as invoke() method
        """
        attempt = 0
        last_error = None

        while attempt <= max_retries:
            logger.info(f"AttendanceAgent attempt {attempt + 1}/{max_retries + 1}")
            result = self.invoke(query)

            if result["success"]:
                return result

            last_error = result.get("error")
            attempt += 1

            if attempt <= max_retries:
                logger.warning(f"Retry {attempt}/{max_retries} after failure")

        # All retries exhausted
        logger.error(f"AttendanceAgent failed after {max_retries + 1} attempts")
        return {
            "response": "I'm sorry, I couldn't understand that request. Could you please rephrase it?",
            "messages": [],
            "success": False,
            "error": f"Failed after {max_retries + 1} attempts. Last error: {last_error}",
        }

    def test_tool_selection(self, test_queries: list[str]) -> list[dict[str, Any]]:
        """
        Tests the agent's tool selection logic with a list of queries.
        Useful for verification checklist item #3 (Tool Selection Logic).

        Args:
            test_queries (list[str]): List of test queries to evaluate

        Returns:
            list[dict[str, Any]]: Results for each test query including which tools were selected
        """
        results = []

        for query in test_queries:
            logger.info(f"Testing tool selection for: '{query}'")
            result = self.invoke(query)

            # Analyze which tools were called
            tools_called = []
            for msg in result.get("messages", []):
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tools_called.append(tool_call.get("name"))

            results.append(
                {
                    "query": query,
                    "response": result.get("response"),
                    "tools_called": tools_called,
                    "success": result.get("success"),
                    "error": result.get("error"),
                }
            )

        return results


# Create a single, reusable instance of the AttendanceAgent.
# This instance will be imported by the API layer and parent routers.
attendance_agent_instance = AttendanceAgent()


# Convenience function for direct invocation
def invoke_attendance_agent(query: str) -> str:
    """
    Convenience function to invoke the AttendanceAgent and return just the response string.

    Args:
        query (str): The user's question or command

    Returns:
        str: The agent's response
    """
    result = attendance_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# For backward compatibility
attendance_agent_app = attendance_agent_instance


# Export main components
__all__ = [
    "AttendanceAgent",
    "attendance_agent_instance",
    "attendance_agent_app",
    "invoke_attendance_agent",
]
