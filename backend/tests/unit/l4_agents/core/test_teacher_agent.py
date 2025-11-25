import pytest
from langchain_core.messages import AIMessage, ToolCall

from app.agents.http_client import AgentAuthenticationError

# Import the agent we are testing
from app.agents.modules.academics.leaves.teacher_agent.main import TeacherAgent, teacher_agent_instance
from app.agents.modules.academics.leaves.teacher_agent.tools import teacher_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_teacher_agent_initialization():
    """
    Tests that the TeacherAgent initializes correctly.
    """
    assert isinstance(teacher_agent_instance, TeacherAgent)
    assert teacher_agent_instance.llm_tier == "medium"


def test_teacher_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 6 tools.
    """
    assert len(teacher_agent_tools) == 6
    tool_names = [tool.name for tool in teacher_agent_tools]
    assert "search_teachers" in tool_names
    assert "get_teacher_qualifications" in tool_names
    assert "deactivate_teacher" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_teacher_qualifications(mock_teacher_llm_invoke, mock_teacher_http_client):
    """
    Tests the critical two-step workflow from the prompt:
    1. User gives teacher name ("Priya Sharma")
    2. Agent calls search_teachers(name="Priya Sharma") -> gets teacher_id 12
    3. Agent calls get_teacher_qualifications(teacher_id=12)
    """
    # 1. Setup Mock LLM: Define the two-step conversation
    query = "What are Priya Sharma's qualifications?"

    # Step 1: LLM decides to call 'search_teachers'
    tool_call_1 = ToolCall(name="search_teachers", args={"name": "Priya Sharma"}, id="tool_123")

    # Step 3: LLM decides to call 'get_teacher_qualifications'
    tool_call_2 = ToolCall(name="get_teacher_qualifications", args={"teacher_id": 12}, id="tool_456")

    mock_teacher_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call_1]),  # 1. LLM calls search
        AIMessage(content="", tool_calls=[tool_call_2]),  # 2. LLM sees search result, calls get_qualifications
        AIMessage(content="Priya Sharma has a PhD in Physics."),  # 3. LLM gives final answer
    ]

    # 2. Setup Mock API
    # API response for 'search_teachers'
    search_response = [{"teacher_id": 12, "profile": {"first_name": "Priya", "last_name": "Sharma"}}]
    # API response for 'get_teacher_qualifications'
    qualifications_response = {"degree": "PhD in Physics", "years_of_experience": 10}
    mock_teacher_http_client.get.side_effect = [search_response, qualifications_response]

    # 3. Invoke Agent
    result = await teacher_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "PhD in Physics" in result["response"]

    # Assert API was called correctly
    assert mock_teacher_http_client.get.call_count == 2
    mock_teacher_http_client.get.assert_any_call("/teachers/search", params={"name": "Priya Sharma"})
    mock_teacher_http_client.get.assert_any_call("/teachers/12/qualifications")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_schedule_query(mock_teacher_llm_invoke, mock_teacher_http_client):
    """
    Tests guardrail: TeacherAgent MUST NOT answer schedule questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What is Priya Sharma's schedule on Monday?"
    mock_response_text = "I manage teacher profiles. For schedule details, please ask the Timetable Agent."
    mock_teacher_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await teacher_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True

    # 3a. CRITICAL: Assert the LLM was called.
    mock_teacher_llm_invoke.assert_called_once()

    # 3b. CRITICAL: Assert *no* API calls were made.
    assert mock_teacher_http_client.get.call_count == 0

    # 3c. CRITICAL: Assert the correct deflection response was given.
    assert "Timetable Agent" in result["response"]


# --- Category D: Edge Case / Failure Tests ---


async def test_edge_case_handles_auth_error_403(mock_teacher_llm_invoke, mock_teacher_http_client):
    """
    Tests the Authentication edge case.
    We simulate a non-Admin user trying to use an Admin-only tool.
    The agent MUST handle the 403 error and return the specific
    response from its prompt.
    """
    # 1. Setup Mock LLM
    query = "Show me all the teachers."
    tool_call = ToolCall(name="list_all_teachers", args={}, id="tool_auth_123")

    # This is the *exact* user-facing response required by the prompt
    final_error_response = "I'm sorry, but you do not have 'Admin' permissions to perform this action."

    mock_teacher_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content=final_error_response)]  # 1. LLM calls the admin tool  # 2. LLM synthesizes the 403 error

    # 2. Setup Mock API: Force the 'get' call to raise a 403 error
    mock_teacher_http_client.get.side_effect = AgentAuthenticationError("Insufficient permissions", status_code=403)

    # 3. Invoke Agent
    result = await teacher_agent_instance.ainvoke(query)

    # 4. Assertions
    # The graph *succeeds* because the BaseAgent handled the error gracefully
    assert result["success"] is True

    # Assert the final response is the correct, user-friendly error
    assert "'Admin' permissions" in result["response"]
    assert "I'm sorry" in result["response"]

    # Assert the API was called (and failed)
    mock_teacher_http_client.get.assert_called_once_with("/teachers/")

    # Assert the LLM was called twice (once to call tool, once to process error)
    assert mock_teacher_llm_invoke.call_count == 2
