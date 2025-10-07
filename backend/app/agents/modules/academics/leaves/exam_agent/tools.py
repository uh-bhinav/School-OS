# backend/app/agents/modules/academics/leaves/exam_agent/tools.py

import logging
from typing import Any, Dict, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.exam_agent.schemas import (
    DefineNewExamTypeSchema,
    GetExamScheduleForClassSchema,
    GetUpcomingExamsSchema,
    ScheduleExamSchema,
)

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("schedule_exam", args_schema=ScheduleExamSchema)
def schedule_exam(
    class_name: str,
    subject_name: str,
    exam_type: str,
    exam_date: str,
    start_time: Optional[str] = None,
    duration_minutes: Optional[int] = 60,
    max_marks: Optional[float] = 100.0,
) -> Dict[str, Any]:
    """
    Schedules a new exam for a specific class and subject.
    Use this tool when a user wants to create or schedule an exam.

    Args:
        class_name: Name of the class (e.g., '10A', '12 Science')
        subject_name: Subject for the exam
        exam_type: Type of exam (e.g., 'Midterm', 'Final')
        exam_date: Date of the exam (YYYY-MM-DD format)
        start_time: Optional start time (HH:MM format)
        duration_minutes: Duration in minutes (default: 60)
        max_marks: Maximum marks for the exam (default: 100)

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:schedule_exam] Class: '{class_name}', Subject: '{subject_name}', " f"Type: '{exam_type}', Date: '{exam_date}'")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "class_name": class_name,
    #         "subject_name": subject_name,
    #         "exam_type": exam_type,
    #         "exam_date": exam_date,
    #         "start_time": start_time,
    #         "duration_minutes": duration_minutes,
    #         "max_marks": max_marks
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/exams/",
    #         json=payload,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to schedule exam: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully scheduled {exam_type} exam for {class_name} - {subject_name} on {exam_date}.",
        "exam_details": {
            "exam_id": "EXM-2025-001",
            "class_name": class_name,
            "subject_name": subject_name,
            "exam_type": exam_type,
            "exam_date": exam_date,
            "start_time": start_time or "Not specified",
            "duration_minutes": duration_minutes,
            "max_marks": max_marks,
        },
    }


@tool("get_exam_schedule_for_class", args_schema=GetExamScheduleForClassSchema)
def get_exam_schedule_for_class(
    class_name: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    subject_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Retrieves the exam schedule for a specific class.
    Use this tool when a user asks for exam schedules, exam dates, or exam timetable for a class.

    Args:
        class_name: Name of the class
        start_date: Optional filter for exams from this date onwards
        end_date: Optional filter for exams until this date
        subject_name: Optional filter for specific subject

    Returns:
        Dictionary containing exam schedule data or error information
    """
    logger.info(f"[TOOL:get_exam_schedule_for_class] Class: '{class_name}', " f"Date Range: {start_date or 'Any'} to {end_date or 'Any'}, Subject: {subject_name or 'All'}")

    # Real implementation would be:
    # try:
    #     params = {}
    #     if start_date:
    #         params["start_date"] = start_date
    #     if end_date:
    #         params["end_date"] = end_date
    #     if subject_name:
    #         params["subject_name"] = subject_name
    #
    #     response = requests.get(
    #         f"{BASE_URL}/exams/class/{class_name}",
    #         params=params,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch exam schedule: {str(e)}"}

    # Placeholder exam schedule for development/testing
    if subject_name:
        # Filtered by subject
        return {
            "status": "success",
            "class_name": class_name,
            "subject_filter": subject_name,
            "exams": [
                {
                    "exam_id": "EXM-2025-001",
                    "subject_name": subject_name,
                    "exam_type": "Midterm",
                    "exam_date": "2025-11-15",
                    "start_time": "09:00",
                    "duration_minutes": 90,
                    "max_marks": 100,
                },
                {
                    "exam_id": "EXM-2025-002",
                    "subject_name": subject_name,
                    "exam_type": "Final",
                    "exam_date": "2025-12-20",
                    "start_time": "10:00",
                    "duration_minutes": 120,
                    "max_marks": 100,
                },
            ],
        }
    else:
        # All subjects
        return {
            "status": "success",
            "class_name": class_name,
            "date_range": {
                "start": start_date or "No start date filter",
                "end": end_date or "No end date filter",
            },
            "exams": [
                {
                    "exam_id": "EXM-2025-001",
                    "subject_name": "Mathematics",
                    "exam_type": "Midterm",
                    "exam_date": "2025-11-15",
                    "start_time": "09:00",
                    "duration_minutes": 90,
                    "max_marks": 100,
                },
                {
                    "exam_id": "EXM-2025-002",
                    "subject_name": "Physics",
                    "exam_type": "Midterm",
                    "exam_date": "2025-11-16",
                    "start_time": "10:00",
                    "duration_minutes": 90,
                    "max_marks": 100,
                },
                {
                    "exam_id": "EXM-2025-003",
                    "subject_name": "Chemistry",
                    "exam_type": "Midterm",
                    "exam_date": "2025-11-17",
                    "start_time": "09:00",
                    "duration_minutes": 90,
                    "max_marks": 100,
                },
            ],
            "total_exams": 3,
        }


@tool("get_upcoming_exams", args_schema=GetUpcomingExamsSchema)
def get_upcoming_exams(
    days_ahead: Optional[int] = 7,
    class_name: Optional[str] = None,
    subject_name: Optional[str] = None,
    exam_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Retrieves upcoming exams within a specified time period.
    Use this tool when a user asks about upcoming exams, next exams, or exams in the near future.

    Args:
        days_ahead: Number of days to look ahead (default: 7)
        class_name: Optional filter by class
        subject_name: Optional filter by subject
        exam_type: Optional filter by exam type

    Returns:
        Dictionary containing upcoming exam data or error information
    """
    logger.info(f"[TOOL:get_upcoming_exams] Looking ahead: {days_ahead} days, " f"Class: {class_name or 'All'}, Subject: {subject_name or 'All'}, Type: {exam_type or 'All'}")

    # Real implementation would be:
    # try:
    #     params = {"days_ahead": days_ahead}
    #     if class_name:
    #         params["class_name"] = class_name
    #     if subject_name:
    #         params["subject_name"] = subject_name
    #     if exam_type:
    #         params["exam_type"] = exam_type
    #
    #     response = requests.get(
    #         f"{BASE_URL}/exams/upcoming",
    #         params=params,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch upcoming exams: {str(e)}"}

    # Placeholder upcoming exams for development/testing
    upcoming_exams = {
        "status": "success",
        "days_ahead": days_ahead,
        "filters": {
            "class_name": class_name or "All classes",
            "subject_name": subject_name or "All subjects",
            "exam_type": exam_type or "All types",
        },
        "exams": [
            {
                "exam_id": "EXM-2025-005",
                "class_name": class_name or "10A",
                "subject_name": subject_name or "Mathematics",
                "exam_type": exam_type or "Unit Test",
                "exam_date": "2025-10-10",
                "days_until": 4,
                "start_time": "09:00",
                "duration_minutes": 60,
            },
            {
                "exam_id": "EXM-2025-006",
                "class_name": class_name or "10A",
                "subject_name": subject_name or "Physics",
                "exam_type": exam_type or "Unit Test",
                "exam_date": "2025-10-12",
                "days_until": 6,
                "start_time": "10:00",
                "duration_minutes": 60,
            },
        ],
        "total_upcoming_exams": 2,
    }

    return upcoming_exams


@tool("define_new_exam_type", args_schema=DefineNewExamTypeSchema)
def define_new_exam_type(
    exam_type_name: str,
    description: Optional[str] = None,
    weightage: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Defines a new exam type in the system.
    Use this tool when a user wants to create a new category of exam.

    Args:
        exam_type_name: Name of the new exam type
        description: Optional description of the exam type
        weightage: Optional percentage this exam type contributes to final grades

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:define_new_exam_type] Exam Type: '{exam_type_name}', " f"Weightage: {weightage or 'Not specified'}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "exam_type_name": exam_type_name,
    #         "description": description,
    #         "weightage": weightage
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/exams/types/",
    #         json=payload,
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to define exam type: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully defined new exam type: '{exam_type_name}'.",
        "exam_type_details": {
            "exam_type_id": "EXTYPE-2025-001",
            "exam_type_name": exam_type_name,
            "description": description or "No description provided",
            "weightage": weightage,
            "is_active": True,
            "created_at": "2025-10-06T10:00:00Z",
        },
    }


# Export all tools as a list for the agent to use
exam_agent_tools = [
    schedule_exam,
    get_exam_schedule_for_class,
    get_upcoming_exams,
    define_new_exam_type,
]

# Export tool names for easy reference
__all__ = [
    "exam_agent_tools",
    "schedule_exam",
    "get_exam_schedule_for_class",
    "get_upcoming_exams",
    "define_new_exam_type",
]
