import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.leaderboard_agent.main import LeaderboardAgent, leaderboard_agent_instance
from app.agents.modules.academics.leaves.leaderboard_agent.tools import leaderboard_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_leaderboard_agent_initialization():
    """
    Tests that the LeaderboardAgent initializes correctly.
    """
    assert isinstance(leaderboard_agent_instance, LeaderboardAgent)
    assert leaderboard_agent_instance.llm_tier == "medium"


def test_leaderboard_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 4 tools.
    """
    assert len(leaderboard_agent_tools) == 4
    tool_names = [tool.name for tool in leaderboard_agent_tools]
    assert "get_school_leaderboard" in tool_names
    assert "get_class_leaderboard" in tool_names
    assert "run_leaderboard_computation" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_school_leaderboard(mock_leaderboard_llm_invoke, mock_leaderboard_http_client):
    """
    Tests the graph logic for 'get_school_leaderboard'
    (from the prompt's example).
    """
    # 1. Setup Mock LLM
    query = "Who are the top 5 academic performers in the school?"
    tool_args = {"category": "academic", "top_n": 5}
    tool_call = ToolCall(name="get_school_leaderboard", args=tool_args, id="tool_123")

    mock_leaderboard_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="The top 5 are: 1. Rohan, 2. Priya.")]

    # 2. Setup Mock API
    mock_response = [{"student_id": 101, "full_name": "Rohan Sharma", "rank": 1, "points": 980}, {"student_id": 102, "full_name": "Priya Singh", "rank": 2, "points": 975}]
    mock_leaderboard_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = leaderboard_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Rohan" in result["response"]
    assert "Priya" in result["response"]

    # Assert LLM was called
    assert mock_leaderboard_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_leaderboard_http_client.get.assert_called_once_with("/leaderboard/school", params=tool_args)


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_leaderboard_llm_invoke, mock_leaderboard_http_client):
    """
    Tests guardrail: LeaderboardAgent MUST NOT answer individual grade questions
    (from the prompt's example).
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "Why am I not number 1? I got 95 in Maths."
    mock_response_text = "I manage final rankings. For individual grades, please ask the Mark Agent."
    mock_leaderboard_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = leaderboard_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_leaderboard_llm_invoke.assert_called_once()
    assert mock_leaderboard_http_client.get.call_count == 0

    assert "Mark Agent" in result["response"]
    assert "rankings" in result["response"]
