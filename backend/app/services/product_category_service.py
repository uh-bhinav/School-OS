# backend/app/services/product_category_service.py
"""
Product Category Service Layer for SchoolOS E-commerce Module (ASYNC REFACTORED).

This service handles all business logic for managing product categories.
All category operations are school-scoped and multi-tenant secure.

Security Architecture:
- school_id is NEVER accepted from client input
- All school_id values come exclusively from JWT-derived current_profile
- RLS policies provide defense-in-depth at database layer
"""

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.product_category_schema import (
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCategoryWithCount,
)


class ProductCategoryService:
    """Service class for asynchronous product category operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_category(self, category_in: ProductCategoryCreate, current_profile: Profile) -> ProductCategory:
        """
        Create a new product category (Admin only).

        Security:
        - school_id populated from current_profile, NOT from request
        - Prevents IDOR vulnerability

        Business Rules:
        - Category name must be unique within school
        - Name is stored in title case (normalized in schema)

        Args:
            category_in: Category creation data
            current_profile: Authenticated user profile (contains school_id)

        Returns:
            Created ProductCategory instance

        Raises:
            HTTPException 409: If category name already exists in school
        """
        # Check for duplicate category name within school
        stmt = select(ProductCategory).where(
            and_(
                ProductCategory.school_id == current_profile.school_id,
                func.lower(ProductCategory.category_name) == category_in.category_name.lower(),
                # ProductCategory.is_active.is_(True),
            )
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{category_in.category_name}' already exists in your school",
            )

        # Create category with school_id from JWT
        db_category = ProductCategory(
            school_id=current_profile.school_id,  # CRITICAL: From JWT, not client
            category_name=category_in.category_name,
            # description=category_in.description,
            # display_order=category_in.display_order,
            # icon_url=category_in.icon_url,
            # is_active=True,
        )

        self.db.add(db_category)
        await self.db.commit()
        await self.db.refresh(db_category)

        return db_category

    async def get_category_by_id(self, category_id: int, school_id: int) -> ProductCategory:
        """
        Get a single category by ID.

        Args:
            category_id: Category ID
            school_id: School ID (for multi-tenant security)

        Returns:
            ProductCategory instance

        Raises:
            HTTPException 404: If category not found or belongs to different school
        """
        stmt = select(ProductCategory).where(
            and_(
                ProductCategory.category_id == category_id,
                ProductCategory.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_category = result.scalar_one_or_none()

        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found",
            )

        return db_category

    async def get_all_categories(self, school_id: int, include_inactive: bool = False) -> list[ProductCategory]:
        """
        Get all categories for a school.

        Args:
            school_id: School ID
            include_inactive: Whether to include soft-deleted categories (admin only)

        Returns:
            List of ProductCategory instances, ordered by display_order
        """
        stmt = select(ProductCategory).where(ProductCategory.school_id == school_id)

        # Parents should only see active categories
        if not include_inactive:
            stmt = stmt.where(ProductCategory.is_active.is_(True))

        # Order by display_order (nulls first), then by name
        stmt = stmt.order_by(
            ProductCategory.display_order.asc().nulls_first(),
            ProductCategory.category_name.asc(),
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_categories_with_product_counts(self, school_id: int) -> list[ProductCategoryWithCount]:
        """
        Get all categories with product counts (Admin dashboard).

        This uses subqueries to efficiently compute product counts.

        Args:
            school_id: School ID

        Returns:
            List of categories with product_count and active_product_count
        """
        # Subquery for total product count
        total_count_subquery = (
            select(
                Product.category_id,
                func.count(Product.product_id).label("product_count"),
            )
            .where(Product.school_id == school_id)
            .group_by(Product.category_id)
            .subquery()
        )

        # Subquery for active product count
        active_count_subquery = (
            select(
                Product.category_id,
                func.count(Product.product_id).label("active_product_count"),
            )
            .where(
                and_(
                    Product.school_id == school_id,
                    Product.is_active.is_(True),
                )
            )
            .group_by(Product.category_id)
            .subquery()
        )

        # Main query with JOINs
        stmt = (
            select(
                ProductCategory,
                func.coalesce(total_count_subquery.c.product_count, 0).label("product_count"),
                func.coalesce(active_count_subquery.c.active_product_count, 0).label("active_product_count"),
            )
            .outerjoin(
                total_count_subquery,
                ProductCategory.category_id == total_count_subquery.c.category_id,
            )
            .outerjoin(
                active_count_subquery,
                ProductCategory.category_id == active_count_subquery.c.category_id,
            )
            .where(ProductCategory.school_id == school_id)
            .order_by(
                ProductCategory.display_order.asc().nulls_first(),
                ProductCategory.category_name.asc(),
            )
        )

        result = await self.db.execute(stmt)
        categories = result.all()

        # Convert to schema objects
        result_list = []
        for category, product_count, active_product_count in categories:
            result_list.append(
                ProductCategoryWithCount(
                    category_id=category.category_id,
                    school_id=category.school_id,
                    category_name=category.category_name,
                    description=category.description,
                    display_order=category.display_order,
                    icon_url=category.icon_url,
                    is_active=category.is_active,
                    product_count=product_count,
                    active_product_count=active_product_count,
                    created_at=category.created_at,
                    updated_at=category.updated_at,
                )
            )

        return result_list

    async def update_category(self, db_category: ProductCategory, category_update: ProductCategoryUpdate) -> ProductCategory:
        """
        Update an existing category.

        Design Pattern: Partial update (only provided fields are updated).

        Args:
            db_category: Existing category instance (fetched by get_category_by_id)
            category_update: Update data

        Returns:
            Updated ProductCategory instance

        Raises:
            HTTPException 409: If new name conflicts with existing category
        """
        # Check for name conflict if name is being changed
        if category_update.category_name and category_update.category_name.lower() != db_category.category_name.lower():
            stmt = select(ProductCategory).where(
                and_(
                    ProductCategory.school_id == db_category.school_id,
                    func.lower(ProductCategory.category_name) == category_update.category_name.lower(),
                    ProductCategory.category_id != db_category.category_id,
                    ProductCategory.is_active.is_(True),
                )
            )
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Category '{category_update.category_name}' already exists in your school",
                )

        # Apply updates (only provided fields)
        update_data = category_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)

        await self.db.commit()
        await self.db.refresh(db_category)

        return db_category

    async def delete_category(self, db_category: ProductCategory) -> ProductCategory:
        """
        Soft-delete a category (sets is_active = False).

        Business Rule: Categories are NEVER hard-deleted to preserve data integrity.
        Products in this category remain linked but category becomes hidden.

        Args:
            db_category: Category instance to delete

        Returns:
            Soft-deleted ProductCategory instance

        Raises:
            HTTPException 400: If category has active products
        """
        # Check if category has active products
        stmt = select(func.count(Product.product_id)).where(
            and_(
                Product.category_id == db_category.category_id,
                Product.is_active.is_(True),
            )
        )
        result = await self.db.execute(stmt)
        active_product_count = result.scalar()

        if active_product_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category with {active_product_count} active products. " f"Deactivate or reassign products first.",
            )

        # Soft delete
        db_category.is_active = False
        await self.db.commit()
        await self.db.refresh(db_category)

        return db_category

    async def bulk_reorder_categories(self, school_id: int, category_orders: list[dict]) -> list[ProductCategory]:
        """
        Bulk update display_order for multiple categories.

        Use Case: Admin drags categories to reorder in UI.

        Args:
            school_id: School ID (for security)
            category_orders: List of {"category_id": int, "display_order": int}

        Returns:
            List of updated categories

        Raises:
            HTTPException 404: If any category doesn't exist or belongs to different school
        """
        updated_categories = []

        for order_data in category_orders:
            category_id = order_data["category_id"]
            new_order = order_data["display_order"]

            # Fetch and validate category belongs to school
            stmt = select(ProductCategory).where(
                and_(
                    ProductCategory.category_id == category_id,
                    ProductCategory.school_id == school_id,
                )
            )
            result = await self.db.execute(stmt)
            db_category = result.scalar_one_or_none()

            if not db_category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category {category_id} not found in your school",
                )

            db_category.display_order = new_order
            updated_categories.append(db_category)

        await self.db.commit()

        # Refresh all updated categories
        for category in updated_categories:
            await self.db.refresh(category)

        return updated_categories

    async def bulk_activate_categories(self, school_id: int, category_ids: list[int], is_active: bool) -> list[ProductCategory]:
        """
        Bulk activate/deactivate categories.

        Use Case: Admin hides seasonal categories temporarily.

        Args:
            school_id: School ID (for security)
            category_ids: List of category IDs
            is_active: True to activate, False to deactivate

        Returns:
            List of updated categories

        Raises:
            HTTPException 404: If any category doesn't exist
        """
        # Fetch all categories in one query
        stmt = select(ProductCategory).where(
            and_(
                ProductCategory.category_id.in_(category_ids),
                ProductCategory.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        categories = list(result.scalars().all())

        # Validate all categories were found
        if len(categories) != len(category_ids):
            found_ids = {c.category_id for c in categories}
            missing_ids = set(category_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categories not found: {missing_ids}",
            )

        # Update all categories
        for category in categories:
            category.is_active = is_active

        await self.db.commit()

        # Refresh all
        for category in categories:
            await self.db.refresh(category)

        return categories
