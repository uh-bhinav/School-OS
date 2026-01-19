from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


@pytest.fixture
def mock_http_client():
    patch_path = "app.agents.modules.academics.leaves.exam_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        mock_client_instance = AsyncMock()
        mock_client_class.return_value = mock_client_instance
        mock_client_instance.__aenter__.return_value = mock_client_instance
        mock_client_instance.__aexit__.return_value = None
        mock_client_instance.get = AsyncMock()
        mock_client_instance.post = AsyncMock()
        mock_client_instance.put = AsyncMock()
        mock_client_instance.delete = AsyncMock()
        yield mock_client_instance


@pytest.fixture
def mock_llm_invoke():
    """Mock the LLM's ainvoke (ASYNC) method"""
    from app.agents.modules.academics.leaves.exam_agent.main import exam_agent_instance

    # ✅ Use AsyncMock for ainvoke
    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default mock response"))

    original_model = exam_agent_instance.model
    exam_agent_instance.model = mock_model

    yield mock_model.ainvoke  # ✅ Yield ainvoke, not invoke

    exam_agent_instance.model = original_model


@pytest.fixture
def mock_mark_llm_invoke():
    """Mock the LLM for MarkAgent - ainvoke version"""
    from app.agents.modules.academics.leaves.mark_agent.main import mark_agent_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default MarkAgent mock response"))

    original_model = mark_agent_instance.model
    mark_agent_instance.model = mock_model

    yield mock_model.ainvoke

    mark_agent_instance.model = original_model


@pytest.fixture
def mock_exam_type_llm_invoke():
    """Mock the LLM for ExamTypeAgent - ainvoke version"""
    from app.agents.modules.academics.leaves.exam_type_agent.main import (
        exam_type_agent_instance,
    )

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default ExamTypeAgent mock response"))

    original_model = exam_type_agent_instance.model
    exam_type_agent_instance.model = mock_model

    yield mock_model.ainvoke

    exam_type_agent_instance.model = original_model


@pytest.fixture
def mock_report_card_llm_invoke():
    """Mock the LLM for ReportCardAgent - ainvoke version"""
    from app.agents.modules.academics.leaves.report_card_agent.main import (
        report_card_agent_instance,
    )

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default ReportCardAgent mock response"))

    original_model = report_card_agent_instance.model
    report_card_agent_instance.model = mock_model

    yield mock_model.ainvoke

    report_card_agent_instance.model = original_model


# ... rest of fixtures
