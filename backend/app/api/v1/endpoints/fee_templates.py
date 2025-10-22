# backend/app/api/v1/endpoints/fee_templates.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.fee_template_schema import (
    FeeTemplateOut,
    FeeTemplateUpdate,
)
from app.services.fee_structure_service import FeeStructureService
from app.services.fee_template_service import FeeTemplateService

router = APIRouter()


async def get_fee_template_service(db: AsyncSession = Depends(get_db)):
    # If using functions directly:
    return FeeTemplateService(db)


@router.get(
    "/{school_id}",
    response_model=list[FeeTemplateOut],
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def get_all_fee_templates(school_id: int, db: AsyncSession = Depends(get_db)):
    """Get all fee templates for a specific school. Admin only."""
    return await get_fee_template_service.get_all_templates(db=db, school_id=school_id)


@router.get("/fee-templates/{template_id}", response_model=FeeTemplateOut, dependencies=[Depends(require_role("Admin"))])
async def get_fee_template_by_id(template_id: int, service: FeeStructureService = Depends(get_fee_template_service), current_user: Profile = Depends(get_current_user_profile)):
    """[Admin Only] Get a specific fee template by ID."""
    template = await service.get_fee_template_by_id(template_id=template_id)  # Assumes service has this method
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found")
    # School isolation check
    if template.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return template


@router.put("/{template_id}", response_model=FeeTemplateOut, dependencies=[Depends(require_role("Admin"))])
async def update_fee_template_by_id(
    template_id: int, template_in: FeeTemplateUpdate, service: FeeStructureService = Depends(get_fee_template_service), current_user: Profile = Depends(get_current_user_profile)  # Assumes FeeTemplateUpdate schema exists
):
    """[Admin Only] Update a fee template."""
    template = await service.get_fee_template_by_id(template_id=template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found")
    # School isolation check
    if template.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot update templates for other schools.")
    # Prevent changing school_id if present in update schema
    if hasattr(template_in, "school_id") and template_in.school_id is not None and template_in.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change template's school.")

    return await service.update_fee_template(db_obj=template, template_data=template_in)  # Assumes service has this method


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("Admin"))])
async def delete_fee_template_by_id(template_id: int, service: FeeStructureService = Depends(get_fee_template_service), current_user: Profile = Depends(get_current_user_profile)):
    """[Admin Only] Delete a fee template."""
    template = await service.get_fee_template_by_id(template_id=template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found")
    # School isolation check
    if template.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot delete templates for other schools.")

    # Add check for dependencies (e.g., if assigned to classes/invoices)
    # is_used = await service.is_template_in_use(template_id=template_id)
    # if is_used:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete fee template as it is currently in use.")

    await service.delete_fee_template(db_obj=template)  # Assumes service has this method
    return None
