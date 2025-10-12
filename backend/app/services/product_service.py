# backend/app/services/product_service.py
"""
Product Service Layer for SchoolOS E-commerce Module.

This service handles all business logic for managing products (inventory items).
All product operations are school-scoped and multi-tenant secure.

Security Architecture:
- school_id is NEVER accepted from client input
- All school_id values come exclusively from JWT-derived current_profile
- RLS policies provide defense-in-depth at database layer
"""

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.profile import Profile
from app.schemas.product_schema import ProductCreate, ProductStockAdjustment, ProductUpdate


class ProductService:
    """Service class for product operations."""

    @staticmethod
    async def create_product(
        db: Session,
        product_in: ProductCreate,
        current_profile: Profile,
    ) -> Product:
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
            db: Database session
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
            category = (
                db.query(ProductCategory)
                .filter(
                    and_(
                        ProductCategory.category_id == product_in.category_id,
                        ProductCategory.school_id == current_profile.school_id,
                    )
                )
                .first()
            )

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {product_in.category_id} not found in your school",
                )

        # Check for duplicate product name within school
        existing = (
            db.query(Product)
            .filter(
                and_(
                    Product.school_id == current_profile.school_id,
                    func.lower(Product.name) == product_in.name.lower(),
                    Product.is_active.is_(True),
                )
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product '{product_in.name}' already exists in your school",
            )

        # Check for duplicate SKU (globally unique)
        if product_in.sku:
            existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()

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

        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    async def get_product_by_id(
        db: Session,
        product_id: int,
        school_id: int,
    ) -> Product:
        """
        Get a single product by ID with category details.

        Args:
            db: Database session
            product_id: Product ID
            school_id: School ID (for multi-tenant security)

        Returns:
            Product instance with category loaded

        Raises:
            HTTPException 404: If product not found or belongs to different school
        """
        db_product = (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(
                and_(
                    Product.product_id == product_id,
                    Product.school_id == school_id,
                )
            )
            .first()
        )

        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found",
            )

        return db_product

    @staticmethod
    async def get_all_products(
        db: Session,
        school_id: int,
        category_id: int = None,
        include_inactive: bool = False,
    ) -> list[Product]:
        """
        Get all products for a school with optional filters.

        Args:
            db: Database session
            school_id: School ID
            category_id: Optional category filter
            include_inactive: Whether to include inactive products (admin only)

        Returns:
            List of Product instances with category loaded, ordered by name
        """
        query = db.query(Product).options(joinedload(Product.category)).filter(Product.school_id == school_id)

        # Filter by category if provided
        if category_id:
            query = query.filter(Product.category_id == category_id)

        # Parents should only see active products
        if not include_inactive:
            query = query.filter(Product.is_active.is_(True))

        # Order by name
        query = query.order_by(Product.name.asc())

        return query.all()

    @staticmethod
    async def update_product(
        db: Session,
        db_product: Product,
        product_update: ProductUpdate,
    ) -> Product:
        """
        Update an existing product.

        Design Pattern: Partial update (only provided fields are updated).

        Args:
            db: Database session
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
            existing = (
                db.query(Product)
                .filter(
                    and_(
                        Product.school_id == db_product.school_id,
                        func.lower(Product.name) == product_update.name.lower(),
                        Product.product_id != db_product.product_id,
                        Product.is_active.is_(True),
                    )
                )
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product '{product_update.name}' already exists in your school",
                )

        # Check for SKU conflict if SKU is being changed
        if product_update.sku and product_update.sku != db_product.sku:
            existing_sku = (
                db.query(Product)
                .filter(
                    and_(
                        Product.sku == product_update.sku,
                        Product.product_id != db_product.product_id,
                    )
                )
                .first()
            )

            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"SKU '{product_update.sku}' is already in use",
                )

        # Validate new category if being changed
        if product_update.category_id and product_update.category_id != db_product.category_id:
            category = (
                db.query(ProductCategory)
                .filter(
                    and_(
                        ProductCategory.category_id == product_update.category_id,
                        ProductCategory.school_id == db_product.school_id,
                    )
                )
                .first()
            )

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {product_update.category_id} not found in your school",
                )

        # Apply updates (only provided fields)
        update_data = product_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)

        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    async def delete_product(
        db: Session,
        db_product: Product,
    ) -> Product:
        """
        Soft-delete a product (sets is_active = False).

        Business Rule: Products are NEVER hard-deleted to preserve order history.

        Args:
            db: Database session
            db_product: Product instance to delete

        Returns:
            Soft-deleted Product instance

        Raises:
            HTTPException 400: If product is in active packages or pending orders
        """
        # Check if product is in any active packages
        from app.models.product_package import PackageItem

        active_package_count = (
            db.query(func.count(PackageItem.package_id))
            .filter(
                and_(
                    PackageItem.product_id == db_product.product_id,
                )
            )
            .scalar()
        )

        if active_package_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete product that is part of {active_package_count} active packages. " f"Remove from packages first.",
            )

        # Soft delete
        db_product.is_active = False
        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    async def adjust_stock(
        db: Session,
        db_product: Product,
        adjustment: ProductStockAdjustment,
    ) -> Product:
        """
        Adjust product stock quantity (Admin only).

        Use Cases:
        - Receiving new inventory shipment (+adjustment)
        - Damaged/lost items (-adjustment)
        - Manual inventory correction

        Args:
            db: Database session
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

        db.commit()
        db.refresh(db_product)

        return db_product

    @staticmethod
    async def bulk_update_category(
        db: Session,
        school_id: int,
        product_ids: list[int],
        new_category_id: int,
    ) -> list[Product]:
        """
        Bulk update category for multiple products (Admin only).

        Use Case: Admin reorganizes product catalog.

        Args:
            db: Database session
            school_id: School ID (for security)
            product_ids: List of product IDs to update
            new_category_id: New category ID

        Returns:
            List of updated products

        Raises:
            HTTPException 404: If category or any product doesn't exist
        """
        # Validate category exists and belongs to school
        category = (
            db.query(ProductCategory)
            .filter(
                and_(
                    ProductCategory.category_id == new_category_id,
                    ProductCategory.school_id == school_id,
                )
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {new_category_id} not found in your school",
            )

        # Fetch all products in one query
        products = (
            db.query(Product)
            .filter(
                and_(
                    Product.product_id.in_(product_ids),
                    Product.school_id == school_id,
                )
            )
            .all()
        )

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

        db.commit()

        # Refresh all
        for product in products:
            db.refresh(product)

        return products
