import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.timetable_agent.main import TimetableAgent, timetable_agent_instance
from app.agents.modules.academics.leaves.timetable_agent.tools import timetable_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_timetable_agent_initialization():
    """
    Tests that the TimetableAgent initializes correctly.
    """
    assert isinstance(timetable_agent_instance, TimetableAgent)
    assert timetable_agent_instance.llm_tier == "medium"


def test_timetable_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 6 tools.
    """
    assert len(timetable_agent_tools) == 6
    tool_names = [tool.name for tool in timetable_agent_tools]
    assert "get_my_timetable" in tool_names
    assert "get_class_schedule" in tool_names
    assert "generate_timetable_for_class" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_class_schedule(mock_timetable_llm_invoke, mock_timetable_http_client):
    """
    Tests the graph logic for 'get_class_schedule'.
    This is the "Happy Path" test for Dev 2's sprint.
    """
    # 1. Setup Mock LLM
    query = "Show me the schedule for 9B on 2025-11-10."

    # FIX: We must provide a Pydantic-compatible date string,
    # as the schema expects a 'date', not just any string.
    test_date_str = "2025-11-10"
    tool_args = {"class_name": "9B", "day": test_date_str}
    tool_call = ToolCall(name="get_class_schedule", args=tool_args, id="tool_123")

    mock_timetable_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here is the schedule for 9B: Period 1 is Physics.")]

    # 2. Setup Mock API
    mock_response = {"class_schedule": [{"period": 1, "subject_name": "Physics"}]}
    mock_timetable_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = timetable_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Physics" in result["response"]

    # Assert LLM was called
    assert mock_timetable_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    # The tool function converts the date object back to a string
    mock_timetable_http_client.get.assert_called_once_with("/timetable/class/9B", params={"day": test_date_str})


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_attendance_query(mock_timetable_llm_invoke, mock_timetable_http_client):
    """
    Tests guardrail: TimetableAgent MUST NOT answer attendance questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "Was Rohan present yesterday?"
    mock_response_text = "I manage schedules. For attendance records, please ask the Attendance Agent."
    mock_timetable_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = timetable_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_timetable_llm_invoke.assert_called_once()
    assert mock_timetable_http_client.get.call_count == 0

    assert "Attendance Agent" in result["response"]


async def test_guardrail_deflects_period_query(mock_timetable_llm_invoke, mock_timetable_http_client):
    """
    Tests guardrail: TimetableAgent MUST NOT answer period *definition* questions.
    """
    # 1. Setup Mock LLM
    query = "How long is the lunch break?"
    mock_response_text = "I manage the class schedules. For questions about period definitions, please ask the Period Agent."
    mock_timetable_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = timetable_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_timetable_llm_invoke.assert_called_once()
    assert mock_timetable_http_client.get.call_count == 0

    assert "Period Agent" in result["response"]
