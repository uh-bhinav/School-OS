import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.club_agent.main import ClubAgent, club_agent_instance
from app.agents.modules.academics.leaves.club_agent.tools import club_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_club_agent_initialization():
    """
    Tests that the ClubAgent initializes correctly.
    """
    assert isinstance(club_agent_instance, ClubAgent)
    assert club_agent_instance.llm_tier == "medium"


def test_club_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 5 tools.
    """
    assert len(club_agent_tools) == 5
    tool_names = [tool.name for tool in club_agent_tools]
    assert "list_all_clubs" in tool_names
    assert "list_club_members" in tool_names
    assert "add_student_to_club" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_list_club_members(mock_club_llm_invoke, mock_club_http_client):
    """
    Tests the graph logic for 'list_club_members'
    (from the prompt's example).
    """
    # 1. Setup Mock LLM
    query = "Who is in the Science Club?"
    tool_args = {"club_name": "Science Club"}
    tool_call = ToolCall(name="list_club_members", args=tool_args, id="tool_123")

    mock_club_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="The members of the Science Club are Rohan and Priya.")]

    # 2. Setup Mock API
    mock_response = [{"student_id": 101, "full_name": "Rohan Sharma"}, {"student_id": 102, "full_name": "Priya Singh"}]
    mock_club_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = await club_agent_instance.ainvoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Rohan" in result["response"]
    assert "Priya" in result["response"]

    # Assert LLM was called
    assert mock_club_llm_invoke.call_count >= 1

    # Assert API was called correctly by the tool
    mock_club_http_client.get.assert_called_once_with("/clubs/members/Science Club")


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_club_llm_invoke, mock_club_http_client):
    """
    Tests guardrail: ClubAgent MUST NOT answer grade questions
    (from the prompt's example).
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What grade did I get in the science club?"
    mock_response_text = "I manage clubs. For grades, please ask the Mark Agent."
    mock_club_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await club_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_club_llm_invoke.assert_called_once()
    assert mock_club_http_client.get.call_count == 0

    assert "Mark Agent" in result["response"]


async def test_guardrail_deflects_schedule_query(mock_club_llm_invoke, mock_club_http_client):
    """
    Tests guardrail: ClubAgent MUST NOT answer schedule questions.
    """
    # 1. Setup Mock LLM
    query = "What's the class schedule?"
    mock_response_text = "I manage clubs. For schedules, please ask the Timetable Agent."
    mock_club_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = await club_agent_instance.ainvoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_club_llm_invoke.assert_called_once()
    assert mock_club_http_client.get.call_count == 0

    assert "Timetable Agent" in result["response"]
