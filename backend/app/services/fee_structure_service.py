# app/services/fee_structure_service.py

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.class_fee_structure import ClassFeeStructure
from app.models.fee_component import FeeComponent
from app.models.fee_template import FeeTemplate
from app.models.fee_template_component import FeeTemplateComponent
from app.models.fee_term import FeeTerm
from app.schemas.class_fee_structure_schema import AssignTemplateToClassSchema
from app.schemas.fee_component_schema import FeeComponentCreate
from app.schemas.fee_template_schema import FeeTemplateCreate


class FeeStructureService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Fee Component Methods
    async def create_fee_component(self, component_data: FeeComponentCreate) -> FeeComponent:
        stmt = select(FeeComponent).where(and_(FeeComponent.school_id == component_data.school_id, FeeComponent.component_name.ilike(component_data.component_name)))
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Fee component '{component_data.component_name}' already exists in your school",
            )

        new_component = FeeComponent(**component_data.model_dump())
        self.db.add(new_component)
        await self.db.commit()
        await self.db.refresh(new_component)
        return new_component

    async def get_fee_components_by_school(self, school_id: int) -> list[FeeComponent]:
        stmt = select(FeeComponent).where(FeeComponent.school_id == school_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    # Fee Template and Term Methods
    async def create_fee_template(self, template_data: FeeTemplateCreate) -> FeeTemplate:
        """
        Creates a FeeTemplate, links its components, and async defines its payment terms
        all in a single, atomic transaction.
        """
        # 1. Separate the nested data from the main template data
        component_ids = template_data.component_ids
        terms_data = template_data.terms
        template_dict = template_data.model_dump(exclude={"component_ids", "terms"})

        # 2. Validate that all component IDs are valid for the given school
        if component_ids:
            stmt = select(FeeComponent.id).where(FeeComponent.id.in_(component_ids), FeeComponent.school_id == template_data.school_id)
            result = await self.db.execute(stmt)
            valid_component_ids = [row[0] for row in result.all()]
            if len(valid_component_ids) != len(component_ids):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or mismatched component IDs.")

        # 3. Create the main FeeTemplate record
        new_template = FeeTemplate(**template_dict)
        self.db.add(new_template)
        await self.db.flush()  # Use flush to get the new_template.id for relationships

        # 4. Create the links in the fee_template_components junction table
        if component_ids:
            for comp_id in component_ids:
                link = FeeTemplateComponent(fee_template_id=new_template.id, fee_component_id=comp_id)
                self.db.add(link)

        # 5. Create the FeeTerm records
        for term_model in terms_data:
            new_term = FeeTerm(**term_model.model_dump(), fee_template_id=new_template.id)
            self.db.add(new_term)

        new_template_id = new_template.id

        await self.db.commit()

        # --- THE CRITICAL FIX ---
        # Instead of just refreshing, re-query for the template and explicitly
        # load the 'fee_terms' relationship. This prevents the lazy load error.
        stmt = select(FeeTemplate).options(selectinload(FeeTemplate.fee_terms)).where(FeeTemplate.id == new_template_id)  # Eagerly load the terms
        result = await self.db.execute(stmt)
        created_template = result.scalars().first()

        return created_template

    async def get_fee_template_by_id(self, template_id: int) -> FeeTemplate:
        stmt = select(FeeTemplate).where(FeeTemplate.id == template_id)
        result = await self.db.execute(stmt)
        template = result.scalar_one_or_none()
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee template not found")
        return template

    async def get_fee_templates_by_school(self, school_id: int) -> list[FeeTemplate]:
        stmt = select(FeeTemplate).options(selectinload(FeeTemplate.fee_terms), selectinload(FeeTemplate.components)).where(FeeTemplate.school_id == school_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def assign_template_to_class(self, assignment_data: AssignTemplateToClassSchema) -> dict:
        """
        Implements the "Bulk Assignment" user story by using an explicit JOIN
        to avoid all async lazy-loading issues.
        """
        # --- THE DEFINITIVE FIX: Use an explicit JOIN ---
        # 1. Instead of loading the template and its relationships, we write a direct
        #    query to get the exact data we need: the component IDs and their base amounts.
        stmt = select(FeeComponent.id, FeeComponent.base_amount).join(FeeTemplateComponent, FeeTemplateComponent.fee_component_id == FeeComponent.id).where(FeeTemplateComponent.fee_template_id == assignment_data.template_id)
        result = await self.db.execute(stmt)
        components_to_assign = result.all()  # This gives a simple list of (id, amount) tuples

        if not components_to_assign:
            # Check if the template itself exists to give a clear error message
            template_exists = await self.db.get(FeeTemplate, assignment_data.template_id)
            if not template_exists:
                raise HTTPException(status_code=404, detail="Fee Template not found")
            return {"detail": "Template has no components to assign."}

        # 2. Iterate through the simple, pre-fetched data. No lazy loading can occur here.
        for component_id, base_amount in components_to_assign:
            existing_stmt = select(ClassFeeStructure).where(ClassFeeStructure.class_id == assignment_data.class_id, ClassFeeStructure.component_id == component_id, ClassFeeStructure.academic_year_id == assignment_data.academic_year_id)
            existing_result = await self.db.execute(existing_stmt)
            existing_assignment = existing_result.scalars().first()

            if not existing_assignment:
                new_assignment = ClassFeeStructure(class_id=assignment_data.class_id, component_id=component_id, academic_year_id=assignment_data.academic_year_id, amount=base_amount)
                self.db.add(new_assignment)

        await self.db.commit()
        template_name_result = await self.db.execute(select(FeeTemplate.name).where(FeeTemplate.id == assignment_data.template_id))
        template_name = template_name_result.scalar_one()
        return {"detail": f"Template '{template_name}' and its components have been assigned successfully."}
