# app/schemas/class_fee_structure.py

from pydantic import BaseModel


class ClassFeeStructureCreate(BaseModel):
    class_id: int
    fee_template_id: int
    academic_year_id: int
    # The 'amount' will be derived from the template's components later,
    # so we don't need it for the initial assignment.


class ClassFeeStructureOut(ClassFeeStructureCreate):
    id: int

    class Config:
        from_attributes = True


class AssignTemplateToClassSchema(BaseModel):
    class_id: int
    template_id: int
    academic_year_id: int
