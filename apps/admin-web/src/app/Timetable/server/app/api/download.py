"""
Download endpoint - Provide templates and sample data files.

GET /download-template - Download empty Excel template
GET /download-sample - Download sample dataset (Vidya Mandir)
GET /sample-data - Get sample data as JSON for auto-loading
"""

import io
import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Sample data - Vidya Mandir High School
# =============================================================================
# CAPACITY CALCULATION:
#   Weekdays Mon-Fri: 5 days × 8 periods = 40 academic slots
#   Saturday: 1 day × 4 periods = 4 academic slots
#   TOTAL: 44 academic slots per section per week
#
# This number was chosen carefully so that subject frequencies can exactly
# fill all slots, eliminating free periods entirely.
# =============================================================================
SAMPLE_SCHOOL = {
    "school_id": 1,
    "name": "Vidya Mandir High School",
    "academic_year": "2025-2026",
    "start_time": "08:30",
    "end_time": "15:30",
    "weekdays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "periods_per_weekday": 8,
    "saturday_periods": 4,
    "period_duration_minutes": 45,
    "prayer_enabled": True,
    "prayer_duration_minutes": 30,
    "lunch_period_index": 4,
    "lunch_after_period": 4,
    "lunch_duration_minutes": 40,
    "recess_period_indices": [3],
    "recess_after_every_n_periods": 3,
    "recess_duration_minutes": 20,
}

SAMPLE_PERIODS = [
    # Period 0: Assembly/Prayer (08:30 - 09:00)
    {
        "period_index": 0,
        "start_time": "08:30",
        "end_time": "09:00",
        "duration_minutes": 30,
        "is_prayer": True,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 1 (09:00 - 09:45)
    {
        "period_index": 1,
        "start_time": "09:00",
        "end_time": "09:45",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 2 (09:45 - 10:30)
    {
        "period_index": 2,
        "start_time": "09:45",
        "end_time": "10:30",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 3 (10:30 - 11:15)
    {
        "period_index": 3,
        "start_time": "10:30",
        "end_time": "11:15",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # RECESS (11:15 - 11:35) — 20 minutes after Period 3
    # Period 4 (11:35 - 12:20)
    {
        "period_index": 4,
        "start_time": "11:35",
        "end_time": "12:20",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # LUNCH BREAK (12:20 - 13:00) — 40 minutes after Period 4
    # Period 5 (13:00 - 13:45)
    {
        "period_index": 5,
        "start_time": "13:00",
        "end_time": "13:45",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 6 (13:45 - 14:30)
    {
        "period_index": 6,
        "start_time": "13:45",
        "end_time": "14:30",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 7 (14:30 - 15:15)
    {
        "period_index": 7,
        "start_time": "14:30",
        "end_time": "15:15",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
    # Period 8 (15:15 - 16:00)
    {
        "period_index": 8,
        "start_time": "15:15",
        "end_time": "16:00",
        "duration_minutes": 45,
        "is_prayer": False,
        "is_recess": False,
        "is_lunch": False,
    },
]

SAMPLE_TEACHERS = [
    # ==========================================================================
    # TEACHER CAPACITY CALCULATION (all hard constraints ON):
    # - 10 sections × 44 slots = 440 total teaching slots needed per week
    # - With language tier-2 sync (3 langs share slots):
    #   10 sections × 44 effective slots = 440 teaching slots
    #   (Language teachers teach simultaneously so they need 3× capacity
    #    for those 5 slots per section, but each only covers 2 sections)
    #
    # TEACHER ASSIGNMENT STRATEGY:
    # - Max 2 sections per language teacher set (for sync feasibility)
    # - Core subject teachers: ~2-3 sections each
    # - max_periods_day=7, max_consecutive=3
    # - max_daily_load_variance=3 (hard constraint)
    # ==========================================================================
    # =========================================================================
    # MATHEMATICS TEACHERS (5 teachers for 10 classes, 2 sections each)
    # Each section needs 7 math periods/week → 5 teachers × ~14 periods = 70
    # =========================================================================
    {
        "teacher_id": "T001",
        "name": "Rajesh Kumar",
        "subjects_can_teach": ["MATH"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T002",
        "name": "Priya Sharma",
        "subjects_can_teach": ["MATH"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T003",
        "name": "Amit Verma",
        "subjects_can_teach": ["MATH"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T004",
        "name": "Sunita Agarwal",
        "subjects_can_teach": ["MATH"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T005",
        "name": "Dinesh Pandey",
        "subjects_can_teach": ["MATH"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # SCIENCE TEACHERS (5 teachers for 10 classes)
    # Grades 6-7: 6 SCI periods/section, Grades 8-10: 6 SCI + 2 PHY_LAB + 2 CHEM_LAB
    # Some science teachers also handle labs
    # =========================================================================
    {
        "teacher_id": "T006",
        "name": "Suresh Reddy",
        "subjects_can_teach": ["SCI", "PHY_LAB"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T007",
        "name": "Lakshmi Nair",
        "subjects_can_teach": ["SCI", "PHY_LAB"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T008",
        "name": "Raghav Menon",
        "subjects_can_teach": ["SCI", "CHEM_LAB"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T009",
        "name": "Deepa Krishnan",
        "subjects_can_teach": ["SCI", "CHEM_LAB"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T010",
        "name": "Vinod Sharma",
        "subjects_can_teach": ["SCI"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # ENGLISH TEACHERS (4 teachers for 10 classes)
    # 6 ENG periods/section → 4 teachers × ~15 periods = 60
    # =========================================================================
    {
        "teacher_id": "T011",
        "name": "Anita Desai",
        "subjects_can_teach": ["ENG"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 12,
        "max_periods_week": 38,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T012",
        "name": "Meena Patel",
        "subjects_can_teach": ["ENG"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 12,
        "max_periods_week": 38,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T013",
        "name": "Rahul Saxena",
        "subjects_can_teach": ["ENG"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 12,
        "max_periods_week": 38,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T014",
        "name": "Neelam Gupta",
        "subjects_can_teach": ["ENG"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 12,
        "max_periods_week": 38,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # SOCIAL STUDIES TEACHERS (4 teachers for 10 classes)
    # 5 SST periods/section → 4 teachers × ~12.5 periods = 50
    # =========================================================================
    {
        "teacher_id": "T015",
        "name": "Vijay Singh",
        "subjects_can_teach": ["SST"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T016",
        "name": "Geeta Rao",
        "subjects_can_teach": ["SST"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T017",
        "name": "Prakash Jha",
        "subjects_can_teach": ["SST"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T018",
        "name": "Savita Kumari",
        "subjects_can_teach": ["SST"],
        "min_periods_day": 1,
        "max_periods_day": 7,
        "min_periods_week": 10,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # LANGUAGE SPECIALIST TEACHERS (TIER 2: Second Language — Hindi / Kannada)
    # 6 teachers total: each teacher serves exactly ONE section per grade.
    # Teachers T019/T020 serve grades 6+8, T022/T023 serve grades 7+9,
    # T031/T032 serve grade 10 only.
    #   T019 (Hindi):   6A(5) + 8A(5) = 10 periods/week
    #   T020 (Kannada): 6B(5) + 8B(5) = 10 periods/week
    #   T022 (Hindi):   7A(5) + 9A(5) = 10 periods/week
    #   T023 (Kannada): 7B(5) + 9B(5) = 10 periods/week
    #   T031 (Hindi):   10A(5)         =  5 periods/week
    #   T032 (Kannada): 10B(5)         =  5 periods/week
    # =========================================================================
    {
        "teacher_id": "T019",
        "name": "Arun Kumar",
        "subjects_can_teach": ["HINDI"],
        "is_language_specialist": True,
        "primary_language": "HINDI",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T020",
        "name": "Kavita Menon",
        "subjects_can_teach": ["KANNADA"],
        "is_language_specialist": True,
        "primary_language": "KANNADA",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T022",
        "name": "Suman Devi",
        "subjects_can_teach": ["HINDI"],
        "is_language_specialist": True,
        "primary_language": "HINDI",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T023",
        "name": "Ravi Hegde",
        "subjects_can_teach": ["KANNADA"],
        "is_language_specialist": True,
        "primary_language": "KANNADA",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T031",
        "name": "Pradeep Mishra",
        "subjects_can_teach": ["HINDI"],
        "is_language_specialist": True,
        "primary_language": "HINDI",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 4,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T032",
        "name": "Vidya Bhat",
        "subjects_can_teach": ["KANNADA"],
        "is_language_specialist": True,
        "primary_language": "KANNADA",
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 4,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # PE TEACHERS (3 teachers for 10 classes)
    # 3 PE periods/section → 3 teachers × ~10 periods = 30
    # =========================================================================
    {
        "teacher_id": "T034",
        "name": "Rohit Bhatt",
        "subjects_can_teach": ["PE"],
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T035",
        "name": "Nisha Kapoor",
        "subjects_can_teach": ["PE"],
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 8,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T036",
        "name": "Vikram Chauhan",
        "subjects_can_teach": ["PE"],
        "min_periods_day": 0,
        "max_periods_day": 7,
        "min_periods_week": 6,
        "max_periods_week": 36,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # COMPUTER TEACHERS (3 teachers for 10 classes)
    # 3 COMP periods/section → 3 teachers × ~10 periods = 30
    # =========================================================================
    {
        "teacher_id": "T037",
        "name": "Neha Gupta",
        "subjects_can_teach": ["COMP"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 8,
        "max_periods_week": 34,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T038",
        "name": "Manoj Kumar",
        "subjects_can_teach": ["COMP"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 8,
        "max_periods_week": 34,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T039",
        "name": "Swati Joshi",
        "subjects_can_teach": ["COMP"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 34,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # ART TEACHERS (2 teachers for 10 classes)
    # 2 ART periods/section → 2 teachers × ~10 periods = 20
    # =========================================================================
    {
        "teacher_id": "T040",
        "name": "Kiran Das",
        "subjects_can_teach": ["ART"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T041",
        "name": "Pooja Mathur",
        "subjects_can_teach": ["ART"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # MORAL SCIENCE / VALUE EDUCATION TEACHERS (2 teachers, NEW)
    # 2 MORAL periods/section → 2 teachers × ~10 periods = 20
    # =========================================================================
    {
        "teacher_id": "T042",
        "name": "Shanti Devi",
        "subjects_can_teach": ["MORAL"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T043",
        "name": "Raman Pillai",
        "subjects_can_teach": ["MORAL"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # GK / GENERAL KNOWLEDGE TEACHERS (2 teachers, NEW)
    # Grades 6-7: 3 GK periods, Grades 8-10: 2 GK periods
    # 2 teachers × ~12 periods = 24
    # =========================================================================
    {
        "teacher_id": "T044",
        "name": "Arjun Nair",
        "subjects_can_teach": ["GK"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T045",
        "name": "Meghna Roy",
        "subjects_can_teach": ["GK"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 6,
        "max_periods_week": 30,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    # =========================================================================
    # LIBRARY TEACHERS (2 teachers, NEW — Grades 6-7 only)
    # 4 LIB periods/section × 4 sections = 16 periods total
    # =========================================================================
    {
        "teacher_id": "T046",
        "name": "Sunanda Rao",
        "subjects_can_teach": ["LIB"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 4,
        "max_periods_week": 24,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
    {
        "teacher_id": "T047",
        "name": "Rajendra Prasad",
        "subjects_can_teach": ["LIB"],
        "min_periods_day": 0,
        "max_periods_day": 6,
        "min_periods_week": 4,
        "max_periods_week": 24,
        "max_consecutive_periods": 3,
        "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "availability_time": "08:30-16:00",
    },
]

SAMPLE_SUBJECTS = [
    # =========================================================================
    # SLOT BUDGET PER SECTION (44 academic slots/week = 5×8 + 1×4):
    #
    # LANGUAGE TIER SYNCHRONIZATION (language_block_enabled=True):
    # - Tier 1 (First Language): English — fixed for all, counts fully
    # - Tier 2 (Second Language): Hindi/Kannada/Sanskrit — students choose ONE
    #   When enabled, tier-2 subjects share the SAME time slot
    #   (taught simultaneously to different student groups)
    #   So only max(tier-2 freq) = 5 slots consumed, not 15
    #
    # FREQUENCY PLAN — all sections sum to exactly 44:
    #
    # Subject       | All   | Gr6-7 only | Gr8-10 only
    # --------------|-------|------------|------------
    # MATH          |  6    |            |
    # ENG (T1)      |  6    |            |
    # SCI           |  6    |            |
    # SST           |  5    |            |
    # HINDI (T2)    |  5    |            |
    # KANNADA (T2)  |  5    |            |
    # PE            |  3    |            |
    # COMP          |  3    |            |
    # ART           |  2    |            |
    # MORAL         |  2    |            |
    # GK            |  2    |            |
    # LIB           |       |   4        |
    # PHY_LAB       |       |            |   2
    # CHEM_LAB      |       |            |   2
    # --------------|-------|------------|------------
    # Effective     | 40    | +4 = 44    | +4 = 44
    # (tier-2 counted once = 5)
    #
    # NOTE: Max subject frequency = 6 (MATH/SCI/ENG).
    #   6 periods over 6 school days → at most 1/day.
    #   This ensures no_subject_twice_daily hard constraint is satisfiable.
    # =========================================================================
    {
        "subject_code": "MATH",
        "name": "Mathematics",
        "category": "core",
        "min_weekly": 6,
        "max_weekly": 6,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "SCI",
        "name": "Science",
        "category": "core",
        "min_weekly": 6,
        "max_weekly": 6,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "ENG",
        "name": "English",
        "category": "language",
        "min_weekly": 6,
        "max_weekly": 6,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": 1,  # TIER 1: First Language — fixed for all students
    },
    {
        "subject_code": "SST",
        "name": "Social Studies",
        "category": "core",
        "min_weekly": 5,
        "max_weekly": 5,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "HINDI",
        "name": "Hindi",
        "category": "language",
        "min_weekly": 5,
        "max_weekly": 5,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": 2,  # TIER 2: Second Language — students choose one
    },
    {
        "subject_code": "KANNADA",
        "name": "Kannada",
        "category": "language",
        "min_weekly": 5,
        "max_weekly": 5,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": 2,  # TIER 2: Second Language — students choose one
    },
    {
        "subject_code": "PHY_LAB",
        "name": "Physics Lab",
        "category": "lab",
        "min_weekly": 2,
        "max_weekly": 2,
        "block_required": True,
        "block_length": 2,
        "resource_type": "Physics Lab",
        "language_tier": None,
    },
    {
        "subject_code": "CHEM_LAB",
        "name": "Chemistry Lab",
        "category": "lab",
        "min_weekly": 2,
        "max_weekly": 2,
        "block_required": True,
        "block_length": 2,
        "resource_type": "Chemistry Lab",
        "language_tier": None,
    },
    {
        "subject_code": "COMP",
        "name": "Computer Science",
        "category": "leisure",
        "min_weekly": 3,
        "max_weekly": 3,
        "block_required": False,
        "block_length": 0,
        "resource_type": "Computer Lab",
        "language_tier": None,
    },
    {
        "subject_code": "PE",
        "name": "Physical Education",
        "category": "leisure",
        "min_weekly": 3,
        "max_weekly": 3,
        "block_required": False,
        "block_length": 0,
        "resource_type": "Sports Ground",
        "language_tier": None,
    },
    {
        "subject_code": "ART",
        "name": "Art & Craft",
        "category": "leisure",
        "min_weekly": 2,
        "max_weekly": 2,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "MORAL",
        "name": "Moral Science",
        "category": "core",
        "min_weekly": 2,
        "max_weekly": 2,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "GK",
        "name": "General Knowledge",
        "category": "core",
        "min_weekly": 2,
        "max_weekly": 2,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
    {
        "subject_code": "LIB",
        "name": "Library",
        "category": "leisure",
        "min_weekly": 4,
        "max_weekly": 4,
        "block_required": False,
        "block_length": 0,
        "resource_type": None,
        "language_tier": None,
    },
]
# NOTE: With language_block_enabled=True, tier-2 languages share slots.
# Feasibility is calculated per section, counting only max(tier-2) once.
# See SAMPLE_SUBJECTS header comment for detailed calculation.

SAMPLE_CLASSES = [
    # Class teacher must be one of the teachers assigned to this section
    # (required by class_teacher_period_1 hard constraint)
    {
        "section_id": "6A",
        "grade": 6,
        "section": "A",
        "student_count": 35,
        "class_teacher_id": "T001",  # Math teacher for 6A
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "6B",
        "grade": 6,
        "section": "B",
        "student_count": 38,
        "class_teacher_id": "T002",  # Math teacher for 6B
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "7A",
        "grade": 7,
        "section": "A",
        "student_count": 40,
        "class_teacher_id": "T006",  # Science teacher for 7A
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "7B",
        "grade": 7,
        "section": "B",
        "student_count": 37,
        "class_teacher_id": "T007",  # Science teacher for 7B
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "8A",
        "grade": 8,
        "section": "A",
        "student_count": 42,
        "class_teacher_id": "T011",  # English teacher for 8A
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "8B",
        "grade": 8,
        "section": "B",
        "student_count": 39,
        "class_teacher_id": "T012",  # English teacher for 8B
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "9A",
        "grade": 9,
        "section": "A",
        "student_count": 35,
        "class_teacher_id": "T017",  # SST teacher for 9A
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "9B",
        "grade": 9,
        "section": "B",
        "student_count": 33,
        "class_teacher_id": "T018",  # SST teacher for 9B
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "10A",
        "grade": 10,
        "section": "A",
        "student_count": 30,
        "class_teacher_id": "T003",  # Math teacher for 10A
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
    {
        "section_id": "10B",
        "grade": 10,
        "section": "B",
        "student_count": 28,
        "class_teacher_id": "T004",  # Math teacher for 10B
        "language_block_enabled": True,
        "language_structure": "2nd_lang_fixed:ENGLISH",
    },
]

SAMPLE_MAPPINGS = [
    # =========================================================================
    # TEACHER → SECTION ASSIGNMENT MAP (with new teacher IDs T001-T047)
    #
    # TEACHER ASSIGNMENT GRID:
    # Subject   | 6A   | 6B   | 7A   | 7B   | 8A   | 8B   | 9A   | 9B   | 10A  | 10B
    # ----------|------|------|------|------|------|------|------|------|------|------
    # MATH      | T001 | T002 | T001 | T002 | T003 | T004 | T005 | T005 | T003 | T004
    # SCI       | T006 | T007 | T006 | T007 | T008 | T009 | T008 | T009 | T010 | T010
    # ENG       | T011 | T012 | T013 | T014 | T011 | T012 | T013 | T014 | T013 | T014
    # SST       | T015 | T016 | T017 | T018 | T015 | T016 | T017 | T018 | T017 | T018
    # HINDI     | T019 |  —   | T022 |  —   | T019 |  —   | T022 |  —   | T031 |  —
    # KANNADA   |  —   | T020 |  —   | T023 |  —   | T020 |  —   | T023 |  —   | T032
    # PE        | T034 | T035 | T034 | T035 | T034 | T035 | T036 | T036 | T036 | T036
    # COMP      | T037 | T038 | T037 | T038 | T037 | T038 | T039 | T039 | T039 | T039
    # ART       | T040 | T041 | T040 | T041 | T040 | T041 | T040 | T041 | T040 | T041
    # MORAL     | T042 | T043 | T042 | T043 | T042 | T043 | T042 | T043 | T042 | T043
    # GK        | T044 | T045 | T044 | T045 | T044 | T045 | T044 | T045 | T044 | T045
    # LIB       | T046 | T047 | T046 | T047 |  —   |  —   |  —   |  —   |  —   |  —
    # PHY_LAB   |  —   |  —   |  —   |  —   | T006 | T007 | T006 | T007 | T006 | T007
    # CHEM_LAB  |  —   |  —   |  —   |  —   | T008 | T009 | T008 | T009 | T008 | T009
    #
    # Language model: each section gets ONE tier-2 language (A=HINDI, B=KANNADA).
    # Language sync constraint aligns them to the same time slots within each grade.
    #
    # Class teachers: 6A→T001, 6B→T002, 7A→T006, 7B→T007,
    #                 8A→T011, 8B→T012, 9A→T017, 9B→T018, 10A→T003, 10B→T004
    # =========================================================================
    # ---- 6A ---- (Grade 6, no labs, has LIB)
    {
        "section_id": "6A",
        "subject_code": "MATH",
        "teacher_id": "T001",
        "is_class_teacher": True,
    },
    {
        "section_id": "6A",
        "subject_code": "SCI",
        "teacher_id": "T006",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "ENG",
        "teacher_id": "T011",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "SST",
        "teacher_id": "T015",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "HINDI",
        "teacher_id": "T019",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "PE",
        "teacher_id": "T034",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "COMP",
        "teacher_id": "T037",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "ART",
        "teacher_id": "T040",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "MORAL",
        "teacher_id": "T042",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "GK",
        "teacher_id": "T044",
        "is_class_teacher": False,
    },
    {
        "section_id": "6A",
        "subject_code": "LIB",
        "teacher_id": "T046",
        "is_class_teacher": False,
    },
    # ---- 6B ---- (Grade 6, no labs, has LIB)
    {
        "section_id": "6B",
        "subject_code": "MATH",
        "teacher_id": "T002",
        "is_class_teacher": True,
    },
    {
        "section_id": "6B",
        "subject_code": "SCI",
        "teacher_id": "T007",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "ENG",
        "teacher_id": "T012",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "SST",
        "teacher_id": "T016",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "KANNADA",
        "teacher_id": "T020",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "PE",
        "teacher_id": "T035",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "COMP",
        "teacher_id": "T038",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "ART",
        "teacher_id": "T041",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "MORAL",
        "teacher_id": "T043",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "GK",
        "teacher_id": "T045",
        "is_class_teacher": False,
    },
    {
        "section_id": "6B",
        "subject_code": "LIB",
        "teacher_id": "T047",
        "is_class_teacher": False,
    },
    # ---- 7A ---- (Grade 7, no labs, has LIB)
    {
        "section_id": "7A",
        "subject_code": "MATH",
        "teacher_id": "T001",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "SCI",
        "teacher_id": "T006",
        "is_class_teacher": True,
    },
    {
        "section_id": "7A",
        "subject_code": "ENG",
        "teacher_id": "T013",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "SST",
        "teacher_id": "T017",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "HINDI",
        "teacher_id": "T022",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "PE",
        "teacher_id": "T034",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "COMP",
        "teacher_id": "T037",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "ART",
        "teacher_id": "T040",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "MORAL",
        "teacher_id": "T042",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "GK",
        "teacher_id": "T044",
        "is_class_teacher": False,
    },
    {
        "section_id": "7A",
        "subject_code": "LIB",
        "teacher_id": "T046",
        "is_class_teacher": False,
    },
    # ---- 7B ---- (Grade 7, no labs, has LIB)
    {
        "section_id": "7B",
        "subject_code": "MATH",
        "teacher_id": "T002",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "SCI",
        "teacher_id": "T007",
        "is_class_teacher": True,
    },
    {
        "section_id": "7B",
        "subject_code": "ENG",
        "teacher_id": "T014",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "SST",
        "teacher_id": "T018",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "KANNADA",
        "teacher_id": "T023",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "PE",
        "teacher_id": "T035",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "COMP",
        "teacher_id": "T038",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "ART",
        "teacher_id": "T041",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "MORAL",
        "teacher_id": "T043",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "GK",
        "teacher_id": "T045",
        "is_class_teacher": False,
    },
    {
        "section_id": "7B",
        "subject_code": "LIB",
        "teacher_id": "T047",
        "is_class_teacher": False,
    },
    # ---- 8A ---- (Grade 8, has labs, no LIB)
    {
        "section_id": "8A",
        "subject_code": "MATH",
        "teacher_id": "T003",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "SCI",
        "teacher_id": "T008",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "ENG",
        "teacher_id": "T011",
        "is_class_teacher": True,
    },
    {
        "section_id": "8A",
        "subject_code": "SST",
        "teacher_id": "T015",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "PHY_LAB",
        "teacher_id": "T006",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T008",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "HINDI",
        "teacher_id": "T019",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "PE",
        "teacher_id": "T034",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "COMP",
        "teacher_id": "T037",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "ART",
        "teacher_id": "T040",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "MORAL",
        "teacher_id": "T042",
        "is_class_teacher": False,
    },
    {
        "section_id": "8A",
        "subject_code": "GK",
        "teacher_id": "T044",
        "is_class_teacher": False,
    },
    # ---- 8B ---- (Grade 8, has labs, no LIB)
    {
        "section_id": "8B",
        "subject_code": "MATH",
        "teacher_id": "T004",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "SCI",
        "teacher_id": "T009",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "ENG",
        "teacher_id": "T012",
        "is_class_teacher": True,
    },
    {
        "section_id": "8B",
        "subject_code": "SST",
        "teacher_id": "T016",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "PHY_LAB",
        "teacher_id": "T007",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T009",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "KANNADA",
        "teacher_id": "T020",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "PE",
        "teacher_id": "T035",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "COMP",
        "teacher_id": "T038",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "ART",
        "teacher_id": "T041",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "MORAL",
        "teacher_id": "T043",
        "is_class_teacher": False,
    },
    {
        "section_id": "8B",
        "subject_code": "GK",
        "teacher_id": "T045",
        "is_class_teacher": False,
    },
    # ---- 9A ---- (Grade 9, has labs, no LIB)
    {
        "section_id": "9A",
        "subject_code": "MATH",
        "teacher_id": "T005",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "SCI",
        "teacher_id": "T008",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "ENG",
        "teacher_id": "T013",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "SST",
        "teacher_id": "T017",
        "is_class_teacher": True,
    },
    {
        "section_id": "9A",
        "subject_code": "PHY_LAB",
        "teacher_id": "T006",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T008",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "HINDI",
        "teacher_id": "T022",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "PE",
        "teacher_id": "T036",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "COMP",
        "teacher_id": "T039",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "ART",
        "teacher_id": "T040",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "MORAL",
        "teacher_id": "T042",
        "is_class_teacher": False,
    },
    {
        "section_id": "9A",
        "subject_code": "GK",
        "teacher_id": "T044",
        "is_class_teacher": False,
    },
    # ---- 9B ---- (Grade 9, has labs, no LIB)
    {
        "section_id": "9B",
        "subject_code": "MATH",
        "teacher_id": "T005",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "SCI",
        "teacher_id": "T009",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "ENG",
        "teacher_id": "T014",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "SST",
        "teacher_id": "T018",
        "is_class_teacher": True,
    },
    {
        "section_id": "9B",
        "subject_code": "PHY_LAB",
        "teacher_id": "T007",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T009",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "KANNADA",
        "teacher_id": "T023",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "PE",
        "teacher_id": "T036",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "COMP",
        "teacher_id": "T039",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "ART",
        "teacher_id": "T041",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "MORAL",
        "teacher_id": "T043",
        "is_class_teacher": False,
    },
    {
        "section_id": "9B",
        "subject_code": "GK",
        "teacher_id": "T045",
        "is_class_teacher": False,
    },
    # ---- 10A ---- (Grade 10, has labs, no LIB)
    {
        "section_id": "10A",
        "subject_code": "MATH",
        "teacher_id": "T003",
        "is_class_teacher": True,
    },
    {
        "section_id": "10A",
        "subject_code": "SCI",
        "teacher_id": "T010",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "ENG",
        "teacher_id": "T013",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "SST",
        "teacher_id": "T017",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "PHY_LAB",
        "teacher_id": "T006",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T008",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "HINDI",
        "teacher_id": "T031",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "PE",
        "teacher_id": "T036",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "COMP",
        "teacher_id": "T039",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "ART",
        "teacher_id": "T040",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "MORAL",
        "teacher_id": "T042",
        "is_class_teacher": False,
    },
    {
        "section_id": "10A",
        "subject_code": "GK",
        "teacher_id": "T044",
        "is_class_teacher": False,
    },
    # ---- 10B ---- (Grade 10, has labs, no LIB)
    {
        "section_id": "10B",
        "subject_code": "MATH",
        "teacher_id": "T004",
        "is_class_teacher": True,
    },
    {
        "section_id": "10B",
        "subject_code": "SCI",
        "teacher_id": "T010",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "ENG",
        "teacher_id": "T014",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "SST",
        "teacher_id": "T018",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "PHY_LAB",
        "teacher_id": "T007",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "CHEM_LAB",
        "teacher_id": "T009",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "KANNADA",
        "teacher_id": "T032",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "PE",
        "teacher_id": "T036",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "COMP",
        "teacher_id": "T039",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "ART",
        "teacher_id": "T041",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "MORAL",
        "teacher_id": "T043",
        "is_class_teacher": False,
    },
    {
        "section_id": "10B",
        "subject_code": "GK",
        "teacher_id": "T045",
        "is_class_teacher": False,
    },
]

SAMPLE_RESOURCES = [
    {
        "resource_id": "PHYS_LAB_1",
        "resource_type": "Physics Lab",
        "max_simultaneous_capacity": 2,
        "accessible_grades": [8, 9, 10],
    },
    {
        "resource_id": "CHEM_LAB_1",
        "resource_type": "Chemistry Lab",
        "max_simultaneous_capacity": 2,
        "accessible_grades": [8, 9, 10],
    },
    {
        "resource_id": "COMP_LAB_1",
        "resource_type": "Computer Lab",
        "max_simultaneous_capacity": 3,
        "accessible_grades": [6, 7, 8, 9, 10],
    },
    {
        "resource_id": "SPORTS_GROUND",
        "resource_type": "Sports Ground",
        "max_simultaneous_capacity": 2,
        "accessible_grades": [6, 7, 8, 9, 10],
    },
]

SAMPLE_LANGUAGE_GROUPS = [
    # =========================================================================
    # 2-language model: A-sections → HINDI only, B-sections → KANNADA only.
    # Each section has exactly ONE tier-2 language with a UNIQUE teacher, so
    # language_sync + teacher_single_assignment are both satisfiable.
    #
    # The sync constraint aligns the tier-2 language slot within each grade:
    #   6A(HINDI) ↔ 6B(KANNADA) scheduled at the same (day, period).
    #
    # Teachers are shared across 2 grades for utilization:
    #   T019 → 6A + 8A (Hindi),  T020 → 6B + 8B (Kannada)
    #   T022 → 7A + 9A (Hindi),  T023 → 7B + 9B (Kannada)
    #   T031 → 10A (Hindi),      T032 → 10B (Kannada)
    # =========================================================================
    # Grade 6
    {
        "section_id": "6A",
        "language_slot": "1st_lang",
        "hindi_teacher": "T019",
        "kannada_teacher": None,
    },
    {
        "section_id": "6B",
        "language_slot": "1st_lang",
        "hindi_teacher": None,
        "kannada_teacher": "T020",
    },
    # Grade 7
    {
        "section_id": "7A",
        "language_slot": "1st_lang",
        "hindi_teacher": "T022",
        "kannada_teacher": None,
    },
    {
        "section_id": "7B",
        "language_slot": "1st_lang",
        "hindi_teacher": None,
        "kannada_teacher": "T023",
    },
    # Grade 8
    {
        "section_id": "8A",
        "language_slot": "1st_lang",
        "hindi_teacher": "T019",
        "kannada_teacher": None,
    },
    {
        "section_id": "8B",
        "language_slot": "1st_lang",
        "hindi_teacher": None,
        "kannada_teacher": "T020",
    },
    # Grade 9
    {
        "section_id": "9A",
        "language_slot": "1st_lang",
        "hindi_teacher": "T022",
        "kannada_teacher": None,
    },
    {
        "section_id": "9B",
        "language_slot": "1st_lang",
        "hindi_teacher": None,
        "kannada_teacher": "T023",
    },
    # Grade 10
    {
        "section_id": "10A",
        "language_slot": "1st_lang",
        "hindi_teacher": "T031",
        "kannada_teacher": None,
    },
    {
        "section_id": "10B",
        "language_slot": "1st_lang",
        "hindi_teacher": None,
        "kannada_teacher": "T032",
    },
]

SAMPLE_CONSTRAINTS_CONFIG = {
    # =========================================================================
    # ALL HARD CONSTRAINTS: ON
    # ALL SOFT CONSTRAINTS: MEDIUM PRIORITY (weight = 5)
    # =========================================================================
    "prayer_enabled": True,
    "language_sync_enabled": True,  # ON — tier-2 languages share slots
    "class_teacher_period_1": True,  # ON — class teacher takes period 1
    "no_subject_twice_daily": True,  # ON — no subject appears twice in one day
    "substitution_reserve_count": 0,  # 0 reserve slots (no substitute teachers needed)
    "core_morning_only": False,  # OFF as hard — handled via soft weight below
    "max_consecutive_default": 3,
    "max_daily_load_variance": 3,
    # --- Soft constraint weights (all MEDIUM = 5) ---
    "soft_weight_core_morning": 5,
    "soft_weight_class_teacher_period_1": 5,
    "soft_weight_no_subject_twice_daily": 5,
    "soft_weight_resource_capacity": 5,
    "soft_weight_teacher_balance": 5,
    "soft_weight_minimize_gaps": 5,
    "soft_weight_leisure_afternoon": 5,
    "soft_weight_avoid_pe_period_1": 5,
    "soft_weight_subject_distribution": 5,
    "soft_weight_teacher_free_period": 5,
    "soft_weight_fair_slot_distribution": 5,
    "soft_weight_specialist_priority": 5,
}


def _generate_csv_content():
    """Generate multi-sheet CSV content as a bundle."""
    import csv
    from io import StringIO

    sheets = {}

    # School Config
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "school_id",
            "name",
            "academic_year",
            "start_time",
            "end_time",
            "weekdays",
            "saturday_periods",
            "prayer_minutes",
            "lunch_period_index",
            "recess_period_indices",
        ]
    )
    writer.writerow(
        [
            SAMPLE_SCHOOL["school_id"],
            SAMPLE_SCHOOL["name"],
            SAMPLE_SCHOOL["academic_year"],
            SAMPLE_SCHOOL["start_time"],
            SAMPLE_SCHOOL["end_time"],
            ",".join(SAMPLE_SCHOOL["weekdays"]),
            SAMPLE_SCHOOL["saturday_periods"],
            SAMPLE_SCHOOL["prayer_duration_minutes"],
            SAMPLE_SCHOOL["lunch_period_index"],
            ",".join(map(str, SAMPLE_SCHOOL["recess_period_indices"])),
        ]
    )
    sheets["school_config"] = output.getvalue()

    # Periods
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "period_index",
            "start_time",
            "end_time",
            "duration_minutes",
            "is_prayer",
            "is_recess",
            "is_lunch",
        ]
    )
    for p in SAMPLE_PERIODS:
        writer.writerow(
            [
                p["period_index"],
                p["start_time"],
                p["end_time"],
                p["duration_minutes"],
                1 if p["is_prayer"] else 0,
                1 if p["is_recess"] else 0,
                1 if p["is_lunch"] else 0,
            ]
        )
    sheets["periods"] = output.getvalue()

    # Classes
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "section_id",
            "grade",
            "section",
            "student_count",
            "class_teacher_id",
            "language_block_enabled",
            "language_structure",
        ]
    )
    for c in SAMPLE_CLASSES:
        writer.writerow(
            [
                c["section_id"],
                c["grade"],
                c["section"],
                c["student_count"],
                c["class_teacher_id"],
                1 if c["language_block_enabled"] else 0,
                c["language_structure"] or "",
            ]
        )
    sheets["classes"] = output.getvalue()

    # Subjects
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "subject_code",
            "name",
            "category",
            "min_weekly",
            "max_weekly",
            "block_required",
            "block_length",
            "resource_type",
        ]
    )
    for s in SAMPLE_SUBJECTS:
        writer.writerow(
            [
                s["subject_code"],
                s["name"],
                s["category"],
                s["min_weekly"],
                s["max_weekly"],
                1 if s["block_required"] else 0,
                s["block_length"],
                s["resource_type"] or "",
            ]
        )
    sheets["subjects"] = output.getvalue()

    # Teachers
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "teacher_id",
            "name",
            "subjects_can_teach",
            "min_periods_day",
            "max_periods_day",
            "min_periods_week",
            "max_periods_week",
            "max_consecutive_periods",
            "availability_days",
            "availability_time",
        ]
    )
    for t in SAMPLE_TEACHERS:
        writer.writerow(
            [
                t["teacher_id"],
                t["name"],
                ",".join(t["subjects_can_teach"]),
                t["min_periods_day"],
                t["max_periods_day"],
                t["min_periods_week"],
                t["max_periods_week"],
                t["max_consecutive_periods"],
                ",".join(t["availability_days"]),
                t["availability_time"],
            ]
        )
    sheets["teachers"] = output.getvalue()

    # Mappings
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["section_id", "subject_code", "teacher_id", "is_class_teacher"])
    for m in SAMPLE_MAPPINGS:
        writer.writerow(
            [
                m["section_id"],
                m["subject_code"],
                m["teacher_id"],
                1 if m["is_class_teacher"] else 0,
            ]
        )
    sheets["mappings"] = output.getvalue()

    # Resources
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "resource_id",
            "resource_type",
            "max_simultaneous_capacity",
            "accessible_grades",
        ]
    )
    for r in SAMPLE_RESOURCES:
        writer.writerow(
            [
                r["resource_id"],
                r["resource_type"],
                r["max_simultaneous_capacity"],
                ",".join(map(str, r["accessible_grades"])),
            ]
        )
    sheets["resources"] = output.getvalue()

    # Language Groups
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "section_id",
            "language_slot",
            "hindi_teacher",
            "kannada_teacher",
        ]
    )
    for lg in SAMPLE_LANGUAGE_GROUPS:
        writer.writerow(
            [
                lg["section_id"],
                lg["language_slot"],
                lg.get("hindi_teacher", ""),
                lg.get("kannada_teacher", ""),
            ]
        )
    sheets["language_groups"] = output.getvalue()

    # Constraints Config
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["constraint_name", "enabled", "value"])
    for name, value in SAMPLE_CONSTRAINTS_CONFIG.items():
        if isinstance(value, bool):
            writer.writerow([name, 1 if value else 0, ""])
        else:
            writer.writerow([name, 1, value])
    sheets["constraints_config"] = output.getvalue()

    return sheets


@router.get("/download-template")
async def download_template():
    """
    Download an empty Excel template with all required sheets and headers.

    Returns:
        StreamingResponse with Excel file
    """
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
        from openpyxl.utils import get_column_letter
    except ImportError:
        # Fallback to CSV format
        sheets = _generate_csv_content()
        # Return as JSON for now if openpyxl not available
        return JSONResponse(
            {
                "message": "openpyxl not installed, returning CSV templates",
                "sheets": {name: content for name, content in sheets.items()},
            }
        )

    wb = openpyxl.Workbook()

    # Define styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(
        start_color="4472C4", end_color="4472C4", fill_type="solid"
    )
    border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )

    # Sheet definitions
    sheet_definitions = {
        "school_config": {
            "headers": [
                "school_id",
                "name",
                "academic_year",
                "start_time",
                "end_time",
                "weekdays",
                "saturday_periods",
                "prayer_minutes",
                "lunch_period_index",
                "recess_period_indices",
            ],
            "widths": [10, 30, 15, 12, 12, 30, 18, 15, 20, 22],
            "example": [
                1,
                "Your School Name",
                "2025-2026",
                "08:00",
                "15:30",
                "Mon,Tue,Wed,Thu,Fri,Sat",
                4,
                30,
                5,
                "3",
            ],
        },
        "periods": {
            "headers": [
                "period_index",
                "start_time",
                "end_time",
                "duration_minutes",
                "is_prayer",
                "is_recess",
                "is_lunch",
            ],
            "widths": [12, 12, 12, 18, 10, 10, 10],
            "example": [0, "08:00", "08:30", 30, 1, 0, 0],
        },
        "classes": {
            "headers": [
                "section_id",
                "grade",
                "section",
                "student_count",
                "class_teacher_id",
                "language_block_enabled",
                "language_structure",
            ],
            "widths": [12, 8, 10, 14, 18, 22, 25],
            "example": ["8A", 8, "A", 40, "T001", 1, "2nd_lang_fixed:ENGLISH"],
        },
        "subjects": {
            "headers": [
                "subject_code",
                "name",
                "category",
                "min_weekly",
                "max_weekly",
                "block_required",
                "block_length",
                "resource_type",
            ],
            "widths": [15, 25, 12, 12, 12, 15, 12, 20],
            "example": ["MATH", "Mathematics", "core", 6, 7, 0, 0, ""],
        },
        "teachers": {
            "headers": [
                "teacher_id",
                "name",
                "subjects_can_teach",
                "min_periods_day",
                "max_periods_day",
                "min_periods_week",
                "max_periods_week",
                "max_consecutive_periods",
                "availability_days",
                "availability_time",
            ],
            "widths": [12, 20, 25, 16, 16, 18, 18, 22, 30, 18],
            "example": [
                "T001",
                "Teacher Name",
                "MATH,SCI",
                3,
                6,
                18,
                30,
                3,
                "Mon,Tue,Wed,Thu,Fri,Sat",
                "08:00-15:30",
            ],
        },
        "mappings": {
            "headers": ["section_id", "subject_code", "teacher_id", "is_class_teacher"],
            "widths": [12, 15, 12, 16],
            "example": ["8A", "MATH", "T001", 1],
        },
        "resources": {
            "headers": [
                "resource_id",
                "resource_type",
                "max_simultaneous_capacity",
                "accessible_grades",
            ],
            "widths": [15, 20, 26, 20],
            "example": ["COMP_LAB_1", "Computer Lab", 3, "6,7,8,9,10"],
        },
        "language_groups": {
            "headers": [
                "section_id",
                "language_slot",
                "hindi_teacher",
                "kannada_teacher",
                "sanskrit_teacher",
            ],
            "widths": [12, 15, 16, 18, 18],
            "example": ["8A", "1st_lang", "T011", "T012", "T013"],
        },
        "constraints_config": {
            "headers": ["constraint_name", "enabled", "value"],
            "widths": [35, 10, 10],
            "example": ["prayer_enabled", 1, ""],
        },
    }

    # Remove default sheet
    wb.remove(wb.active)

    for sheet_name, definition in sheet_definitions.items():
        ws = wb.create_sheet(title=sheet_name)

        # Add headers
        for col, header in enumerate(definition["headers"], 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.border = border
            cell.alignment = Alignment(horizontal="center")

        # Set column widths
        for col, width in enumerate(definition["widths"], 1):
            ws.column_dimensions[get_column_letter(col)].width = width

        # Add example row (commented)
        for col, value in enumerate(definition["example"], 1):
            cell = ws.cell(row=2, column=col, value=value)
            cell.border = border

    # Save to BytesIO
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=timetable_template.xlsx"},
    )


@router.get("/download-sample")
async def download_sample():
    """
    Download the complete Vidya Mandir sample dataset as Excel.

    Returns:
        StreamingResponse with Excel file containing all sample data
    """
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
        from openpyxl.utils import get_column_letter
    except ImportError:
        # Fallback to JSON format
        return JSONResponse(
            {
                "school": SAMPLE_SCHOOL,
                "periods": SAMPLE_PERIODS,
                "teachers": SAMPLE_TEACHERS,
                "subjects": SAMPLE_SUBJECTS,
                "classes": SAMPLE_CLASSES,
                "mappings": SAMPLE_MAPPINGS,
                "resources": SAMPLE_RESOURCES,
                "language_groups": SAMPLE_LANGUAGE_GROUPS,
                "constraints_config": SAMPLE_CONSTRAINTS_CONFIG,
            }
        )

    wb = openpyxl.Workbook()

    # Define styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(
        start_color="217346", end_color="217346", fill_type="solid"
    )
    border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )

    def add_sheet(name, headers, data, widths):
        ws = wb.create_sheet(title=name)

        # Add headers
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.border = border
            cell.alignment = Alignment(horizontal="center")

        # Set column widths
        for col, width in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(col)].width = width

        # Add data
        for row_idx, row_data in enumerate(data, 2):
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_idx, column=col, value=value)
                cell.border = border

    # Remove default sheet
    wb.remove(wb.active)

    # School Config
    add_sheet(
        "school_config",
        [
            "school_id",
            "name",
            "academic_year",
            "start_time",
            "end_time",
            "weekdays",
            "saturday_periods",
            "prayer_minutes",
            "lunch_period_index",
            "recess_period_indices",
        ],
        [
            [
                SAMPLE_SCHOOL["school_id"],
                SAMPLE_SCHOOL["name"],
                SAMPLE_SCHOOL["academic_year"],
                SAMPLE_SCHOOL["start_time"],
                SAMPLE_SCHOOL["end_time"],
                ",".join(SAMPLE_SCHOOL["weekdays"]),
                SAMPLE_SCHOOL["saturday_periods"],
                SAMPLE_SCHOOL["prayer_duration_minutes"],
                SAMPLE_SCHOOL["lunch_period_index"],
                ",".join(map(str, SAMPLE_SCHOOL["recess_period_indices"])),
            ]
        ],
        [10, 30, 15, 12, 12, 30, 18, 15, 20, 22],
    )

    # Periods
    add_sheet(
        "periods",
        [
            "period_index",
            "start_time",
            "end_time",
            "duration_minutes",
            "is_prayer",
            "is_recess",
            "is_lunch",
        ],
        [
            [
                p["period_index"],
                p["start_time"],
                p["end_time"],
                p["duration_minutes"],
                1 if p["is_prayer"] else 0,
                1 if p["is_recess"] else 0,
                1 if p["is_lunch"] else 0,
            ]
            for p in SAMPLE_PERIODS
        ],
        [12, 12, 12, 18, 10, 10, 10],
    )

    # Classes
    add_sheet(
        "classes",
        [
            "section_id",
            "grade",
            "section",
            "student_count",
            "class_teacher_id",
            "language_block_enabled",
            "language_structure",
        ],
        [
            [
                c["section_id"],
                c["grade"],
                c["section"],
                c["student_count"],
                c["class_teacher_id"],
                1 if c["language_block_enabled"] else 0,
                c["language_structure"] or "",
            ]
            for c in SAMPLE_CLASSES
        ],
        [12, 8, 10, 14, 18, 22, 25],
    )

    # Subjects
    add_sheet(
        "subjects",
        [
            "subject_code",
            "name",
            "category",
            "min_weekly",
            "max_weekly",
            "block_required",
            "block_length",
            "resource_type",
        ],
        [
            [
                s["subject_code"],
                s["name"],
                s["category"],
                s["min_weekly"],
                s["max_weekly"],
                1 if s["block_required"] else 0,
                s["block_length"],
                s["resource_type"] or "",
            ]
            for s in SAMPLE_SUBJECTS
        ],
        [15, 25, 12, 12, 12, 15, 12, 20],
    )

    # Teachers
    add_sheet(
        "teachers",
        [
            "teacher_id",
            "name",
            "subjects_can_teach",
            "min_periods_day",
            "max_periods_day",
            "min_periods_week",
            "max_periods_week",
            "max_consecutive_periods",
            "availability_days",
            "availability_time",
        ],
        [
            [
                t["teacher_id"],
                t["name"],
                ",".join(t["subjects_can_teach"]),
                t["min_periods_day"],
                t["max_periods_day"],
                t["min_periods_week"],
                t["max_periods_week"],
                t["max_consecutive_periods"],
                ",".join(t["availability_days"]),
                t["availability_time"],
            ]
            for t in SAMPLE_TEACHERS
        ],
        [12, 20, 25, 16, 16, 18, 18, 22, 30, 18],
    )

    # Mappings
    add_sheet(
        "mappings",
        ["section_id", "subject_code", "teacher_id", "is_class_teacher"],
        [
            [
                m["section_id"],
                m["subject_code"],
                m["teacher_id"],
                1 if m["is_class_teacher"] else 0,
            ]
            for m in SAMPLE_MAPPINGS
        ],
        [12, 15, 12, 16],
    )

    # Resources
    add_sheet(
        "resources",
        [
            "resource_id",
            "resource_type",
            "max_simultaneous_capacity",
            "accessible_grades",
        ],
        [
            [
                r["resource_id"],
                r["resource_type"],
                r["max_simultaneous_capacity"],
                ",".join(map(str, r["accessible_grades"])),
            ]
            for r in SAMPLE_RESOURCES
        ],
        [15, 20, 26, 20],
    )

    # Language Groups
    add_sheet(
        "language_groups",
        [
            "section_id",
            "language_slot",
            "hindi_teacher",
            "kannada_teacher",
        ],
        [
            [
                lg["section_id"],
                lg["language_slot"],
                lg.get("hindi_teacher", ""),
                lg.get("kannada_teacher", ""),
            ]
            for lg in SAMPLE_LANGUAGE_GROUPS
        ],
        [12, 15, 16, 18],
    )

    # Constraints Config
    constraints_data = []
    for name, value in SAMPLE_CONSTRAINTS_CONFIG.items():
        if isinstance(value, bool):
            constraints_data.append([name, 1 if value else 0, ""])
        else:
            constraints_data.append([name, 1, value])
    add_sheet(
        "constraints_config",
        ["constraint_name", "enabled", "value"],
        constraints_data,
        [35, 10, 10],
    )

    # Save to BytesIO
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=vidya_mandir_sample.xlsx"
        },
    )


@router.get("/sample-data")
async def get_sample_data():
    """
    Get sample data as JSON for auto-loading into the frontend.

    Returns:
        JSON with all sample data transformed for frontend consumption
    """
    # Transform to frontend-compatible format
    teachers = []
    for t in SAMPLE_TEACHERS:
        teachers.append(
            {
                "teacher_id": t["teacher_id"],
                "name": t["name"],
                "subjects_can_teach": t["subjects_can_teach"],
                "sections_assigned": [],
                "min_periods_day": t["min_periods_day"],
                "max_periods_day": t["max_periods_day"],
                "min_periods_week": t["min_periods_week"],
                "max_periods_week": t["max_periods_week"],
                "max_consecutive_periods": t["max_consecutive_periods"],
                "is_class_teacher_of": None,
                "is_specialist": len(t["availability_days"]) < 6,
                # Language specialist fields for language block synchronization
                "is_language_specialist": t.get("is_language_specialist", False),
                "primary_language": t.get("primary_language"),
                "availability": {
                    day: {
                        "available": day in t["availability_days"],
                        "from_time": t["availability_time"].split("-")[0]
                        if day in t["availability_days"]
                        else None,
                        "to_time": t["availability_time"].split("-")[1]
                        if day in t["availability_days"]
                        else None,
                    }
                    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                },
            }
        )

    # Update class teacher info
    for c in SAMPLE_CLASSES:
        for t in teachers:
            if t["teacher_id"] == c["class_teacher_id"]:
                t["is_class_teacher_of"] = c["section_id"]
                break

    # Update sections assigned based on mappings
    for m in SAMPLE_MAPPINGS:
        for t in teachers:
            if t["teacher_id"] == m["teacher_id"]:
                if m["section_id"] not in t["sections_assigned"]:
                    t["sections_assigned"].append(m["section_id"])
                break

    subjects = []
    for s in SAMPLE_SUBJECTS:
        subjects.append(
            {
                "subject_id": s["subject_code"],
                "name": s["name"],
                "category": s["category"],
                "min_per_week": s["min_weekly"],
                "max_per_week": s["max_weekly"],
                "requires_block": s["block_required"],
                "block_length": s["block_length"] if s["block_required"] else 2,
                "requires_resource": s["resource_type"] is not None,
                "resource_type": s["resource_type"],
                "prefer_morning": s["category"] == "core",
                "avoid_after_lunch": s["category"] == "core",
                "is_specialist": False,
                # Language tier for synchronization:
                # Tier 1: First Language (e.g., English) - fixed for all students
                # Tier 2: Second Language (Hindi/Kannada/Sanskrit) - students choose one
                # Tier 3: Third Language (French/German) - students choose one
                "language_tier": s.get("language_tier"),
                "is_language_block": s["category"] == "language"
                and s.get("language_tier", 0) >= 2,  # Tier 2+ requires synchronization
            }
        )

    classes = []
    for c in SAMPLE_CLASSES:
        # Build subject-teacher map
        subject_teacher_map = {}
        language_subjects = []
        language_teachers = []

        for m in SAMPLE_MAPPINGS:
            if m["section_id"] == c["section_id"]:
                subject_teacher_map[m["subject_code"]] = m["teacher_id"]

        # Get language block info (2-language model: each section has ONE tier-2 lang)
        for lg in SAMPLE_LANGUAGE_GROUPS:
            if lg["section_id"] == c["section_id"]:
                language_subjects = []
                language_teachers = []
                if lg.get("hindi_teacher"):
                    language_subjects.append("HINDI")
                    language_teachers.append(lg["hindi_teacher"])
                if lg.get("kannada_teacher"):
                    language_subjects.append("KANNADA")
                    language_teachers.append(lg["kannada_teacher"])
                break

        classes.append(
            {
                "section_id": c["section_id"],
                "grade": c["grade"],
                "section_name": c["section"],
                "class_teacher_id": c["class_teacher_id"],
                "subject_teacher_map": subject_teacher_map,
                "language_block_enabled": c["language_block_enabled"],
                "language_subjects": language_subjects,
                "language_teachers": language_teachers,
            }
        )

    resources = []
    for r in SAMPLE_RESOURCES:
        resources.append(
            {
                "resource_id": r["resource_id"],
                "resource_type": r["resource_type"],
                "name": r["resource_type"],
                "max_simultaneous_capacity": r["max_simultaneous_capacity"],
                "available_periods": None,
            }
        )

    school = {
        "school_id": SAMPLE_SCHOOL["school_id"],
        "name": SAMPLE_SCHOOL["name"],
        "start_time": SAMPLE_SCHOOL["start_time"],
        "end_time": SAMPLE_SCHOOL["end_time"],
        "weekdays": SAMPLE_SCHOOL["weekdays"],
        "periods_per_weekday": SAMPLE_SCHOOL["periods_per_weekday"],
        "saturday_periods": SAMPLE_SCHOOL["saturday_periods"],
        "period_duration_minutes": SAMPLE_SCHOOL["period_duration_minutes"],
        "prayer_enabled": SAMPLE_SCHOOL["prayer_enabled"],
        "prayer_duration_minutes": SAMPLE_SCHOOL["prayer_duration_minutes"],
        "lunch_period_index": SAMPLE_SCHOOL["lunch_period_index"],
        "lunch_after_period": SAMPLE_SCHOOL["lunch_after_period"],
        "lunch_duration_minutes": SAMPLE_SCHOOL["lunch_duration_minutes"],
        "recess_period_indices": SAMPLE_SCHOOL["recess_period_indices"],
        "recess_after_every_n_periods": SAMPLE_SCHOOL["recess_after_every_n_periods"],
        "recess_duration_minutes": SAMPLE_SCHOOL["recess_duration_minutes"],
    }

    return {
        "upload_id": "sample-data-vidya-mandir",
        "preview": {
            "teachers": len(teachers),
            "classes": len(classes),
            "subjects": len(subjects),
            "resources": len(resources),
        },
        "sample_rows": {
            "teachers": teachers[:3],
            "classes": classes[:3],
            "subjects": subjects[:3],
        },
        "validation_errors": [],
        "school": school,
        "teachers": teachers,
        "subjects": subjects,
        "classes": classes,
        "resources": resources,
        "constraints": SAMPLE_CONSTRAINTS_CONFIG,
    }
