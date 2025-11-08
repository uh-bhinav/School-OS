import logging

from langchain_core.prompts import ChatPromptTemplate

from app.agents.utils.llm_router import get_llm

from .core_curriculum_schemas import CoreCurriculumRoute

logger = logging.getLogger(__name__)

# 1. Define the System Prompt
SYSTEM_PROMPT = """
You are a highly efficient router for the "Core Curriculum" sub-module of an academics system.
Your *only* job is to classify the user's query and determine which specialized agent it should be routed to.

You must route to one of the following 5 agents based on their responsibilities:
- `AcademicYearAgent`: Manages school academic years (e.g., "current year", "2024-2025").
- `StudentAgent`: Manages student profiles, admission, and parent/contact information.
- `ClassAgent`: Manages class rosters and class-level assignments (e.g., "10A", "students in 10A").
- `SubjectAgent`: Manages academic subjects (e.g., "Physics", "teachers for Math").
- `TeacherAgent`: Manages teacher profiles, qualifications, and departments.

- If the query is a simple greeting ("hi", "hello") or a general question about this module ("what can you do?"), route to `__self__`.

Respond *only* with the JSON object matching the requested schema.
"""

# 2. Get the "fast" LLM, as recommended for routing
llm = get_llm("fast")

# 3. Create the prompt
prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", "{query}")])

# 4. Bind the structured output schema to the LLM
# This forces the LLM to *always* return a valid CoreCurriculumRoute JSON
llm_with_output = llm.with_structured_output(CoreCurriculumRoute)

# 5. Create the final routing chain
router_chain = prompt | llm_with_output


async def invoke_core_curriculum_router(query: str) -> CoreCurriculumRoute:
    """
    Invokes the Core Curriculum router to get a routing decision.

    Args:
        query: The user's input query.

    Returns:
        A CoreCurriculumRoute object with the agent_name to route to.
    """
    logger.info(f"Routing query in CoreCurriculumRouter: '{query[:100]}...'")
    try:
        route = await router_chain.ainvoke({"query": query})
        logger.info(f"Routing decision: {route.agent_name}")
        return route
    except Exception as e:
        logger.error(f"Error in CoreCurriculumRouter: {e}", exc_info=True)
        # Fallback in case of a routing error
        return CoreCurriculumRoute(agent_name="__self__")


__all__ = ["invoke_core_curriculum_router"]
