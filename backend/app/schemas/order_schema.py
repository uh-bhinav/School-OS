# backend/app/schemas/order_schema.py
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# Item detail used for input when creating a new order
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


# Full Order input structure
class OrderCreate(BaseModel):
    student_id: int = Field(..., description="Student the order is being placed for.")
    # parent_user_id will be derived from the authenticated user (JWT)
    items: list[OrderItemCreate] = Field(
        ..., description="List of products in the order."
    )


# Order update (Admin use)
class OrderUpdate(BaseModel):
    status: Optional[str] = None  # e.g., 'Completed', 'Shipped', 'Cancelled'
    total_amount: Optional[Decimal] = None


# Order item output (detail)
class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    price_at_time_of_order: Decimal

    class Config:
        from_attributes = True


# Full Order output structure
class OrderOut(BaseModel):
    order_id: int
    order_number: str
    student_id: int
    parent_user_id: UUID
    total_amount: Decimal
    status: str
    items: list[OrderItemOut]

    class Config:
        from_attributes = True
