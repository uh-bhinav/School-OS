from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage

# --- Fixture for ALL Scheduling Agent Tests ---


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """
    Forces the LLM_PROVIDER_STRATEGY to 'local' for ALL unit tests
    in this directory.
    """
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


# --- Fixtures for TimetableAgent ---


@pytest.fixture
def mock_timetable_http_client():
    """Mock AgentHTTPClient for the TimetableAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.timetable_agent.tools.AgentHTTPClient"
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
def mock_timetable_llm_invoke():
    """Mock the LLM for the TimetableAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.timetable_agent.main import (
        timetable_agent_instance,
    )

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default TimetableAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = timetable_agent_instance.model
    timetable_agent_instance.model = mock_model

    yield mock_model.ainvoke

    # Restore the original model after the test
    timetable_agent_instance.model = original_model


# --- Fixtures for AttendanceAgent ---


@pytest.fixture
def mock_attendance_http_client():
    """Mock AgentHTTPClient for the AttendanceAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.attendance_agent.tools.AgentHTTPClient"
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
def mock_attendance_llm_invoke():
    """Mock the LLM for the AttendanceAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.attendance_agent.main import (
        attendance_agent_instance,
    )

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default AttendanceAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = attendance_agent_instance.model
    attendance_agent_instance.model = mock_model

    yield mock_model.ainvoke

    # Restore the original model after the test
    attendance_agent_instance.model = original_model


# --- Fixtures for PeriodAgent ---


@pytest.fixture
def mock_period_http_client():
    """Mock AgentHTTPClient for the PeriodAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.period_agent.tools.AgentHTTPClient"
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
def mock_period_llm_invoke():
    """Mock the LLM for the PeriodAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.period_agent.main import (
        period_agent_instance,
    )

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default PeriodAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = period_agent_instance.model
    period_agent_instance.model = mock_model

    yield mock_model.ainvoke

    # Restore the original model after the test
    period_agent_instance.model = original_model
