import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.student_agent.main import StudentAgent, student_agent_instance
from app.agents.modules.academics.leaves.student_agent.tools import student_agent_tools

pytestmark = pytest.mark.asyncio

# --- Category A: Initialization Tests ---


def test_student_agent_initialization():
    """Tests that the StudentAgent initializes correctly."""
    assert isinstance(student_agent_instance, StudentAgent)
    assert student_agent_instance.llm_tier == "power"


def test_student_agent_loads_tools():
    """Tests that the agent is configured with the correct 12 tools."""
    assert len(student_agent_tools) == 13
    tool_names = [tool.name for tool in student_agent_tools]
    assert "search_students" in tool_names
    assert "admit_new_student" in tool_names
    assert "get_parent_contacts_for_student" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_parent_contacts(mock_student_llm_invoke, mock_student_http_client):
    """
    Tests the critical two-step workflow for the sprint plan:
    1. User gives student name ("Rohan Sharma")
    2. Agent calls search_students(name="Rohan Sharma") -> gets student_id 101
    3. Agent calls get_parent_contacts_for_student(student_id=101)
    """
    # 1. Setup Mock LLM: Define the two-step conversation
    query = "Find Rohan Sharma's parent contact info."

    tool_call_1 = ToolCall(name="search_students", args={"name": "Rohan Sharma"}, id="tool_123")
    tool_call_2 = ToolCall(name="get_parent_contacts_for_student", args={"student_id": 101}, id="tool_456")

    mock_student_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call_1]),  # 1. LLM calls search
        AIMessage(content="", tool_calls=[tool_call_2]),  # 2. LLM sees search result, calls get_contacts
        AIMessage(content="Rohan's parent is Suresh Sharma."),  # 3. LLM gives final answer
    ]

    # 2. Setup Mock API
    search_response = [{"student_id": 101, "first_name": "Rohan", "last_name": "Sharma"}]
    contacts_response = [{"name": "Suresh Sharma", "phone": "555-1234", "relationship_type": "Father"}]
    mock_student_http_client.get.side_effect = [search_response, contacts_response]

    # 3. Invoke Agent
    result = await student_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Suresh Sharma" in result["response"]

    # Assert API was called correctly
    assert mock_student_http_client.get.call_count == 2
    mock_student_http_client.get.assert_any_call("/students/search", params={"name": "Rohan Sharma"})
    mock_student_http_client.get.assert_any_call("/student-contacts/student/101")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_student_llm_invoke, mock_student_http_client):
    """
    Tests guardrail: StudentAgent MUST NOT answer detailed marks questions.
    [cite_start][cite: 547]
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What mark did Rohan get in Physics?"
    mock_response_text = "For detailed marks or grade entry, please ask the Marks Agent."
    mock_student_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await student_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_student_llm_invoke.assert_called_once()
    assert mock_student_http_client.get.call_count == 0

    assert "Marks Agent" in result["response"]


# --- Category D: Edge Case / Failure Tests ---


async def test_edge_case_handles_empty_search_result(mock_student_llm_invoke, mock_student_http_client):
    """
    Tests the edge case: What if 'search_students' finds no one?
    The agent should not crash and should report the empty result.
    """
    # 1. Setup Mock LLM: Define the two-step conversation
    query = "Find student 'John Smith'."

    # Step 1: LLM decides to call 'search_students'
    tool_call_1 = ToolCall(name="search_students", args={"name": "John Smith"}, id="tool_123")

    # Step 2: The tool will return 'count: 0'. The LLM synthesizes this.
    mock_response_text = "I'm sorry, I could not find any student named 'John Smith'."

    mock_student_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call_1]), AIMessage(content=mock_response_text)]  # 1. LLM calls search  # 2. LLM synthesizes the empty result

    # 2. Setup Mock API
    # The API returns an empty list
    search_response = []
    mock_student_http_client.get.return_value = search_response

    # 3. Invoke Agent
    result = await student_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "could not find any student" in result["response"]

    # Assert API was called
    mock_student_http_client.get.assert_called_once_with("/students/search", params={"name": "John Smith"})

    # Assert LLM was called twice
    assert mock_student_llm_invoke.call_count == 2
