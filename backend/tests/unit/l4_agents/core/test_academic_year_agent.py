import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the specific error we want to simulate
from app.agents.http_client import AgentAuthenticationError

# Import the agent we are testing
from app.agents.modules.academics.leaves.academic_year_agent.main import AcademicYearAgent, academic_year_agent_instance
from app.agents.modules.academics.leaves.academic_year_agent.tools import academic_year_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_academic_year_agent_initialization():
    """
    Tests that the AcademicYearAgent initializes correctly.
    """
    assert isinstance(academic_year_agent_instance, AcademicYearAgent)
    assert academic_year_agent_instance.llm_tier == "medium"


def test_academic_year_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 6 tools.
    """
    assert len(academic_year_agent_tools) == 6
    tool_names = [tool.name for tool in academic_year_agent_tools]
    assert "get_active_academic_year" in tool_names
    assert "create_academic_year" in tool_names
    assert "set_active_academic_year" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_active_year(mock_academic_year_llm_invoke, mock_academic_year_http_client):
    """
    Tests the graph logic for 'get_active_academic_year'.
    This is the simplest happy path.
    """
    # 1. Setup Mock LLM: Force the LLM to call 'get_active_academic_year'
    query = "What's the current academic year?"
    tool_call = ToolCall(name="get_active_academic_year", args={}, id="tool_123")

    mock_academic_year_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="The current active year is 2025-2026.")]  # 1. LLM calls tool  # 2. LLM gives final answer

    # 2. Setup Mock API
    mock_response = {"id": 1, "name": "2025-2026", "is_active": True}
    mock_academic_year_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await academic_year_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "2025-2026" in result["response"]

    # Assert LLM was called (at least once, usually twice)
    assert mock_academic_year_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_academic_year_http_client.get.assert_called_once_with("/academic-years/active")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_academic_year_llm_invoke, mock_academic_year_http_client):
    """
    Tests guardrail: AcademicYearAgent MUST NOT answer marks questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What marks did Rohan get?"
    mock_response_text = "I manage academic years. For marks, please ask the Marks Agent."
    mock_academic_year_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await academic_year_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True

    # 3a. CRITICAL: Assert the LLM was called.
    mock_academic_year_llm_invoke.assert_called_once()

    # 3b. CRITICAL: Assert *no* API calls were made.
    assert mock_academic_year_http_client.get.call_count == 0

    # 3c. CRITICAL: Assert the correct deflection response was given.
    assert "Marks Agent" in result["response"]


# --- Category D: Edge Case / Failure Tests ---


async def test_edge_case_handles_auth_error_403(mock_academic_year_llm_invoke, mock_academic_year_http_client):
    """
    Tests our first "Skipped Edge Case": Authentication.
    We test that the agent gracefully handles a 403 Forbidden error
    from an Admin-only tool, as required by its prompt.
    """
    # 1. Setup Mock LLM: Force the LLM to call 'create_academic_year'
    query = "Create a new year '2026-2027' for school 1"
    tool_args = {"school_id": 1, "name": "2026-2027", "start_date": "2026-06-01", "end_date": "2027-05-31"}
    tool_call = ToolCall(name="create_academic_year", args=tool_args, id="tool_456")

    # The LLM's second call will be to synthesize the 403 error
    final_error_response = "I'm sorry, but you do not have 'Admin' permissions to perform this action."

    mock_academic_year_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content=final_error_response)]  # 1. LLM calls tool  # 2. LLM synthesizes the error

    # 2. Setup Mock API: Force the 'post' call to raise a 403 error
    mock_academic_year_http_client.post.side_effect = AgentAuthenticationError("Insufficient permissions", status_code=403)

    # 3. Invoke Agent
    result = await academic_year_agent_instance.ainvoke(query)

    # 4. Assertions
    # The graph succeeds because the error was handled gracefully
    assert result["success"] is True

    # Assert the final response is the correct, user-friendly error
    assert "Admin' permissions" in result["response"]

    # Assert the API was called (and failed)
    mock_academic_year_http_client.post.assert_called_once()

    # Assert the LLM was called twice (once to call tool, once to process error)
    assert mock_academic_year_llm_invoke.call_count == 2
