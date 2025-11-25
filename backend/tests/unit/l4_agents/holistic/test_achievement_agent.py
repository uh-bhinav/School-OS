import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.achievement_agent.main import AchievementAgent, achievement_agent_instance
from app.agents.modules.academics.leaves.achievement_agent.tools import achievement_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_achievement_agent_initialization():
    """
    Tests that the AchievementAgent initializes correctly.
    """
    assert isinstance(achievement_agent_instance, AchievementAgent)
    assert achievement_agent_instance.llm_tier == "medium"


def test_achievement_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 5 tools.
    """
    assert len(achievement_agent_tools) == 5
    tool_names = [tool.name for tool in achievement_agent_tools]
    assert "get_unverified_achievements_list" in tool_names
    assert "verify_achievement" in tool_names
    assert "add_student_achievement" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_unverified_list(mock_achievement_llm_invoke, mock_achievement_http_client):
    """
    Tests the Admin "Review" step from the prompt's workflow.
    """
    # 1. Setup Mock LLM
    query = "Show me all achievements I need to approve."
    tool_call = ToolCall(name="get_unverified_achievements_list", args={}, id="tool_123")

    mock_achievement_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="You have 1 item to review: 'State Debate Win' (ID 42).")]

    # 2. Setup Mock API
    mock_response = [{"achievement_id": 42, "title": "State Debate Win", "student_name": "Rohan"}]
    mock_achievement_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await achievement_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "State Debate Win" in result["response"]
    assert "ID 42" in result["response"]

    # Assert LLM was called
    assert mock_achievement_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_achievement_http_client.get.assert_called_once_with("/achievements/unverified")


async def test_happy_path_verify_achievement(mock_achievement_llm_invoke, mock_achievement_http_client):
    """
    Tests the Admin "Verify" step from the prompt's workflow.
    """
    # 1. Setup Mock LLM
    query = "Okay, verify achievement ID 42."
    tool_args = {"achievement_id": 42}
    tool_call = ToolCall(name="verify_achievement", args=tool_args, id="tool_456")

    mock_achievement_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Achievement 42 has been verified.")]

    # 2. Setup Mock API
    mock_response = {"achievement_id": 42, "verified": True, "title": "State Debate Win"}
    mock_achievement_http_client.post.return_value = mock_response

    # 3. Invoke Agent
    result = await achievement_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "verified" in result["response"]

    # Assert API was called correctly by the tool
    mock_achievement_http_client.post.assert_called_once_with("/achievements/verify/42")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_achievement_llm_invoke, mock_achievement_http_client):
    """
    Tests guardrail: AchievementAgent MUST NOT answer academic marks questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "How many points did I get in Maths?"
    mock_response_text = "I manage co-curricular achievements. For academic grades, please ask the Mark Agent."
    mock_achievement_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await achievement_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_achievement_llm_invoke.assert_called_once()
    assert mock_achievement_http_client.get.call_count == 0

    assert "Mark Agent" in result["response"]
    assert "co-curricular" in result["response"]
