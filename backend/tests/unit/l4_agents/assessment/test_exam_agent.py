from unittest.mock import AsyncMock

import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent and its prompt
from app.agents.modules.academics.leaves.exam_agent.main import ExamAgent, exam_agent_instance
from app.agents.modules.academics.leaves.exam_agent.tools import exam_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio

# --- Category A: Initialization Tests ---


def test_exam_agent_initialization():
    """
    Tests that the ExamAgent initializes correctly.
    """
    assert isinstance(exam_agent_instance, ExamAgent)
    assert exam_agent_instance.llm_tier == "medium"


def test_exam_agent_loads_tools():
    """
    Tests that the agent is configured with the correct tools.
    """
    assert len(exam_agent_tools) == 9
    tool_names = [tool.name for tool in exam_agent_tools]
    assert "list_all_exams" in tool_names
    assert "search_exams" in tool_names
    assert "search_exam_type" in tool_names
    assert "search_exam_by_name_and_class" in tool_names
    assert "delete_exam_from_class" in tool_names
    assert "get_exam_details" in tool_names
    assert "create_exam" in tool_names
    assert "update_exam" in tool_names
    assert "delete_exam" in tool_names


# --- Category B: Tool Selection (Routing) Tests ---


async def test_routes_to_list_all_exams(mock_llm_invoke, mock_http_client: AsyncMock):
    """
    Tests the full graph logic for 'list_all_exams'.
    """
    # 1. Setup Mock LLM: Force the LLM to call 'list_all_exams'
    query = "Show me all exams"
    tool_call = ToolCall(name="list_all_exams", args={}, id="tool_123")

    # The graph loops: first call makes tool call, second call after tool execution
    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here are all the exams in your school...")]

    # 2. Setup Mock API: Define what the API will return
    mock_response = [{"exam_id": 1, "exam_name": "Midterm 2025"}]
    mock_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert len(result["messages"]) > 0
    assert mock_llm_invoke.call_count >= 1
    mock_http_client.get.assert_called_once_with("/exams/")


async def test_routes_to_search_exams(mock_llm_invoke, mock_http_client: AsyncMock):
    """
    Tests the full graph logic for 'search_exams'.
    """
    # 1. Setup Mock LLM
    query = "When is the Midterm?"
    tool_args = {"name": "Midterm"}
    tool_call = ToolCall(name="search_exams", args=tool_args, id="tool_123")

    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="The Midterm exam is scheduled for...")]

    # 2. Setup Mock API
    mock_response = [{"exam_id": 22, "exam_name": "Class 10 Midterm"}]
    mock_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1
    mock_http_client.get.assert_called_once_with("/exams/search", params=tool_args)


async def test_routes_to_get_exam_details(mock_llm_invoke, mock_http_client: AsyncMock):
    """
    Tests the full graph logic for 'get_exam_details'.
    """
    # 1. Setup Mock LLM
    query = "Details for exam 45"
    tool_args = {"exam_id": 45}
    tool_call = ToolCall(name="get_exam_details", args=tool_args, id="tool_123")

    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here are the details for exam 45...")]

    # 2. Setup Mock API
    mock_response = {"exam_id": 45, "exam_name": "Physics Unit Test"}
    mock_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1
    mock_http_client.get.assert_called_once_with("/exams/45")


async def test_routes_to_create_exam(mock_llm_invoke, mock_http_client: AsyncMock):
    """
    Tests the full graph logic for 'create_exam'.
    """
    # 1. Setup Mock LLM
    query = "Create a new exam"
    tool_args = {"school_id": 1, "exam_name": "New Final", "exam_type_id": 2, "start_date": "2025-12-01", "end_date": "2025-12-05", "total_marks": 100.0, "academic_year_id": 3}
    tool_call = ToolCall(name="create_exam", args=tool_args, id="tool_123")

    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Successfully created the exam!")]

    # 2. Setup Mock API
    mock_response = {"exam_id": 101, **tool_args}
    mock_http_client.post.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1

    # The tool converts date objects to strings for the JSON payload
    expected_payload = tool_args.copy()
    expected_payload["start_date"] = str(tool_args["start_date"])
    expected_payload["end_date"] = str(tool_args["end_date"])

    mock_http_client.post.assert_called_once_with("/exams/", json=expected_payload)


async def test_routes_to_update_exam(mock_llm_invoke, mock_http_client: AsyncMock):
    """
    Tests the full graph logic for 'update_exam'.
    """
    # 1. Setup Mock LLM
    query = "Update exam 10"
    tool_args = {"exam_id": 10, "start_date": "2025-11-02"}
    tool_call = ToolCall(name="update_exam", args=tool_args, id="tool_123")

    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Successfully updated exam 10!")]

    # 2. Setup Mock API
    mock_response = {"exam_id": 10, "start_date": "2025-11-02"}
    mock_http_client.put.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1

    expected_payload = {"start_date": "2025-11-02"}  # Tool converts date
    mock_http_client.put.assert_called_once_with("/exams/10", json=expected_payload)


async def test_routes_to_delete_exam(mock_llm_invoke, mock_http_client):
    """
    Tests the full graph logic for 'delete_exam'.
    """
    # 1. Setup Mock LLM
    query = "Delete exam 12"
    tool_args = {"exam_id": 12}
    tool_call = ToolCall(name="delete_exam", args=tool_args, id="tool_123")

    mock_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Successfully deleted exam 12!")]

    # 2. Setup Mock API
    mock_http_client.delete.return_value = None  # Simulates 204 No Content

    # 3. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 4. Debug: Print what happened
    print(f"\nResult: {result}")
    print(f"LLM invoke called {mock_llm_invoke.call_count} times")
    print(f"HTTP delete called {mock_http_client.delete.call_count} times")
    print(f"Messages in result: {len(result.get('messages', []))}")
    if result.get("messages"):
        for i, msg in enumerate(result["messages"]):
            print(f"  Message {i}: {type(msg).__name__} - {getattr(msg, 'content', '')[:100]}")

    # 5. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1

    # Check if tools were actually called
    if mock_http_client.delete.call_count == 0:
        pytest.fail("Tool was never executed! Check if _call_tool is running.")

    mock_http_client.delete.assert_called_once_with("/exams/12")


# --- Category C: No-Tool Handling (Guardrails) ---


async def test_guardrail_deflects_marks_query(mock_llm_invoke):
    """
    Tests that a guardrail query returns a text response WITHOUT calling a tool.
    """
    # 1. Setup Mock LLM: This time, we force a *text* response with NO tool calls.
    query = "What marks did Rohan get?"
    mock_response_text = "I manage exam schedules. For student marks, please ask the Marks Agent."

    # Only one call needed - direct text response, no tools
    mock_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1
    assert "Marks Agent" in result["response"]


async def test_guardrail_deflects_exam_type_query(mock_llm_invoke):
    """
    Tests the second critical guardrail.
    """
    # 1. Setup Mock LLM: Force a text response.
    query = "Create a new exam type."
    mock_response_text = "I can only schedule exams. To create a new exam *type*, please ask the ExamType Agent."

    mock_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await exam_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    assert mock_llm_invoke.call_count >= 1
    assert "ExamType Agent" in result["response"]
