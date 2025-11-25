from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ExamClassMappingBase(BaseModel):
    exam_id: int
    class_id: int
    is_active: bool = True


class ExamClassMappingCreate(ExamClassMappingBase):
    pass


class ExamClassMappingUpdate(BaseModel):
    is_active: Optional[bool] = None


class ExamClassMappingOut(ExamClassMappingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExamWithClassesOut(BaseModel):
    """Exam with all classes it's assigned to"""

    id: int
    exam_name: str
    exam_type_id: Optional[int]
    start_date: Optional[str]
    end_date: Optional[str]
    marks: Optional[float]
    academic_year_id: Optional[int]
    is_active: bool
    classes: list[dict] = []  # List of {class_id, class_name, grade_level, section}

    class Config:
        from_attributes = True


class ClassWithExamsOut(BaseModel):
    """Class with all exams assigned to it"""

    class_id: int
    grade_level: int
    section: str
    school_id: int
    exams: list[dict] = []  # List of {exam_id, exam_name, exam_type_id, ...}

    class Config:
        from_attributes = True
