from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage

# --- Fixture for ALL Holistic Agent Tests ---


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """
    Forces the LLM_PROVIDER_STRATEGY to 'local' for ALL unit tests
    in this directory.
    """
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


# --- Fixtures for ClubAgent ---


@pytest.fixture
def mock_club_http_client():
    """Mock AgentHTTPClient for the ClubAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.club_agent.tools.AgentHTTPClient"
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
def mock_club_llm_invoke():
    """Mock the LLM for the ClubAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.club_agent.main import club_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default ClubAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = club_agent_instance.model
    club_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    club_agent_instance.model = original_model


# --- Fixtures for AchievementAgent ---


@pytest.fixture
def mock_achievement_http_client():
    """Mock AgentHTTPClient for the AchievementAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.achievement_agent.tools.AgentHTTPClient"
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
def mock_achievement_llm_invoke():
    """Mock the LLM for the AchievementAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.achievement_agent.main import achievement_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default AchievementAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = achievement_agent_instance.model
    achievement_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    achievement_agent_instance.model = original_model


# --- Fixtures for LeaderboardAgent ---


@pytest.fixture
def mock_leaderboard_http_client():
    """Mock AgentHTTPClient for the LeaderboardAgent's tools."""
    # Patch the client where it is *used* by the tools
    patch_path = "app.agents.modules.academics.leaves.leaderboard_agent.tools.AgentHTTPClient"
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
def mock_leaderboard_llm_invoke():
    """Mock the LLM for the LeaderboardAgent by replacing the entire model object."""
    # We must import the instance *inside* the fixture
    from app.agents.modules.academics.leaves.leaderboard_agent.main import leaderboard_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.invoke = MagicMock(return_value=AIMessage(content="Default LeaderboardAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = leaderboard_agent_instance.model
    leaderboard_agent_instance.model = mock_model

    yield mock_model.invoke

    # Restore the original model after the test
    leaderboard_agent_instance.model = original_model
