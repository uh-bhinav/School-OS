# File: app/agents/modules/academics/routers/scheduling_router.py

import logging

from langchain_core.prompts import ChatPromptTemplate

# Assuming you have a central get_llm function as in your example
from app.agents.utils.llm_router import get_llm

from .scheduling_schemas import SchedulingRoute

logger = logging.getLogger(__name__)

# 1. Define the System Prompt
SYSTEM_PROMPT = """
You are a highly efficient router for the "Scheduling & Timetabling" sub-module.
Your *only* job is to classify the user's query and determine which specialized agent it should be routed to.

You must route to one of the following 4 agents. Be very precise in your choice.

**Routing Rules:**

1.  **`PeriodAgent`**:
    * **Keywords**: "period timings", "how long is", "lunch break", "period structure"
    * **Purpose**: Manages the *definitions* of time slots (e.g., "Period 1 is 9:00-9:40").
    * **Example**: "How long is the 4th period?"

2.  **`TimetableAgent`**:
    * **Keywords**: "schedule", "timetable", "what class", "who is free", "conflict"
    * **Purpose**: Manages the *schedule* of what happens in those periods (e.g., "Maths is in Period 1").
    * **Example**: "What is the schedule for Class 10A today?" or "Is Priya Sharma free during Period 3?"

3.  **`AttendanceAgent`**:
    * **Keywords**: "attendance", "present", "absent", "late", "attendance report"
    * **Purpose**: Manages the *record* of student presence in those periods.
    * **Example**: "Mark Rohan absent for Period 1." or "Show me all absentees today."

4.  **`__self__`**:
    * **Purpose**: For simple greetings ("hi", "hello") or general questions about this module ("what can you do?").

Respond *only* with the JSON object matching the requested schema.
"""

# 2. Get the "fast" LLM, as recommended for routing
llm = get_llm("fast")

# 3. Create the prompt
prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", "{query}")])

# 4. Bind the structured output schema to the LLM
llm_with_output = llm.with_structured_output(SchedulingRoute)

# 5. Create the final routing chain
router_chain = prompt | llm_with_output


async def invoke_scheduling_router(query: str) -> SchedulingRoute:
    """
    Invokes the Scheduling router to get a routing decision.

    Args:
        query: The user's input query.

    Returns:
        A SchedulingRoute object with the agent_name to route to.
    """
    logger.info(f"Routing query in SchedulingRouter: '{query[:100]}...'")
    try:
        route = await router_chain.ainvoke({"query": query})
        logger.info(f"Routing decision: {route.agent_name}")
        return route
    except Exception as e:
        logger.error(f"Error in SchedulingRouter: {e}", exc_info=True)
        # Fallback in case of a routing error
        return SchedulingRoute(agent_name="__self__")


__all__ = ["invoke_scheduling_router"]
