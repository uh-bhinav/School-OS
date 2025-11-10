import pytest
from langchain_core.messages import AIMessage, ToolCall

# Function we are testing
from app.agents.modules.academics.routers.scheduling_router import invoke_scheduling_router

# Schema for type hints
from app.agents.modules.academics.routers.scheduling_schemas import SchedulingRoute

pytestmark = pytest.mark.asyncio


async def test_route_to_timetable_agent(mock_scheduling_llm_ainvoke):
    """
    Tests Happy Path: Query for 'schedule' routes to TimetableAgent.
    """
    query = "What is the schedule for Class 10A today?"

    # 1. Setup Mock
    tool_call = ToolCall(name="SchedulingRoute", args={"agent_name": "TimetableAgent"}, id="tool_123")
    mock_scheduling_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: SchedulingRoute = await invoke_scheduling_router(query)

    # 3. Assert
    assert route.agent_name == "TimetableAgent"
    mock_scheduling_llm_ainvoke.assert_called_once()


async def test_route_to_attendance_agent(mock_scheduling_llm_ainvoke):
    """
    Tests Happy Path: Query for 'absent' routes to AttendanceAgent.
    """
    query = "Mark Rohan absent for Period 1."

    # 1. Setup Mock
    tool_call = ToolCall(name="SchedulingRoute", args={"agent_name": "AttendanceAgent"}, id="tool_123")
    mock_scheduling_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: SchedulingRoute = await invoke_scheduling_router(query)

    # 3. Assert
    assert route.agent_name == "AttendanceAgent"
    mock_scheduling_llm_ainvoke.assert_called_once()


async def test_guardrail_route_wrong_module(mock_scheduling_llm_ainvoke):
    """
    Tests Guardrail: A query for a *different* module (Holistic)
    should be routed to '__self__'.
    """
    query = "Who is in the robotics club?"  # This is a Holistic query

    # 1. Setup Mock
    tool_call = ToolCall(name="SchedulingRoute", args={"agent_name": "__self__"}, id="tool_123")
    mock_scheduling_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: SchedulingRoute = await invoke_scheduling_router(query)

    # 3. Assert
    assert route.agent_name == "__self__"
    mock_scheduling_llm_ainvoke.assert_called_once()
