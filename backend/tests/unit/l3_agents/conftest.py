from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage, ToolCall


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """
    Sets the environment for all router tests.
    """
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


@pytest.fixture
def mock_assessment_llm_ainvoke():
    """
    Mocks the *entire* 'llm' object in the assessment_router.py file
    and returns a mock for its 'ainvoke' method.
    """
    # 1. Create a complete mock for the llm object
    mock_llm = MagicMock()

    # 2. Mock its 'ainvoke' method (which is async)
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    # 3. Set a default response
    default_tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "__self__"}, id="tool_abc")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    # 4. Patch the *entire object* where it's imported
    patch_path = "app.agents.modules.academics.routers.assessment_router.llm"
    with patch(patch_path, mock_llm):  # Replace the 'llm' object with our 'mock_llm'
        yield mock_ainvoke  # Yield the 'ainvoke' mock for tests to use


@pytest.fixture
def mock_core_llm_ainvoke():
    """
    Mocks the *entire* 'llm' object in the core_curriculum_router.py file
    and returns a mock for its 'ainvoke' method.
    """
    # 1. Create a complete mock for the llm object
    mock_llm = MagicMock()

    # 2. Mock its 'ainvoke' method (which is async)
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    # 3. Set a default response
    default_tool_call = ToolCall(name="CoreCurriculumRoute", args={"agent_name": "__self__"}, id="tool_xyz")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    # 4. Patch the *entire object*
    patch_path = "app.agents.modules.academics.routers.core_curriculum_router.llm"
    with patch(patch_path, mock_llm):  # Replace 'llm' with 'mock_llm'
        yield mock_ainvoke  # Yield the 'ainvoke' mock


# --- Fixtures for SchedulingRouter ---


@pytest.fixture
def mock_scheduling_llm_ainvoke():
    """
    Mocks the *entire* 'llm' object in the scheduling_router.py file
    and returns a mock for its 'ainvoke' method.
    """
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="SchedulingRoute", args={"agent_name": "__self__"}, id="tool_sched")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.scheduling_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke


# --- Fixtures for HolisticRouter ---


@pytest.fixture
def mock_holistic_llm_ainvoke():
    """
    Mocks the *entire* 'llm' object in the holistic_router.py file
    and returns a mock for its 'ainvoke' method.
    """
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="HolisticRoute", args={"agent_name": "__self__"}, id="tool_holistic")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.holistic_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke
