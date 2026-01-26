from pydantic import BaseModel


class StudentFeeAssignmentCreate(BaseModel):
    student_id: int
    fee_component_id: int
    # The 'is_active' flag is the key to this override system
    is_active: bool


class StudentFeeAssignmentOut(StudentFeeAssignmentCreate):
    id: int

    class Config:
        from_attributes = True
