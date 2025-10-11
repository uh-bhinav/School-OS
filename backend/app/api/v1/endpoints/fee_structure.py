from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.fee_component_schema import FeeComponentCreate, FeeComponentOut
from app.schemas.fee_template_schema import FeeTemplateCreate, FeeTemplateOut
from app.services.fee_structure_service import FeeStructureService

router = APIRouter()


def get_fee_structure_service(db: AsyncSession = Depends(get_db)):
    return FeeStructureService(db)


@router.post("/fee-components", response_model=FeeComponentOut, status_code=201)
async def create_fee_component(
    component_in: FeeComponentCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Create a new fee component (e.g., 'Tuition Fee')."""
    return await service.create_fee_component(component_data=component_in)


@router.get("/fee-components/school/{school_id}", response_model=List[FeeComponentOut])
async def get_fee_components_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Get all fee components for a specific school."""
    return await service.get_fee_components_by_school(school_id=school_id)


@router.post("/fee-templates", response_model=FeeTemplateOut, status_code=201)
async def create_fee_template(
    template_in: FeeTemplateCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Create a new fee template with its associated payment terms."""
    return await service.create_fee_template_with_terms(template_data=template_in)


@router.get("/fee-templates/school/{school_id}", response_model=List[FeeTemplateOut])
async def get_fee_templates_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
):
    """Get all fee templates for a specific school."""
    return await service.get_fee_templates_by_school(school_id=school_id)
