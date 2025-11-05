# backend/app/services/report_card_service.py

from collections import defaultdict
from decimal import Decimal

# --- END OF FIX ---
from typing import Dict, Optional

from sqlalchemy.future import select
from sqlalchemy.orm import Session

# --- START OF FIX ---
# Changed these imports from relative (..) to absolute (app.)
from app import schemas
from app.models import Class, Exam, Mark, Profile, Student, Subject


def get_percentage(obtained: Decimal, max_marks: Decimal) -> Optional[float]:
    """
    Safely calculate percentage, handling division by zero.
    """
    if max_marks == 0:
        return None
    # Convert to float for standard percentage representation
    return float((obtained / max_marks) * 100)


async def get_student_report_card_data(db: Session, student_id: int, academic_year_id: int) -> Optional[schemas.ReportCard]:
    # 1. Get student, class, and profile info
    student_query = select(Student, Class, Profile).join(Profile, Student.user_id == Profile.user_id).join(Class, Student.current_class_id == Class.class_id).where(Student.student_id == student_id)
    student_result = (await db.execute(student_query)).first()

    if not student_result:
        # Student not found or not enrolled in a class
        return None

    student_obj, class_obj, profile_obj = student_result

    # 2. Get all marks for that student in the given academic year
    marks_query = (
        select(Subject.name.label("subject_name"), Exam.exam_name, Mark.marks_obtained, Mark.max_marks)
        .join(Subject, Mark.subject_id == Subject.subject_id)
        .join(Exam, Mark.exam_id == Exam.id)
        .where(Mark.student_id == student_id, Exam.academic_year_id == academic_year_id)
    )

    marks_results = (await db.execute(marks_query)).all()

    # 3. Process and aggregate the marks in Python

    # This dictionary will group all marks by exam name
    # e.g., "Mid-Term": {"marks": [], "total_obtained": 0, "total_max": 0}
    exam_groups: Dict[str, Dict] = defaultdict(lambda: {"marks": [], "total_obtained": Decimal(0), "total_max": Decimal(0)})

    grand_total_obtained = Decimal(0)
    grand_total_max_marks = Decimal(0)

    for mark in marks_results:
        exam_name = mark.exam_name
        obtained = mark.marks_obtained
        max_m = mark.max_marks

        # Add to this exam's group
        exam_groups[exam_name]["marks"].append(schemas.SubjectMark(subject_name=mark.subject_name, marks_obtained=obtained, max_marks=max_m))
        exam_groups[exam_name]["total_obtained"] += obtained
        exam_groups[exam_name]["total_max"] += max_m

        # Add to grand total
        grand_total_obtained += obtained
        grand_total_max_marks += max_m

    # 4. Build the final response objects
    exam_summaries = []
    for exam_name, data in exam_groups.items():
        exam_summaries.append(schemas.ExamSummary(exam_name=exam_name, marks=data["marks"], total_obtained=data["total_obtained"], total_max_marks=data["total_max"], percentage=get_percentage(data["total_obtained"], data["total_max"])))

    # 5. Build the final ReportCard object
    report_card_data = schemas.ReportCard(
        student_id=student_obj.student_id,
        student_user_id=student_obj.user_id,
        student_name=f"{profile_obj.first_name} {profile_obj.last_name or ''}".strip(),
        class_name=f"Grade {class_obj.grade_level} - {class_obj.section}",
        exam_summaries=sorted(exam_summaries, key=lambda e: e.exam_name),  # Sort exams by name
        grand_total_obtained=grand_total_obtained,
        grand_total_max_marks=grand_total_max_marks,
        overall_percentage=get_percentage(grand_total_obtained, grand_total_max_marks),
    )

    return report_card_data
