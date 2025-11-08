import logging
from typing import Any

from langchain_core.tools import tool
from pydantic.v1 import BaseModel, Field

# Import the L4 agent instances. The L2 orchestrator needs to be able
# to call them directly after routing.
from .leaves.academic_year_agent import academic_year_agent_instance
from .leaves.achievement_agent import achievement_agent_instance
from .leaves.attendance_agent import attendance_agent_instance
from .leaves.class_agent import class_agent_instance
from .leaves.club_agent import club_agent_instance
from .leaves.exam_agent import exam_agent_instance
from .leaves.exam_type_agent import exam_type_agent_instance
from .leaves.leaderboard_agent import leaderboard_agent_instance
from .leaves.mark_agent import mark_agent_instance
from .leaves.period_agent import period_agent_instance
from .leaves.report_card_agent import report_card_agent_instance
from .leaves.student_agent import student_agent_instance
from .leaves.subject_agent import subject_agent_instance
from .leaves.teacher_agent import teacher_agent_instance
from .leaves.timetable_agent import timetable_agent_instance
from .routers.assessment_router import invoke_assessment_router

# Import the L3 routers we just built
from .routers.core_curriculum_router import invoke_core_curriculum_router
from .routers.holistic_router import invoke_holistic_router
from .routers.scheduling_router import invoke_scheduling_router  # <-- ADDED

logger = logging.getLogger(__name__)

# This dictionary maps the router's decision (a string)
# to the actual L4 agent instance we need to call.
L4_AGENT_MAP = {
    "AcademicYearAgent": academic_year_agent_instance,
    "StudentAgent": student_agent_instance,
    "ClassAgent": class_agent_instance,
    "SubjectAgent": subject_agent_instance,
    "TeacherAgent": teacher_agent_instance,
    "ExamTypeAgent": exam_type_agent_instance,
    "ExamAgent": exam_agent_instance,
    "MarkAgent": mark_agent_instance,
    "ReportCardAgent": report_card_agent_instance,
    "PeriodAgent": period_agent_instance,
    "TimetableAgent": timetable_agent_instance,
    "AttendanceAgent": attendance_agent_instance,
    "ClubAgent": club_agent_instance,
    "AchievementAgent": achievement_agent_instance,
    "LeaderboardAgent": leaderboard_agent_instance,
}

# --- L2 Tool Schemas ---


class L2ToolInputSchema(BaseModel):
    """Input schema for all L2 tools."""

    query: str = Field(..., description="The user's original query.")


# --- L2 Tool Definitions ---


@tool("core_curriculum_tool", args_schema=L2ToolInputSchema)
async def core_curriculum_tool(query: str) -> dict[str, Any]:
    """
    Use this tool for any query related to core curriculum:
    - Students (profiles, admission, parents)
    - Classes (rosters, creation, teacher assignment)
    - Subjects (creation, teacher assignment)
    - Teachers (profiles, qualifications)
    - Academic Years (current year, creation)
    """
    logger.info("L2 Orchestrator: Routing to CoreCurriculumRouter")
    # 1. Call the L3 Router
    route = await invoke_core_curriculum_router(query)

    # 2. Check the L3 router's decision
    agent_name = route.agent_name
    if agent_name == "__self__":
        return {"response": "I can help with students, classes, subjects, and teachers. What do you need?"}

    # 3. Find the L4 Agent to call
    leaf_agent = L4_AGENT_MAP.get(agent_name)
    if not leaf_agent:
        logger.error(f"CoreCurriculumRouter returned invalid agent name: {agent_name}")
        return {"error": f"Invalid routing decision: {agent_name}"}

    # 4. Invoke the L4 Leaf Agent
    logger.info(f"L2 Orchestrator: Invoking L4 Agent: {agent_name}")
    return leaf_agent.invoke(query)


@tool("assessment_tool", args_schema=L2ToolInputSchema)
async def assessment_tool(query: str) -> dict[str, Any]:
    """
    Use this tool for any query related to assessment and grading:
    - Exam Types (e.g., "Midterm", "Final")
    - Exam Schedules (dates, creation)
    - Marks (entering marks, viewing grades)
    - Report Cards (final compiled reports, PDFs)
    """
    logger.info("L2 Orchestrator: Routing to AssessmentRouter")
    # 1. Call the L3 Router
    route = await invoke_assessment_router(query)

    # 2. Check the L3 router's decision
    agent_name = route.agent_name
    if agent_name == "__self__":
        return {"response": "I can help with exams, marks, and report cards. What do you need?"}

    # 3. Find the L4 Agent to call
    leaf_agent = L4_AGENT_MAP.get(agent_name)
    if not leaf_agent:
        logger.error(f"AssessmentRouter returned invalid agent name: {agent_name}")
        return {"error": f"Invalid routing decision: {agent_name}"}

    # 4. Invoke the L4 Leaf Agent
    logger.info(f"L2 Orchestrator: Invoking L4 Agent: {agent_name}")
    return leaf_agent.invoke(query)


@tool("scheduling_tool", args_schema=L2ToolInputSchema)
async def scheduling_tool(query: str) -> dict[str, Any]:
    """
    Use this tool for any query related to scheduling:
    - Period Structures (e.g., "How long is lunch?")
    - Timetables (e.g., "What is 10A's schedule?")
    - Attendance (e.g., "Mark Rohan absent", "Who was absent today?")
    """
    logger.info("L2 Orchestrator: Routing to SchedulingRouter")
    # 1. Call the L3 Router
    route = await invoke_scheduling_router(query)

    # 2. Check the L3 router's decision
    agent_name = route.agent_name
    if agent_name == "__self__":
        return {"response": "I can help with timetables, attendance, and period structures. What do you need?"}

    # 3. Find the L4 Agent to call
    leaf_agent = L4_AGENT_MAP.get(agent_name)
    if not leaf_agent:
        logger.error(f"SchedulingRouter returned invalid agent name: {agent_name}")
        return {"error": f"Invalid routing decision: {agent_name}"}

    # 4. Invoke the L4 Leaf Agent
    logger.info(f"L2 Orchestrator: Invoking L4 Agent: {agent_name}")
    return leaf_agent.invoke(query)


@tool("holistic_tool", args_schema=L2ToolInputSchema)
async def holistic_tool(query: str) -> dict[str, Any]:
    """
    Use this tool for any query related to holistic development:
    - Clubs (e.g., "Join the debate club")
    - Achievements (e.g., "Verify Rohan's award")
    - Leaderboards (e.g., "Show the school rankings")
    """
    logger.info("L2 Orchestrator: Routing to HolisticRouter")
    # 1. Call the L3 Router
    route = await invoke_holistic_router(query)

    # 2. Check the L3 router's decision
    agent_name = route.agent_name
    if agent_name == "__self__":
        return {"response": "I can help with clubs, achievements, and leaderboards. What do you need?"}

    # 3. Find the L4 Agent to call
    leaf_agent = L4_AGENT_MAP.get(agent_name)
    if not leaf_agent:
        logger.error(f"HolisticRouter returned invalid agent name: {agent_name}")
        return {"error": f"Invalid routing decision: {agent_name}"}

    # 4. Invoke the L4 Leaf Agent
    logger.info(f"L2 Orchestrator: Invoking L4 Agent: {agent_name}")
    return leaf_agent.invoke(query)


# --- Export the list of tools ---
# These are the tools the L2 Orchestrator can use.
academics_module_tools = [
    core_curriculum_tool,
    assessment_tool,
    scheduling_tool,  # <-- ADDED
    holistic_tool,  # <-- ADDED
]

__all__ = ["academics_module_tools"]
