# backend/app/schemas/invoice_schema.py (Fixed)
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# Properties to receive on creation (Admin use)
class InvoiceCreate(BaseModel):
    student_id: int
    fee_structure_id: int
    fee_term_id: Optional[int] = None
    invoice_number: str
    due_date: date
    amount_due: Decimal = Field(..., ge=0, decimal_places=2)


# Properties to receive on update (Used by Admin to change status or apply fine)
class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    late_fee_applied: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    payment_date: Optional[date] = None

    # ADDED: Essential audit and financial update fields
    fine_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    scholarship_ref: Optional[str] = None
    payment_method: Optional[str] = None
    is_active: Optional[bool] = None  # Allows Admin to reactivate an invoice


# Properties to return to the client (Parent/Student)
class InvoiceOut(BaseModel):
    id: int
    student_id: int
    invoice_number: str
    due_date: date
    amount_due: Decimal
    status: str
    late_fee_applied: Decimal

    # OUTPUT INCLUDES NEW FIELDS
    fine_amount: Optional[Decimal]
    payment_date: Optional[date]
    payment_method: Optional[str]
    is_active: bool

    total_due: Decimal  # Calculated field (amount_due + late_fee_applied)

    class Config:
        from_attributes = True
