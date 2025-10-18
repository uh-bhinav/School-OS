# backend/app/services/product_package_service.py
"""
Product Package Service Layer for SchoolOS E-commerce Module (ASYNC REFACTORED).

This service handles all business logic for managing product packages (bundles/kits).
Packages allow schools to sell multiple products together as a discounted unit.

Security Architecture:
- school_id is NEVER accepted from client input
- All school_id values come exclusively from JWT-derived current_profile
"""

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.models.product_package import PackageItem, ProductPackage
from app.models.profile import Profile
from app.schemas.product_package_schema import (
    ProductPackageAddItems,
    ProductPackageCreate,
    ProductPackageUpdate,
)


class ProductPackageService:
    """Service class for asynchronous product package operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_package(self, package_in: ProductPackageCreate, current_profile: Profile) -> ProductPackage:
        """
                Create a new product package with items (Admin only).

                Security:
                - school_id populated from current_profile, NOT from request
                - All products must belong to same school

                Business Rules:
                - Package must contain at least 1 item
                - All products must exist and be active
        - No duplicate products in same package

                Args:
                    package_in: Package creation data (includes items list)
                    current_profile: Authenticated user profile

                Returns:
                    Created ProductPackage instance with items relationship loaded

                Raises:
                    HTTPException 404: If any product doesn't exist
                    HTTPException 400: If any product belongs to different school
        """
        # Validate all products exist and belong to school
        product_ids = [item.product_id for item in package_in.items]
        stmt = select(Product).where(
            and_(
                Product.product_id.in_(product_ids),
                Product.school_id == current_profile.school_id,
            )
        )
        result = await self.db.execute(stmt)
        products = list(result.scalars().all())

        # Check all products were found
        if len(products) != len(product_ids):
            found_ids = {p.product_id for p in products}
            missing_ids = set(product_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found or don't belong to your school: {missing_ids}",
            )

        # Check all products are active
        inactive_products = [p for p in products if not p.is_active]
        if inactive_products:
            inactive_ids = [p.product_id for p in inactive_products]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add inactive products to package: {inactive_ids}",
            )

        # Create package header
        db_package = ProductPackage(
            school_id=current_profile.school_id,  # CRITICAL: From JWT
            name=package_in.name,
            description=package_in.description,
            price=package_in.price,
            image_url=package_in.image_url,
            category=package_in.category,
            academic_year=package_in.academic_year,
            is_active=package_in.is_active,
        )

        self.db.add(db_package)
        await self.db.flush()  # Get package ID without committing

        # Create package items with quantities
        for item_in in package_in.items:
            package_item = PackageItem(
                package_id=db_package.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
            )
            self.db.add(package_item)

        await self.db.commit()
        await self.db.refresh(db_package)

        # Eager load items for response
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == db_package.id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return db_package

    async def get_package_by_id(self, package_id: int, school_id: int) -> ProductPackage:
        """
        Get a single package by ID with items.

        Args:
            package_id: Package ID
            school_id: School ID (for multi-tenant security)

        Returns:
            ProductPackage instance with items and product details loaded

        Raises:
            HTTPException 404: If package not found
        """
        stmt = (
            select(ProductPackage)
            .options(selectinload(ProductPackage.items).selectinload(PackageItem.product))
            .where(
                and_(
                    ProductPackage.id == package_id,
                    ProductPackage.school_id == school_id,
                )
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        return db_package

    async def get_all_packages(self, school_id: int, include_inactive: bool = False) -> list[ProductPackage]:
        """
        Get all packages for a school.

        Args:
            school_id: School ID
            include_inactive: Whether to include inactive packages (admin only)

        Returns:
            List of ProductPackage instances with items loaded
        """
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.school_id == school_id)

        if not include_inactive:
            stmt = stmt.where(ProductPackage.is_active.is_(True))

        stmt = stmt.order_by(ProductPackage.name.asc())

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update_package(self, db_package: ProductPackage, package_update: ProductPackageUpdate) -> ProductPackage:
        """
        Update package header (metadata only, not items).

        Design Pattern: Partial update.

        Note: To modify package items, use add_items or remove_item endpoints.

        Args:
            db_package: Existing package instance
            package_update: Update data

        Returns:
            Updated ProductPackage instance
        """
        # Apply updates
        update_data = package_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_package, field, value)

        await self.db.commit()
        await self.db.refresh(db_package)

        return db_package

    async def delete_package(self, db_package: ProductPackage) -> ProductPackage:
        """
        Soft-delete a package (sets is_active = False).

        Business Rule: Packages are soft-deleted to preserve order history.

        Args:
            db_package: Package instance to delete

        Returns:
            Soft-deleted ProductPackage instance
        """
        db_package.is_active = False
        await self.db.commit()
        await self.db.refresh(db_package)

        return db_package

    async def add_items_to_package(self, db_package: ProductPackage, items_in: ProductPackageAddItems) -> ProductPackage:
        """
        Add new items to an existing package.

        Business Rules:
        - Cannot add products already in package
        - All products must belong to same school
        - Products must be active

        Args:
            db_package: Existing package instance
            items_in: List of items to add

        Returns:
            Updated ProductPackage instance with items loaded

        Raises:
            HTTPException 409: If product already in package
            HTTPException 404: If product doesn't exist
        """
        # Get existing product IDs in package
        stmt = select(PackageItem).where(PackageItem.package_id == db_package.id)
        result = await self.db.execute(stmt)
        existing_items = list(result.scalars().all())
        existing_product_ids = {item.product_id for item in existing_items}

        # Check for duplicates
        new_product_ids = [item.product_id for item in items_in.items]
        duplicates = existing_product_ids.intersection(new_product_ids)

        if duplicates:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Products already in package: {duplicates}",
            )

        # Validate all products exist and belong to school
        stmt = select(Product).where(
            and_(
                Product.product_id.in_(new_product_ids),
                Product.school_id == db_package.school_id,
            )
        )
        result = await self.db.execute(stmt)
        products = list(result.scalars().all())

        if len(products) != len(new_product_ids):
            found_ids = {p.product_id for p in products}
            missing_ids = set(new_product_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found: {missing_ids}",
            )

        # Add new items
        for item_in in items_in.items:
            package_item = PackageItem(
                package_id=db_package.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
            )
            self.db.add(package_item)

        await self.db.commit()

        # Reload package with items
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == db_package.id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return db_package

    async def remove_item_from_package(self, db_package: ProductPackage, product_id: int) -> ProductPackage:
        """
        Remove an item from a package.

        Business Rules:
        - Cannot remove last item (package must have at least 1 item)

        Args:
            db_package: Existing package instance
            product_id: Product ID to remove

        Returns:
            Updated ProductPackage instance

        Raises:
            HTTPException 404: If product not in package
            HTTPException 400: If trying to remove last item
        """
        # Check item exists in package
        stmt = select(PackageItem).where(
            and_(
                PackageItem.package_id == db_package.id,
                PackageItem.product_id == product_id,
            )
        )
        result = await self.db.execute(stmt)
        item = result.scalars().first()

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found in this package",
            )

        # Check if this is the last item
        stmt = select(func.count(PackageItem.product_id)).where(PackageItem.package_id == db_package.id)
        result = await self.db.execute(stmt)
        item_count = result.scalar()

        if item_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove last item from package. Package must contain at least 1 item.",
            )

        # Delete item
        await self.db.delete(item)
        await self.db.commit()

        # Reload package
        await self.db.refresh(db_package)

        return db_package

    async def update_item_quantity(self, db_package: ProductPackage, product_id: int, new_quantity: int) -> ProductPackage:
        """
        Update the quantity of a specific item in a package.

        Args:
            db_package: Existing package instance
            product_id: Product ID to update
            new_quantity: New quantity (1-100)

        Returns:
            Updated ProductPackage instance

        Raises:
            HTTPException 404: If product not in package
        """
        # Find item
        stmt = select(PackageItem).where(
            and_(
                PackageItem.package_id == db_package.id,
                PackageItem.product_id == product_id,
            )
        )
        result = await self.db.execute(stmt)
        item = result.scalars().first()

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found in this package",
            )

        # Update quantity
        item.quantity = new_quantity

        await self.db.commit()
        await self.db.refresh(db_package)

        return db_package
