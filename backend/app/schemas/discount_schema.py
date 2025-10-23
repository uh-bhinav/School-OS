# app/schemas/discount.py

import enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class DiscountCreate(BaseModel):
    school_id: int
    name: str = Field(..., description="e.g., '10% Sibling Discount'")
    description: Optional[str] = None
    type: DiscountType
    value: float = Field(..., gt=0, description="The value, like 10.0 for percentage or 500 for fixed amount")
    rules: Optional[dict[str, Any]] = Field(None, description="JSON rules for applicability, e.g., {'applicable_to_component_ids': [1]}")


class DiscountOut(DiscountCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
