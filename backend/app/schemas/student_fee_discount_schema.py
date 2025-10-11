# app/schemas/fee_discount.py

from typing import Optional

from pydantic import BaseModel


class FeeDiscountBase(BaseModel):
    amount: float
    reason: Optional[str] = None


class FeeDiscountCreate(FeeDiscountBase):
    student_id: int
    fee_term_id: int


class FeeDiscountOut(FeeDiscountBase):
    id: int
    student_id: int
    fee_term_id: int

    class Config:
        from_attributes = True
