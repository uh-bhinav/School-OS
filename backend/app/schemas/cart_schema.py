# backend/app/schemas/cart_schema.py

from uuid import UUID

from pydantic import BaseModel, Field


# Cart Item input for ADD/UPDATE operations
class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


# Cart Item output detail
class CartItemOut(BaseModel):
    cart_item_id: int
    product_id: int
    quantity: int
    # Note: Price lookup will be done client-side or in a dedicated endpoint/view.

    class Config:
        from_attributes = True


# Full Cart output structure
class CartOut(BaseModel):
    cart_id: int
    user_id: UUID
    items: list[CartItemOut]

    class Config:
        from_attributes = True
