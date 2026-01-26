# backend/app/services/product_package_service.py (FIXED)
"""
Product Package Service Layer - With Proper Response Transformation
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

    def _transform_package_to_dict(self, package: ProductPackage) -> dict:
        """
        Transform ProductPackage model to dict with flattened item structure.

        This solves the Pydantic validation issue by manually flattening
        the nested PackageItem->Product relationship.
        """
        return {
            "id": package.id,
            "school_id": package.school_id,
            "name": package.name,
            "description": package.description,
            "price": package.price,
            "image_url": package.image_url,
            "category": package.category,
            "academic_year": package.academic_year,
            "is_active": package.is_active,
            "created_at": package.created_at,
            "updated_at": package.updated_at,
            "items": [
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "product_name": item.product.name,
                    "product_price": item.product.price,
                    "product_image_url": item.product.image_url,
                    "product_sku": item.product.sku,
                    "stock_quantity": item.product.stock_quantity,
                    "availability": item.product.availability,
                }
                for item in package.items
            ],
        }

    async def create_package(self, package_in: ProductPackageCreate, current_profile: Profile) -> dict:
        """Create a new product package with items."""

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
            school_id=current_profile.school_id,
            name=package_in.name,
            description=package_in.description,
            price=package_in.price,
            image_url=package_in.image_url,
            category=package_in.category,
            academic_year=package_in.academic_year,
            is_active=package_in.is_active,
        )

        self.db.add(db_package)
        await self.db.flush()

        # Create package items
        for item_in in package_in.items:
            package_item = PackageItem(
                package_id=db_package.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
            )
            self.db.add(package_item)

        await self.db.commit()

        # Reload with relationships
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == db_package.id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)

    async def get_package_by_id(self, package_id: int, school_id: int) -> dict:
        """Get a single package by ID with items."""

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

        return self._transform_package_to_dict(db_package)

    async def get_all_packages(self, school_id: int, include_inactive: bool = False) -> list[dict]:
        """Get all packages for a school."""

        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.school_id == school_id)

        if not include_inactive:
            stmt = stmt.where(ProductPackage.is_active.is_(True))

        stmt = stmt.order_by(ProductPackage.name.asc())

        result = await self.db.execute(stmt)
        packages = list(result.scalars().all())

        return [self._transform_package_to_dict(pkg) for pkg in packages]

    async def update_package(self, package_id: int, school_id: int, package_update: ProductPackageUpdate) -> dict:
        """Update package header (metadata only)."""

        # Fetch the actual ORM object (not transformed dict)
        stmt = select(ProductPackage).where(
            and_(
                ProductPackage.id == package_id,
                ProductPackage.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        # Apply updates
        update_data = package_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_package, field, value)

        await self.db.commit()

        # Reload with relationships and transform
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == db_package.id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)

    async def delete_package(self, package_id: int, school_id: int) -> dict:
        """Soft-delete a package."""

        # Fetch the actual ORM object (not transformed dict)
        stmt = select(ProductPackage).where(
            and_(
                ProductPackage.id == package_id,
                ProductPackage.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        db_package.is_active = False
        await self.db.commit()

        # Reload with relationships and transform
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == db_package.id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)

    async def add_items_to_package(self, package_id: int, school_id: int, items_in: ProductPackageAddItems) -> dict:
        """Add new items to an existing package."""

        # Fetch the package first to validate it exists
        stmt = select(ProductPackage).where(
            and_(
                ProductPackage.id == package_id,
                ProductPackage.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        # Get existing product IDs
        stmt = select(PackageItem).where(PackageItem.package_id == package_id)
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

        # Validate products
        stmt = select(Product).where(
            and_(
                Product.product_id.in_(new_product_ids),
                Product.school_id == school_id,
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

        # Add items
        for item_in in items_in.items:
            package_item = PackageItem(
                package_id=package_id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
            )
            self.db.add(package_item)

        await self.db.commit()

        # Reload with relationships and transform
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == package_id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)

    async def remove_item_from_package(self, package_id: int, school_id: int, product_id: int) -> dict:
        """Remove an item from a package."""

        # Validate package exists
        stmt = select(ProductPackage).where(
            and_(
                ProductPackage.id == package_id,
                ProductPackage.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        # Find item
        stmt = select(PackageItem).where(
            and_(
                PackageItem.package_id == package_id,
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

        # Check if last item
        stmt = select(func.count(PackageItem.product_id)).where(PackageItem.package_id == package_id)
        result = await self.db.execute(stmt)
        item_count = result.scalar()

        if item_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove last item from package",
            )

        # Delete item
        await self.db.delete(item)
        await self.db.commit()

        # Reload with relationships and transform
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == package_id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)

    async def update_item_quantity(self, package_id: int, school_id: int, product_id: int, new_quantity: int) -> dict:
        """Update quantity of an item in package."""

        # Validate package exists
        stmt = select(ProductPackage).where(
            and_(
                ProductPackage.id == package_id,
                ProductPackage.school_id == school_id,
            )
        )
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        if not db_package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package with ID {package_id} not found",
            )

        # Find item
        stmt = select(PackageItem).where(
            and_(
                PackageItem.package_id == package_id,
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

        # Reload with relationships and transform
        stmt = select(ProductPackage).options(selectinload(ProductPackage.items).selectinload(PackageItem.product)).where(ProductPackage.id == package_id)
        result = await self.db.execute(stmt)
        db_package = result.scalars().first()

        return self._transform_package_to_dict(db_package)
