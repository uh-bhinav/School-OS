import pytest
from langchain_core.messages import AIMessage, ToolCall

# Function we are testing
from app.agents.modules.academics.routers.holistic_router import invoke_holistic_router

# Schema for type hints
from app.agents.modules.academics.routers.holistic_schemas import HolisticRoute

pytestmark = pytest.mark.asyncio


async def test_route_to_club_agent(mock_holistic_llm_ainvoke):
    """
    Tests Happy Path: Query for 'club' routes to ClubAgent.
    """
    query = "Who is in the robotics club?"

    # 1. Setup Mock
    tool_call = ToolCall(name="HolisticRoute", args={"agent_name": "ClubAgent"}, id="tool_123")
    mock_holistic_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: HolisticRoute = await invoke_holistic_router(query)

    # 3. Assert
    assert route.agent_name == "ClubAgent"
    mock_holistic_llm_ainvoke.assert_called_once()


async def test_route_to_leaderboard_agent(mock_holistic_llm_ainvoke):
    """
    Tests Happy Path: Query for 'ranking' routes to LeaderboardAgent.
    """
    query = "Show me the school rankings."

    # 1. Setup Mock
    tool_call = ToolCall(name="HolisticRoute", args={"agent_name": "LeaderboardAgent"}, id="tool_123")
    mock_holistic_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: HolisticRoute = await invoke_holistic_router(query)

    # 3. Assert
    assert route.agent_name == "LeaderboardAgent"
    mock_holistic_llm_ainvoke.assert_called_once()


async def test_guardrail_route_wrong_module(mock_holistic_llm_ainvoke):
    """
    Tests Guardrail: A query for a *different* module (Scheduling)
    should be routed to '__self__'.
    """
    query = "What is the schedule for 10A?"  # This is a Scheduling query

    # 1. Setup Mock
    tool_call = ToolCall(name="HolisticRoute", args={"agent_name": "__self__"}, id="tool_123")
    mock_holistic_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: HolisticRoute = await invoke_holistic_router(query)

    # 3. Assert
    assert route.agent_name == "__self__"
    mock_holistic_llm_ainvoke.assert_called_once()
