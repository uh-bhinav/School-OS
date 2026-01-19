import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.period_agent.main import (
    PeriodAgent,
    period_agent_instance,
)
from app.agents.modules.academics.leaves.period_agent.tools import period_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_period_agent_initialization():
    """
    Tests that the PeriodAgent initializes correctly.
    """
    assert isinstance(period_agent_instance, PeriodAgent)
    assert period_agent_instance.llm_tier == "medium"


def test_period_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 3 tools.
    """
    assert len(period_agent_tools) == 3
    tool_names = [tool.name for tool in period_agent_tools]
    assert "list_periods" in tool_names
    assert "create_period_structure" in tool_names
    assert "update_period_timing" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_list_periods(mock_period_llm_invoke, mock_period_http_client):
    """
    Tests the graph logic for 'list_periods'.
    """
    # 1. Setup Mock LLM
    query = "What are the school's period timings?"
    tool_call = ToolCall(name="list_periods", args={}, id="tool_123")

    mock_period_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call]),
        AIMessage(content="Period 1 is 09:00-09:40."),
    ]

    # 2. Setup Mock API
    mock_response = [
        {
            "period_number": 1,
            "name": "Period 1",
            "start_time": "09:00",
            "end_time": "09:40",
        }
    ]
    mock_period_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await period_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "09:00-09:40" in result["response"]

    # Assert LLM was called
    assert mock_period_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_period_http_client.get.assert_called_once_with("/periods/", params={})


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_timetable_query(mock_period_llm_invoke, mock_period_http_client):
    """
    Tests guardrail: PeriodAgent MUST NOT answer schedule questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What class is in Period 2?"
    mock_response_text = "I manage the period timings. For class schedules, please ask the Timetable Agent."
    mock_period_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await period_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_period_llm_invoke.assert_called_once()
    assert mock_period_http_client.get.call_count == 0

    assert "Timetable Agent" in result["response"]
