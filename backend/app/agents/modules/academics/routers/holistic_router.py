# File: app/agents/modules/academics/routers/holistic_router.py

import logging

from langchain_core.prompts import ChatPromptTemplate

# Assuming you have a central get_llm function
from app.agents.utils.llm_router import get_llm

from .holistic_schemas import HolisticRoute

logger = logging.getLogger(__name__)

# 1. Define the System Prompt
SYSTEM_PROMPT = """
You are a highly efficient router for the "Holistic Development" sub-module.
Your *only* job is to classify the user's query and determine which specialized agent it should be routed to.

You must route to one of the following 4 agents. Be very precise in your choice.

**Routing Rules:**

1.  **`ClubAgent`**:
    * **Keywords**: "club", "join club", "club members", "Debate Club"
    * **Purpose**: Manages school clubs and their memberships.
    * **Example**: "Who is the coordinator for the Science Club?" or "Add me to the chess club."

2.  **`AchievementAgent`**:
    * **Keywords**: "achievement", "award", "certificate", "verify", "won", "competition"
    * **Purpose**: Manages *individual* co-curricular achievements and their verification status.
    * **Example**: "Add an achievement for Rohan, he won the state debate." or "Show me all unverified achievements."

3.  **`LeaderboardAgent`**:
    * **Keywords**: "leaderboard", "ranking", "top students", "who is number one"
    * **Purpose**: Manages the *final, computed rankings* based on all points (academic and co-curricular).
    * **Example**: "Show me the school's overall leaderboard." or "Who are the top 3 students in 10A?"

4.  **`__self__`**:
    * **Purpose**: For simple greetings ("hi", "hello") or general questions about this module ("what can you do?").

Respond *only* with the JSON object matching the requested schema.
"""

# 2. Get the "fast" LLM, as recommended for routing
llm = get_llm("fast")

# 3. Create the prompt
prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", "{query}")])

# 4. Bind the structured output schema to the LLM
llm_with_output = llm.with_structured_output(HolisticRoute)

# 5. Create the final routing chain
router_chain = prompt | llm_with_output


async def invoke_holistic_router(query: str) -> HolisticRoute:
    """
    Invokes the Holistic router to get a routing decision.

    Args:
        query: The user's input query.

    Returns:
        A HolisticRoute object with the agent_name to route to.
    """
    logger.info(f"Routing query in HolisticRouter: '{query[:100]}...'")
    try:
        route = await router_chain.ainvoke({"query": query})
        logger.info(f"Routing decision: {route.agent_name}")
        return route
    except Exception as e:
        logger.error(f"Error in HolisticRouter: {e}", exc_info=True)
        # Fallback in case of a routing error
        return HolisticRoute(agent_name="__self__")


__all__ = ["invoke_holistic_router"]
