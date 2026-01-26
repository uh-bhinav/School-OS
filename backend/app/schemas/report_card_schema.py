# backend/app/schemas/report_card_schema.py

import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SubjectMark(BaseModel):
    """
    Represents the marks for a single subject within one exam.
    """

    subject_name: str
    marks_obtained: Decimal
    max_marks: Decimal

    model_config = ConfigDict(from_attributes=True)


class ExamSummary(BaseModel):
    """
    Represents the summary for a single exam, including all its subjects
    and the calculated totals and percentage for that exam.
    """

    exam_name: str
    marks: list[SubjectMark]
    total_obtained: Decimal
    total_max_marks: Decimal
    percentage: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class ReportCard(BaseModel):
    """
    The main report card model. It contains student info, a list
    of all their exam summaries, and the grand totals.
    """

    student_id: int
    student_user_id: uuid.UUID
    student_name: str
    class_name: str
    exam_summaries: list[ExamSummary]
    grand_total_obtained: Decimal
    grand_total_max_marks: Decimal
    overall_percentage: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
