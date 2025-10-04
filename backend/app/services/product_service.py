# # backend/app/services/product_service.py
# from typing import Optional

# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select

# from app.models.product import Product
# from app.schemas.product_schema import ProductCreate, ProductUpdate


# async def create_product(db: AsyncSession, *, obj_in: ProductCreate) -> Product:
#     db_obj = Product(**obj_in.model_dump())
#     db.add(db_obj)
#     await db.commit()
#     await db.refresh(db_obj)
#     return db_obj


# async def get_product(db: AsyncSession, product_id: int) -> Optional[Product]:
#     stmt = select(Product).where(Product.product_id == product_id)
#     result = await db.execute(stmt)
#     return result.scalars().first()


# async def get_all_products_for_school(
#     db: AsyncSession, school_id: int, is_active: bool = True
# ) -> list[Product]:
#     stmt = (
#         select(Product)
#         .where(Product.school_id == school_id, Product.is_active == is_active)
#         .order_by(Product.name)
#     )
#     result = await db.execute(stmt)
#     return result.scalars().all()


# async def update_product(
#     db: AsyncSession, *, db_obj: Product, obj_in: ProductUpdate
# ) -> Product:
#     update_data = obj_in.model_dump(exclude_unset=True)
#     for field, value in update_data.items():
#         setattr(db_obj, field, value)
#     db.add(db_obj)
#     await db.commit()
#     await db.refresh(db_obj)
#     return db_obj


# async def delete_product(db: AsyncSession, *, db_obj: Product):
#     # In E-commerce, we typically set is_active=False (soft delete)
#     db_obj.is_active = False
#     await db.commit()
