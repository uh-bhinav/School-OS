# app/schemas/discount.py

import enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


# Define the ENUM for the discount type
class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


# --- Schemas for Discount Templates ---


class DiscountBase(BaseModel):
    name: str = Field(..., description="Name of the discount, e.g., 'Sibling Discount'")
    description: Optional[str] = None
    type: DiscountType
    value: float = Field(..., gt=0, description="The value (e.g., 10 for 10% or 500 for a fixed amount)")
    rules: Optional[Dict[str, Any]] = Field(None, description="JSON rules for applicability")
    is_active: bool = True


class DiscountCreate(DiscountBase):
    school_id: int


class DiscountUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[DiscountType] = None
    value: Optional[float] = Field(None, gt=0)
    rules: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class DiscountOut(DiscountBase):
    id: int
    school_id: int

    class Config:
        from_attributes = True
