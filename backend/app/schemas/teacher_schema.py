from typing import Optional

from pydantic import UUID4, BaseModel


class TeacherOut(BaseModel):
    teacher_id: int  #
    user_id: UUID4  #
    department: Optional[str] = None  #

    class Config:
        from_attributes = True
