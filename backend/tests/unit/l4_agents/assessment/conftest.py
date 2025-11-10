from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """
    Forces the LLM_PROVIDER_STRATEGY to 'local' for ALL unit tests.
    """
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


@pytest.fixture
def mock_http_client():
    """
    Mocks the AgentHTTPClient to prevent real network calls.
    This is used by the *tools* when they are called.
    Must be synchronous fixture since tools run in sync context via _run_coroutine.
    """
    patch_path = "app.agents.modules.academics.leaves.exam_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        # Create async mock instance
        mock_client_instance = AsyncMock()

        # Make the class constructor return the instance
        mock_client_class.return_value = mock_client_instance

        # Setup async context manager
        mock_client_instance.__aenter__.return_value = mock_client_instance
        mock_client_instance.__aexit__.return_value = None

        # Setup async HTTP methods
        mock_client_instance.get = AsyncMock()
        mock_client_instance.post = AsyncMock()
        mock_client_instance.put = AsyncMock()
        mock_client_instance.delete = AsyncMock()

        yield mock_client_instance


@pytest.fixture
def mock_llm_invoke():
    """
    Mocks the entire model object on the exam_agent_instance.
    This replaces the ChatOllama/ChatOpenAI with a MagicMock.
    """
    # Import here to ensure it's after the module is loaded
    from app.agents.modules.academics.leaves.exam_agent.main import exam_agent_instance

    # Create a mock model that replaces the entire LLM
    mock_model = MagicMock()
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default mock response"))

    # Store the original model for cleanup
    original_model = exam_agent_instance.model

    # Replace the entire model object
    exam_agent_instance.model = mock_model

    # Yield the invoke method so tests can configure it
    yield mock_model.invoke

    # Cleanup: restore original model
    exam_agent_instance.model = original_model


@pytest.fixture
def mock_mark_http_client():
    """
    Mock AgentHTTPClient for the MarkAgent's tools.
    MUST be synchronous fixture.
    """
    # [cite_start]Patch the client where it is *used* [cite: 220]
    patch_path = "app.agents.modules.academics.leaves.mark_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        mock_instance = AsyncMock()
        mock_client_class.return_value = mock_instance
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None

        mock_instance.get = AsyncMock()
        mock_instance.post = AsyncMock()
        mock_instance.put = AsyncMock()
        mock_instance.delete = AsyncMock()

        yield mock_instance


@pytest.fixture
def mock_mark_llm_invoke():
    """
    Mock the LLM for the MarkAgent by replacing the entire model object.
    We must import the instance *inside* the fixture.
    """
    from app.agents.modules.academics.leaves.mark_agent.main import mark_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default MarkAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = mark_agent_instance.model
    mark_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    mark_agent_instance.model = original_model


@pytest.fixture
def mock_exam_type_http_client():
    """
    Mock AgentHTTPClient for the ExamTypeAgent's tools.
    MUST be synchronous fixture.
    """
    # Patch the client where it is *used*
    patch_path = "app.agents.modules.academics.leaves.exam_type_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        mock_instance = AsyncMock()
        mock_client_class.return_value = mock_instance
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None

        mock_instance.get = AsyncMock()
        mock_instance.post = AsyncMock()
        mock_instance.put = AsyncMock()
        mock_instance.delete = AsyncMock()

        yield mock_instance


@pytest.fixture
def mock_exam_type_llm_invoke():
    """
    Mock the LLM for the ExamTypeAgent by replacing the entire model object.
    We must import the instance *inside* the fixture.
    """
    from app.agents.modules.academics.leaves.exam_type_agent.main import exam_type_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default ExamTypeAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = exam_type_agent_instance.model
    exam_type_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    exam_type_agent_instance.model = original_model


# --- Fixtures for ReportCardAgent ---


@pytest.fixture
def mock_report_card_http_client():
    """
    Mock AgentHTTPClient for the ReportCardAgent's tools.
    MUST be synchronous fixture.
    """
    # Patch the client where it is *used*
    patch_path = "app.agents.modules.academics.leaves.report_card_agent.tools.AgentHTTPClient"
    with patch(patch_path) as mock_client_class:
        mock_instance = AsyncMock()
        mock_client_class.return_value = mock_instance
        mock_instance.__aenter__.return_value = mock_instance
        mock_instance.__aexit__.return_value = None

        mock_instance.get = AsyncMock()
        mock_instance.post = AsyncMock()

        # This mock is special for the PDF download tool
        # We mock the *synchronous* internal method it calls
        mock_auth_context = MagicMock()
        mock_auth_context.api_base_url = "http://test-server"
        mock_instance._get_auth_headers = MagicMock(return_value=mock_auth_context)

        yield mock_instance


@pytest.fixture
def mock_report_card_llm_invoke():
    """
    Mock the LLM for the ReportCardAgent by replacing the entire model object.
    We must import the instance *inside* the fixture.
    """
    from app.agents.modules.academics.leaves.report_card_agent.main import report_card_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default ReportCardAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = report_card_agent_instance.model
    report_card_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    report_card_agent_instance.model = original_model
