import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.report_card_agent.main import ReportCardAgent, report_card_agent_instance
from app.agents.modules.academics.leaves.report_card_agent.tools import report_card_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_report_card_agent_initialization():
    """
    Tests that the ReportCardAgent initializes correctly.
    """
    assert isinstance(report_card_agent_instance, ReportCardAgent)
    assert report_card_agent_instance.llm_tier == "medium"


def test_report_card_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 3 tools.
    """
    assert len(report_card_agent_tools) == 3
    tool_names = [tool.name for tool in report_card_agent_tools]
    assert "get_student_report_card" in tool_names
    assert "get_class_report_cards" in tool_names
    assert "download_student_report_card_pdf" in tool_names


# --- Category B: Happy Path Tests ---


async def test_happy_path_get_student_report_card(mock_report_card_llm_invoke, mock_report_card_http_client):
    """
    Tests the graph logic for 'get_student_report_card'.
    """
    # 1. Setup Mock LLM
    query = "Get report card for student 101, year 3"
    tool_args = {"student_id": 101, "academic_year_id": 3}
    tool_call = ToolCall(name="get_student_report_card", args=tool_args, id="tool_123")

    mock_report_card_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here is the report card: Physics - 85, Math - 90.")]

    # 2. Setup Mock API
    mock_response = {"student_id": 101, "grades": [{"subject": "Physics", "marks": 85}]}
    mock_report_card_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = report_card_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Physics - 85" in result["response"]

    # Assert LLM was called
    assert mock_report_card_llm_invoke.call_count >= 1

    # Assert API was called correctly
    mock_report_card_http_client.get.assert_called_once_with(f"/report-cards/student/{tool_args['student_id']}", params={"academic_year_id": tool_args["academic_year_id"]})


async def test_happy_path_download_pdf(mock_report_card_llm_invoke, mock_report_card_http_client):
    """
    Tests the 'download_student_report_card_pdf' tool.
    This test verifies the agent synthesizes the correct URL response
    as specified in its prompt.
    """
    # 1. Setup Mock LLM
    query = "Download the PDF report card for student 101, year 3."
    tool_args = {"student_id": 101, "academic_year_id": 3}
    tool_call = ToolCall(name="download_student_report_card_pdf", args=tool_args, id="tool_456")

    # This is the *required* final response from the prompt
    final_response_text = "Here is the secure download link for the report card: http://test-server/report-cards/student/101/pdf?academic_year_id=3"

    mock_report_card_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content=final_response_text)]

    # 2. Setup Mock API (not used for a GET, but the tool is called)
    # The tool constructs the URL itself using the mocked _get_auth_headers

    # 3. Invoke Agent
    result = report_card_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Here is the secure download link" in result["response"]
    assert "http://test-server/report-cards/student/101/pdf?academic_year_id=3" in result["response"]

    # Assert the internal _get_auth_headers was called by the tool
    mock_report_card_http_client._get_auth_headers.assert_called_once()


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_marks_query(mock_report_card_llm_invoke, mock_report_card_http_client):
    """
    Tests guardrail: ReportCardAgent MUST NOT answer specific marks questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What mark did Rohan get in Physics?"
    mock_response_text = "I only retrieve final report cards. For entering or changing marks, please ask the Marks Agent."
    mock_report_card_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = report_card_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_report_card_llm_invoke.assert_called_once()
    assert mock_report_card_http_client.get.call_count == 0

    assert "Marks Agent" in result["response"]


async def test_guardrail_asks_for_id(mock_report_card_llm_invoke, mock_report_card_http_client):
    """
    Tests the agent's *own* critical workflow: it MUST ask for IDs
    when given only a name.
    """
    # 1. Setup Mock LLM
    query = "Show me Rohan's report card."
    mock_response_text = "I can fetch report cards, but I need the numeric IDs. Please ask the Student Agent for the 'student_id'..."
    mock_report_card_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = report_card_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_report_card_llm_invoke.assert_called_once()
    assert mock_report_card_http_client.get.call_count == 0

    assert "student_id" in result["response"]
    assert "Student Agent" in result["response"]
