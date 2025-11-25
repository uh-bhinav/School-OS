from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage, ToolCall

# --- Global Fixture ---


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """Forces the LLM_PROVIDER_STRATEGY to 'local' for ALL tests."""
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


# --- L1 Root Orchestrator Mocks ---


@pytest.fixture
def mock_l1_llm_invoke():
    """Mocks the LLM for the L1 Root Orchestrator."""
    from app.agents.root_orchestrator.main import root_orchestrator_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default L1 mock"))

    original_model = root_orchestrator_instance.model
    root_orchestrator_instance.model = mock_model

    yield mock_model.ainvoke

    root_orchestrator_instance.model = original_model


# --- L2 Academics Module Mocks ---


@pytest.fixture
def mock_l2_llm_invoke():
    """Mocks the LLM for the L2 Academics Module Orchestrator."""
    from app.agents.modules.academics.module_agent import academics_module_orchestrator_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default L2 mock"))

    original_model = academics_module_orchestrator_instance.model
    academics_module_orchestrator_instance.model = mock_model

    yield mock_model.ainvoke

    academics_module_orchestrator_instance.model = original_model


# --- L3 Router Mocks ---


@pytest.fixture
def mock_l3_assessment_llm_ainvoke():
    """Mocks the 'llm.ainvoke' call inside the assessment_router.py file."""
    mock_llm = MagicMock()
    mock_ainvoke = AsyncMock()
    mock_llm.ainvoke = mock_ainvoke

    default_tool_call = ToolCall(name="AssessmentRoute", args={"agent_name": "__self__"}, id="tool_abc")
    mock_ainvoke.return_value = AIMessage(content="", tool_calls=[default_tool_call])

    patch_path = "app.agents.modules.academics.routers.assessment_router.llm"
    with patch(patch_path, mock_llm):
        yield mock_ainvoke


# --- L4 MarkAgent Mocks ---


@pytest.fixture
def mock_l4_mark_llm_invoke():
    """Mocks the LLM for the L4 MarkAgent."""
    from app.agents.modules.academics.leaves.mark_agent.main import mark_agent_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default L4 mock"))

    original_model = mark_agent_instance.model
    mark_agent_instance.model = mock_model

    yield mock_model.ainvoke

    mark_agent_instance.model = original_model


@pytest.fixture
def mock_l4_mark_http_client():
    """Mocks the AgentHTTPClient for the L4 MarkAgent's tools."""
    patch_path = "app.agents.modules.academics.leaves.mark_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        mock_instance = AsyncMock()
        mock_client_class.return_value = mock_instance
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None

        mock_instance.get = AsyncMock()
        mock_instance.post = AsyncMock()
        # ... (add put, delete if needed)

        yield mock_instance
