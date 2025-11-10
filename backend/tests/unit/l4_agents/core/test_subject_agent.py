import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.subject_agent.main import SubjectAgent, subject_agent_instance
from app.agents.modules.academics.leaves.subject_agent.tools import subject_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_subject_agent_initialization():
    """
    Tests that the SubjectAgent initializes correctly.
    """
    assert isinstance(subject_agent_instance, SubjectAgent)
    assert subject_agent_instance.llm_tier == "medium"


def test_subject_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 7 tools.
    """
    assert len(subject_agent_tools) == 7
    tool_names = [tool.name for tool in subject_agent_tools]
    assert "search_subjects" in tool_names
    assert "get_teachers_for_subject" in tool_names
    assert "create_subject" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_teachers_for_subject(mock_subject_llm_invoke, mock_subject_http_client):
    """
    Tests the critical two-step workflow from the prompt:
    1. User gives subject name ("Physics")
    2. Agent calls search_subjects(name="Physics") -> gets subject_id 42
    3. Agent calls get_teachers_for_subject(subject_id=42)
    """
    # 1. Setup Mock LLM: Define the two-step conversation
    query = "Who can teach Physics?"

    # Step 1: LLM decides to call 'search_subjects'
    tool_call_1 = ToolCall(name="search_subjects", args={"name": "Physics"}, id="tool_123")

    # Step 3: LLM decides to call 'get_teachers_for_subject'
    tool_call_2 = ToolCall(name="get_teachers_for_subject", args={"subject_id": 42}, id="tool_456")

    mock_subject_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call_1]),  # 1. LLM calls search
        AIMessage(content="", tool_calls=[tool_call_2]),  # 2. LLM sees search result, calls get_teachers
        AIMessage(content="Mrs. Priya and Mr. Raj can teach Physics."),  # 3. LLM gives final answer
    ]

    # 2. Setup Mock API
    # API response for 'search_subjects'
    search_response = [{"subject_id": 42, "name": "Physics", "category": "Science"}]
    # API response for 'get_teachers_for_subject'
    teachers_response = [{"teacher_id": 5, "first_name": "Priya"}, {"teacher_id": 6, "first_name": "Raj"}]
    mock_subject_http_client.get.side_effect = [search_response, teachers_response]

    # 3. Invoke Agent
    result = subject_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Priya" in result["response"]
    assert "Raj" in result["response"]

    # Assert API was called correctly
    assert mock_subject_http_client.get.call_count == 2
    mock_subject_http_client.get.assert_any_call("/subjects/search", params={"name": "Physics"})
    mock_subject_http_client.get.assert_any_call("/subjects/42/teachers")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_subject_llm_invoke, mock_subject_http_client):
    """
    Tests guardrail: SubjectAgent MUST NOT answer marks questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What marks did Rohan get in Physics?"
    mock_response_text = "I manage subjects. For marks, please ask the Marks Agent."
    mock_subject_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = subject_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True

    # 3a. CRITICAL: Assert the LLM was called.
    mock_subject_llm_invoke.assert_called_once()

    # 3b. CRITICAL: Assert *no* API calls were made.
    assert mock_subject_http_client.get.call_count == 0

    # 3c. CRITICAL: Assert the correct deflection response was given.
    assert "Marks Agent" in result["response"]
