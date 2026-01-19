import pytest
from langchain_core.messages import AIMessage, ToolCall

# Function we are testing
from app.agents.modules.academics.routers.core_curriculum_router import (
    invoke_core_curriculum_router,
)

# Schema for type hints
from app.agents.modules.academics.routers.core_curriculum_schemas import (
    CoreCurriculumRoute,
)

pytestmark = pytest.mark.asyncio


async def test_route_to_class_agent(mock_core_llm_ainvoke):
    """
    Tests Happy Path: Query for 'class roster' routes to ClassAgent.
    """
    query = "Who is in Class 10A?"

    # 1. Setup Mock
    tool_call = ToolCall(name="CoreCurriculumRoute", args={"agent_name": "ClassAgent"}, id="tool_123")
    mock_core_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: CoreCurriculumRoute = await invoke_core_curriculum_router(query)

    # 3. Assert
    assert route.agent_name == "ClassAgent"
    mock_core_llm_ainvoke.assert_called_once()


async def test_route_to_student_agent(mock_core_llm_ainvoke):
    """
    Tests Happy Path: Query for 'student profile' routes to StudentAgent.
    """
    query = "Admit a new student named Rohan"

    # 1. Setup Mock
    tool_call = ToolCall(name="CoreCurriculumRoute", args={"agent_name": "StudentAgent"}, id="tool_123")
    mock_core_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: CoreCurriculumRoute = await invoke_core_curriculum_router(query)

    # 3. Assert
    assert route.agent_name == "StudentAgent"
    mock_core_llm_ainvoke.assert_called_once()


async def test_guardrail_route_wrong_module(mock_core_llm_ainvoke):
    """
    Tests Guardrail: A query for a *different* module (Assessment)
    should be routed to '__self__'.
    """
    query = "What did Rohan get in Physics?"  # This is an Assessment query

    # 1. Setup Mock
    tool_call = ToolCall(name="CoreCurriculumRoute", args={"agent_name": "__self__"}, id="tool_123")
    mock_core_llm_ainvoke.return_value = AIMessage(content="", tool_calls=[tool_call])

    # 2. Invoke Router
    route: CoreCurriculumRoute = await invoke_core_curriculum_router(query)

    # 3. Assert
    assert route.agent_name == "__self__"
    mock_core_llm_ainvoke.assert_called_once()
