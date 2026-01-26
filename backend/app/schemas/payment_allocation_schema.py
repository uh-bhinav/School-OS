from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PaymentAllocationCreate(BaseModel):
    payment_id: int
    invoice_item_id: int
    amount_allocated: Decimal
    allocated_by_user_id: UUID
    notes: Optional[str] = None


class PaymentAllocationOut(PaymentAllocationCreate):
    id: int

    class Config:
        from_attributes = True
