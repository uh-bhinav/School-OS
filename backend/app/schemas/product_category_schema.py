# backend/app/schemas/product_category_schema.py
"""
Product Category schema definitions for the SchoolOS e-commerce module.

These schemas define the API contract for managing product categories.
Categories organize products into logical groups (Uniforms, Books, Stationery, etc.)

Architectural Notes:
- school_id is auto-populated from JWT in service layer (security)
- Categories are soft-deleted (is_active flag, not exposed in basic schema)
- Includes product count for admin dashboard analytics
- Hierarchical categories not yet supported (future enhancement)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

# ============================================================================
# INPUT SCHEMAS (Request Bodies)
# ============================================================================


class ProductCategoryCreate(BaseModel):
    """
    Schema for creating a new product category (Admin only).

    Security Note:
    - school_id is NOT included here (auto-populated from JWT)
    - Prevents IDOR vulnerability where admin from School A
      could create categories for School B

    Business Rules:
    - Category name must be unique within a school
    - Name is case-insensitive for uniqueness check
    - Name is stored in title case (e.g., "School Uniforms")

    Used by: POST /api/v1/admin/product-categories
    """

    category_name: str = Field(..., min_length=1, max_length=100, description="Category name (e.g., 'Uniforms', 'Textbooks')")

    description: Optional[str] = Field(None, max_length=500, description="Optional category description")

    display_order: Optional[int] = Field(None, ge=0, description="Order for displaying categories (lower numbers first)")

    icon_url: Optional[str] = Field(None, max_length=500, description="URL to category icon/image")

    @field_validator("category_name")
    @classmethod
    def validate_category_name(cls, v: str) -> str:
        """
        Normalize category name to title case and validate.

        Business Rules:
        - Trim whitespace
        - Convert to title case for consistency
        - Disallow special characters except spaces, hyphens, ampersands
        """
        v = v.strip()

        if not v:
            raise ValueError("Category name cannot be empty")

        # Allow alphanumeric, spaces, hyphens, and ampersands
        allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -&'")
        if not all(char in allowed_chars for char in v):
            raise ValueError("Category name can only contain letters, numbers, spaces, hyphens, and ampersands")

        # Convert to title case
        return v.title()

    class Config:
        json_schema_extra = {"example": {"category_name": "School Uniforms", "description": "Complete range of school uniforms including shirts, pants, and ties", "display_order": 1, "icon_url": "https://cdn.schoolos.io/icons/uniform.svg"}}


class ProductCategoryUpdate(BaseModel):
    """
    Schema for updating an existing product category (Admin only).

    Design Pattern: Partial update (all fields optional)
    - Only provided fields are updated
    - school_id cannot be changed (immutable)
    - category_id is in URL path, not body

    Used by: PUT /api/v1/admin/product-categories/{category_id}
    """

    category_name: Optional[str] = Field(None, min_length=1, max_length=100)

    description: Optional[str] = Field(None, max_length=500)

    display_order: Optional[int] = Field(None, ge=0)

    icon_url: Optional[str] = Field(None, max_length=500)

    is_active: Optional[bool] = Field(None, description="Set to false to soft-delete category (hides from parents, preserves data)")

    @field_validator("category_name")
    @classmethod
    def validate_category_name(cls, v: Optional[str]) -> Optional[str]:
        """Normalize category name to title case if provided."""
        if v:
            v = v.strip()
            if not v:
                raise ValueError("Category name cannot be empty")

            allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -&'")
            if not all(char in allowed_chars for char in v):
                raise ValueError("Category name can only contain letters, numbers, spaces, hyphens, and ampersands")

            return v.title()
        return v


# ============================================================================
# OUTPUT SCHEMAS (API Responses)
# ============================================================================


class ProductCategoryOut(BaseModel):
    """
    Complete product category representation for API responses.

    Used by:
    - GET /api/v1/product-categories (parent browsing)
    - GET /api/v1/product-categories/{category_id}
    - GET /api/v1/admin/product-categories (admin management)

    Design Decisions:
    - Includes product count for "empty category" detection
    - Includes timestamps for admin audit trail
    - is_active flag determines visibility to parents
    """

    category_id: int
    school_id: int
    category_name: str
    description: Optional[str] = None
    display_order: Optional[int] = Field(None, description="Display order (null categories shown last)")
    icon_url: Optional[str] = None
    is_active: bool = Field(default=True, description="Whether category is visible to parents")

    # Timestamps for audit trail
    created_at: datetime = Field(..., description="When category was created")
    updated_at: datetime = Field(..., description="Last modification timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "category_id": 1,
                "school_id": 3,
                "category_name": "School Uniforms",
                "description": "Complete range of school uniforms including shirts, pants, and ties",
                "display_order": 1,
                "icon_url": "https://cdn.schoolos.io/icons/uniform.svg",
                "is_active": True,
                "created_at": "2025-01-10T09:00:00Z",
                "updated_at": "2025-01-10T09:00:00Z",
            }
        }


class ProductCategoryWithCount(BaseModel):
    """
    Category representation with product count for admin dashboards.

    Used by: GET /api/v1/admin/product-categories/stats

    Design Rationale:
    - Extends ProductCategoryOut with analytics
    - product_count helps admins identify empty/underutilized categories
    - active_product_count excludes discontinued products
    """

    category_id: int
    school_id: int
    category_name: str
    description: Optional[str] = None
    display_order: Optional[int] = None
    icon_url: Optional[str] = None
    is_active: bool

    # Analytics fields
    product_count: int = Field(..., description="Total number of products in this category")
    active_product_count: int = Field(..., description="Number of active (is_active=true) products in this category")

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "category_id": 1,
                "school_id": 3,
                "category_name": "School Uniforms",
                "description": "Complete range of school uniforms",
                "display_order": 1,
                "icon_url": "https://cdn.schoolos.io/icons/uniform.svg",
                "is_active": True,
                "product_count": 25,
                "active_product_count": 23,
                "created_at": "2025-01-10T09:00:00Z",
                "updated_at": "2025-01-15T14:30:00Z",
            }
        }


class ProductCategoryListOut(BaseModel):
    """
    Minimal category representation for dropdown lists and navigation.

    Used by:
    - GET /api/v1/product-categories/list (lightweight endpoint)
    - Embedded in product filters/selectors

    Design Rationale:
    - Excludes timestamps and metadata for performance
    - Only includes fields needed for UI display
    - Optimized for mobile bandwidth
    """

    category_id: int
    category_name: str
    icon_url: Optional[str] = None
    product_count: int = Field(default=0, description="Number of active products (for 'empty category' UI handling)")

    class Config:
        from_attributes = True
        json_schema_extra = {"example": {"category_id": 1, "category_name": "School Uniforms", "icon_url": "https://cdn.schoolos.io/icons/uniform.svg", "product_count": 23}}


class ProductCategoryWithProducts(BaseModel):
    """
    Category with embedded product list (hydrated response).

    Used by: GET /api/v1/product-categories/{category_id}/products

    Design Rationale:
    - Single API call returns category + all its products
    - Avoids N+1 query pattern
    - Useful for "Browse by Category" pages

    Note: Import ProductListOut from product_schema to avoid circular dependency
    """

    category_id: int
    school_id: int
    category_name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

    # Hydrated product list (using lightweight schema)
    # NOTE: Type hint uses string to avoid circular import at module level
    # Actual import handled in service layer
    products: list = Field(default_factory=list, description="List of products in this category (ProductListOut schema)")

    product_count: int = Field(..., description="Total number of products returned")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "category_id": 1,
                "school_id": 3,
                "category_name": "School Uniforms",
                "description": "Complete range of school uniforms",
                "icon_url": "https://cdn.schoolos.io/icons/uniform.svg",
                "products": [{"product_id": 42, "name": "House T-Shirt (Blue)", "price": "750.00", "stock_quantity": 45, "availability": "in_stock"}],
                "product_count": 1,
            }
        }


# ============================================================================
# BULK OPERATION SCHEMAS
# ============================================================================


class ProductCategoryBulkReorder(BaseModel):
    """
    Schema for bulk updating display_order of multiple categories.

    Used by: PATCH /api/v1/admin/product-categories/reorder

    Use Case:
    - Admin drags categories to reorder them in UI
    - Frontend sends new order in single API call
    - Atomic operation (all succeed or all fail)
    """

    category_orders: list[dict[str, int]] = Field(..., description="List of {category_id: int, display_order: int} mappings")

    class Config:
        json_schema_extra = {"example": {"category_orders": [{"category_id": 1, "display_order": 1}, {"category_id": 3, "display_order": 2}, {"category_id": 2, "display_order": 3}]}}


class ProductCategoryBulkActivate(BaseModel):
    """
    Schema for bulk activating/deactivating categories.

    Used by: PATCH /api/v1/admin/product-categories/bulk-activate

    Use Case:
    - Admin wants to temporarily hide multiple categories (e.g., seasonal items)
    - Reactivate them later without losing data
    """

    category_ids: list[int] = Field(..., min_length=1, description="List of category IDs to activate/deactivate")
    is_active: bool = Field(..., description="Set to true to activate, false to deactivate")

    class Config:
        json_schema_extra = {"example": {"category_ids": [5, 6, 7], "is_active": False}}
