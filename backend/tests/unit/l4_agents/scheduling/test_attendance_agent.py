from datetime import date

import pytest
from langchain_core.messages import AIMessage, ToolCall

# Import the agent we are testing
from app.agents.modules.academics.leaves.attendance_agent.main import AttendanceAgent, attendance_agent_instance
from app.agents.modules.academics.leaves.attendance_agent.tools import attendance_agent_tools

# This marks all tests in this file as async
pytestmark = pytest.mark.asyncio


# --- Category A: Initialization Tests ---


def test_attendance_agent_initialization():
    """
    Tests that the AttendanceAgent initializes correctly.
    """
    assert isinstance(attendance_agent_instance, AttendanceAgent)
    assert attendance_agent_instance.llm_tier == "medium"


def test_attendance_agent_loads_tools():
    """
    Tests that the agent is configured with the correct 5 tools.
    """
    assert len(attendance_agent_tools) == 5
    tool_names = [tool.name for tool in attendance_agent_tools]
    assert "get_class_attendance_sheet" in tool_names
    assert "take_class_attendance" in tool_names
    assert "get_all_absentees_today" in tool_names


# --- Category B: Happy Path Tests (Critical Workflow) ---


async def test_happy_path_step_1_get_sheet(mock_attendance_llm_invoke, mock_attendance_http_client):
    """
    Tests Step 1 of the critical workflow: asking for an attendance sheet.
    Agent MUST call 'get_class_attendance_sheet'.
    """
    # 1. Setup Mock LLM
    query = "I need to take attendance for Class 8B."
    today_str = date.today().isoformat()
    tool_args = {"class_name": "8B", "date": today_str}
    tool_call = ToolCall(name="get_class_attendance_sheet", args=tool_args, id="tool_123")

    mock_attendance_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Here is the attendance sheet for 8B: [{'student_id': 101, 'full_name': 'Rohan Sharma'}]...")]

    # 2. Setup Mock API
    mock_response = [{"student_id": 101, "full_name": "Rohan Sharma"}]
    mock_attendance_http_client.get.return_value = mock_response

    # 3. Invoke Agent
    result = attendance_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Rohan Sharma" in result["response"]

    # Assert API was called correctly by the tool
    mock_attendance_http_client.get.assert_called_once_with("/attendance/agent/sheet/8B", params={"target_date": today_str})


async def test_happy_path_step_2_take_attendance(mock_attendance_llm_invoke, mock_attendance_http_client):
    """
    Tests Step 2 of the critical workflow: submitting the attendance.
    Agent MUST call 'take_class_attendance'.
    """
    # 1. Setup Mock LLM
    query = "Okay, for 8B, mark Rohan (101) as absent. Priya (102) is late. The rest are present."
    today_str = date.today().isoformat()
    tool_args = {"class_name": "8B", "date": today_str, "absent_student_ids": [101], "late_student_ids": [102], "present_student_ids": []}  # Assuming LLM would be smart enough to add the rest
    tool_call = ToolCall(name="take_class_attendance", args=tool_args, id="tool_456")

    mock_attendance_llm_invoke.side_effect = [AIMessage(content="", tool_calls=[tool_call]), AIMessage(content="Attendance has been submitted successfully for 8B.")]

    # 2. Setup Mock API
    mock_response = {"status": "success", "records_created": 2}
    mock_attendance_http_client.post.return_value = mock_response

    # 3. Invoke Agent
    result = attendance_agent_instance.invoke(query)

    # 4. Assertions
    assert result["success"] is True
    assert "Attendance has been submitted" in result["response"]

    # Assert API was called correctly by the tool
    mock_attendance_http_client.post.assert_called_once_with("/attendance/agent/take", json=tool_args)


# --- Category C: Guardrail Tests ---


async def test_guardrail_deflects_timetable_query(mock_attendance_llm_invoke, mock_attendance_http_client):
    """
    Tests guardrail: AttendanceAgent MUST NOT answer timetable questions.
    """
    # 1. Setup Mock LLM: Force a direct text response
    query = "What's the schedule for 8B?"
    mock_response_text = "I manage attendance. For class schedules, please ask the Timetable Agent."
    mock_attendance_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = attendance_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_attendance_llm_invoke.assert_called_once()
    assert mock_attendance_http_client.get.call_count == 0

    assert "Timetable Agent" in result["response"]


async def test_guardrail_deflects_marks_query(mock_attendance_llm_invoke, mock_attendance_http_client):
    """
    Tests guardrail: AttendanceAgent MUST NOT answer marks questions.
    """
    # 1. Setup Mock LLM
    query = "What are Rohan's marks?"
    mock_response_text = "I manage attendance. For grades, please ask the Mark Agent."
    mock_attendance_llm_invoke.return_value = AIMessage(content=mock_response_text)

    # 2. Invoke Agent
    result = attendance_agent_instance.invoke(query)

    # 3. Assertions
    assert result["success"] is True
    mock_attendance_llm_invoke.assert_called_once()
    assert mock_attendance_http_client.get.call_count == 0

    assert "Mark Agent" in result["response"]
