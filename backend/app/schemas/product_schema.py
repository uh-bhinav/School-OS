# backend/app/schemas/product_schema.py
"""
Product schema definitions for the SchoolOS e-commerce module.

These schemas define the API contract for product catalog management.
Products are the core inventory items sold through the school store.

Architectural Notes:
- school_id is auto-populated from JWT in service layer (security)
- Timestamps included for audit trail and admin dashboards
- Availability status computed from stock_quantity and reorder_level
- Supports both admin (full CRUD) and parent (read-only) endpoints
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, computed_field, field_validator

from app.schemas.enums import ProductAvailability

# ============================================================================
# INPUT SCHEMAS (Request Bodies)
# ============================================================================


class ProductCreate(BaseModel):
    """
    Schema for creating a new product (Admin only).

    Security Note:
    - school_id is NOT included here (auto-populated from JWT)
    - Prevents IDOR vulnerability where admin from School A
      could create products for School B

    Business Rules:
    - Price must be positive
    - Stock quantity must be non-negative
    - SKU must be unique within the school
    - Category must exist and belong to the same school

    Used by: POST /api/v1/admin/products
    """

    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed product description")

    price: Decimal = Field(..., gt=0, decimal_places=2, description="Price per unit in INR (must be positive)")

    stock_quantity: int = Field(default=0, ge=0, description="Initial stock quantity (defaults to 0)")

    category_id: int = Field(..., description="Product category ID")

    sku: Optional[str] = Field(None, max_length=100, description="Stock Keeping Unit (unique identifier)")

    image_url: Optional[str] = Field(None, max_length=500, description="URL to product image")

    manufacturer: Optional[str] = Field(None, max_length=255, description="Manufacturer or brand name")

    reorder_level: Optional[int] = Field(None, ge=0, description="Stock level that triggers low-stock warning")

    reorder_quantity: Optional[int] = Field(None, ge=1, description="Quantity to reorder when stock is low")

    is_active: bool = Field(default=True, description="Whether product is available for sale")

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        """Ensure SKU is uppercase and alphanumeric if provided."""
        if v:
            v = v.strip().upper()
            if not v.replace("-", "").replace("_", "").isalnum():
                raise ValueError("SKU must be alphanumeric (hyphens and underscores allowed)")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        """Ensure price has at most 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError("Price cannot have more than 2 decimal places")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "House T-Shirt (Blue)",
                "description": "Premium cotton house t-shirt in blue with school emblem",
                "price": "750.00",
                "stock_quantity": 100,
                "category_id": 1,
                "sku": "UNIFORM-TSHIRT-BLUE-M",
                "image_url": "https://cdn.schoolos.io/products/tshirt-blue.jpg",
                "manufacturer": "Raymond Textiles",
                "reorder_level": 20,
                "reorder_quantity": 50,
                "is_active": True,
            }
        }


class ProductUpdate(BaseModel):
    """
    Schema for updating an existing product (Admin only).

    Design Pattern: Partial update (all fields optional)
    - Only provided fields are updated
    - Null values can explicitly clear optional fields
    - school_id cannot be changed (immutable)
    - product_id is in URL path, not body

    Used by: PUT /api/v1/admin/products/{product_id}
    """

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2, description="New price (must be positive)")

    stock_quantity: Optional[int] = Field(None, ge=0, description="New stock quantity")

    category_id: Optional[int] = None
    sku: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = Field(None, max_length=500)
    manufacturer: Optional[str] = Field(None, max_length=255)
    reorder_level: Optional[int] = Field(None, ge=0)
    reorder_quantity: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        """Ensure SKU is uppercase and alphanumeric if provided."""
        if v:
            v = v.strip().upper()
            if not v.replace("-", "").replace("_", "").isalnum():
                raise ValueError("SKU must be alphanumeric (hyphens and underscores allowed)")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure price has at most 2 decimal places."""
        if v and v.as_tuple().exponent < -2:
            raise ValueError("Price cannot have more than 2 decimal places")
        return v


class ProductStockAdjustment(BaseModel):
    """
    Schema for adjusting product stock (Admin only).

    Use Cases:
    - Increment stock after receiving shipment
    - Decrement stock for damaged/lost items
    - Manual correction of inventory discrepancies

    Note: Stock decrements during checkout are handled
    automatically by the order service, not this endpoint.

    Used by: PATCH /api/v1/admin/products/{product_id}/stock
    """

    adjustment: int = Field(..., description="Stock adjustment amount (positive to add, negative to subtract)")

    reason: str = Field(..., min_length=1, max_length=500, description="Reason for adjustment (audit trail)")

    class Config:
        json_schema_extra = {"example": {"adjustment": 50, "reason": "Received new shipment from vendor"}}


# ============================================================================
# OUTPUT SCHEMAS (API Responses)
# ============================================================================


class ProductCategoryMinimal(BaseModel):
    """
    Minimal category information embedded in product responses.
    Avoids circular dependency with product_category_schema.
    """

    category_id: int
    category_name: str

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    """
    Complete product representation for API responses.

    Used by:
    - GET /api/v1/products (parent browsing)
    - GET /api/v1/products/{product_id} (product details)
    - GET /api/v1/admin/products (admin inventory management)

    Design Decisions:
    - Includes timestamps for admin dashboards
    - Includes category details (hydrated) to avoid additional calls
    - Computes availability status from stock levels
    - Does NOT expose internal IDs or sensitive data
    """

    product_id: int
    school_id: int

    name: str
    description: Optional[str]
    price: Decimal
    stock_quantity: int
    sku: Optional[str]
    image_url: Optional[str]
    manufacturer: Optional[str]
    reorder_level: Optional[int]
    reorder_quantity: Optional[int]
    is_active: bool

    # Hydrated category details
    category: Optional[ProductCategoryMinimal] = Field(None, description="Product category details")

    # Timestamps for audit trail
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def availability(self) -> ProductAvailability:
        """
        Computed field: Product availability status.

        Logic:
        - DISCONTINUED: is_active = False
        - OUT_OF_STOCK: stock_quantity = 0 AND is_active = True
        - LOW_STOCK: 0 < stock_quantity <= reorder_level AND is_active = True
        - IN_STOCK: stock_quantity > reorder_level AND is_active = True

        Special Case: If reorder_level is not set, LOW_STOCK is never returned
        """
        if not self.is_active:
            return ProductAvailability.DISCONTINUED

        if self.stock_quantity == 0:
            return ProductAvailability.OUT_OF_STOCK

        if self.reorder_level and self.stock_quantity <= self.reorder_level:
            return ProductAvailability.LOW_STOCK

        return ProductAvailability.IN_STOCK

    @computed_field
    @property
    def is_purchasable(self) -> bool:
        """
        Computed field: Whether this product can be added to cart.

        Business Rules:
        - Must be active
        - Must have stock > 0
        """
        return self.is_active and self.stock_quantity > 0

    @computed_field
    @property
    def stock_status_message(self) -> str:
        """
        Computed field: User-friendly stock status message.

        Examples:
        - "In Stock (50 available)"
        - "Low Stock (Only 5 left)"
        - "Out of Stock"
        - "Discontinued"
        """
        availability = self.availability

        if availability == ProductAvailability.DISCONTINUED:
            return "Discontinued"

        if availability == ProductAvailability.OUT_OF_STOCK:
            return "Out of Stock"

        if availability == ProductAvailability.LOW_STOCK:
            return f"Low Stock (Only {self.stock_quantity} left)"

        return f"In Stock ({self.stock_quantity} available)"

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "product_id": 42,
                "school_id": 3,
                "name": "House T-Shirt (Blue)",
                "description": "Premium cotton house t-shirt in blue with school emblem",
                "price": "750.00",
                "stock_quantity": 45,
                "sku": "UNIFORM-TSHIRT-BLUE-M",
                "image_url": "https://cdn.schoolos.io/products/tshirt-blue.jpg",
                "manufacturer": "Raymond Textiles",
                "reorder_level": 20,
                "reorder_quantity": 50,
                "is_active": True,
                "category": {"category_id": 1, "category_name": "Uniforms"},
                "created_at": "2025-01-10T09:00:00Z",
                "updated_at": "2025-01-15T14:30:00Z",
                "availability": "in_stock",
                "is_purchasable": True,
                "stock_status_message": "In Stock (45 available)",
            }
        }


class ProductListOut(BaseModel):
    """
    Simplified product representation for list endpoints.

    Used by: GET /api/v1/products/school/{school_id} (browsing catalog)

    Design Rationale:
    - Lighter payload for list views (excludes manufacturer, timestamps)
    - Still includes essential display info (name, price, image, availability)
    - Optimized for mobile bandwidth constraints
    """

    product_id: int
    name: str
    description: Optional[str]
    price: Decimal
    stock_quantity: int
    image_url: Optional[str]
    is_active: bool

    category: Optional[ProductCategoryMinimal]

    @computed_field
    @property
    def availability(self) -> ProductAvailability:
        """Computed availability status (same logic as ProductOut)."""
        if not self.is_active:
            return ProductAvailability.DISCONTINUED

        if self.stock_quantity == 0:
            return ProductAvailability.OUT_OF_STOCK

        # Note: reorder_level not available in this schema,
        # so LOW_STOCK is approximated as stock < 10
        if self.stock_quantity < 10:
            return ProductAvailability.LOW_STOCK

        return ProductAvailability.IN_STOCK

    @computed_field
    @property
    def is_purchasable(self) -> bool:
        """Whether product can be added to cart."""
        return self.is_active and self.stock_quantity > 0

    class Config:
        from_attributes = True


# ============================================================================
# FILTER & PAGINATION SCHEMAS
# ============================================================================


class ProductFilterParams(BaseModel):
    """
    Query parameters for filtering product lists.

    Used by: GET /api/v1/products/school/{school_id}?category_id=1&is_active=true

    All filters are optional (AND logic when multiple provided).
    """

    category_id: Optional[int] = Field(None, description="Filter by category")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    min_price: Optional[Decimal] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[Decimal] = Field(None, ge=0, description="Maximum price filter")
    availability: Optional[ProductAvailability] = Field(None, description="Filter by availability (in_stock, low_stock, out_of_stock, discontinued)")
    search: Optional[str] = Field(None, max_length=100, description="Search in product name and description")


# ============================================================================
# BULK OPERATION SCHEMAS
# ============================================================================


class CategoryReorderItem(BaseModel):
    """Schema for bulk reorder operation."""

    category_id: int = Field(..., gt=0)
    display_order: int = Field(..., ge=0)


class BulkActivateRequest(BaseModel):
    """Schema for bulk activate/deactivate operation."""

    category_ids: list[int] = Field(..., min_length=1)
    is_active: bool


class BulkUpdateCategoryRequest(BaseModel):
    """Schema for bulk category update for products."""

    product_ids: list[int] = Field(..., min_length=1, description="List of product IDs to update")
    new_category_id: int = Field(..., gt=0, description="New category ID")

    class Config:
        json_schema_extra = {"example": {"product_ids": [103, 104, 105], "new_category_id": 2}}
