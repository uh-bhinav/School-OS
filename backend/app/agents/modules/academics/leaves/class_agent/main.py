# backend/app/agents/modules/academics/leaves/class_agent/main.py

import asyncio
import logging
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.class_agent.prompts import SYSTEM_PROMPT
from app.agents.modules.academics.leaves.class_agent.tools import class_agent_tools

# Set up logging
logger = logging.getLogger(__name__)


class ClassAgent(BaseAgent):
    """
    A specialized leaf agent for handling class management and information retrieval.

    This agent is part of the Academics module's Core & Scheduling sub-module.
    It operates at Layer 4 of the agentic architecture and is responsible for:
    - Creating new classes and sections.
    - Retrieving class details, including the assigned class teacher.
    - Listing students enrolled in a class.
    - Fetching weekly timetables for classes.
    - Assigning and updating class teachers (proctors).

    The agent defaults to a 'power' tier LLM for robust tool selection.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the ClassAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power' for better
                          function calling capabilities. Options: 'fast', 'medium', 'power'.
        """
        logger.info("Initializing ClassAgent...")
        super().__init__(tools=class_agent_tools, llm_tier=llm_tier)
        logger.info(f"ClassAgent initialized successfully with {len(self.tools)} tools.")

    def invoke(self, query: str) -> dict[str, Any]:
        """
        Invokes the agent with a user query and returns a structured response.
        This method is the primary entry point for interacting with the agent.

        Args:
            query (str): The user's question or command.

        Returns:
            dict[str, Any]: A dictionary containing the final response, success status, and any errors.
        """
        logger.info(f"ClassAgent received query: '{query}'")
        messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=query)]

        try:
            # The BaseAgent's invoke method handles the graph execution
            result_state = super().invoke(messages)

            final_message = result_state["messages"][-1]
            response_content = final_message.content if hasattr(final_message, "content") else str(final_message)

            logger.info(f"ClassAgent final response: '{response_content}'")
            return {
                "response": response_content,
                "success": True,
                "error": None,
                "messages": result_state["messages"],
            }
        except Exception as e:
            logger.error(f"ClassAgent invocation failed for query '{query}': {e}", exc_info=True)
            return {
                "response": "I'm sorry, I encountered an internal error. Please try again.",
                "success": False,
                "error": str(e),
                "messages": messages,
            }

    async def invoke_with_retry(self, query: str, retries: int = 3, delay: int = 2) -> dict[str, Any]:
        """
        Invokes the agent with retry logic to handle transient errors (e.g., API rate limits).
        """
        for i in range(retries):
            try:
                return self.invoke(query)
            except Exception as e:
                logger.warning(f"Attempt {i+1}/{retries} failed for query '{query}'. Retrying in {delay}s... Error: {e}")
                await asyncio.sleep(delay)

        logger.error(f"All {retries} retry attempts failed for query: '{query}'")
        return {
            "response": "I'm sorry, I'm having trouble connecting. Please try again later.",
            "success": False,
            "error": "All retry attempts failed.",
            "messages": [],
        }

    def test_tool_selection(self, test_queries: list[str]) -> list[dict[str, Any]]:
        """
        Runs a batch of test queries and returns which tool the agent would select for each,
        without actually executing the tool. This is for validation and debugging.

        Args:
            test_queries (list[str]): A list of user queries to test.

        Returns:
            list[dict[str, Any]]: A list of results, each containing the query and the selected tools.
        """
        results = []
        for query in test_queries:
            logger.info(f"Testing tool selection for: '{query}'")
            messages = [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=query),
            ]

            # Call the model directly to see its tool-calling decision
            model_response = self.model.invoke(messages)

            tools_called = []
            if model_response.tool_calls:
                for tool_call in model_response.tool_calls:
                    tools_called.append({"name": tool_call.get("name"), "args": tool_call.get("args")})

            results.append({"query": query, "predicted_tools": tools_called})

        return results


# Create a single, reusable instance of the ClassAgent.
# This instance will be imported by the API layer and parent routers.
class_agent_instance = ClassAgent()


# Convenience function for direct invocation
def invoke_class_agent(query: str) -> str:
    """
    Convenience function to invoke the ClassAgent and return just the response string.

    Args:
        query (str): The user's question or command

    Returns:
        str: The agent's response
    """
    result = class_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# For backward compatibility
class_agent_app = class_agent_instance


# Export main components
__all__ = [
    "ClassAgent",
    "class_agent_instance",
    "class_agent_app",
    "invoke_class_agent",
]
