# backend/app/agents/modules/academics/leaves/mark_agent/main.py

import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.mark_agent.prompts import SYSTEM_PROMPT
from app.agents.modules.academics.leaves.mark_agent.tools import mark_agent_tools

# Set up logging
logger = logging.getLogger(__name__)


class MarkAgent(BaseAgent):
    """
    A specialized leaf agent for handling student marks and grades.

    This agent is part of the Academics module's Assessment & Grading sub-module.
    It operates at Layer 4 of the agentic architecture and is responsible for:
    - Retrieving student marks and grades
    - Recording new marks
    - Updating existing marks
    - Generating marksheets
    - Providing class performance analytics

    The agent uses a 'power' tier LLM for better tool selection and response generation.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the MarkAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power' for better
                          function calling capabilities. Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing MarkAgent...")
        super().__init__(tools=mark_agent_tools, llm_tier=llm_tier)
        logger.info(f"MarkAgent initialized with {len(mark_agent_tools)} tools and '{llm_tier}' tier LLM")

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
            logger.info(f"MarkAgent attempt {attempt + 1}/{max_retries + 1}")
            result = self.invoke(query)

            if result["success"]:
                return result

            last_error = result.get("error")
            attempt += 1

            if attempt <= max_retries:
                logger.warning(f"Retry {attempt}/{max_retries} after failure")

        # All retries exhausted
        logger.error(f"MarkAgent failed after {max_retries + 1} attempts")
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


# Create a single, reusable instance of the MarkAgent.
# This instance will be imported by the API layer and parent routers.
mark_agent_instance = MarkAgent()


# Convenience function for direct invocation
def invoke_mark_agent(query: str) -> str:
    """
    Convenience function to invoke the MarkAgent and return just the response string.

    Args:
        query (str): The user's question or command

    Returns:
        str: The agent's response
    """
    result = mark_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# For backward compatibility
mark_agent_app = mark_agent_instance


# Export main components
__all__ = ["MarkAgent", "mark_agent_instance", "mark_agent_app", "invoke_mark_agent"]
