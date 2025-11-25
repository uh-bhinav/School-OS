import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.class_agent.main import ClassAgent, class_agent_instance
from app.agents.modules.academics.leaves.class_agent.tools import class_agent_tools

pytestmark = pytest.mark.asyncio

# --- Category A: Initialization Tests ---


def test_class_agent_initialization():
    """Tests that the ClassAgent initializes correctly."""
    assert isinstance(class_agent_instance, ClassAgent)
    assert class_agent_instance.llm_tier == "medium"


def test_class_agent_loads_tools():
    """Tests that the agent is configured with the correct 8 tools."""
    assert len(class_agent_tools) == 8
    tool_names = [tool.name for tool in class_agent_tools]
    assert "search_classes" in tool_names
    assert "get_students_in_class" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_students_in_class(mock_class_llm_invoke, mock_class_http_client):
    """
    Tests the critical two-step workflow:
    1. User gives class name ("10A")
    2. Agent calls search_classes(name="10A") -> gets class_id 15
    3. Agent calls get_students_in_class(class_id=15)
    [cite_start][cite: 155-161]
    """
    # 1. Setup Mock LLM: Define the two-step conversation
    query = "List all students in Class 10A"

    # Step 1: LLM decides to call 'search_classes'
    tool_call_1 = ToolCall(name="search_classes", args={"name": "10A"}, id="tool_123")

    # Step 3: LLM decides to call 'get_students_in_class'
    tool_call_2 = ToolCall(name="get_students_in_class", args={"class_id": 15}, id="tool_456")

    mock_class_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call_1]),  # 1. LLM calls search
        AIMessage(content="", tool_calls=[tool_call_2]),  # 2. LLM sees search result, calls get_students
        AIMessage(content="The students in 10A are Rohan and Priya."),  # 3. LLM gives final answer
    ]

    # 2. Setup Mock API
    # API response for 'search_classes'
    search_response = [{"class_id": 15, "name": "10A", "grade_level": 10}]
    # API response for 'get_students_in_class'
    students_response = [{"student_id": 101, "first_name": "Rohan"}, {"student_id": 102, "first_name": "Priya"}]
    mock_class_http_client.get.side_effect = [search_response, students_response]

    # 3. Invoke Agent
    result = await class_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Rohan" in result["response"]

    # Assert API was called correctly
    assert mock_class_http_client.get.call_count == 2
    mock_class_http_client.get.assert_any_call("/classes/search", params={"name": "10A"})
    mock_class_http_client.get.assert_any_call("/classes/15/students")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_attendance_query(mock_class_llm_invoke, mock_class_http_client):
    """
    Tests guardrail: ClassAgent MUST NOT answer attendance questions.
    [cite_start][cite: 167-168]
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What's the attendance for 9B today?"
    mock_response_text = "I manage class rosters. [cite_start]For detailed attendance, please ask the Attendance Agent."
    mock_class_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await class_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_class_llm_invoke.assert_called_once()
    assert mock_class_http_client.get.call_count == 0

    assert "Attendance Agent" in result["response"]
