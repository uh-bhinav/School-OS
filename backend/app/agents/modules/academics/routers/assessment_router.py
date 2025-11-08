import logging

from langchain_core.prompts import ChatPromptTemplate

from app.agents.utils.llm_router import get_llm

from .assessment_schemas import AssessmentRoute

logger = logging.getLogger(__name__)

# 1. Define the System Prompt
SYSTEM_PROMPT = """
You are a highly efficient router for the "Assessment & Grading" sub-module.
Your *only* job is to classify the user's query and determine which specialized agent it should be routed to.

You must route to one of the following 4 agents. Be very precise in your choice:

- `ExamTypeAgent`: Manages the *categories* of exams.
    (e.g., "Create a new 'Unit Test' type", "List all exam types")

- `ExamAgent`: Manages exam *schedules* and dates.
    (e.g., "When is the midterm?", "Schedule the final exams")

- `MarkAgent`: Manages the *entry, updating, and viewing* of individual marks and class analytics.
    (e.g., "Enter marks for 10A", "What did Rohan get in Physics?", "Show class performance")

- `ReportCardAgent`: Manages *final, compiled* report cards for a student or class.
    (e.g., "Get Rohan's report card for the year", "Download the class report cards")

- If the query is a simple greeting ("hi", "hello") or a general question about this module ("what can you do?"), route to `__self__`.

Respond *only* with the JSON object matching the requested schema.
"""

# 2. Get the "fast" LLM, as recommended for routing
llm = get_llm("fast")

# 3. Create the prompt
prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", "{query}")])

# 4. Bind the structured output schema to the LLM
llm_with_output = llm.with_structured_output(AssessmentRoute)

# 5. Create the final routing chain
router_chain = prompt | llm_with_output


async def invoke_assessment_router(query: str) -> AssessmentRoute:
    """
    Invokes the Assessment router to get a routing decision.

    Args:
        query: The user's input query.

    Returns:
        An AssessmentRoute object with the agent_name to route to.
    """
    logger.info(f"Routing query in AssessmentRouter: '{query[:100]}...'")
    try:
        route = await router_chain.ainvoke({"query": query})
        logger.info(f"Routing decision: {route.agent_name}")
        return route
    except Exception as e:
        logger.error(f"Error in AssessmentRouter: {e}", exc_info=True)
        # Fallback in case of a routing error
        return AssessmentRoute(agent_name="__self__")


__all__ = ["invoke_assessment_router"]
