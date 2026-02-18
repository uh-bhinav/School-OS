"""
Report Intelligence Module
============================
Smart query classifier that detects when users want downloadable reports.
Determines report type, target entity, and output format.

Supported report types:
  - report_card: Student academic report with marks, grades, remarks
  - fee_receipt: Fee payment receipt with invoice details
  - attendance_report: Attendance summary for student/class
  - class_analytics: Class-wide performance analytics

Used by agents.py to automatically trigger report generation.
"""

import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ============================================================================
# REPORT TYPE DEFINITIONS
# ============================================================================

REPORT_TYPES = {
    "report_card": {
        "triggers": [
            "report card",
            "progress report",
            "academic report",
            "student report",
            "marksheet",
            "mark sheet",
            "grade card",
            "grade sheet",
            "result card",
            "performance report",
            "generate report card",
            "download report card",
            "downloadable report",
            "downloadable report card",
            "report card downloadable",
            "make it downloadable",
            "need this downloadable",
            "need it downloadable",
            "need a downloadable",
            "want it downloadable",
            "want a downloadable",
            "download this report",
            "download the report",
            "print report card",
            "pdf report card",
            "give me the report card",
            "get me the report card",
            "i need the report card",
            "report card pdf",
        ],
        "description": "Student academic report with marks, grades, and remarks (CBSE format)",
        "required_data": ["student_name", "class_name", "marks_data"],
        "default_format": "pdf",
    },
    "fee_receipt": {
        "triggers": [
            "fee receipt",
            "payment receipt",
            "invoice",
            "fee statement",
            "payment statement",
            "fees receipt",
            "tuition receipt",
            "generate receipt",
            "download receipt",
            "print receipt",
        ],
        "description": "Fee payment receipt with invoice and payment details",
        "required_data": ["student_name", "fee_data"],
        "default_format": "pdf",
    },
    "attendance_report": {
        "triggers": [
            "attendance report",
            "attendance certificate",
            "attendance summary",
            "attendance record",
            "generate attendance",
            "download attendance",
            "print attendance",
            "attendance sheet",
        ],
        "description": "Attendance summary with daily/monthly breakdown",
        "required_data": ["student_name", "attendance_data"],
        "default_format": "pdf",
    },
    "class_analytics": {
        "triggers": [
            "class analytics",
            "class report",
            "class performance report",
            "class summary",
            "class overview report",
            "section report",
            "grade report",
            "generate class report",
            "download class analytics",
            "class analysis report",
        ],
        "description": "Class-wide performance analytics with metrics and rankings",
        "required_data": ["class_name", "marks_data", "attendance_data"],
        "default_format": "pdf",
    },
}

# Keywords that indicate download / generation intent
GENERATION_KEYWORDS = [
    "generate",
    "download",
    "downloadable",
    "print",
    "create",
    "make",
    "prepare",
    "produce",
    "export",
    "get me",
    "give me",
    "send me",
    "i need",
    "i want",
    "can i get",
    "please provide",
    "make it",
    "need this",
    "need it",
    "want it",
    "pdf",
]

# Format keywords
FORMAT_KEYWORDS = {
    "pdf": ["pdf", "document", "printable"],
    "csv": ["csv", "excel", "spreadsheet", "data file"],
}


# ============================================================================
# ENTITY EXTRACTION
# ============================================================================

# Student name patterns — ordered from most specific to most general
STUDENT_NAME_PATTERNS = [
    r"(?:student\s+named?|named?)\s+(\w+(?:\s+\w+){0,2})",
    r"(?:for|of)\s+(?:student\s+)?(\w+(?:\s+\w+){0,2}?)(?:\s*(?:from|in|of|class|grade|'s|$))",
    r"(\w+(?:\s+\w+){0,2}?)(?:'s)\s+(?:report|receipt|attendance|card|marks)",
    r"(?:student|name)\s*[:=]?\s*(\w+(?:\s+\w+){0,2})",
    r"report\s+card\s+(?:for|of)\s+(\w+(?:\s+\w+){0,2})",
    r"give\s+me\s+(?:the\s+)?(?:report\s+card|marksheet|grade\s+card)\s+(?:for|of)\s+(\w+(?:\s+\w+){0,2})",
]

# Class/grade patterns
CLASS_PATTERNS = [
    r"(?:class|grade)\s*(\d+)\s*[-–]?\s*([A-Za-z])?",
    r"(?:for|of|in)\s+(?:class|grade)\s*(\d+)\s*[-–]?\s*([A-Za-z])?",
    r"(\d+)(?:th|st|nd|rd)\s+(?:class|grade|standard)\s*[-–]?\s*([A-Za-z])?",
]

# Student ID patterns
STUDENT_ID_PATTERNS = [
    r"(?:student\s*(?:id|number|no))\s*[:=]?\s*(\d+)",
    r"(?:id|roll\s*(?:no|number))\s*[:=]?\s*(\d+)",
    r"student\s+(?:with\s+)?(?:student\s+)?id\s*[:=]?\s*(\d+)",
    r"\bid\s+(\d+)\b",
]


def extract_entity(query: str) -> Dict[str, Any]:
    """
    Extract the target entity (student, class) from the query.

    Returns:
        Dict with:
            - student_name (str or None)
            - student_id (int or None)
            - class_name (str or None)
            - section (str or None)
    """
    entity = {
        "student_name": None,
        "student_id": None,
        "class_name": None,
        "section": None,
    }

    query_lower = query.lower()

    # Extract student ID
    for pattern in STUDENT_ID_PATTERNS:
        match = re.search(pattern, query_lower)
        if match:
            entity["student_id"] = int(match.group(1))
            break

    # Extract class/grade
    for pattern in CLASS_PATTERNS:
        match = re.search(pattern, query_lower)
        if match:
            grade_num = match.group(1)
            section = match.group(2).upper() if match.group(2) else None
            entity["class_name"] = f"Grade {grade_num}"
            entity["section"] = section
            break

    # Extract student name
    for pattern in STUDENT_NAME_PATTERNS:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Validate: not a report type keyword or generic word
            skip_names = [
                "the",
                "a",
                "an",
                "this",
                "my",
                "all",
                "each",
                "every",
                "class",
                "grade",
                "report",
                "fee",
                "attendance",
            ]
            if name.lower() not in skip_names and len(name) > 2:
                entity["student_name"] = name.title()
                break

    return entity


# ============================================================================
# REPORT DETECTION
# ============================================================================


def should_generate_report(query: str) -> Dict[str, Any]:
    """
    Determine if a user query is requesting a downloadable report.

    Args:
        query: The user's query string

    Returns:
        Dict with:
            - needs_report (bool): Whether a report should be generated
            - report_type (str): Type of report (report_card, fee_receipt, etc.)
            - entity (dict): Extracted target entity info
            - format (str): Output format (pdf, csv)
            - confidence (float): Detection confidence 0-1
            - reasoning (str): Why report was/wasn't detected
    """
    query_lower = query.lower().strip()

    # Check each report type
    best_match = None
    best_score = 0

    for report_type, config in REPORT_TYPES.items():
        score = 0
        matched_trigger = None

        # Check trigger phrases
        for trigger in config["triggers"]:
            if trigger in query_lower:
                score += 2.0
                matched_trigger = trigger
                break

        # Check if generation intent is present
        has_generation_intent = any(kw in query_lower for kw in GENERATION_KEYWORDS)
        if has_generation_intent:
            score += 1.0

        # Check for report-related words alongside domain keywords
        report_words = [
            "report",
            "receipt",
            "card",
            "sheet",
            "certificate",
            "statement",
        ]
        has_report_word = any(w in query_lower for w in report_words)
        if has_report_word:
            score += 0.5

        if score > best_score:
            best_score = score
            best_match = (report_type, matched_trigger, score)

    # Determine if we should generate
    needs_report = best_score >= 2.0  # Must match a trigger at minimum

    if not needs_report:
        return {
            "needs_report": False,
            "report_type": None,
            "entity": {},
            "format": None,
            "confidence": 0.0,
            "reasoning": f"No report trigger matched (score: {best_score:.1f})",
        }

    report_type = best_match[0]
    confidence = min(best_score / 4.0, 1.0)

    # Extract entity
    entity = extract_entity(query)

    # Detect format
    output_format = REPORT_TYPES[report_type]["default_format"]
    for fmt, keywords in FORMAT_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            output_format = fmt
            break

    return {
        "needs_report": True,
        "report_type": report_type,
        "entity": entity,
        "format": output_format,
        "confidence": confidence,
        "reasoning": f"Matched '{best_match[1]}' for {report_type} (confidence: {confidence:.1%})",
    }


# ============================================================================
# DATA RESOLVER — Looks up entity data from inline CSV data
# ============================================================================


def resolve_report_data(
    report_type: str,
    entity: Dict[str, Any],
    students_data: str = "",
    marks_data: str = "",
    attendance_data: str = "",
    fees_data: str = "",
    staff_data: str = "",
) -> Optional[Dict[str, Any]]:
    """
    Resolve the data needed for a specific report by looking up entity
    information in the inline CSV data strings.

    Args:
        report_type: Type of report to generate
        entity: Extracted entity dict (student_name, student_id, class_name)
        students_data: CSV string of student records
        marks_data: CSV string of marks records
        attendance_data: CSV string of attendance records
        fees_data: CSV string of fee records
        staff_data: CSV string of staff records

    Returns:
        Dict with all resolved data needed for the report, or None if entity not found
    """
    import csv
    import io

    def parse_csv(csv_string: str) -> List[Dict[str, str]]:
        """Parse a CSV string into list of dicts."""
        if not csv_string.strip():
            return []
        reader = csv.DictReader(io.StringIO(csv_string.strip()))
        return list(reader)

    # Parse all data
    students = parse_csv(students_data)
    marks = parse_csv(marks_data)
    attendance = parse_csv(attendance_data)
    fees = parse_csv(fees_data)

    # Find the target student(s)
    target_students = []

    if entity.get("student_id"):
        sid = str(entity["student_id"])
        target_students = [
            s for s in students if s.get("student_id") == sid or s.get("id") == sid
        ]
    elif entity.get("student_name"):
        name_lower = entity["student_name"].lower()
        target_students = [
            s
            for s in students
            if name_lower in s.get("student_name", "").lower()
            or name_lower in s.get("name", "").lower()
        ]
    elif entity.get("class_name"):
        class_name = entity["class_name"]
        section = entity.get("section")
        target_students = [
            s
            for s in students
            if class_name.lower() in s.get("class_name", "").lower()
            and (not section or s.get("section", "").upper() == section)
        ]

    if not target_students and report_type != "class_analytics":
        return {"found": False, "error": f"No student found matching: {entity}"}

    resolved = {
        "found": True,
        "report_type": report_type,
        "entity": entity,
        "students": target_students,
        "school_name": "SchoolOS Academy",
        "school_address": "123 Education Lane, Knowledge City",
        "school_phone": "+91-1234567890",
        "school_email": "info@schoolos.edu",
        "academic_year": "2025-2026",
    }

    # Report-specific data resolution
    if report_type == "report_card" and target_students:
        student = target_students[0]
        sid = student.get("student_id", student.get("id", ""))
        # Only include marks — NO fees, NO attendance mixing
        student_marks = [m for m in marks if m.get("student_id") == sid]
        resolved["student"] = student
        resolved["marks"] = student_marks

    elif report_type == "fee_receipt" and target_students:
        student = target_students[0]
        sid = student.get("student_id", student.get("id", ""))
        student_fees = [f for f in fees if f.get("student_id") == sid]
        resolved["student"] = student
        resolved["fees"] = student_fees

    elif report_type == "attendance_report" and target_students:
        student = target_students[0]
        sid = student.get("student_id", student.get("id", ""))
        student_attendance = [a for a in attendance if a.get("student_id") == sid]
        resolved["student"] = student
        resolved["attendance"] = student_attendance

    elif report_type == "class_analytics":
        class_name = entity.get("class_name", "")
        section = entity.get("section")

        # Filter all data by class
        class_marks = [
            m for m in marks if class_name.lower() in m.get("class_name", "").lower()
        ]
        class_attendance = [
            a
            for a in attendance
            if class_name.lower() in a.get("class_name", "").lower()
            and (not section or a.get("section", "").upper() == section)
        ]
        class_fees = [
            f for f in fees if class_name.lower() in f.get("class_name", "").lower()
        ]

        resolved["class_name"] = f"{class_name}{f' - {section}' if section else ''}"
        resolved["marks"] = class_marks
        resolved["attendance"] = class_attendance
        resolved["fees"] = class_fees
        resolved["students"] = target_students

    return resolved


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "should_generate_report",
    "extract_entity",
    "resolve_report_data",
    "REPORT_TYPES",
]
