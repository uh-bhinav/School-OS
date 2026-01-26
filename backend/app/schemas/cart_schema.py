# backend/app/schemas/cart_schema.py
"""
Cart schema definitions for the SchoolOS e-commerce module.

These schemas define the API contract for shopping cart operations.
The CartOut schema is "hydrated" with full product details to avoid
N+1 query anti-patterns and provide optimal frontend performance.

Architectural Note:
- CartItemOut includes product details to eliminate additional API calls
- All pricing comes from the canonical products table (single source of truth)
- Subtotals are computed to provide immediate feedback to users
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, computed_field

from app.schemas.enums import ProductAvailability

# ============================================================================
# INPUT SCHEMAS (Request Bodies)
# ============================================================================


class CartItemIn(BaseModel):
    """
    Schema for adding or updating a cart item.

    Business Rules:
    - Quantity must be positive (enforced by Field constraint)
    - Product availability is validated in service layer
    - If product already exists in cart, quantity is updated (not duplicated)

    Used by: POST /api/v1/carts/me/items, PUT /api/v1/carts/me/items/{product_id}
    """

    product_id: int = Field(..., description="ID of the product to add to cart")
    quantity: int = Field(..., ge=1, le=100, description="Quantity to add (1-100)")

    class Config:
        json_schema_extra = {"example": {"product_id": 42, "quantity": 2}}


class CartItemUpdateQuantity(BaseModel):
    """
    Schema for updating only the quantity of an existing cart item.

    Used by: PATCH /api/v1/carts/me/items/{cart_item_id}
    """

    quantity: int = Field(..., ge=1, le=100, description="New quantity (1-100)")


# ============================================================================
# OUTPUT SCHEMAS (API Responses)
# ============================================================================


class CartItemProductDetail(BaseModel):
    """
    Embedded product details within a cart item.
    Contains all information needed to display the product in the cart.

    Design Rationale:
    - Avoids forcing frontend to make separate product detail calls
    - Provides current price (not historical - this is pre-checkout)
    - Includes availability status for real-time stock warnings
    """

    product_id: int
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., description="Current price per unit from products table")
    image_url: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: int = Field(..., description="Current available stock")
    availability: ProductAvailability = Field(..., description="Computed availability status (in_stock, low_stock, out_of_stock, discontinued)")
    category_name: Optional[str] = Field(None, description="Product category for display")

    class Config:
        from_attributes = True


class CartItemOut(BaseModel):
    """
    Complete cart item representation with hydrated product details.

    This schema is the result of a JOIN query across:
    - cart_items (for cart_item_id, quantity)
    - products (for all product details)
    - product_categories (for category_name)

    Performance Note:
    - Single SQL query with JOINs, not N separate queries
    - Eliminates N+1 query anti-pattern
    - Optimal for mobile apps with limited bandwidth
    """

    cart_item_id: int
    product_id: int
    quantity: int

    # Hydrated product details (from JOIN)
    product: CartItemProductDetail

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        """
        Computed field: Line item subtotal (price × quantity).

        Note: Uses current price from products table.
        This is NOT the historical price (that comes later in order_items).
        """
        return self.product.price * Decimal(self.quantity)

    @computed_field
    @property
    def is_available(self) -> bool:
        """
        Computed field: Whether this item can currently be purchased.

        Business Logic:
        - False if product is discontinued
        - False if requested quantity exceeds available stock
        - True otherwise
        """
        if self.product.availability == ProductAvailability.DISCONTINUED:
            return False
        if self.quantity > self.product.stock_quantity:
            return False
        return True

    @computed_field
    @property
    def stock_warning(self) -> Optional[str]:
        """
        Computed field: User-friendly stock warning message.

        Examples:
        - "Only 3 items left in stock"
        - "Out of stock"
        - "This item has been discontinued"
        - None (if no warning needed)
        """
        if self.product.availability == ProductAvailability.DISCONTINUED:
            return "This item has been discontinued"

        if self.product.availability == ProductAvailability.OUT_OF_STOCK:
            return "Out of stock"

        if self.quantity > self.product.stock_quantity:
            return f"Only {self.product.stock_quantity} items available (you have {self.quantity} in cart)"

        if self.product.availability == ProductAvailability.LOW_STOCK:
            return f"Only {self.product.stock_quantity} items left in stock"

        return None

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    """
    Complete shopping cart representation with all items and computed totals.

    This is the primary response schema for GET /api/v1/carts/me.

    Business Rules:
    - Each user has exactly one cart (enforced by DB unique constraint on user_id)
    - Cart persists across sessions (not session-based)
    - Empty carts return items: []

    Performance Characteristics:
    - Single database query with JOINs across 4 tables:
      * carts
      * cart_items
      * products
      * product_categories
    - Computed fields calculated in Python (not additional DB queries)
    """

    cart_id: int
    user_id: UUID
    items: list[CartItemOut] = Field(default_factory=list, description="List of items in cart")

    created_at: datetime = Field(..., description="When this cart was created")
    updated_at: datetime = Field(..., description="Last modification timestamp")

    @computed_field
    @property
    def total_items(self) -> int:
        """
        Computed field: Total number of individual items (sum of all quantities).

        Example: 2 shirts + 3 ties = 5 total items
        """
        return sum(item.quantity for item in self.items)

    @computed_field
    @property
    def total_unique_products(self) -> int:
        """
        Computed field: Number of distinct products in cart.

        Example: 2 shirts + 3 ties = 2 unique products
        """
        return len(self.items)

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        """
        Computed field: Cart subtotal (sum of all line item subtotals).

        Note: This is pre-tax, pre-discount.
        Final order total may differ after checkout.
        """
        return sum(item.subtotal for item in self.items)

    @computed_field
    @property
    def has_availability_issues(self) -> bool:
        """
        Computed field: Whether any items in cart have stock/availability problems.

        Used by frontend to:
        - Disable checkout button
        - Show warning banner
        - Highlight problematic items
        """
        return any(not item.is_available for item in self.items)

    @computed_field
    @property
    def is_empty(self) -> bool:
        """Computed field: Whether cart has any items."""
        return len(self.items) == 0

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "cart_id": 1,
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "items": [
                    {
                        "cart_item_id": 101,
                        "product_id": 42,
                        "quantity": 2,
                        "product": {"product_id": 42, "name": "House T-Shirt (Blue)", "price": "750.00", "stock_quantity": 50, "availability": "in_stock", "category_name": "Uniforms"},
                        "subtotal": "1500.00",
                        "is_available": True,
                        "stock_warning": None,
                    }
                ],
                "created_at": "2025-01-15T10:30:00Z",
                "updated_at": "2025-01-15T14:22:00Z",
                "total_items": 2,
                "total_unique_products": 1,
                "subtotal": "1500.00",
                "has_availability_issues": False,
                "is_empty": False,
            }
        }


# ============================================================================
# OPERATIONAL SCHEMAS (Service Layer Internal Use)
# ============================================================================


class CartItemStockValidation(BaseModel):
    """
    Internal schema used by service layer for atomic stock validation.

    Not exposed via API - used in checkout transaction validation.
    """

    product_id: int
    requested_quantity: int
    available_quantity: int
    is_valid: bool
    error_message: Optional[str] = None
