# app/schemas/fee_term.py

from datetime import date
from typing import Optional

from pydantic import BaseModel


class FeeTermBase(BaseModel):
    name: str
    due_date: date
    amount: float


class FeeTermCreate(FeeTermBase):
    pass


class FeeTermUpdate(BaseModel):
    name: Optional[str] = None
    due_date: Optional[date] = None
    amount: Optional[float] = None


class FeeTermOut(FeeTermBase):
    id: int
    fee_template_id: int

    class Config:
        from_attributes = True
