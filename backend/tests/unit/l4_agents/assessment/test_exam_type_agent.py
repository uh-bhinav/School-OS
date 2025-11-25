import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.exam_type_agent.main import ExamTypeAgent, exam_type_agent_instance
from app.agents.modules.academics.leaves.exam_type_agent.tools import exam_type_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_exam_type_agent_initialization():
    """
    Tests that the ExamTypeAgent initializes correctly.
    """
    assert isinstance(exam_type_agent_instance, ExamTypeAgent)
    # Prompt says it uses 'fast' tier
    assert exam_type_agent_instance.llm_tier == "fast"


def test_exam_type_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 5 tools.
    """
    assert len(exam_type_agent_tools) == 5
    tool_names = [tool.name for tool in exam_type_agent_tools]
    assert "list_exam_types" in tool_names
    assert "create_exam_type" in tool_names
    assert "delete_exam_type" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_list_exam_types(mock_exam_type_llm_invoke, mock_exam_type_http_client):
    """
    Tests the graph logic for 'list_exam_types'.
    We follow the 'side_effect' pattern for the graph loop.
    """
    # 1. Setup Mock LLM: Force the LLM to call 'list_exam_types'
    query = "List all our exam types."
    tool_call = ToolCall(name="list_exam_types", args={}, id="tool_123")

    mock_exam_type_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here are the types: Midterm, Final.")]  # 1. LLM calls tool  # 2. LLM gives final answer

    # 2. Setup Mock API
    mock_response = [{"exam_type_id": 1, "type_name": "Midterm"}, {"exam_type_id": 2, "type_name": "Final"}]
    mock_exam_type_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_type_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Midterm, Final" in result["response"]

    # Assert LLM was called (at least once, usually twice)
    assert mock_exam_type_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_exam_type_http_client.get.assert_called_once_with("/exam-types/")


async def test_happy_path_create_exam_type(mock_exam_type_llm_invoke, mock_exam_type_http_client):
    """
    Tests the graph logic for 'create_exam_type'.
    """
    # 1. Setup Mock LLM
    query = "Create a new exam type called 'Quiz' for school 1."
    tool_args = {"school_id": 1, "type_name": "Quiz"}
    tool_call = ToolCall(name="create_exam_type", args=tool_args, id="tool_456")

    mock_exam_type_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="The 'Quiz' exam type was created.")]

    # 2. Setup Mock API
    mock_response = {"exam_type_id": 3, "school_id": 1, "type_name": "Quiz"}
    mock_exam_type_http_client.post.return_value = mock_response

    # 3. Invoke Agent
    result = await exam_type_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Quiz" in result["response"]

    # Assert API was called correctly by the tool
    mock_exam_type_http_client.post.assert_called_once_with("/exam-types/", json=tool_args)


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_exam_schedule_query(mock_exam_type_llm_invoke, mock_exam_type_http_client):
    """
    Tests guardrail: ExamTypeAgent MUST NOT answer exam *schedule* questions.
    We use 'return_value' for this single-shot response.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "When is the Midterm?"
    mock_response_text = "I only manage the *categories* of exams. For exam schedules, please ask the Exam Agent."
    mock_exam_type_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await exam_type_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True

    # 3a. CRITICAL: Assert the LLM was called.
    mock_exam_type_llm_invoke.assert_called_once()

    # 3b. CRITICAL: Assert *no* API calls were made.
    assert mock_exam_type_http_client.get.call_count == 0
    assert mock_exam_type_http_client.post.call_count == 0

    # 3c. CRITICAL: Assert the correct deflection response was given.
    assert "Exam Agent" in result["response"]
    assert "schedules" in result["response"]


# --- Category D: Edge Case / Failure Tests ---


async def test_edge_case_handles_tool_api_error_gracefully(mock_exam_type_llm_invoke, mock_exam_type_http_client):
    """
    Tests that the agent GRACEFULLY handles a 500 Internal Server Error
    from the tool, and the LLM synthesizes a user-friendly error.
    """
    # 1. Setup Mock LLM
    query = "List all our exam types."
    tool_call = ToolCall(name="list_exam_types", args={}, id="tool_123")

    mock_exam_type_llm_invoke.side_effect = [
        AIMessage(content="", tool_calls=[tool_call]),
        # This is the 2nd call, after the graph gets the ToolMessage
        # containing the "500 Internal Server Error"
        AIMessage(content="I'm sorry, I couldn't retrieve the list of exam types due to a server error."),
    ]

    # 2. Setup Mock API: Force the 'get' call to raise a server error
    mock_exam_type_http_client.get.side_effect = Exception("500 Internal Server Error")

    # 3. Invoke Agent
    result = await exam_type_agent_instance.ainvoke(query)

    # 4. Assertions
    # FIX: The agent's invoke method *succeeds* because the graph handled the error.
    assert result["success"] is True

    # We check that the *final response* contains the error message
    # synthesized by the LLM in its second call.
    assert "due to a server error" in result["response"]

    # Assert the API was called (and failed)
    mock_exam_type_http_client.get.assert_called_once_with("/exam-types/")

    # Assert the LLM was called twice (once to call tool, once to process error)
    assert mock_exam_type_llm_invoke.call_count == 2


async def test_edge_case_handles_llm_failure_gracefully(mock_exam_type_llm_invoke):
    """
    Tests that the agent's BaseAgent catches an LLM failure,
    handles it, and the agent's invoke() still succeeds.
    """
    # 1. Setup Mock LLM: Force the LLM mock itself to raise an Exception
    query = "List all our exam types."
    mock_exam_type_llm_invoke.side_effect = Exception("Catastrophic LLM Failure")

    # 2. Invoke Agent
    result = await exam_type_agent_instance.ainvoke(query)

    # 4. Assertions
    # FIX: The agent's own invoke() method succeeds...
    assert result["success"] is True

    # ...and the final response to the user is the error
    # message synthesized by the BaseAgent._call_model's except block.
    response_text = result["response"]
    assert "I encountered an error" in response_text
    assert "Catastrophic LLM Failure" in response_text
