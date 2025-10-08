# backend/app/agents/modules/academics/leaves/timetable_agent/main.py

import logging
from typing import Any, Dict, List

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.timetable_agent.tools import (
    timetable_agent_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class TimetableAgent(BaseAgent):
    """
    A specialized leaf agent for handling class schedules and timetable information.

    This agent is part of the Academics module's Scheduling sub-module.
    It operates at Layer 4 of the agentic architecture and is responsible for:
    - Retrieving class timetables
    - Retrieving teacher timetables
    - Finding free periods or available teachers
    - Creating and updating timetable entries
    - Managing all schedule-related information

    The agent uses a 'power' tier LLM for better tool selection and response generation.
    """

    def __init__(self, llm_tier: str = "power"):
        """
        Initializes the TimetableAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'power' for better
                          function calling capabilities. Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing TimetableAgent...")
        super().__init__(tools=timetable_agent_tools, llm_tier=llm_tier)
        logger.info("TimetableAgent initialized successfully.")

    def invoke(self, query: str) -> Dict[str, Any]:
        """
        Invokes the agent with a single query and returns the structured result.

        Args:
            query (str): The user's question or command.

        Returns:
            A dictionary containing the agent's final response, success status,
            and any errors.
        """
        logger.debug(f"TimetableAgent received query: '{query}'")
        try:
            # The BaseAgent's invoke method handles the graph execution
            final_state = super().invoke([HumanMessage(content=query)])

            # Robustly extract the last AI message for the final response.
            # Iterate backwards to find the most recent AIMessage.
            response_content = "I'm sorry, I couldn't generate a response."
            for message in reversed(final_state.get("messages", [])):
                if isinstance(message, AIMessage):
                    response_content = message.content
                    break

            # Check for tool errors in the final state for more specific error reporting
            if "Error executing tool" in response_content:
                logger.warning(f"TimetableAgent invocation resulted in a tool error state: {response_content}")
                return {
                    "response": "There was an issue with one of my tools. Please try rephrasing your request.",
                    "success": False,
                    "error": response_content,
                    "messages": final_state["messages"],
                }

            logger.info(f"TimetableAgent invocation successful. Final response: '{response_content}'")
            return {
                "response": response_content,
                "success": True,
                "error": None,
                "messages": final_state["messages"],
            }
        except Exception as e:
            logger.error(f"Error during TimetableAgent invocation: {e}", exc_info=True)
            return {
                "response": "I'm sorry, an error occurred while processing your request about the timetable.",
                "success": False,
                "error": str(e),
                "messages": [SystemMessage(content=f"Error state: {e}")],
            }

    def run_test_queries(self, queries: List[str]) -> List[Dict[str, Any]]:
        """
        Runs a batch of test queries through the agent to validate its tool selection
        and response generation. This is a utility for development and testing.
        """
        results = []
        for query in queries:
            logger.info(f"--- Running test query for tool selection for: '{query}' ---")
            result = self.invoke(query)

            # Analyze which tools were called and with what arguments
            tools_called = []
            for msg in result.get("messages", []):
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tools_called.append(
                            {
                                "name": tool_call.get("name"),
                                "args": tool_call.get("args"),
                            }
                        )

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


# Create a single, reusable instance of the TimetableAgent.
# This instance will be imported by the API layer and parent routers.
timetable_agent_instance = TimetableAgent()


# Convenience function for direct invocation
def invoke_timetable_agent(query: str) -> str:
    """
    Convenience function to invoke the TimetableAgent and return just the response string.

    Args:
        query (str): The user's question or command

    Returns:
        str: The agent's response
    """
    result = timetable_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# For backward compatibility and simple invocation in the API layer
timetable_agent_app = timetable_agent_instance


# Export main components for easy import elsewhere
__all__ = [
    "TimetableAgent",
    "timetable_agent_instance",
    "timetable_agent_app",
    "invoke_timetable_agent",
]


# ============================================================================
# Main execution block for direct testing of the agent
# ============================================================================
if __name__ == "__main__":
    import json

    # Configure basic logging for standalone script execution
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    logger.info("Starting direct test run of TimetableAgent...")

    # Define a list of test queries to validate agent's capabilities
    TEST_QUERIES = [
        "What is the schedule for class 10A tomorrow?",
        "Show me Mr. Sharma's timetable for this week.",
        "Which teachers are free during the 3rd period on Tuesday?",
        "What subject is class 8B having right now?",
        "Update the timetable: assign Mrs. Gupta to teach Math to 9C on Friday, 4th period.",
        "Who is the CEO of Google?",  # Out-of-domain query to test refusal
    ]

    # Run the test queries
    test_results = timetable_agent_instance.run_test_queries(TEST_QUERIES)

    # Pretty-print the results
    print("\n" + "=" * 50)
    print("            TimetableAgent Test Results")
    print("=" * 50 + "\n")
    print(json.dumps(test_results, indent=2))
    print("\n" + "=" * 50)
    logger.info("TimetableAgent test run completed.")
