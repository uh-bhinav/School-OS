import pytest
from langchain_core.messages import AIMessage, ToolCall

# Function we are testing
from app.agents.modules.academics.routers.assessment_router import invoke_assessment_router

# Schema for type hints
from app.agents.modules.academics.routers.assessment_schemas import AssessmentRoute

pytestmark = pytest.mark.asyncio


async def test_route_to_exam_agent(mock_assessment_llm_ainvoke):
    """
    Tests Happy Path: Query for 'exam schedules' routes to ExamAgent.
    """
    query = "When is the midterm?"

    # 1. Setup Mock: Tell the LLM mock to return "ExamAgent"
    tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "ExamAgent"}, id="tool_123")
    mock_assessment_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: AssessmentRoute = await invoke_assessment_router(query)

    # 3. Assert
    assert route.agent_name == "ExamAgent"
    mock_assessment_llm_ainvoke.assert_called_once()


async def test_route_to_mark_agent(mock_assessment_llm_ainvoke):
    """
    Tests Happy Path: Query for 'student marks' routes to MarkAgent.
    """
    query = "What did Rohan get in Physics?"

    # 1. Setup Mock
    tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "MarkAgent"}, id="tool_123")
    mock_assessment_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: AssessmentRoute = await invoke_assessment_router(query)

    # 3. Assert
    assert route.agent_name == "MarkAgent"
    mock_assessment_llm_ainvoke.assert_called_once()


async def test_route_to_report_card_agent(mock_assessment_llm_ainvoke):
    """
    Tests Happy Path: Query for 'report cards' routes to ReportCardAgent.
    """
    query = "Get Rohan's report card for the year"

    # 1. Setup Mock
    tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "ReportCardAgent"}, id="tool_123")
    mock_assessment_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: AssessmentRoute = await invoke_assessment_router(query)

    # 3. Assert
    assert route.agent_name == "ReportCardAgent"
    mock_assessment_llm_ainvoke.assert_called_once()


async def test_guardrail_route_wrong_module(mock_assessment_llm_ainvoke):
    """
    Tests Guardrail: A query for a *different* module (Core)
    should be routed to '__self__'.
    """
    query = "Who is in Class 10A?"  # This is a CoreCurriculum query

    # 1. Setup Mock
    tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "__self__"}, id="tool_123")
    mock_assessment_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: AssessmentRoute = await invoke_assessment_router(query)

    # 3. Assert
    assert route.agent_name == "__self__"
    mock_assessment_llm_ainvoke.assert_called_once()
