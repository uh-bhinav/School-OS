from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.schemas.class_fee_structure_schema import AssignTemplateToClassSchema
from app.schemas.fee_component_schema import FeeComponentCreate, FeeComponentOut
from app.schemas.fee_template_schema import FeeTemplateCreate, FeeTemplateOut
from app.services.fee_structure_service import FeeStructureService

router = APIRouter()


def get_fee_structure_service(db: AsyncSession = Depends(get_db)):
    return FeeStructureService(db)


@router.post("/fee-components", response_model=FeeComponentOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def create_fee_component(
    component_in: FeeComponentCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Create a new fee component (e.g., 'Tuition Fee')."""
    return await service.create_fee_component(component_data=component_in)


@router.get("/fee-components/school/{school_id}", response_model=list[FeeComponentOut], dependencies=[Depends(get_current_user_profile)])
async def get_fee_components_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Get all fee components for a specific school."""
    return await service.get_fee_components_by_school(school_id=school_id)


@router.post("/fee-templates", response_model=FeeTemplateOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def create_fee_template(
    template_in: FeeTemplateCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Create a new fee template with its associated payment terms."""
    return await service.create_fee_template(template_data=template_in)


@router.get("/fee-templates/school/{school_id}", response_model=list[FeeTemplateOut], dependencies=[Depends(get_current_user_profile)])
async def get_fee_templates_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Get all fee templates for a specific school."""
    return await service.get_fee_templates_by_school(school_id=school_id)


@router.post("/assign-template-to-class", status_code=200, dependencies=[Depends(require_role("Admin"))])
async def assign_template_to_class(
    assignment_in: AssignTemplateToClassSchema,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """
    Assign a fee template to a class for an academic year.
    This sets the default fees for all students in that class.
    """
    return await service.assign_template_to_class(assignment_data=assignment_in)
