# backend/app/services/fee_template_service.py
from typing import Optional # Added List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload # Added selectinload

# --- Import necessary models and schemas ---
from app.models.fee_template import FeeTemplate
from app.schemas.fee_template_schema import FeeTemplateCreate, FeeTemplateUpdate
from app.models.class_fee_structure import ClassFeeStructure


class FeeTemplateService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_template(db: AsyncSession, *, template_id: int) -> Optional[FeeTemplate]:
        """
        Retrieves a single Fee Template by its ID, including its terms.
        """
        stmt = (
            select(FeeTemplate)
            .where(FeeTemplate.id == template_id)
            .options(selectinload(FeeTemplate.fee_terms)) # Eager load terms
        )
        result = await db.execute(stmt)
        return result.scalars().first()


    async def get_all_templates(db: AsyncSession, school_id: int) -> list[FeeTemplate]:
        """
        Retrieves all Fee Templates for a specific school, including their terms.
        """
        stmt = (
            select(FeeTemplate)
            .where(FeeTemplate.school_id == school_id)
            .options(selectinload(FeeTemplate.fee_terms)) # Eager load terms
            .order_by(FeeTemplate.start_date.desc(), FeeTemplate.name) # Added name ordering
        )
        result = await db.execute(stmt)
        # Ensure it returns a list
        templates = result.scalars().all()
        return list(templates)


    async def update_template(
        db: AsyncSession, *, db_obj: FeeTemplate, obj_in: FeeTemplateUpdate
    ) -> FeeTemplate:
        """
        Updates an existing Fee Template.
        Note: This basic version doesn't handle updating/adding/deleting terms.
        A more complex implementation would be needed for that.
        """
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Simple attribute updates
        for field, value in update_data.items():
            if hasattr(db_obj, field): # Check if the attribute exists
                setattr(db_obj, field, value)
                
        # If handling term updates, logic would go here:
        # - Compare incoming terms with existing terms
        # - Add new terms
        # - Update existing terms
        # - Delete terms not present in incoming data (if allowed)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        # Re-fetch to ensure relationships are loaded correctly if needed
        # return await get_template(db=db, template_id=db_obj.id)
        return db_obj


    async def delete_template(db: AsyncSession, *, db_obj: FeeTemplate) -> None:
        """
        Deletes a Fee Template.
        Note: Use a soft delete (e.g., db_obj.status = 'Archived') in production
        and add checks to prevent deletion if the template is in use.
        """
        # Potential Check:
        is_assigned = await db.execute(select(ClassFeeStructure).where(ClassFeeStructure.fee_template_id == db_obj.id))
        if is_assigned.scalars().first():
            raise ValueError("Cannot delete fee template as it is assigned to one or more classes.")
        
        await db.delete(db_obj) # This should cascade delete terms due to relationship setup
        await db.commit()
        return None # Return None for successful deletion
