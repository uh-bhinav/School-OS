# File: app/agents/modules/academics/leaves/club_agent/main.py

import logging
from typing import Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.agents.base_agent import BaseAgent
from app.agents.modules.academics.leaves.club_agent.prompts import (
    SYSTEM_PROMPT,
)
from app.agents.modules.academics.leaves.club_agent.tools import (
    club_agent_tools,
)

# Set up logging
logger = logging.getLogger(__name__)


class ClubAgent(BaseAgent):
    """
    A specialized leaf agent for managing School Clubs and Memberships.

    This agent is part of the Academics module's Holistic sub-module.
    It operates at Layer 4 of the agentic architecture.
    """

    def __init__(self, llm_tier: str = "medium"):
        """
        Initializes the ClubAgent with its specific tools and LLM tier.

        Args:
            llm_tier (str): The tier of LLM to use. Defaults to 'medium'.
                          Options: 'fast', 'medium', 'power'
        """
        logger.info("Initializing ClubAgent...")
        super().__init__(tools=club_agent_tools, llm_tier=llm_tier)
        logger.info(f"ClubAgent initialized with {len(club_agent_tools)} tools " f"and '{llm_tier}' tier LLM")

    def invoke(self, query: str, conversation_history: Optional[list] = None) -> dict[str, Any]:
        """
        Invokes the agent with a user query, automatically applying the system prompt.

        Args:
            query (str): The user's question or command.
            conversation_history (Optional[list]): Previous conversation messages for context.

        Returns:
            dict[str, Any]: A dictionary containing the response and agent state.
        """
        try:
            logger.info(f"ClubAgent invoked with query: '{query[:100]}...'")

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
            if isinstance(final_message, AIMessage):
                response_content = final_message.content
            else:
                response_content = str(final_message.content) if hasattr(final_message, "content") else str(final_message)

            logger.info("ClubAgent invocation completed successfully")

            return {
                "response": response_content,
                "messages": result["messages"],
                "success": True,
            }

        except Exception as e:
            logger.error(f"ClubAgent invocation failed: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing " "your request about school clubs. Please try again.",
                "messages": [],
                "success": False,
                "error": str(e),
            }


# Create a single, reusable instance of the ClubAgent.
club_agent_instance = ClubAgent()

# For consistency
club_agent_app = club_agent_instance


# Convenience function for direct invocation
def invoke_club_agent(query: str) -> str:
    """
    Convenience function to invoke the ClubAgent and return just the response string.
    """
    result = club_agent_instance.invoke(query)
    return result.get("response", "I couldn't process that request.")


# Export main components
__all__ = [
    "ClubAgent",
    "club_agent_instance",
    "club_agent_app",
    "invoke_club_agent",
]
