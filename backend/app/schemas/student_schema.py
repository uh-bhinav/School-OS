from typing import Optional

from pydantic import UUID4, BaseModel


class StudentOut(BaseModel):
    student_id: int  #
    user_id: UUID4  #
    current_class_id: Optional[int] = None  #
    roll_number: Optional[str] = None  #

    class Config:
        from_attributes = True
