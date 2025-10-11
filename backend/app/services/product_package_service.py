# backend/app/services/product_package_service.py (Completing the file)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product_package import ProductPackage
from app.schemas.product_package_schema import (
    ProductPackageUpdate,
)

# --- Existing functions (create_package, get_package) are assumed to be here ---


async def get_all_packages_for_school(db: AsyncSession, school_id: int, is_active: bool = True) -> list[ProductPackage]:
    """Retrieves all active product packages for a specific school."""
    stmt = select(ProductPackage).where(ProductPackage.school_id == school_id, ProductPackage.is_active == is_active).order_by(ProductPackage.name)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_package(db: AsyncSession, *, db_obj: ProductPackage, obj_in: ProductPackageUpdate) -> ProductPackage:
    """Updates package details (name, price, or status)."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_package(db: AsyncSession, *, db_obj: ProductPackage):
    """Deactivates a package (soft delete)."""
    db_obj.is_active = False
    db.add(db_obj)
    await db.commit()
