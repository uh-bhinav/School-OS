# backend/app/schemas/product_schema.py
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# Properties to receive on creation/update
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)
    category_id: int
    sku: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductCreate(ProductBase):
    school_id: int = Field(..., description="The ID of the school owning the product.")


class ProductUpdate(ProductBase):
    name: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)


# Properties to return to the client
class ProductOut(BaseModel):
    product_id: int
    school_id: int
    category_id: int
    name: str
    price: Decimal
    stock_quantity: int
    is_active: bool

    class Config:
        from_attributes = True
