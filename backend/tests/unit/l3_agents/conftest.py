from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage, ToolCall


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """Sets the environment for all router tests."""
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


@pytest.fixture
def mock_assessment_llm_ainvoke():
    """
    Mocks get_llm() to return a mock LLM with structured output support.
    ✅ FIXED: Patch get_llm, not the chain
    """
    mock_llm = MagicMock()
    mock_llm.with_structured_output = MagicMock(return_value=MagicMock())

    # Mock the ainvoke call on the chain
    mock_chain = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_chain.ainvoke = mock_ainvoke

    # Make the pipe operator work
    mock_llm.__or__ = MagicMock(return_value=mock_chain)

    # Default response
    default_route = MagicMock(agent_name="__self__")
    mock_ainvoke.return_value = default_route

    patch_path = "app.agents.modules.academics.routers.assessment_router.get_llm"
    with patch(patch_path, return_value=mock_llm):
        yield mock_ainvoke


@pytest.fixture
def mock_core_llm_ainvoke():
    """Mocks the 'llm' object in core_curriculum_router.py."""
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="CoreCurriculumRoute", args={"agent_name": "__self__"}, id="tool_xyz")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.core_curriculum_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke  # ✅ Yield INSIDE the with block


@pytest.fixture
def mock_scheduling_llm_ainvoke():
    """Mocks the 'llm' object in scheduling_router.py."""
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="SchedulingRoute", args={"agent_name": "__self__"}, id="tool_sched")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.scheduling_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke  # ✅ Yield INSIDE the with block


@pytest.fixture
def mock_holistic_llm_ainvoke():
    """Mocks the 'llm' object in holistic_router.py."""
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="HolisticRoute", args={"agent_name": "__self__"}, id="tool_holistic")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.holistic_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke  # ✅ Yield INSIDE the with block
