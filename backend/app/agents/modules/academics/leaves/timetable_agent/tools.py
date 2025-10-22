# backend/app/agents/modules/academics/leaves/timetable_agent/tools.py

import logging
from datetime import datetime
from typing import Any, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.timetable_agent.schemas import CreateOrUpdateTimetableEntrySchema, FindCurrentPeriodForClassSchema, FindFreeTeachersSchema, GetClassTimetableSchema, GetTeacherTimetableSchema

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("get_class_timetable", args_schema=GetClassTimetableSchema)
def get_class_timetable(class_name: str, day_of_week: Optional[str] = None) -> dict[str, Any]:
    """
    Retrieves the full weekly timetable for a specified class, showing all periods and subjects.
    Use this tool when a user asks for a class schedule, class timetable, or what subjects a class has on specific days.

    Args:
        class_name: Name of the class (e.g., '10A', 'Grade 12 Science')
        day_of_week: Optional specific day (Monday-Friday). If not provided, returns the full week.

    Returns:
        Dictionary containing the timetable data or error information
    """
    logger.info(f"[TOOL:get_class_timetable] Class: '{class_name}', Day: {day_of_week or 'Full Week'}")

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

    # Placeholder timetable data for development/testing
    full_week_schedule = {
        "Monday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "subject": "Mathematics",
                "teacher": "Mrs. Sharma",
                "room": "101",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "subject": "Physics",
                "teacher": "Mr. Kumar",
                "room": "Lab-1",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "subject": "Chemistry",
                "teacher": "Dr. Patel",
                "room": "Lab-2",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "subject": "English",
                "teacher": "Ms. Reddy",
                "room": "102",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "subject": "Biology",
                "teacher": "Dr. Singh",
                "room": "Lab-3",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "subject": "Physical Education",
                "teacher": "Mr. Mehta",
                "room": "Playground",
            },
        ],
        "Tuesday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "subject": "Chemistry",
                "teacher": "Dr. Patel",
                "room": "Lab-2",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "subject": "Mathematics",
                "teacher": "Mrs. Sharma",
                "room": "101",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "subject": "English",
                "teacher": "Ms. Reddy",
                "room": "102",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "subject": "Physics",
                "teacher": "Mr. Kumar",
                "room": "Lab-1",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "subject": "Computer Science",
                "teacher": "Mr. Gupta",
                "room": "Computer Lab",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "subject": "Social Studies",
                "teacher": "Mrs. Nair",
                "room": "103",
            },
        ],
        "Wednesday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "subject": "Biology",
                "teacher": "Dr. Singh",
                "room": "Lab-3",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "subject": "English",
                "teacher": "Ms. Reddy",
                "room": "102",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "subject": "Mathematics",
                "teacher": "Mrs. Sharma",
                "room": "101",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "subject": "Physics",
                "teacher": "Mr. Kumar",
                "room": "Lab-1",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "subject": "Chemistry",
                "teacher": "Dr. Patel",
                "room": "Lab-2",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "subject": "Art",
                "teacher": "Mrs. Joshi",
                "room": "Art Room",
            },
        ],
        "Thursday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "subject": "Mathematics",
                "teacher": "Mrs. Sharma",
                "room": "101",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "subject": "Social Studies",
                "teacher": "Mrs. Nair",
                "room": "103",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "subject": "Computer Science",
                "teacher": "Mr. Gupta",
                "room": "Computer Lab",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "subject": "English",
                "teacher": "Ms. Reddy",
                "room": "102",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "subject": "Physics",
                "teacher": "Mr. Kumar",
                "room": "Lab-1",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "subject": "Chemistry",
                "teacher": "Dr. Patel",
                "room": "Lab-2",
            },
        ],
        "Friday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "subject": "English",
                "teacher": "Ms. Reddy",
                "room": "102",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "subject": "Biology",
                "teacher": "Dr. Singh",
                "room": "Lab-3",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "subject": "Mathematics",
                "teacher": "Mrs. Sharma",
                "room": "101",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "subject": "Social Studies",
                "teacher": "Mrs. Nair",
                "room": "103",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "subject": "Physical Education",
                "teacher": "Mr. Mehta",
                "room": "Playground",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "subject": "Library Period",
                "teacher": "Mrs. Desai",
                "room": "Library",
            },
        ],
    }

    # If a specific day is requested, filter the schedule
    if day_of_week:
        day_schedule = full_week_schedule.get(day_of_week.capitalize())
        if not day_schedule:
            return {
                "status": "error",
                "error": f"Invalid day: {day_of_week}. Please use Monday-Friday.",
            }
        return {
            "status": "success",
            "class_name": class_name,
            "day_of_week": day_of_week.capitalize(),
            "schedule": day_schedule,
            "total_periods": len(day_schedule),
        }

    # Return full week schedule
    return {
        "status": "success",
        "class_name": class_name,
        "week_schedule": full_week_schedule,
        "total_days": len(full_week_schedule),
    }


@tool("get_teacher_timetable", args_schema=GetTeacherTimetableSchema)
def get_teacher_timetable(teacher_name: str, day_of_week: Optional[str] = None) -> dict[str, Any]:
    """
    Fetches the weekly teaching schedule for a specific teacher, including classes and subjects.
    Use this tool when a user asks about a teacher's schedule, which classes they teach, or their availability.

    Args:
        teacher_name: Full name of the teacher
        day_of_week: Optional specific day (Monday-Friday). If not provided, returns the full week.

    Returns:
        Dictionary containing the teacher's timetable data or error information
    """
    logger.info(f"[TOOL:get_teacher_timetable] Teacher: '{teacher_name}', Day: {day_of_week or 'Full Week'}")

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

    # Placeholder teacher schedule for development/testing
    # Simulating Mrs. Sharma's Mathematics teaching schedule
    teacher_week_schedule = {
        "Monday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "class": "10A",
                "subject": "Mathematics",
                "room": "101",
            },
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "class": "9B",
                "subject": "Mathematics",
                "room": "105",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "class": "11A",
                "subject": "Mathematics",
                "room": "201",
            },
        ],
        "Tuesday": [
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "class": "10A",
                "subject": "Mathematics",
                "room": "101",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "class": "12A",
                "subject": "Mathematics",
                "room": "202",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "class": "9A",
                "subject": "Mathematics",
                "room": "104",
            },
        ],
        "Wednesday": [
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "class": "10A",
                "subject": "Mathematics",
                "room": "101",
            },
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "class": "11A",
                "subject": "Mathematics",
                "room": "201",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "class": "9B",
                "subject": "Mathematics",
                "room": "105",
            },
        ],
        "Thursday": [
            {
                "period": 1,
                "start_time": "08:00",
                "end_time": "08:45",
                "class": "10A",
                "subject": "Mathematics",
                "room": "101",
            },
            {
                "period": 4,
                "start_time": "10:45",
                "end_time": "11:30",
                "class": "9A",
                "subject": "Mathematics",
                "room": "104",
            },
            {
                "period": 6,
                "start_time": "13:00",
                "end_time": "13:45",
                "class": "12A",
                "subject": "Mathematics",
                "room": "202",
            },
        ],
        "Friday": [
            {
                "period": 3,
                "start_time": "09:40",
                "end_time": "10:25",
                "class": "10A",
                "subject": "Mathematics",
                "room": "101",
            },
            {
                "period": 2,
                "start_time": "08:50",
                "end_time": "09:35",
                "class": "11A",
                "subject": "Mathematics",
                "room": "201",
            },
            {
                "period": 5,
                "start_time": "11:35",
                "end_time": "12:20",
                "class": "9B",
                "subject": "Mathematics",
                "room": "105",
            },
        ],
    }

    # If a specific day is requested, filter the schedule
    if day_of_week:
        day_schedule = teacher_week_schedule.get(day_of_week.capitalize())
        if not day_schedule:
            return {
                "status": "error",
                "error": f"Invalid day: {day_of_week}. Please use Monday-Friday.",
            }
        return {
            "status": "success",
            "teacher_name": teacher_name,
            "day_of_week": day_of_week.capitalize(),
            "schedule": day_schedule,
            "total_periods": len(day_schedule),
            "free_periods": 6 - len(day_schedule),
        }

    # Return full week schedule
    total_teaching_periods = sum(len(periods) for periods in teacher_week_schedule.values())
    return {
        "status": "success",
        "teacher_name": teacher_name,
        "week_schedule": teacher_week_schedule,
        "total_teaching_periods": total_teaching_periods,
        "total_free_periods": 30 - total_teaching_periods,  # Assuming 6 periods/day * 5 days = 30
    }


@tool("find_current_period_for_class", args_schema=FindCurrentPeriodForClassSchema)
def find_current_period_for_class(class_name: str) -> dict[str, Any]:
    """
    Identifies the subject and teacher for the ongoing period in a given class.
    Use this tool when asked "what is happening right now", "current period", or "what class is going on".

    Args:
        class_name: Name of the class

    Returns:
        Dictionary containing current period information or error information
    """
    logger.info(f"[TOOL:find_current_period_for_class] Class: '{class_name}'")

    # Real implementation would be:
    # try:
    #     response = requests.get(
    #         f"{BASE_URL}/timetable/current-period/{class_name}",
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch current period: {str(e)}"}

    # Simulate current time and determine current period
    current_time = datetime.now()
    current_day = current_time.strftime("%A")

    # Check if it's a weekday
    if current_day in ["Saturday", "Sunday"]:
        return {
            "status": "success",
            "class_name": class_name,
            "current_day": current_day,
            "message": "It's a weekend. No classes scheduled.",
            "is_class_time": False,
        }

    # Simulated time-based period detection (simplified)
    current_hour = current_time.hour
    current_minute = current_time.minute

    # Define period timings
    periods = [
        {"period": 1, "start": (8, 0), "end": (8, 45)},
        {"period": 2, "start": (8, 50), "end": (9, 35)},
        {"period": 3, "start": (9, 40), "end": (10, 25)},
        {"period": 4, "start": (10, 45), "end": (11, 30)},
        {"period": 5, "start": (11, 35), "end": (12, 20)},
        {"period": 6, "start": (13, 0), "end": (13, 45)},
    ]

    current_period = None
    for period_info in periods:
        start_h, start_m = period_info["start"]
        end_h, end_m = period_info["end"]

        if (current_hour > start_h or (current_hour == start_h and current_minute >= start_m)) and (current_hour < end_h or (current_hour == end_h and current_minute < end_m)):
            current_period = period_info["period"]
            break

    if not current_period:
        return {
            "status": "success",
            "class_name": class_name,
            "current_day": current_day,
            "message": "No class is currently in session. It might be a break or outside school hours.",
            "is_class_time": False,
        }

    # Return placeholder data for the current period
    return {
        "status": "success",
        "class_name": class_name,
        "current_day": current_day,
        "current_period": current_period,
        "subject": "Mathematics",
        "teacher": "Mrs. Sharma",
        "room": "101",
        "start_time": "09:40",
        "end_time": "10:25",
        "is_class_time": True,
    }


@tool("find_free_teachers", args_schema=FindFreeTeachersSchema)
def find_free_teachers(day_of_week: str, period_number: int) -> dict[str, Any]:
    """
    Lists all teachers who do not have a class assigned during a specific period.
    Use this tool when asked about teacher availability, free teachers, or who can substitute.

    Args:
        day_of_week: Day of the week (Monday-Friday)
        period_number: Period number (1-6)

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
    #     return {"error": f"Failed to fetch free teachers: {str(e)}"}

    # Validate inputs
    valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if day_of_week.capitalize() not in valid_days:
        return {
            "status": "error",
            "error": f"Invalid day: {day_of_week}. Please use Monday-Friday.",
        }

    if not 1 <= period_number <= 6:
        return {
            "status": "error",
            "error": f"Invalid period number: {period_number}. Please use 1-6.",
        }

    # Placeholder data for free teachers
    return {
        "status": "success",
        "day_of_week": day_of_week.capitalize(),
        "period_number": period_number,
        "free_teachers": [
            {
                "teacher_name": "Dr. Iyer",
                "department": "Mathematics",
                "phone": "+91-9876543222",
                "email": "dr.iyer@school.edu",
            },
            {
                "teacher_name": "Mrs. Verma",
                "department": "English",
                "phone": "+91-9876543223",
                "email": "verma@school.edu",
            },
            {
                "teacher_name": "Mr. Rao",
                "department": "Social Studies",
                "phone": "+91-9876543224",
                "email": "rao@school.edu",
            },
        ],
        "total_free_teachers": 3,
    }


@tool("update_timetable_entry", args_schema=CreateOrUpdateTimetableEntrySchema)
def update_timetable_entry(
    class_name: str,
    day_of_week: str,
    period_number: int,
    subject: str,
    teacher_name: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    room_number: Optional[str] = None,
) -> dict[str, Any]:
    """
    Creates or modifies a single entry in the timetable (Admin-only operation).
    Use this tool when an administrator wants to update, create, or modify a timetable entry.

    Args:
        class_name: Name of the class
        day_of_week: Day of the week (Monday-Friday)
        period_number: Period number (1-6)
        subject: Subject name
        teacher_name: Teacher assigned to this period
        start_time: Optional start time (format: HH:MM)
        end_time: Optional end time (format: HH:MM)
        room_number: Optional room number

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:update_timetable_entry] Class: '{class_name}', Day: '{day_of_week}', " f"Period: {period_number}, Subject: '{subject}', Teacher: '{teacher_name}'")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "class_name": class_name,
    #         "day_of_week": day_of_week,
    #         "period_number": period_number,
    #         "subject": subject,
    #         "teacher_name": teacher_name,
    #         "start_time": start_time,
    #         "end_time": end_time,
    #         "room_number": room_number
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/timetable/update",
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
    #     return {"error": f"Failed to update timetable: {str(e)}"}

    # Validate inputs
    valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if day_of_week.capitalize() not in valid_days:
        return {
            "status": "error",
            "error": f"Invalid day: {day_of_week}. Please use Monday-Friday.",
        }

    if not 1 <= period_number <= 6:
        return {
            "status": "error",
            "error": f"Invalid period number: {period_number}. Please use 1-6.",
        }

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully updated timetable entry for {class_name} on {day_of_week.capitalize()}, Period {period_number}.",
        "entry_details": {
            "entry_id": "TT-2025-001",
            "class_name": class_name,
            "day_of_week": day_of_week.capitalize(),
            "period_number": period_number,
            "subject": subject,
            "teacher_name": teacher_name,
            "start_time": start_time or "09:40",
            "end_time": end_time or "10:25",
            "room_number": room_number or "TBA",
            "updated_at": datetime.now().isoformat(),
            "updated_by": "ADMIN-001",
        },
    }


# Export all tools as a list for the agent to use
timetable_agent_tools = [
    get_class_timetable,
    get_teacher_timetable,
    find_current_period_for_class,
    find_free_teachers,
    update_timetable_entry,
]

# Export tool names for easy reference
__all__ = [
    "timetable_agent_tools",
    "get_class_timetable",
    "get_teacher_timetable",
    "find_current_period_for_class",
    "find_free_teachers",
    "update_timetable_entry",
]
