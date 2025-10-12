# backend/app/schemas/product_package_schema.py
"""
Product Package schema definitions for the SchoolOS e-commerce module.

These schemas define the API contract for managing product packages (bundles/kits).
Packages allow schools to sell multiple products together as a single unit
(e.g., "Complete Grade 5 Uniform Kit" containing shirt, pants, tie, and belt).

Architectural Notes:
- school_id is auto-populated from JWT in service layer (security)
- Package items now include quantity support (requires PackageItem association object)
- Supports both fixed-price packages and dynamic pricing (sum of components)
- Packages can be made mandatory for specific grades via product_package_rules table
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, computed_field, field_validator

from app.schemas.enums import ProductAvailability

# ============================================================================
# PACKAGE ITEM SCHEMAS (Junction Table with Quantity)
# ============================================================================


class PackageItemIn(BaseModel):
    """
    Schema for defining a single item within a package (input).

    Business Rules:
    - Each package can contain multiple products
    - Each product can have a specific quantity (e.g., "2 shirts + 1 tie")
    - Product must be active and belong to the same school

    Used in: ProductPackageCreate.items, ProductPackageAddItems.items
    """

    product_id: int = Field(..., description="ID of the product to include in package")

    quantity: int = Field(default=1, ge=1, le=100, description="Quantity of this product in the package (1-100)")

    class Config:
        json_schema_extra = {"example": {"product_id": 42, "quantity": 2}}


class PackageItemOut(BaseModel):
    """
    Schema for package item with full product details (output).

    Design Rationale:
    - Hydrated response includes product details to avoid N+1 queries
    - Shows current product price (for admin pricing decisions)
    - Includes availability status (admin can see if package contains discontinued items)

    This schema is the result of JOIN across:
    - package_items (for quantity)
    - products (for all product details)
    """

    product_id: int
    product_name: str
    product_price: Decimal = Field(..., description="Current price of individual product (not package price)")
    product_image_url: Optional[str] = None
    product_sku: Optional[str] = None

    quantity: int = Field(..., description="Quantity of this product included in the package")

    availability: ProductAvailability = Field(..., description="Current availability status of this product")

    stock_quantity: int = Field(..., description="Current stock of individual product")

    @computed_field
    @property
    def item_subtotal(self) -> Decimal:
        """
        Computed field: Subtotal for this item in package (price × quantity).

        Note: Used for calculating suggested package price.
        Not the actual package price (which can be discounted).
        """
        return self.product_price * Decimal(self.quantity)

    @computed_field
    @property
    def is_available(self) -> bool:
        """
        Computed field: Whether this item is currently available.

        Business Logic:
        - False if product is discontinued
        - True otherwise (stock validation happens during checkout)
        """
        return self.availability != ProductAvailability.DISCONTINUED

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "product_id": 42,
                "product_name": "House T-Shirt (Blue)",
                "product_price": "750.00",
                "product_image_url": "https://cdn.schoolos.io/products/tshirt-blue.jpg",
                "product_sku": "UNIFORM-TSHIRT-BLUE-M",
                "quantity": 2,
                "availability": "in_stock",
                "stock_quantity": 45,
                "item_subtotal": "1500.00",
                "is_available": True,
            }
        }


# ============================================================================
# INPUT SCHEMAS (Request Bodies)
# ============================================================================


class ProductPackageCreate(BaseModel):
    """
    Schema for creating a new product package (Admin only).

    Security Note:
    - school_id is NOT included here (auto-populated from JWT)
    - Prevents IDOR vulnerability

    Business Rules:
    - Package must contain at least 1 item
    - All products in items list must exist and belong to same school
    - Price can be null (auto-calculated as sum of component prices)
    - If price is set, it should typically be less than sum (discount/bundle pricing)

    Used by: POST /api/v1/admin/product-packages
    """

    name: str = Field(..., min_length=1, max_length=255, description="Package name (e.g., 'Complete Grade 5 Uniform Kit')")

    description: Optional[str] = Field(None, max_length=2000, description="Detailed package description")

    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2, description="Package price (null = auto-calculate from items). Set manually for bundle discount.")

    image_url: Optional[str] = Field(None, max_length=500, description="URL to package image")

    category: Optional[str] = Field(None, max_length=100, description="Package category (e.g., 'Uniform Kits', 'Stationery Sets')")

    academic_year: Optional[str] = Field(None, max_length=20, description="Academic year this package is valid for (e.g., '2024-2025')")

    is_active: bool = Field(default=True, description="Whether package is available for purchase")

    # CRITICAL: List of products and quantities in this package
    items: list[PackageItemIn] = Field(..., min_length=1, description="List of products and quantities in this package (minimum 1 item)")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list[PackageItemIn]) -> list[PackageItemIn]:
        """
        Validate package items list.

        Business Rules:
        - Must contain at least 1 item
        - No duplicate product_ids in same package
        """
        if len(v) < 1:
            raise ValueError("Package must contain at least 1 item")

        # Check for duplicate product_ids
        product_ids = [item.product_id for item in v]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Package cannot contain duplicate products")

        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure price has at most 2 decimal places if provided."""
        if v is not None and v.as_tuple().exponent < -2:
            raise ValueError("Price cannot have more than 2 decimal places")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Complete Grade 5 Uniform Kit",
                "description": "Everything needed for Grade 5: 2 shirts, 1 pant, 1 tie, 1 belt",
                "price": "3500.00",
                "image_url": "https://cdn.schoolos.io/packages/grade5-kit.jpg",
                "category": "Uniform Kits",
                "academic_year": "2024-2025",
                "is_active": True,
                "items": [{"product_id": 42, "quantity": 2}, {"product_id": 43, "quantity": 1}, {"product_id": 44, "quantity": 1}, {"product_id": 45, "quantity": 1}],
            }
        }


class ProductPackageUpdate(BaseModel):
    """
    Schema for updating package header information (Admin only).

    Design Pattern: Partial update (all fields optional)

    Important Note:
    - This schema only updates package metadata (name, price, etc.)
    - To modify package items (add/remove products), use dedicated endpoints:
      * POST /api/v1/admin/product-packages/{id}/items (add items)
      * DELETE /api/v1/admin/product-packages/{id}/items/{product_id} (remove item)

    Rationale: Separating item management from metadata updates provides:
    - Better audit trail
    - Simpler validation logic
    - Clearer API semantics

    Used by: PUT /api/v1/admin/product-packages/{package_id}
    """

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2, description="Set to null to auto-calculate from items")

    image_url: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    academic_year: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure price has at most 2 decimal places if provided."""
        if v is not None and v.as_tuple().exponent < -2:
            raise ValueError("Price cannot have more than 2 decimal places")
        return v


class ProductPackageAddItems(BaseModel):
    """
    Schema for adding items to an existing package (Admin only).

    Business Rules:
    - Cannot add product that already exists in package
    - All products must belong to same school
    - Package price is NOT auto-updated (admin must manually adjust if needed)

    Used by: POST /api/v1/admin/product-packages/{package_id}/items
    """

    items: list[PackageItemIn] = Field(..., min_length=1, description="List of products to add to package")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list[PackageItemIn]) -> list[PackageItemIn]:
        """Check for duplicate product_ids in request."""
        product_ids = [item.product_id for item in v]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Cannot add duplicate products in same request")
        return v


class ProductPackageUpdateItemQuantity(BaseModel):
    """
    Schema for updating the quantity of a specific item in a package.

    Used by: PATCH /api/v1/admin/product-packages/{package_id}/items/{product_id}
    """

    quantity: int = Field(..., ge=1, le=100, description="New quantity for this product in the package")


# ============================================================================
# OUTPUT SCHEMAS (API Responses)
# ============================================================================


class ProductPackageOut(BaseModel):
    """
    Complete product package representation with hydrated items.

    Used by:
    - GET /api/v1/product-packages (parent browsing)
    - GET /api/v1/product-packages/{package_id} (package details)
    - GET /api/v1/admin/product-packages (admin management)

    Design Decisions:
    - Items are fully hydrated (includes product details)
    - Computed fields provide pricing insights
    - Availability status helps parents make informed decisions
    """

    id: int
    school_id: int

    name: str
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, description="Package price. Null means auto-calculated from items.")
    image_url: Optional[str] = None
    category: Optional[str] = None
    academic_year: Optional[str] = None
    is_active: bool

    # Hydrated items list (with full product details)
    items: list[PackageItemOut] = Field(default_factory=list, description="List of products in this package with quantities and details")

    # Timestamps for audit trail
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def item_count(self) -> int:
        """
        Computed field: Total number of individual items in package.

        Example: 2 shirts + 1 pant + 1 tie = 4 items
        """
        return sum(item.quantity for item in self.items)

    @computed_field
    @property
    def unique_product_count(self) -> int:
        """
        Computed field: Number of distinct products.

        Example: 2 shirts + 1 pant + 1 tie = 3 unique products
        """
        return len(self.items)

    @computed_field
    @property
    def calculated_price(self) -> Decimal:
        """
        Computed field: Sum of all item subtotals (quantity × price).

        Used for:
        - Displaying "component value" when package has discount
        - Suggesting price when admin creates package with price=null
        """
        return sum(item.item_subtotal for item in self.items)

    @computed_field
    @property
    def effective_price(self) -> Decimal:
        """
        Computed field: Actual price customer pays.

        Logic:
        - If package.price is set → use that (bundle discount)
        - If package.price is null → use calculated_price (sum of items)
        """
        return self.price if self.price is not None else self.calculated_price

    @computed_field
    @property
    def savings(self) -> Decimal:
        """
        Computed field: Amount saved by buying package vs individual items.

        Returns 0 if package.price is null (no discount).
        """
        if self.price is None:
            return Decimal("0.00")

        savings_amount = self.calculated_price - self.price
        return savings_amount if savings_amount > 0 else Decimal("0.00")

    @computed_field
    @property
    def savings_percentage(self) -> Decimal:
        """
        Computed field: Percentage saved (for marketing display).

        Example: "Save 15% with this package!"
        """
        if self.savings == 0 or self.calculated_price == 0:
            return Decimal("0.00")

        percentage = (self.savings / self.calculated_price) * 100
        return percentage.quantize(Decimal("0.01"))

    @computed_field
    @property
    def all_items_available(self) -> bool:
        """
        Computed field: Whether all items in package are currently available.

        Business Logic:
        - False if any item is discontinued
        - True otherwise (stock validation happens during checkout)
        """
        return all(item.is_available for item in self.items)

    @computed_field
    @property
    def is_purchasable(self) -> bool:
        """
        Computed field: Whether package can be added to cart.

        Business Rules:
        - Must be active
        - All items must be available (not discontinued)
        """
        return self.is_active and self.all_items_available

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "school_id": 3,
                "name": "Complete Grade 5 Uniform Kit",
                "description": "Everything needed for Grade 5",
                "price": "3500.00",
                "image_url": "https://cdn.schoolos.io/packages/grade5-kit.jpg",
                "category": "Uniform Kits",
                "academic_year": "2024-2025",
                "is_active": True,
                "items": [{"product_id": 42, "product_name": "House T-Shirt (Blue)", "product_price": "750.00", "quantity": 2, "availability": "in_stock", "stock_quantity": 45, "item_subtotal": "1500.00", "is_available": True}],
                "created_at": "2025-01-10T09:00:00Z",
                "updated_at": "2025-01-15T14:30:00Z",
                "item_count": 5,
                "unique_product_count": 4,
                "calculated_price": "4000.00",
                "effective_price": "3500.00",
                "savings": "500.00",
                "savings_percentage": "12.50",
                "all_items_available": True,
                "is_purchasable": True,
            }
        }


class ProductPackageListOut(BaseModel):
    """
    Minimal package representation for list endpoints.

    Used by: GET /api/v1/product-packages (browsing catalog)

    Design Rationale:
    - Lighter payload than ProductPackageOut
    - Excludes individual item details (reduces bandwidth)
    - Includes enough info for "package card" UI component
    """

    id: int
    name: str
    description: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: bool

    @computed_field
    @property
    def item_count(self) -> int:
        """Total items in package (computed in service layer from items list)."""
        # Note: This will be populated by service layer using a subquery
        # Format: SELECT COUNT(*) FROM package_items WHERE package_id = ...
        return 0  # Placeholder, overridden by service layer

    class Config:
        from_attributes = True


# ============================================================================
# MANDATORY PACKAGE RULES (Grade-Specific Requirements)
# ============================================================================


class ProductPackageRuleCreate(BaseModel):
    """
    Schema for creating a mandatory package rule (Admin only).

    Business Use Case:
    - School requires all Grade 5 students to purchase "Grade 5 Uniform Kit"
    - Rule is enforced in checkout (warning/blocking if not in cart)

    Used by: POST /api/v1/admin/product-packages/{package_id}/rules
    """

    grade_level: int = Field(..., ge=1, le=12, description="Grade level this rule applies to (1-12)")

    academic_year_id: Optional[int] = Field(None, description="Academic year ID (null = applies to all years)")

    is_mandatory: bool = Field(default=True, description="Whether package is mandatory for this grade")

    class Config:
        json_schema_extra = {"example": {"grade_level": 5, "academic_year_id": 1, "is_mandatory": True}}


class ProductPackageRuleOut(BaseModel):
    """
    Output schema for package rules.

    Used by: GET /api/v1/admin/product-packages/{package_id}/rules
    """

    id: int
    product_package_id: int
    school_id: int
    grade_level: int
    academic_year_id: Optional[int] = None
    is_mandatory: bool

    class Config:
        from_attributes = True
