from typing import (
    Any,
    Optional,
)

from sqlalchemy import select

# FIX 1: Import Dict, Any, List from typing
from sqlalchemy.orm import Session

from app.models.exam import Exam
from app.models.mark import Mark  # Assuming you have a Mark model
from app.models.subject import Subject

# Assuming you have a Subject model
from app.schemas.exam_schema import ExamCreate, ExamUpdate


def create_exam(db: Session, exam_in: ExamCreate) -> Exam:
    db_obj = Exam(**exam_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_exam_by_id(db: Session, exam_id: int) -> Optional[Exam]:
    """Retrieves an active exam by ID (READ FILTER APPLIED)."""
    # NOTE: The critical filter required by project standards:
    stmt = select(Exam).where(Exam.id == exam_id, Exam.is_active.is_(True))
    result = db.execute(stmt)
    return result.scalars().first()


def get_all_exams_for_school(db: Session, school_id: int) -> list[Exam]:
    stmt = (
        select(Exam).where(Exam.school_id == school_id).order_by(Exam.start_date.desc())
    )
    result = db.execute(stmt)
    return list(result.scalars().all())


def update_exam(db: Session, db_obj: Exam, exam_in: ExamUpdate) -> Exam:
    update_data = exam_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_exam(db: Session, db_obj: Exam) -> Exam:
    # Assuming the soft delete standard is
    # implemented here, as per project context
    db_obj.is_active = False
    db.add(db_obj)
    db.commit()
    return db_obj


def get_exam_mark_summary(db: Session, exam_id: int, student_id: int) -> dict[str, Any]:
    """
    Agentic Function: Retrieves a student's
      consolidated results for all subjects
    in a specific, active exam.
    """

    # 1. Select the necessary data by joining Marks, Subjects, and Exams.
    stmt = (
        select(
            Mark.marks_obtained,
            Mark.total_marks,
            Mark.grade_letter,
            Subject.name.label("subject_name"),
            Exam.exam_name,
        )
        .join(Subject, Mark.subject_id == Subject.subject_id)
        .join(Exam, Mark.exam_id == Exam.id)
        .where(
            Mark.student_id == student_id,
            Mark.exam_id == exam_id,
            # FIX 2: Ensure filter is on a separate
            #  line if needed, but keeping it clean
            Exam.is_active.is_(True),
        )
    )

    result = db.execute(stmt)
    mark_records = result.all()

    if not mark_records:
        return {
            "status": "not_found",
            "message": f"No active results- {student_id} in Exam {exam_id}.",
        }
    # 2. Format the results into a clean,
    #  structured dictionary for the Agent.
    summary = {
        "student_id": student_id,
        # FIX 3: E501 line break applied here
        "exam_name": mark_records[0].exam_name,
        "total_marks_obtained": sum(r.marks_obtained for r in mark_records),
        "performance_by_subject": [
            {
                "subject": r.subject_name,
                "obtained": float(r.marks_obtained),
                "total": float(r.total_marks),
                "grade": r.grade_letter,
            }
            for r in mark_records
        ],
        "status": "complete",
    }

    return summary


# --- Agentic Function ---
# NOTE: The subsequent functions were moved from the bottom of the file
# to resolve E402 and F811 errors (Imports must be at the top).


def fetch_exams_by_academic_year(db: Session, academic_year_id: int) -> list[Exam]:
    """
    Agentic Function: Retrieves all active
    exams scheduled within a specific academic year.
    """
    stmt = (
        select(Exam)
        .where(
            # Filter 1: Match the required academic year
            Exam.academic_year_id == academic_year_id,
            # Filter 2: Apply the mandatory soft-delete filter
            Exam.is_active.is_(True),
        )
        .order_by(Exam.start_date.asc())
    )
    result = db.execute(stmt)
    # Return a list of Exam objects
    return list(result.scalars().all())
