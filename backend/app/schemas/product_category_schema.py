# backend/app/schemas/product_category_schema.py
from typing import Optional

from pydantic import BaseModel


class ProductCategoryCreate(BaseModel):
    school_id: int
    category_name: str


class ProductCategoryUpdate(BaseModel):
    category_name: Optional[str] = None


class ProductCategoryOut(BaseModel):
    category_id: int
    school_id: int
    category_name: str

    class Config:
        from_attributes = True
