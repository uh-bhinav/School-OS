# app/schemas/payment.py

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    amount_paid: float
    payment_method: str
    status: str
    transaction_id: Optional[str] = None
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentCreate(PaymentBase):
    invoice_id: int


class PaymentOut(PaymentBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True
