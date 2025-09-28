# backend/app/services/product_category_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product_category import ProductCategory
from app.schemas.product_category_schema import ProductCategoryCreate


# ... (create_product_category is unchanged) ...
async def create_product_category(
    db: AsyncSession, *, category_in: ProductCategoryCreate
) -> ProductCategory:
    db_obj = ProductCategory(**category_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_all_product_categories_for_school(
    db: AsyncSession, school_id: int
) -> list[ProductCategory]:  # Changed from List to list
    stmt = select(ProductCategory).where(ProductCategory.school_id == school_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
