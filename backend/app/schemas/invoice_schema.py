from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, computed_field

from .invoice_item_schema import InvoiceItemOut


# ADDED: A minimal PaymentOut schema for nesting inside InvoiceOut.
# This should ideally be in its own payment_schema.py file.
class PaymentOut(BaseModel):
    id: int
    amount_paid: Decimal
    payment_date: date
    payment_method: str
    status: str

    class Config:
        from_attributes = True


# CHANGE: Simplified to only require essential IDs for automated generation.
class InvoiceCreate(BaseModel):
    student_id: int
    fee_term_id: int


# Properties to receive on update (Used by Admin)
class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    fine_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    scholarship_ref: Optional[str] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None


class BulkInvoiceCreate(BaseModel):
    class_id: int
    fee_term_id: int


# Properties to return to the client
class InvoiceOut(BaseModel):
    id: int
    student_id: int
    invoice_number: str
    due_date: date
    amount_due: Decimal
    status: str
    fine_amount: Optional[Decimal]
    payment_date: Optional[date]

    # CHANGE: Added a nested list to show all payments for this invoice.
    payments: list[PaymentOut] = []
    items: list[InvoiceItemOut] = []

    # CHANGE: Implemented total_due as a computed field.
    @computed_field
    @property
    def total_due(self) -> Decimal:
        """Calculates the total amount due by adding the base amount and any fine."""
        fine = self.fine_amount or Decimal(0)
        return self.amount_due + fine

    class Config:
        from_attributes = True
