# app/schemas/fee_discount.py


from pydantic import BaseModel


class StudentFeeDiscountCreate(BaseModel):
    student_id: int
    discount_id: int


class StudentFeeDiscountOut(StudentFeeDiscountCreate):
    id: int

    class Config:
        from_attributes = True
