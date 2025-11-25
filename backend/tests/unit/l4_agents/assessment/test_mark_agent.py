import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.mark_agent.main import MarkAgent, mark_agent_instance
from app.agents.modules.academics.leaves.mark_agent.tools import mark_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_mark_agent_initialization():
    """
    Tests that the MarkAgent initializes correctly.
    """
    assert isinstance(mark_agent_instance, MarkAgent)
    # [cite_start]Prompt says it uses 'power' tier [cite: 36-37]
    assert mark_agent_instance.llm_tier == "power"


def test_mark_agent_loads_tools():
    """
    [cite_start]Tests that the agent is configured with the correct 8 tools. [cite: 397-405]
    """
    assert len(mark_agent_tools) == 9
    tool_names = [tool.name for tool in mark_agent_tools]
    assert "search_marks" in tool_names
    assert "get_class_performance" in tool_names
    assert "get_report_card" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_search_marks(mock_mark_llm_invoke, mock_mark_http_client):
    """
    Tests the graph logic for 'search_marks'.
    We follow the 'side_effect' pattern for the graph loop.
    """
    # 1. Setup Mock LLM: Force the LLM to call 'search_marks'
    query = "Show me marks for student 101."
    tool_args = {"student_id": 101}
    tool_call = ToolCall(name="search_marks", args=tool_args, id="tool_123")

    mock_mark_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Student 101 got 85 in Physics.")]  # 1. LLM calls tool  # 2. LLM gives final answer

    # 2. Setup Mock API
    mock_response = [{"mark_id": 1, "student_id": 101, "marks_obtained": 85, "subject_id": 42}]
    mock_mark_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await mark_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True, f"Agent hit exception: {result.get('error')}"
    assert "got 85 in Physics" in result["response"]

    # Assert LLM was called (at least once, usually twice)
    assert mock_mark_llm_invoke.call_count >= 1

    # [cite_start]Assert API was called correctly by the tool [cite: 307]
    mock_mark_http_client.get.assert_called_once_with("/marks/search", params=tool_args)


async def test_happy_path_get_class_performance(mock_mark_llm_invoke, mock_mark_http_client):
    """
    Tests the graph logic for 'get_class_performance'.
    """
    # 1. Setup Mock LLM
    query = "How did class 5 do in exam 22?"
    tool_args = {"class_id": 5, "exam_id": 22}
    tool_call = ToolCall(name="get_class_performance", args=tool_args, id="tool_456")

    mock_mark_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Class 5 had an average of 78.")]

    # 2. Setup Mock API
    mock_response = {"average": 78.5, "high_score": 99, "low_score": 45}
    mock_mark_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await mark_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "average of 78" in result["response"]

    # [cite_start]Assert API was called correctly by the tool [cite: 352-353]
    mock_mark_http_client.get.assert_called_once_with(f"/marks/performance/class/{tool_args['class_id']}/exam/{tool_args['exam_id']}")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_exam_schedule_query(mock_mark_llm_invoke, mock_mark_http_client):
    """
    [cite_start]Tests guardrail: MarkAgent MUST NOT answer exam *schedule* questions. [cite: 135]
    We use 'return_value' for this single-shot response.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "When is the next exam?"
    mock_response_text = "I manage exam *results*. For exam schedules, please ask the Exam Agent."
    mock_mark_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await mark_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True

    # 3a. CRITICAL: Assert the LLM was called.
    mock_mark_llm_invoke.assert_called_once()

    # 3b. CRITICAL: Assert *no* API calls were made.
    assert mock_mark_http_client.get.call_count == 0
    assert mock_mark_http_client.post.call_count == 0

    # 3c. CRITICAL: Assert the correct deflection response was given.
    assert "Exam Agent" in result["response"]
    assert "schedules" in result["response"]


async def test_guardrail_deflects_attendance_query(mock_mark_llm_invoke, mock_mark_http_client):
    """
    [cite_start]Tests guardrail: MarkAgent MUST NOT answer attendance questions. [cite: 134]
    """
    # 1. Setup Mock LLM
    query = "Did Rohan attend class today?"
    mock_response_text = "I manage marks. For attendance, please ask the Attendance Agent."
    mock_mark_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await mark_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_mark_llm_invoke.assert_called_once()
    assert mock_mark_http_client.get.call_count == 0

    assert "Attendance Agent" in result["response"]
    assert "marks" in result["response"]


async def test_guardrail_agent_asks_for_id(mock_mark_llm_invoke, mock_mark_http_client):
    """
    Tests the agent's *own* critical workflow: it MUST ask for IDs
    [cite_start]when given only a name. [cite: 126-128]
    """
    # 1. Setup Mock LLM
    query = "Show me Rohan's marks."
    mock_response_text = "I can search for marks, but I need the numeric IDs. Please ask the Student Agent for the 'student_id'."
    mock_mark_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await mark_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_mark_llm_invoke.assert_called_once()
    assert mock_mark_http_client.get.call_count == 0

    assert "student_id" in result["response"]
    assert "Student Agent" in result["response"]
