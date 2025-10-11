# backend/app/schemas/fee_template_schema.py
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# Properties to receive on creation
class FeeTemplateCreate(BaseModel):
    school_id: int = Field(..., description="The ID of the school this fee structure belongs to.")
    academic_year_id: int
    name: str
    description: Optional[str] = None
    total_amount: Decimal = Field(..., ge=0, decimal_places=2)
    status: str = "Draft"
    start_date: Optional[date] = None
    end_date: Optional[date] = None


# Properties to receive on update
class FeeTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: Optional[str] = None  # e.g., 'Draft', 'Active', 'Archived'


# Properties to return to the client
class FeeTemplateOut(BaseModel):
    id: int
    school_id: int
    academic_year_id: int
    name: str
    total_amount: Decimal
    status: str
    created_at: Optional[date] = None

    class Config:
        from_attributes = True
