# backend/app/services/product_service.py
"""
Product Service Layer for SchoolOS E-commerce Module (ASYNC REFACTORED).

This service handles all business logic for managing products (inventory items).
All product operations are school-scoped and multi-tenant secure.

Security Architecture:
- school_id is NEVER accepted from client input
- All school_id values come exclusively from JWT-derived current_profile
- RLS policies provide defense-in-depth at database layer
"""

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.product_schema import ProductCreate, ProductStockAdjustment, ProductUpdate


class ProductService:
    """Service class for asynchronous product operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_product(self, product_in: ProductCreate, current_profile: Profile) -> Product:
        """
        Create a new product (Admin only).

        Security:
        - school_id populated from current_profile, NOT from request
        - Prevents IDOR vulnerability

        Business Rules:
        - Product name must be unique within school
        - SKU must be globally unique (if provided)
        - Category must exist and belong to same school

        Args:
            product_in: Product creation data
            current_profile: Authenticated user profile (contains school_id)

        Returns:
            Created Product instance

        Raises:
            HTTPException 409: If product name or SKU already exists
            HTTPException 404: If category doesn't exist
        """
        # Validate category exists and belongs to school
        if product_in.category_id:
            stmt = select(ProductCategory).where(
                and_(
                    ProductCategory.category_id == product_in.category_id,
                    ProductCategory.school_id == current_profile.school_id,
                )
            )
            result = await self.db.execute(stmt)
            category = result.scalars().first()

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {product_in.category_id} not found in your school",
                )

        # Check for duplicate product name within school
        stmt = select(Product).where(
            and_(
                Product.school_id == current_profile.school_id,
                func.lower(Product.name) == product_in.name.lower(),
                Product.is_active.is_(True),
            )
        )
        result = await self.db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product '{product_in.name}' already exists in your school",
            )

        # Check for duplicate SKU (globally unique)
        if product_in.sku:
            stmt = select(Product).where(Product.sku == product_in.sku)
            result = await self.db.execute(stmt)
            existing_sku = result.scalars().first()

            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"SKU '{product_in.sku}' is already in use",
                )

        # Create product
        db_product = Product(
            school_id=current_profile.school_id,  # CRITICAL: From JWT, not client
            name=product_in.name,
            description=product_in.description,
            price=product_in.price,
            stock_quantity=product_in.stock_quantity,
            category_id=product_in.category_id,
            sku=product_in.sku,
            image_url=product_in.image_url,
            manufacturer=product_in.manufacturer,
            reorder_level=product_in.reorder_level,
            reorder_quantity=product_in.reorder_quantity,
            is_active=product_in.is_active,
        )

        self.db.add(db_product)
        await self.db.commit()
        await self.db.refresh(db_product)

        return db_product

    async def get_product_by_id(self, product_id: int, school_id: int) -> Product:
        """
        Get a single product by ID with category details.

        Args:
            product_id: Product ID
            school_id: School ID (for multi-tenant security)

        Returns:
            Product instance with category loaded

        Raises:
            HTTPException 404: If product not found or belongs to different school
        """
        stmt = (
            select(Product)
            .options(selectinload(Product.category))
            .where(
                and_(
                    Product.product_id == product_id,
                    Product.school_id == school_id,
                )
            )
        )
        result = await self.db.execute(stmt)
        db_product = result.scalars().first()

        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found",
            )

        return db_product

    async def get_all_products(
        self,
        school_id: int,
        category_id: int = None,
        include_inactive: bool = False,
    ) -> list[Product]:
        """
        Get all products for a school with optional filters.

        Args:
            school_id: School ID
            category_id: Optional category filter
            include_inactive: Whether to include inactive products (admin only)

        Returns:
            List of Product instances with category loaded, ordered by name
        """
        stmt = select(Product).options(selectinload(Product.category)).where(Product.school_id == school_id)

        # Filter by category if provided
        if category_id:
            stmt = stmt.where(Product.category_id == category_id)

        # Parents should only see active products
        if not include_inactive:
            stmt = stmt.where(Product.is_active.is_(True))

        # Order by name
        stmt = stmt.order_by(Product.name.asc())

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update_product(self, db_product: Product, product_update: ProductUpdate) -> Product:
        """
        Update an existing product.

        Design Pattern: Partial update (only provided fields are updated).

        Args:
            db_product: Existing product instance (fetched by get_product_by_id)
            product_update: Update data

        Returns:
            Updated Product instance

        Raises:
            HTTPException 409: If new name or SKU conflicts with existing product
            HTTPException 404: If new category doesn't exist
        """
        # Check for name conflict if name is being changed
        if product_update.name and product_update.name.lower() != db_product.name.lower():
            stmt = select(Product).where(
                and_(
                    Product.school_id == db_product.school_id,
                    func.lower(Product.name) == product_update.name.lower(),
                    Product.product_id != db_product.product_id,
                    Product.is_active.is_(True),
                )
            )
            result = await self.db.execute(stmt)
            existing = result.scalars().first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product '{product_update.name}' already exists in your school",
                )

        # Check for SKU conflict if SKU is being changed
        if product_update.sku and product_update.sku != db_product.sku:
            stmt = select(Product).where(
                and_(
                    Product.sku == product_update.sku,
                    Product.product_id != db_product.product_id,
                )
            )
            result = await self.db.execute(stmt)
            existing_sku = result.scalars().first()

            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"SKU '{product_update.sku}' is already in use",
                )

        # Validate new category if being changed
        if product_update.category_id and product_update.category_id != db_product.category_id:
            stmt = select(ProductCategory).where(
                and_(
                    ProductCategory.category_id == product_update.category_id,
                    ProductCategory.school_id == db_product.school_id,
                )
            )
            result = await self.db.execute(stmt)
            category = result.scalars().first()

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {product_update.category_id} not found in your school",
                )

        # Apply updates (only provided fields)
        update_data = product_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)

        await self.db.commit()
        await self.db.refresh(db_product)

        return db_product

    async def delete_product(self, db_product: Product) -> Product:
        """
        Soft-delete a product (sets is_active = False).

        Business Rule: Products are NEVER hard-deleted to preserve order history.

        Args:
            db_product: Product instance to delete

        Returns:
            Soft-deleted Product instance

        Raises:
            HTTPException 400: If product is in active packages or pending orders
        """
        # Check if product is in any active packages
        from app.models.product_package import PackageItem

        stmt = select(func.count(PackageItem.package_id)).where(PackageItem.product_id == db_product.product_id)
        result = await self.db.execute(stmt)
        active_package_count = result.scalar()

        if active_package_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete product that is part of {active_package_count} active packages. " f"Remove from packages first.",
            )

        # Soft delete
        db_product.is_active = False
        await self.db.commit()
        await self.db.refresh(db_product)

        return db_product

    async def adjust_stock(self, db_product: Product, adjustment: ProductStockAdjustment) -> Product:
        """
        Adjust product stock quantity (Admin only).

        Use Cases:
        - Receiving new inventory shipment (+adjustment)
        - Damaged/lost items (-adjustment)
        - Manual inventory correction

        Args:
            db_product: Product instance
            adjustment: Adjustment amount and reason

        Returns:
            Updated Product instance

        Raises:
            HTTPException 400: If adjustment would result in negative stock
        """
        new_stock = db_product.stock_quantity + adjustment.adjustment

        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock adjustment would result in negative stock. " f"Current: {db_product.stock_quantity}, Adjustment: {adjustment.adjustment}",
            )

        db_product.stock_quantity = new_stock

        # TODO: Log this adjustment in an audit table
        # AuditLog.create(
        #     user_id=current_user.user_id,
        #     action="stock_adjustment",
        #     entity="product",
        #     entity_id=db_product.product_id,
        #     details={"adjustment": adjustment.adjustment, "reason": adjustment.reason}
        # )

        await self.db.commit()
        await self.db.refresh(db_product)

        return db_product

    async def bulk_update_category(self, school_id: int, product_ids: list[int], new_category_id: int) -> list[Product]:
        """
        Bulk update category for multiple products (Admin only).

        Use Case: Admin reorganizes product catalog.

        Args:
            school_id: School ID (for security)
            product_ids: List of product IDs to update
            new_category_id: New category ID

        Returns:
            List of updated products

        Raises:
            HTTPException 404: If category or any product doesn't exist
        """
        # Validate category exists and belongs to school
        stmt = select(ProductCategory).where(
            and_(
                ProductCategory.category_id == new_category_id,
                ProductCategory.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        category = result.scalars().first()

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {new_category_id} not found in your school",
            )

        # Fetch all products in one query
        stmt = select(Product).where(
            and_(
                Product.product_id.in_(product_ids),
                Product.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        products = list(result.scalars().all())

        # Validate all products were found
        if len(products) != len(product_ids):
            found_ids = {p.product_id for p in products}
            missing_ids = set(product_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found: {missing_ids}",
            )

        # Update all products
        for product in products:
            product.category_id = new_category_id

        await self.db.commit()

        # Refresh all
        for product in products:
            await self.db.refresh(product)

        return products
