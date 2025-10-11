# app/services/fee_structure_service.py

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.fee_component import FeeComponent
from app.models.fee_template import FeeTemplate
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
    def create_fee_template_with_terms(self, template_data: FeeTemplateCreate) -> FeeTemplate:
        template_dict = template_data.model_dump(exclude={"terms"})
        new_template = FeeTemplate(**template_dict)

        # Create term objects from the nested data
        for term_data in template_data.terms:
            new_term = FeeTerm(**term_data.model_dump())
            new_template.fee_terms.append(new_term)
        self.db.add(new_template)
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
        Implements the user story of assigning a fee template to a class.
        This finds all components in the template and creates the necessary
        class_fee_structure records.
        """
        # 1. Find the Fee Template to ensure it exists
        template = self.db.query(FeeTemplate).filter(FeeTemplate.id == assignment_data.template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Fee Template not found")

        # NOTE: The PDF mentions a `fee_template_components` table[cite: 1073].
        # Your current schema doesn't have this. For this to work, we must assume a
        # relationship exists linking templates to components. Let's pretend the `FeeTemplate`
        # model has a `fee_components` list.

        # In a real application, you would query the linker table here.
        # For now, we will simulate this with a placeholder.
        # This is a critical point where the code depends on the full DB schema from the PDF.

        # Let's assume a template has components with amounts.
        # A better model would have a `template_components` table with amounts.
        # e.g., template.components = [(component1, 50000), (component2, 2000)]

        # This service highlights the need for the full robust schema from the PDF.
        # Let's write the code assuming the relationship is there.

        # This is a conceptual example, as the models need the relationship defined.
        # for component in template.fee_components:
        #     new_assignment = ClassFeeStructure(
        #         class_id=assignment_data.class_id,
        #         component_id=component.id,
        #         academic_year_id=assignment_data.academic_year_id,
        #         amount=component.base_amount # Get amount from the component
        #     )
        #     self.db.add(new_assignment)

        # self.db.commit()
        # return {"detail": f"Template '{template.name}' assigned to class successfully."}

        # Since the model relationship is missing, let's provide a service that works with the current models.
        # The user will have to call it for each component.

        # new_assignments = []
        # This is a simplified logic. A real implementation needs the template->component link.
        # For now, we return a message indicating the next step.

        # Returning to the simpler, workable version for now.
        pass  # Leaving this empty to discuss the schema dependency.
