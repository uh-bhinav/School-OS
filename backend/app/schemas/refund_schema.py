from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RefundCreate(BaseModel):
    payment_id: int
    amount: Decimal = Field(..., gt=0, description="The amount to be refunded.")
    reason: str
    processed_by_user_id: UUID
    notes: Optional[str] = None


class RefundOut(BaseModel):
    id: int
    payment_id: int
    amount: Decimal
    reason: str
    status: str
    gateway_refund_id: Optional[str] = None

    class Config:
        from_attributes = True
