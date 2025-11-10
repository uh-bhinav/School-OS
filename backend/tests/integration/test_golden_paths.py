import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolCall, ToolMessage

# Import L3 schema for type hints
# Import the L1 instance we are testing
from app.agents.root_orchestrator.main import root_orchestrator_instance

pytestmark = pytest.mark.asyncio


@pytest.fixture
def full_e2e_mocks(mock_l1_llm_invoke, mock_l2_llm_invoke, mock_l3_assessment_llm_ainvoke, mock_l4_mark_llm_invoke, mock_l4_mark_http_client):
    """A helper fixture to combine all mocks for a clean test signature."""
    return {
        "l1_llm": mock_l1_llm_invoke,
        "l2_llm": mock_l2_llm_invoke,
        "l3_llm": mock_l3_assessment_llm_ainvoke,
        "l4_llm": mock_l4_mark_llm_invoke,
        "l4_http": mock_l4_mark_http_client,
    }


async def test_e2e_marks_query_golden_path(full_e2e_mocks):
    """
    Tests the full "golden path" for a marks query:
    L1 -> L2 -> L3 -> L4 -> API
    """
    query = "What are Rohan's marks for student_id 101?"

    # --- 1. Configure all Mocks (Bottom-up) ---

    # L4 HTTP: Mock the final API database call
    api_response = [{"mark_id": 1, "student_id": 101, "marks_obtained": 85, "subject_id": 42}]
    full_e2e_mocks["l4_http"].get.return_value = api_response

    # L4 LLM (MarkAgent): Synthesizes the final answer
    l4_tool_call = ToolCall(name="search_marks", args={"student_id": 101}, id="l4_tool")
    l4_final_response = "Rohan got 85 in Physics."  # The golden string

    # FIX: Update L4 mock callable signature
    def l4_mock_callable(messages_list, *, tools=None, **kwargs):
        last_message = messages_list[-1]
        if isinstance(last_message, HumanMessage):
            return AIMessage(content="", tool_calls=[l4_tool_call])  # 1. Use tool
        if isinstance(last_message, ToolMessage):
            return AIMessage(content=l4_final_response)  # 2. Synthesize
        return AIMessage(content="L4 Fallback Error")

    full_e2e_mocks["l4_llm"].side_effect = l4_mock_callable

    # L3 LLM (Router): Just returns the route
    l3_tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "MarkAgent"}, id="l3_tool")
    full_e2e_mocks["l3_llm"].return_value = AIMessage(content="", tool_calls=[l3_tool_call])

    # L2 LLM (Academics): Needs to *pass through* the L4 response
    l2_tool_call = ToolCall(name="assessment_tool", args={"query": query}, id="l2_tool")

    # FIX: Update L2 mock callable signature to accept 'tools' kwarg
    def l2_mock_callable(messages_list, *, tools=None, **kwargs):
        last_message = messages_list[-1]
        if isinstance(last_message, HumanMessage):
            # First call from user
            return AIMessage(content="", tool_calls=[l2_tool_call])
        if isinstance(last_message, ToolMessage):
            # Second call, after L4 ran
            # last_message.content is "{'response': 'Rohan got 85...', ...}"
            # A simple str() conversion is safer than json.loads
            tool_content_str = str(last_message.content)
            return AIMessage(content=tool_content_str)  # Pass up the raw ToolMessage content
        return AIMessage(content="L2 Fallback Error")

    full_e2e_mocks["l2_llm"].side_effect = l2_mock_callable

    # L1 LLM (Root): Needs to *pass through* the L2 response
    l1_tool_call = ToolCall(name="academics_tool", args={"query": query}, id="l1_tool")

    # FIX: Update L1 mock callable signature to accept 'tools' kwarg
    def l1_mock_callable(messages_list, *, tools=None, **kwargs):
        last_message = messages_list[-1]
        if isinstance(last_message, HumanMessage):
            # First call from user
            return AIMessage(content="", tool_calls=[l1_tool_call])
        if isinstance(last_message, ToolMessage):
            # Second call, after L2 ran
            # last_message.content is "{'response': 'Rohan got 85...', ...}"
            tool_content_str = str(last_message.content)
            # This is the final synthesis step. We need to extract the response.
            if "Rohan got 85 in Physics" in tool_content_str:
                return AIMessage(content="Rohan got 85 in Physics.")
            else:
                # If the tool output was complex, just echo it
                return AIMessage(content=tool_content_str)
        return AIMessage(content="L1 Fallback Error")

    full_e2e_mocks["l1_llm"].side_effect = l1_mock_callable

    # --- 2. Invoke the L1 Root Orchestrator ---
    result = root_orchestrator_instance.invoke(query)

    # --- 3. Assertions ---
    assert result["success"] is True, f"Agent hit exception: {result.get('error')}"

    # 3a. CRITICAL: Check the final user-facing response.
    assert "Rohan got 85 in Physics" in result["response"]

    # 3b. Verify L1 LLM was called twice (route, then synthesize)
    assert full_e2e_mocks["l1_llm"].call_count == 2

    # 3c. Verify L2 LLM was called twice (route, then synthesize)
    assert full_e2e_mocks["l2_llm"].call_count == 2

    # 3d. Verify L3 Router LLM was called once
    full_e2e_mocks["l3_llm"].assert_called_once()

    # 3e. Verify L4 LLM was called twice (route, then synthesize)
    assert full_e2e_mocks["l4_llm"].call_count == 2

    # 3f. CRITICAL: Verify the final API call was correct
    full_e2e_mocks["l4_http"].get.assert_called_once_with("/marks/search", params={"student_id": 101})
