from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.messages import AIMessage

# --- Fixture for ALL Core Agent Tests ---


@pytest.fixture(scope="function", autouse=True)
def force_local_llm_strategy(monkeypatch):
    """
    Forces the LLM_PROVIDER_STRATEGY to 'local' for ALL unit tests
    in this directory.
    """
    monkeypatch.setenv("LLM_PROVIDER_STRATEGY", "local")
    monkeypatch.setenv("API_BASE_URL", "http://test-server/api/v1")


# --- Fixtures for ClassAgent ---


@pytest.fixture
def mock_class_http_client():
    """Mock AgentHTTPClient for the ClassAgent's tools."""
    patch_path = "app.agents.modules.academics.leaves.class_agent.tools.AgentHTTPClient"
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
def mock_class_llm_invoke():
    """Mock the LLM for the ClassAgent by replacing the entire model object."""
    from app.agents.modules.academics.leaves.class_agent.main import class_agent_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default ClassAgent mock response"))

    original_model = class_agent_instance.model
    class_agent_instance.model = mock_model

    yield mock_model.ainvoke

    class_agent_instance.model = original_model


# --- Fixtures for StudentAgent ---


@pytest.fixture
def mock_student_http_client():
    """Mock AgentHTTPClient for the StudentAgent's tools."""
    patch_path = "app.agents.modules.academics.leaves.student_agent.tools.AgentHTTPClient"
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
def mock_student_llm_invoke():
    """Mock the LLM for the StudentAgent by replacing the entire model object."""
    from app.agents.modules.academics.leaves.student_agent.main import student_agent_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default StudentAgent mock response"))

    original_model = student_agent_instance.model
    student_agent_instance.model = mock_model

    yield mock_model.ainvoke

    student_agent_instance.model = original_model


@pytest.fixture
def mock_academic_year_http_client():
    """Mock AgentHTTPClient for the AcademicYearAgent's tools."""
    # Patch the client where it is *used*
    patch_path = "app.agents.modules.academics.leaves.academic_year_agent.tools.AgentHTTPClient"
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
def mock_academic_year_llm_invoke():
    """Mock the LLM for the AcademicYearAgent by replacing the entire model object."""
    from app.agents.modules.academics.leaves.academic_year_agent.main import academic_year_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default AcademicYearAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = academic_year_agent_instance.model
    academic_year_agent_instance.model = mock_model

    yield mock_model.ainvoke

    # Restore the original model after the test
    academic_year_agent_instance.model = original_model


# --- Fixtures for SubjectAgent ---


@pytest.fixture
def mock_subject_http_client():
    """Mock AgentHTTPClient for the SubjectAgent's tools."""
    # Patch the client where it is *used*
    patch_path = "app.agents.modules.academics.leaves.subject_agent.tools.AgentHTTPClient"
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
def mock_subject_llm_invoke():
    """Mock the LLM for the SubjectAgent by replacing the entire model object."""
    from app.agents.modules.academics.leaves.subject_agent.main import subject_agent_instance

    mock_model = MagicMock()
    # Set a default return value for safety
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default SubjectAgent mock response"))

    # The key fix: replace the entire .model object
    original_model = subject_agent_instance.model
    subject_agent_instance.model = mock_model

    yield mock_model.ainvoke

    # Restore the original model after the test
    subject_agent_instance.model = original_model


# --- Fixtures for TeacherAgent ---


@pytest.fixture
def mock_teacher_http_client():
    """Mock AgentHTTPClient for the TeacherAgent's tools."""
    patch_path = "app.agents.modules.academics.leaves.teacher_agent.tools.AgentHTTPClient"
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
def mock_teacher_llm_invoke():
    """Mock the LLM for the TeacherAgent by replacing the entire model object."""
    from app.agents.modules.academics.leaves.teacher_agent.main import teacher_agent_instance

    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(return_value=AIMessage(content="Default TeacherAgent mock response"))

    original_model = teacher_agent_instance.model
    teacher_agent_instance.model = mock_model

    yield mock_model.ainvoke

    teacher_agent_instance.model = original_model
