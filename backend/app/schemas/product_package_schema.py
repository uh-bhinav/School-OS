# backend/app/schemas/product_package_schema.py (Finalized)
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# --- New: Defines the structure for a single item within the package ---
class PackageItemIn(BaseModel):
    product_id: int = Field(..., description="ID of the product to include.")
    quantity: int = Field(
        1, ge=1, description="Quantity of the product in the package."
    )


# --- Updated: ProductPackageCreate must now accept a list of items ---
class ProductPackageCreate(BaseModel):
    school_id: int
    name: str
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    image_url: Optional[str] = None

    # CRITICAL ADDITION: List of items to be created in the junction table
    items: list[PackageItemIn] = Field(
        ..., description="List of products and quantities in this package."
    )


# Properties to receive on update (Update only affects package header data)
class ProductPackageUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    is_active: Optional[bool] = None
    # Note: Updating package items (adding/removing products)
    #  requires a separate service endpoint
    # to handle the list mutation logic, which
    # is usually more complex than a simple PUT.


# Properties to return to the client (Update to reflect the actual item schema)
class ProductPackageOut(BaseModel):
    id: int
    school_id: int
    name: str
    price: Optional[Decimal]
    is_active: bool
    # Updated: This should return the detailed
    # items (or an ID list if schema isn't defined yet)
    # items: List[PackageItemOut] # You would
    # replace List[int] with a detailed schema later
    items: list[int]

    class Config:
        from_attributes = True
