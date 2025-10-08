# backend/app/agents/modules/academics/leaves/timetable_agent/tools.py

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.timetable_agent.schemas import (
    CreateOrUpdateTimetableEntrySchema,
    FindCurrentPeriodForClassSchema,
    FindFreeTeachersSchema,
    GetClassTimetableSchema,
    GetTeacherTimetableSchema,
)

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("get_class_timetable", args_schema=GetClassTimetableSchema)
def get_class_timetable(class_name: str, day_of_week: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieves the full weekly timetable for a specified class, showing all periods and subjects.
    Use this tool when a user asks for a class schedule, timetable, or what subjects a class has.

    Args:
        class_name: Name of the class (e.g., '10A', '12 Science')
        day_of_week: Optional filter for specific day

    Returns:
        Dictionary containing timetable data or error information
    """
    logger.info(f"[TOOL:get_class_timetable] Class: '{class_name}', " f"Day: {day_of_week or 'All days'}")

    # Real implementation would be:
    # try:
    #     params = {}
    #     if day_of_week:
    #         params["day_of_week"] = day_of_week
    #
    #     response = requests.get(
    #         f"{BASE_URL}/timetable/class/{class_name}",
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
    #     return {"error": f"Failed to fetch class timetable: {str(e)}"}

    # Placeholder timetable for development/testing
    if day_of_week:
        # Single day timetable
        return {
            "status": "success",
            "class_name": class_name,
            "day_of_week": day_of_week,
            "periods": [
                {
                    "period_number": 1,
                    "subject_name": "Mathematics",
                    "teacher_name": "Mr. Sharma",
                    "start_time": "08:00",
                    "end_time": "08:45",
                    "room_number": "Room 301",
                },
                {
                    "period_number": 2,
                    "subject_name": "Physics",
                    "teacher_name": "Mrs. Patel",
                    "start_time": "08:50",
                    "end_time": "09:35",
                    "room_number": "Lab 1",
                },
                {
                    "period_number": 3,
                    "subject_name": "English",
                    "teacher_name": "Ms. Verma",
                    "start_time": "09:40",
                    "end_time": "10:25",
                    "room_number": "Room 205",
                },
                {
                    "period_number": 4,
                    "subject_name": "Break",
                    "teacher_name": None,
                    "start_time": "10:25",
                    "end_time": "10:45",
                    "room_number": None,
                },
                {
                    "period_number": 5,
                    "subject_name": "Chemistry",
                    "teacher_name": "Dr. Kumar",
                    "start_time": "10:45",
                    "end_time": "11:30",
                    "room_number": "Lab 2",
                },
                {
                    "period_number": 6,
                    "subject_name": "History",
                    "teacher_name": "Mr. Reddy",
                    "start_time": "11:35",
                    "end_time": "12:20",
                    "room_number": "Room 102",
                },
            ],
            "total_periods": 6,
        }
    else:
        # Full weekly timetable
        return {
            "status": "success",
            "class_name": class_name,
            "week_timetable": {
                "Monday": [
                    {
                        "period_number": 1,
                        "subject_name": "Mathematics",
                        "teacher_name": "Mr. Sharma",
                        "start_time": "08:00",
                        "end_time": "08:45",
                    },
                    {
                        "period_number": 2,
                        "subject_name": "Physics",
                        "teacher_name": "Mrs. Patel",
                        "start_time": "08:50",
                        "end_time": "09:35",
                    },
                    {
                        "period_number": 3,
                        "subject_name": "English",
                        "teacher_name": "Ms. Verma",
                        "start_time": "09:40",
                        "end_time": "10:25",
                    },
                    {
                        "period_number": 4,
                        "subject_name": "Break",
                        "teacher_name": None,
                        "start_time": "10:25",
                        "end_time": "10:45",
                    },
                    {
                        "period_number": 5,
                        "subject_name": "Chemistry",
                        "teacher_name": "Dr. Kumar",
                        "start_time": "10:45",
                        "end_time": "11:30",
                    },
                    {
                        "period_number": 6,
                        "subject_name": "History",
                        "teacher_name": "Mr. Reddy",
                        "start_time": "11:35",
                        "end_time": "12:20",
                    },
                ],
                "Tuesday": [
                    {
                        "period_number": 1,
                        "subject_name": "Chemistry",
                        "teacher_name": "Dr. Kumar",
                        "start_time": "08:00",
                        "end_time": "08:45",
                    },
                    {
                        "period_number": 2,
                        "subject_name": "Mathematics",
                        "teacher_name": "Mr. Sharma",
                        "start_time": "08:50",
                        "end_time": "09:35",
                    },
                    {
                        "period_number": 3,
                        "subject_name": "History",
                        "teacher_name": "Mr. Reddy",
                        "start_time": "09:40",
                        "end_time": "10:25",
                    },
                    {
                        "period_number": 4,
                        "subject_name": "Break",
                        "teacher_name": None,
                        "start_time": "10:25",
                        "end_time": "10:45",
                    },
                    {
                        "period_number": 5,
                        "subject_name": "English",
                        "teacher_name": "Ms. Verma",
                        "start_time": "10:45",
                        "end_time": "11:30",
                    },
                    {
                        "period_number": 6,
                        "subject_name": "Physics",
                        "teacher_name": "Mrs. Patel",
                        "start_time": "11:35",
                        "end_time": "12:20",
                    },
                ],
                "Wednesday": [
                    {
                        "period_number": 1,
                        "subject_name": "English",
                        "teacher_name": "Ms. Verma",
                        "start_time": "08:00",
                        "end_time": "08:45",
                    },
                    {
                        "period_number": 2,
                        "subject_name": "History",
                        "teacher_name": "Mr. Reddy",
                        "start_time": "08:50",
                        "end_time": "09:35",
                    },
                    {
                        "period_number": 3,
                        "subject_name": "Physics",
                        "teacher_name": "Mrs. Patel",
                        "start_time": "09:40",
                        "end_time": "10:25",
                    },
                    {
                        "period_number": 4,
                        "subject_name": "Break",
                        "teacher_name": None,
                        "start_time": "10:25",
                        "end_time": "10:45",
                    },
                    {
                        "period_number": 5,
                        "subject_name": "Mathematics",
                        "teacher_name": "Mr. Sharma",
                        "start_time": "10:45",
                        "end_time": "11:30",
                    },
                    {
                        "period_number": 6,
                        "subject_name": "Chemistry",
                        "teacher_name": "Dr. Kumar",
                        "start_time": "11:35",
                        "end_time": "12:20",
                    },
                ],
                "Thursday": [
                    {
                        "period_number": 1,
                        "subject_name": "Physics",
                        "teacher_name": "Mrs. Patel",
                        "start_time": "08:00",
                        "end_time": "08:45",
                    },
                    {
                        "period_number": 2,
                        "subject_name": "English",
                        "teacher_name": "Ms. Verma",
                        "start_time": "08:50",
                        "end_time": "09:35",
                    },
                    {
                        "period_number": 3,
                        "subject_name": "Mathematics",
                        "teacher_name": "Mr. Sharma",
                        "start_time": "09:40",
                        "end_time": "10:25",
                    },
                    {
                        "period_number": 4,
                        "subject_name": "Break",
                        "teacher_name": None,
                        "start_time": "10:25",
                        "end_time": "10:45",
                    },
                    {
                        "period_number": 5,
                        "subject_name": "History",
                        "teacher_name": "Mr. Reddy",
                        "start_time": "10:45",
                        "end_time": "11:30",
                    },
                    {
                        "period_number": 6,
                        "subject_name": "Chemistry",
                        "teacher_name": "Dr. Kumar",
                        "start_time": "11:35",
                        "end_time": "12:20",
                    },
                ],
                "Friday": [
                    {
                        "period_number": 1,
                        "subject_name": "History",
                        "teacher_name": "Mr. Reddy",
                        "start_time": "08:00",
                        "end_time": "08:45",
                    },
                    {
                        "period_number": 2,
                        "subject_name": "Chemistry",
                        "teacher_name": "Dr. Kumar",
                        "start_time": "08:50",
                        "end_time": "09:35",
                    },
                    {
                        "period_number": 3,
                        "subject_name": "Physics",
                        "teacher_name": "Mrs. Patel",
                        "start_time": "09:40",
                        "end_time": "10:25",
                    },
                    {
                        "period_number": 4,
                        "subject_name": "Break",
                        "teacher_name": None,
                        "start_time": "10:25",
                        "end_time": "10:45",
                    },
                    {
                        "period_number": 5,
                        "subject_name": "English",
                        "teacher_name": "Ms. Verma",
                        "start_time": "10:45",
                        "end_time": "11:30",
                    },
                    {
                        "period_number": 6,
                        "subject_name": "Mathematics",
                        "teacher_name": "Mr. Sharma",
                        "start_time": "11:35",
                        "end_time": "12:20",
                    },
                ],
            },
            "total_days": 5,
        }


@tool("get_teacher_timetable", args_schema=GetTeacherTimetableSchema)
def get_teacher_timetable(teacher_name: str, day_of_week: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetches the weekly teaching schedule for a specific teacher, including classes and subjects.
    Use this tool when a user asks about a teacher's schedule or what classes a teacher teaches.

    Args:
        teacher_name: Name of the teacher
        day_of_week: Optional filter for specific day

    Returns:
        Dictionary containing teacher timetable data or error information
    """
    logger.info(f"[TOOL:get_teacher_timetable] Teacher: '{teacher_name}', " f"Day: {day_of_week or 'All days'}")

    # Real implementation would be:
    # try:
    #     params = {}
    #     if day_of_week:
    #         params["day_of_week"] = day_of_week
    #
    #     response = requests.get(
    #         f"{BASE_URL}/timetable/teacher/{teacher_name}",
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
    #     return {"error": f"Failed to fetch teacher timetable: {str(e)}"}

    # Placeholder teacher timetable for development/testing
    if day_of_week:
        # Single day schedule
        return {
            "status": "success",
            "teacher_name": teacher_name,
            "day_of_week": day_of_week,
            "periods": [
                {
                    "period_number": 1,
                    "class_name": "10A",
                    "subject_name": "Mathematics",
                    "start_time": "08:00",
                    "end_time": "08:45",
                    "room_number": "Room 301",
                },
                {
                    "period_number": 2,
                    "class_name": "10B",
                    "subject_name": "Mathematics",
                    "start_time": "08:50",
                    "end_time": "09:35",
                    "room_number": "Room 302",
                },
                {
                    "period_number": 3,
                    "class_name": "Free",
                    "subject_name": None,
                    "start_time": "09:40",
                    "end_time": "10:25",
                    "room_number": None,
                },
                {
                    "period_number": 5,
                    "class_name": "11A",
                    "subject_name": "Mathematics",
                    "start_time": "10:45",
                    "end_time": "11:30",
                    "room_number": "Room 301",
                },
                {
                    "period_number": 6,
                    "class_name": "12A",
                    "subject_name": "Mathematics",
                    "start_time": "11:35",
                    "end_time": "12:20",
                    "room_number": "Room 305",
                },
            ],
            "total_classes": 4,
            "free_periods": 1,
        }
    else:
        # Full weekly schedule
        return {
            "status": "success",
            "teacher_name": teacher_name,
            "week_schedule": {
                "Monday": [
                    {
                        "period_number": 1,
                        "class_name": "10A",
                        "subject_name": "Mathematics",
                        "start_time": "08:00",
                        "end_time": "08:45",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 2,
                        "class_name": "10B",
                        "subject_name": "Mathematics",
                        "start_time": "08:50",
                        "end_time": "09:35",
                        "room_number": "Room 302",
                    },
                    {
                        "period_number": 3,
                        "class_name": "Free",
                        "subject_name": None,
                        "start_time": "09:40",
                        "end_time": "10:25",
                        "room_number": None,
                    },
                    {
                        "period_number": 5,
                        "class_name": "11A",
                        "subject_name": "Mathematics",
                        "start_time": "10:45",
                        "end_time": "11:30",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 6,
                        "class_name": "12A",
                        "subject_name": "Mathematics",
                        "start_time": "11:35",
                        "end_time": "12:20",
                        "room_number": "Room 305",
                    },
                ],
                "Tuesday": [
                    {
                        "period_number": 1,
                        "class_name": "11B",
                        "subject_name": "Mathematics",
                        "start_time": "08:00",
                        "end_time": "08:45",
                        "room_number": "Room 303",
                    },
                    {
                        "period_number": 2,
                        "class_name": "10A",
                        "subject_name": "Mathematics",
                        "start_time": "08:50",
                        "end_time": "09:35",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 3,
                        "class_name": "Free",
                        "subject_name": None,
                        "start_time": "09:40",
                        "end_time": "10:25",
                        "room_number": None,
                    },
                    {
                        "period_number": 5,
                        "class_name": "12B",
                        "subject_name": "Mathematics",
                        "start_time": "10:45",
                        "end_time": "11:30",
                        "room_number": "Room 306",
                    },
                    {
                        "period_number": 6,
                        "class_name": "10B",
                        "subject_name": "Mathematics",
                        "start_time": "11:35",
                        "end_time": "12:20",
                        "room_number": "Room 302",
                    },
                ],
                "Wednesday": [
                    {
                        "period_number": 1,
                        "class_name": "12A",
                        "subject_name": "Mathematics",
                        "start_time": "08:00",
                        "end_time": "08:45",
                        "room_number": "Room 305",
                    },
                    {
                        "period_number": 2,
                        "class_name": "Free",
                        "subject_name": None,
                        "start_time": "08:50",
                        "end_time": "09:35",
                        "room_number": None,
                    },
                    {
                        "period_number": 3,
                        "class_name": "11A",
                        "subject_name": "Mathematics",
                        "start_time": "09:40",
                        "end_time": "10:25",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 5,
                        "class_name": "10A",
                        "subject_name": "Mathematics",
                        "start_time": "10:45",
                        "end_time": "11:30",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 6,
                        "class_name": "10B",
                        "subject_name": "Mathematics",
                        "start_time": "11:35",
                        "end_time": "12:20",
                        "room_number": "Room 302",
                    },
                ],
                "Thursday": [
                    {
                        "period_number": 1,
                        "class_name": "Free",
                        "subject_name": None,
                        "start_time": "08:00",
                        "end_time": "08:45",
                        "room_number": None,
                    },
                    {
                        "period_number": 2,
                        "class_name": "11B",
                        "subject_name": "Mathematics",
                        "start_time": "08:50",
                        "end_time": "09:35",
                        "room_number": "Room 303",
                    },
                    {
                        "period_number": 3,
                        "class_name": "10A",
                        "subject_name": "Mathematics",
                        "start_time": "09:40",
                        "end_time": "10:25",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 5,
                        "class_name": "12A",
                        "subject_name": "Mathematics",
                        "start_time": "10:45",
                        "end_time": "11:30",
                        "room_number": "Room 305",
                    },
                    {
                        "period_number": 6,
                        "class_name": "12B",
                        "subject_name": "Mathematics",
                        "start_time": "11:35",
                        "end_time": "12:20",
                        "room_number": "Room 306",
                    },
                ],
                "Friday": [
                    {
                        "period_number": 1,
                        "class_name": "10B",
                        "subject_name": "Mathematics",
                        "start_time": "08:00",
                        "end_time": "08:45",
                        "room_number": "Room 302",
                    },
                    {
                        "period_number": 2,
                        "class_name": "11A",
                        "subject_name": "Mathematics",
                        "start_time": "08:50",
                        "end_time": "09:35",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 3,
                        "class_name": "Free",
                        "subject_name": None,
                        "start_time": "09:40",
                        "end_time": "10:25",
                        "room_number": None,
                    },
                    {
                        "period_number": 5,
                        "class_name": "10A",
                        "subject_name": "Mathematics",
                        "start_time": "10:45",
                        "end_time": "11:30",
                        "room_number": "Room 301",
                    },
                    {
                        "period_number": 6,
                        "class_name": "12A",
                        "subject_name": "Mathematics",
                        "start_time": "11:35",
                        "end_time": "12:20",
                        "room_number": "Room 305",
                    },
                ],
            },
            "total_days": 5,
            "total_classes_per_week": 20,
            "free_periods_per_week": 5,
        }


@tool("find_current_period_for_class", args_schema=FindCurrentPeriodForClassSchema)
def find_current_period_for_class(class_name: str) -> Dict[str, Any]:
    """
    Identifies the subject and teacher for the ongoing period in a given class.
    Use this tool when a user asks what class is happening now, what's the current period, or who's teaching now.

    Args:
        class_name: Name of the class to check

    Returns:
        Dictionary containing current period information or error information
    """
    logger.info(f"[TOOL:find_current_period_for_class] Class: '{class_name}'")

    # Real implementation would be:
    # try:
    #     response = requests.get(
    #         f"{BASE_URL}/timetable/class/{class_name}/current-period",
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to find current period: {str(e)}"}

    # Get current time and day for simulation
    now = datetime.now()
    current_day = now.strftime("%A")
    current_time = now.strftime("%H:%M")

    # Placeholder current period for development/testing
    # Simulating it's during period 2 on a weekday
    return {
        "status": "success",
        "class_name": class_name,
        "current_day": current_day,
        "current_time": current_time,
        "current_period": {
            "period_number": 2,
            "subject_name": "Physics",
            "teacher_name": "Mrs. Patel",
            "start_time": "08:50",
            "end_time": "09:35",
            "room_number": "Lab 1",
            "time_remaining_minutes": 15,
        },
        "next_period": {
            "period_number": 3,
            "subject_name": "English",
            "teacher_name": "Ms. Verma",
            "start_time": "09:40",
            "end_time": "10:25",
            "room_number": "Room 205",
        },
    }


@tool("find_free_teachers", args_schema=FindFreeTeachersSchema)
def find_free_teachers(day_of_week: str, period_number: int) -> Dict[str, Any]:
    """
    Lists all teachers who do not have a class assigned during a specific period.
    Use this tool when a user asks for available teachers, free teachers, or teachers for substitution.

    Args:
        day_of_week: The day to check (e.g., 'Monday')
        period_number: The period number to check

    Returns:
        Dictionary containing list of free teachers or error information
    """
    logger.info(f"[TOOL:find_free_teachers] Day: '{day_of_week}', Period: {period_number}")

    # Real implementation would be:
    # try:
    #     params = {
    #         "day_of_week": day_of_week,
    #         "period_number": period_number
    #     }
    #     response = requests.get(
    #         f"{BASE_URL}/timetable/free-teachers",
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
    #     return {"error": f"Failed to find free teachers: {str(e)}"}

    # Placeholder free teachers list for development/testing
    return {
        "status": "success",
        "day_of_week": day_of_week,
        "period_number": period_number,
        "period_time": "08:50 - 09:35",
        "free_teachers": [
            {
                "teacher_name": "Mr. Singh",
                "subject_specialization": "Biology",
                "department": "Science",
                "contact_extension": "305",
            },
            {
                "teacher_name": "Ms. Gupta",
                "subject_specialization": "Computer Science",
                "department": "Technology",
                "contact_extension": "412",
            },
            {
                "teacher_name": "Dr. Iyer",
                "subject_specialization": "Chemistry",
                "department": "Science",
                "contact_extension": "307",
            },
            {
                "teacher_name": "Mrs. Nair",
                "subject_specialization": "Geography",
                "department": "Social Studies",
                "contact_extension": "210",
            },
        ],
        "total_free_teachers": 4,
        "note": "These teachers are available for substitution during this period",
    }


@tool("create_or_update_timetable_entry", args_schema=CreateOrUpdateTimetableEntrySchema)
def create_or_update_timetable_entry(
    class_name: str,
    day_of_week: str,
    period_number: int,
    subject_name: str,
    teacher_name: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    room_number: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates or modifies a single entry in the timetable (Admin-only operation).
    Use this tool when a user wants to schedule a class, assign a teacher, or update the timetable.

    Args:
        class_name: Name of the class
        day_of_week: Day of the week
        period_number: Period number
        subject_name: Subject to be taught
        teacher_name: Teacher assigned
        start_time: Optional start time
        end_time: Optional end time
        room_number: Optional room number

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:create_or_update_timetable_entry] Class: '{class_name}', " f"Day: '{day_of_week}', Period: {period_number}, Subject: '{subject_name}', Teacher: '{teacher_name}'")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "class_name": class_name,
    #         "day_of_week": day_of_week,
    #         "period_number": period_number,
    #         "subject_name": subject_name,
    #         "teacher_name": teacher_name,
    #         "start_time": start_time,
    #         "end_time": end_time,
    #         "room_number": room_number
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/timetable/entry",
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
    #     return {"error": f"Failed to create/update timetable entry: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully created/updated timetable entry for {class_name} on {day_of_week}, Period {period_number}.",
        "timetable_entry": {
            "entry_id": "TT-2025-001",
            "class_name": class_name,
            "day_of_week": day_of_week,
            "period_number": period_number,
            "subject_name": subject_name,
            "teacher_name": teacher_name,
            "start_time": start_time or "Not specified",
            "end_time": end_time or "Not specified",
            "room_number": room_number or "Not assigned",
            "is_active": True,
            "last_modified": "2025-10-06T10:30:00Z",
        },
    }


# Export all tools as a list for the agent to use
timetable_agent_tools = [
    get_class_timetable,
    get_teacher_timetable,
    find_current_period_for_class,
    find_free_teachers,
    create_or_update_timetable_entry,
]

# Export tool names for easy reference
__all__ = [
    "timetable_agent_tools",
    "get_class_timetable",
    "get_teacher_timetable",
    "find_current_period_for_class",
    "find_free_teachers",
    "create_or_update_timetable_entry",
]
