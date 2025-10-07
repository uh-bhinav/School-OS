# backend/app/agents/modules/academics/leaves/class_agent/tools.py

import logging
from typing import Any, Dict, Optional

from langchain_core.tools import tool

from app.agents.modules.academics.leaves.class_agent.schemas import (
    AssignClassTeacherSchema,
    CreateNewClassSchema,
    GetClassDetailsSchema,
    GetClassScheduleSchema,
    ListAllClassesSchema,
    ListStudentsInClassSchema,
)

# Set up logging for tool activity
logger = logging.getLogger(__name__)

# Base URL for API calls (would be from environment in production)
BASE_URL = "http://localhost:8000/api/v1"


@tool("create_new_class", args_schema=CreateNewClassSchema)
def create_new_class(
    class_name: str,
    academic_year: str,
    grade_level: Optional[int] = None,
    section: Optional[str] = None,
    max_students: Optional[int] = 40,
) -> Dict[str, Any]:
    """
    Creates a new class or section for a specific academic year.
    Use this tool when a user wants to create or set up a new class.

    Args:
        class_name: Name of the class (e.g., '10A', 'Grade 12 Science')
        academic_year: Academic year (e.g., '2024-2025')
        grade_level: Optional grade level (e.g., 10)
        section: Optional section identifier (e.g., 'A', 'B')
        max_students: Maximum students allowed (default: 40)

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:create_new_class] Class: '{class_name}', Academic Year: '{academic_year}', " f"Grade: {grade_level}, Section: {section}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "class_name": class_name,
    #         "academic_year": academic_year,
    #         "grade_level": grade_level,
    #         "section": section,
    #         "max_students": max_students
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/classes/",
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
    #     return {"error": f"Failed to create class: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully created class '{class_name}' for academic year {academic_year}.",
        "class_details": {
            "class_id": "CLS-2025-001",
            "class_name": class_name,
            "academic_year": academic_year,
            "grade_level": grade_level,
            "section": section,
            "max_students": max_students,
            "current_students": 0,
            "class_teacher": "Not assigned yet",
            "is_active": True,
            "created_at": "2025-10-06T10:00:00Z",
        },
    }


@tool("get_class_details", args_schema=GetClassDetailsSchema)
def get_class_details(class_name: str) -> Dict[str, Any]:
    """
    Retrieves key details about a specific class.
    Use this tool when a user asks for information about a class.

    Args:
        class_name: Name of the class

    Returns:
        Dictionary containing class details or error information
    """
    logger.info(f"[TOOL:get_class_details] Class: '{class_name}'")

    # Real implementation would be:
    # try:
    #     response = requests.get(
    #         f"{BASE_URL}/classes/{class_name}",
    #         timeout=10
    #     )
    #     response.raise_for_status()
    #     return response.json()
    # except requests.Timeout:
    #     logger.error("API request timed out")
    #     return {"error": "Request timed out. Please try again."}
    # except requests.RequestException as e:
    #     logger.error(f"API call failed: {e}")
    #     return {"error": f"Failed to fetch class details: {str(e)}"}

    # Placeholder class details for development/testing
    return {
        "status": "success",
        "class_details": {
            "class_id": "CLS-2025-001",
            "class_name": class_name,
            "academic_year": "2024-2025",
            "grade_level": 10,
            "section": "A",
            "class_teacher": {
                "teacher_id": "TCH-2025-042",
                "teacher_name": "Mrs. Priya Sharma",
                "email": "priya.sharma@schoolos.edu",
                "phone": "+91-9876543210",
            },
            "total_students": 35,
            "max_students": 40,
            "subjects_taught": [
                "Mathematics",
                "Physics",
                "Chemistry",
                "Biology",
                "English",
                "Computer Science",
            ],
            "room_number": "201",
            "is_active": True,
        },
    }


@tool("list_students_in_class", args_schema=ListStudentsInClassSchema)
def list_students_in_class(class_name: str, include_details: Optional[bool] = False) -> Dict[str, Any]:
    """
    Provides a complete roster of all students enrolled in a specific class.
    Use this tool when a user asks for the student list or class roster.

    Args:
        class_name: Name of the class
        include_details: Whether to include detailed student information

    Returns:
        Dictionary containing student roster or error information
    """
    logger.info(f"[TOOL:list_students_in_class] Class: '{class_name}', " f"Include Details: {include_details}")

    # Real implementation would be:
    # try:
    #     params = {"include_details": include_details}
    #     response = requests.get(
    #         f"{BASE_URL}/classes/{class_name}/students",
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
    #     return {"error": f"Failed to fetch student list: {str(e)}"}

    # Placeholder student roster for development/testing
    if include_details:
        return {
            "status": "success",
            "class_name": class_name,
            "total_students": 3,
            "students": [
                {
                    "student_id": "STU-2025-101",
                    "student_name": "Rohan Sharma",
                    "roll_number": "10A-01",
                    "date_of_birth": "2010-05-15",
                    "email": "rohan.sharma@student.schoolos.edu",
                    "parent_contact": "+91-9876543210",
                    "enrollment_date": "2024-04-01",
                },
                {
                    "student_id": "STU-2025-102",
                    "student_name": "Priya Verma",
                    "roll_number": "10A-02",
                    "date_of_birth": "2010-08-22",
                    "email": "priya.verma@student.schoolos.edu",
                    "parent_contact": "+91-9876543211",
                    "enrollment_date": "2024-04-01",
                },
                {
                    "student_id": "STU-2025-103",
                    "student_name": "Anjali Kapoor",
                    "roll_number": "10A-03",
                    "date_of_birth": "2010-03-10",
                    "email": "anjali.kapoor@student.schoolos.edu",
                    "parent_contact": "+91-9876543212",
                    "enrollment_date": "2024-04-01",
                },
            ],
        }
    else:
        return {
            "status": "success",
            "class_name": class_name,
            "total_students": 3,
            "students": [
                {"roll_number": "10A-01", "student_name": "Rohan Sharma"},
                {"roll_number": "10A-02", "student_name": "Priya Verma"},
                {"roll_number": "10A-03", "student_name": "Anjali Kapoor"},
            ],
        }


@tool("get_class_schedule", args_schema=GetClassScheduleSchema)
def get_class_schedule(class_name: str, day_of_week: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetches the weekly schedule or timetable for a given class.
    Use this tool when a user asks for the class timetable or schedule.

    Args:
        class_name: Name of the class
        day_of_week: Optional specific day (e.g., 'Monday')

    Returns:
        Dictionary containing schedule data or error information
    """
    logger.info(f"[TOOL:get_class_schedule] Class: '{class_name}', " f"Day: {day_of_week or 'Full week'}")

    # Real implementation would be:
    # try:
    #     params = {}
    #     if day_of_week:
    #         params["day_of_week"] = day_of_week
    #     response = requests.get(
    #         f"{BASE_URL}/timetables/class/{class_name}",
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
    #     return {"error": f"Failed to fetch class schedule: {str(e)}"}

    # Placeholder schedule for development/testing
    if day_of_week:
        # Return schedule for specific day
        return {
            "status": "success",
            "class_name": class_name,
            "day": day_of_week,
            "periods": [
                {
                    "period_number": 1,
                    "start_time": "08:00",
                    "end_time": "08:45",
                    "subject": "Mathematics",
                    "teacher": "Mr. Gupta",
                    "room": "201",
                },
                {
                    "period_number": 2,
                    "start_time": "08:45",
                    "end_time": "09:30",
                    "subject": "Physics",
                    "teacher": "Mrs. Reddy",
                    "room": "Physics Lab",
                },
                {
                    "period_number": 3,
                    "start_time": "09:30",
                    "end_time": "10:15",
                    "subject": "English",
                    "teacher": "Ms. Singh",
                    "room": "201",
                },
                {
                    "period_number": 4,
                    "start_time": "10:15",
                    "end_time": "11:00",
                    "subject": "Chemistry",
                    "teacher": "Dr. Patel",
                    "room": "Chemistry Lab",
                },
            ],
        }
    else:
        # Return full week schedule
        return {
            "status": "success",
            "class_name": class_name,
            "schedule_type": "Weekly",
            "week_schedule": {
                "Monday": ["Mathematics", "Physics", "English", "Chemistry", "Biology"],
                "Tuesday": [
                    "English",
                    "Chemistry",
                    "Mathematics",
                    "Computer Science",
                    "Physical Education",
                ],
                "Wednesday": [
                    "Physics",
                    "Mathematics",
                    "Biology",
                    "English",
                    "History",
                ],
                "Thursday": [
                    "Chemistry",
                    "Computer Science",
                    "Mathematics",
                    "English",
                    "Geography",
                ],
                "Friday": ["Biology", "English", "Physics", "Mathematics", "Art"],
            },
            "total_periods_per_day": 5,
            "message": "Use day_of_week parameter to get detailed period timings for a specific day.",
        }


@tool("assign_class_teacher", args_schema=AssignClassTeacherSchema)
def assign_class_teacher(class_name: str, teacher_name: str, effective_from: Optional[str] = None) -> Dict[str, Any]:
    """
    Assigns or updates the main class teacher for a specific class.
    Use this tool when a user wants to assign a class teacher/proctor.

    Args:
        class_name: Name of the class
        teacher_name: Full name of the teacher
        effective_from: Optional effective date (YYYY-MM-DD)

    Returns:
        Dictionary containing success status or error information
    """
    logger.info(f"[TOOL:assign_class_teacher] Class: '{class_name}', " f"Teacher: '{teacher_name}', Effective: {effective_from or 'Immediately'}")

    # Real implementation would be:
    # try:
    #     payload = {
    #         "class_name": class_name,
    #         "teacher_name": teacher_name,
    #         "effective_from": effective_from
    #     }
    #     response = requests.post(
    #         f"{BASE_URL}/classes/{class_name}/assign-teacher",
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
    #     return {"error": f"Failed to assign class teacher: {str(e)}"}

    # Placeholder confirmation for development/testing
    return {
        "status": "success",
        "message": f"Successfully assigned {teacher_name} as class teacher for {class_name}.",
        "assignment_details": {
            "class_name": class_name,
            "class_teacher": {
                "teacher_id": "TCH-2025-042",
                "teacher_name": teacher_name,
                "email": f"{teacher_name.lower().replace(' ', '.')}@schoolos.edu",
                "specialization": "Mathematics",
            },
            "effective_from": effective_from or "2025-10-06",
            "previous_teacher": "Mr. Kumar (if any)",
            "assigned_at": "2025-10-06T10:00:00Z",
        },
    }


@tool("list_all_classes", args_schema=ListAllClassesSchema)
def list_all_classes(
    academic_year: Optional[str] = None,
    grade_level: Optional[int] = None,
    include_inactive: Optional[bool] = False,
) -> Dict[str, Any]:
    """
    Returns a list of all classes currently active in the school.
    Use this tool when a user asks for all classes or class list.

    Args:
        academic_year: Optional filter by academic year
        grade_level: Optional filter by grade level
        include_inactive: Whether to include inactive classes

    Returns:
        Dictionary containing list of classes or error information
    """
    logger.info(f"[TOOL:list_all_classes] Academic Year: {academic_year or 'All'}, " f"Grade: {grade_level or 'All'}, Include Inactive: {include_inactive}")

    # Real implementation would be:
    # try:
    #     params = {
    #         "include_inactive": include_inactive
    #     }
    #     if academic_year:
    #         params["academic_year"] = academic_year
    #     if grade_level:
    #         params["grade_level"] = grade_level
    #
    #     response = requests.get(
    #         f"{BASE_URL}/classes/",
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
    #     return {"error": f"Failed to fetch class list: {str(e)}"}

    # Placeholder class list for development/testing
    all_classes = [
        {
            "class_id": "CLS-2025-001",
            "class_name": "10A",
            "grade_level": 10,
            "section": "A",
            "academic_year": "2024-2025",
            "class_teacher": "Mrs. Priya Sharma",
            "total_students": 35,
            "is_active": True,
        },
        {
            "class_id": "CLS-2025-002",
            "class_name": "10B",
            "grade_level": 10,
            "section": "B",
            "academic_year": "2024-2025",
            "class_teacher": "Mr. Rajesh Kumar",
            "total_students": 38,
            "is_active": True,
        },
        {
            "class_id": "CLS-2025-003",
            "class_name": "11 Science",
            "grade_level": 11,
            "section": "Science",
            "academic_year": "2024-2025",
            "class_teacher": "Dr. Anjali Patel",
            "total_students": 32,
            "is_active": True,
        },
        {
            "class_id": "CLS-2025-004",
            "class_name": "12 Commerce",
            "grade_level": 12,
            "section": "Commerce",
            "academic_year": "2024-2025",
            "class_teacher": "Mr. Suresh Reddy",
            "total_students": 30,
            "is_active": True,
        },
    ]

    # Apply filters
    filtered_classes = all_classes

    if grade_level:
        filtered_classes = [c for c in filtered_classes if c["grade_level"] == grade_level]

    if academic_year:
        filtered_classes = [c for c in filtered_classes if c["academic_year"] == academic_year]

    if not include_inactive:
        filtered_classes = [c for c in filtered_classes if c["is_active"]]

    return {
        "status": "success",
        "filters": {
            "academic_year": academic_year or "All",
            "grade_level": grade_level or "All",
            "include_inactive": include_inactive,
        },
        "total_classes": len(filtered_classes),
        "classes": filtered_classes,
    }


# Export all tools as a list for the agent to use
class_agent_tools = [
    create_new_class,
    get_class_details,
    list_students_in_class,
    get_class_schedule,
    assign_class_teacher,
    list_all_classes,
]

# Export tool names for easy reference
__all__ = [
    "class_agent_tools",
    "create_new_class",
    "get_class_details",
    "list_students_in_class",
    "get_class_schedule",
    "assign_class_teacher",
    "list_all_classes",
]
