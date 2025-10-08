# backend/app/services/fee_template_service.py
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.fee_template import FeeTemplate
from app.schemas.fee_template_schema import FeeTemplateCreate, FeeTemplateUpdate


async def create_template(db: AsyncSession, *, obj_in: FeeTemplateCreate) -> FeeTemplate:
    db_obj = FeeTemplate(**obj_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_template(db: AsyncSession, template_id: int) -> Optional[FeeTemplate]:
    stmt = select(FeeTemplate).where(FeeTemplate.id == template_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_templates(db: AsyncSession, school_id: int) -> list[FeeTemplate]:
    stmt = select(FeeTemplate).where(FeeTemplate.school_id == school_id).order_by(FeeTemplate.start_date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_template(db: AsyncSession, *, db_obj: FeeTemplate, obj_in: FeeTemplateUpdate) -> FeeTemplate:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_template(db: AsyncSession, *, db_obj: FeeTemplate):
    # Note: Use a soft delete (e.g., db_obj.status = 'Archived') in production
    await db.delete(db_obj)
    await db.commit()
