# app/services/fee_structure_service.py

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.class_fee_structure import ClassFeeStructure
from app.models.fee_component import FeeComponent
from app.models.fee_template import FeeTemplate
from app.models.fee_template_component import FeeTemplateComponent
from app.models.fee_term import FeeTerm
from app.schemas.class_fee_structure_schema import AssignTemplateToClassSchema
from app.schemas.fee_component_schema import FeeComponentCreate
from app.schemas.fee_template_schema import FeeTemplateCreate


class FeeStructureService:
    def __init__(self, db: Session):
        self.db = db

    # Fee Component Methods
    def create_fee_component(self, component_data: FeeComponentCreate) -> FeeComponent:
        new_component = FeeComponent(**component_data.model_dump())
        self.db.add(new_component)
        self.db.commit()
        self.db.refresh(new_component)
        return new_component

    def get_fee_components_by_school(self, school_id: int) -> List[FeeComponent]:
        return self.db.query(FeeComponent).filter(FeeComponent.school_id == school_id).all()

    # Fee Template and Term Methods
    def create_fee_template(self, template_data: FeeTemplateCreate) -> FeeTemplate:
        """
        Creates a FeeTemplate, links its components, and defines its payment terms
        all in a single, atomic transaction.
        """
        # 1. Separate the nested data from the main template data
        component_ids = template_data.component_ids
        terms_data = template_data.terms
        template_dict = template_data.model_dump(exclude={"component_ids", "terms"})

        # 2. Validate that all component IDs are valid for the given school
        if component_ids:
            valid_components_count = self.db.query(FeeComponent).filter(FeeComponent.id.in_(component_ids), FeeComponent.school_id == template_data.school_id).count()
            if valid_components_count != len(component_ids):
                raise HTTPException(status_code=400, detail="Invalid or mismatched component IDs.")

        # 3. Create the main FeeTemplate record
        new_template = FeeTemplate(**template_dict)
        self.db.add(new_template)
        self.db.flush()  # Use flush to get the new_template.id for relationships

        # 4. Create the links in the fee_template_components junction table
        for comp_id in component_ids:
            link = FeeTemplateComponent(fee_template_id=new_template.id, fee_component_id=comp_id)
            self.db.add(link)

        # 5. Create the FeeTerm records
        for term_model in terms_data:
            new_term = FeeTerm(**term_model.model_dump(), fee_template_id=new_template.id)
            self.db.add(new_term)

        self.db.commit()
        self.db.refresh(new_template)
        return new_template

    def get_fee_template_by_id(self, template_id: int) -> FeeTemplate:
        template = self.db.query(FeeTemplate).filter(FeeTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee template not found")
        return template

    def get_fee_templates_by_school(self, school_id: int) -> List[FeeTemplate]:
        return self.db.query(FeeTemplate).filter(FeeTemplate.school_id == school_id).all()

    def assign_template_to_class(self, assignment_data: AssignTemplateToClassSchema):
        """
        Implements the "Bulk Assignment" user story[cite: 1572].
        Assigns all components from a fee template to a class for a given academic year.
        """
        # 1. Fetch the template using its relationship to get all its components
        template = self.db.query(FeeTemplate).filter(FeeTemplate.id == assignment_data.template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Fee Template not found")

        # 2. Iterate through the components linked to the template
        for component in template.components:
            # 3. Check if this specific assignment already exists to avoid duplicates
            existing_assignment = self.db.query(ClassFeeStructure).filter_by(class_id=assignment_data.class_id, component_id=component.id, academic_year_id=assignment_data.academic_year_id).first()

            if not existing_assignment:
                # 4. Create a new record in class_fee_structure for each component
                new_assignment = ClassFeeStructure(
                    class_id=assignment_data.class_id,
                    component_id=component.id,
                    academic_year_id=assignment_data.academic_year_id,
                    # The amount is copied from the component's default amount
                    amount=component.base_amount,
                )
                self.db.add(new_assignment)

        self.db.commit()
        return {"detail": f"Template '{template.name}' and its components have been assigned successfully."}
