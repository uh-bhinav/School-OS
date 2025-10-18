# app/schemas/payment.py

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class PaymentBase(BaseModel):
    amount_paid: Optional[Decimal]
    payment_method: Optional[str]
    status: Optional[str]
    transaction_id: Optional[str] = None
    payment_date: Optional[datetime] = None


class PaymentCreate(PaymentBase):
    invoice_id: int
    amount_paid: Decimal  # Required when creating a payment log
    payment_method: str  # Required when creating a payment log
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentOut(PaymentBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True


class PaymentInitiateRequest(BaseModel):
    invoice_id: Optional[int] = None
    order_id: Optional[int] = None

    @model_validator(mode="after")
    def check_exactly_one_target(self) -> "PaymentInitiateRequest":
        if (self.invoice_id is not None and self.order_id is not None) or (self.invoice_id is None and self.order_id is None):
            raise ValueError("Exactly one of invoice_id or order_id must be provided.")
        return self


class PaymentInitiateResponse(BaseModel):
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int  # Amount in the smallest currency unit (e.g., paise)
    internal_payment_id: int
    school_name: str
    description: str


class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    internal_payment_id: int  # Our internal ID to quickly find the payment record
