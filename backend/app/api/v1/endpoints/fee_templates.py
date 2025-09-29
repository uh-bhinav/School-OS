# backend/app/api/v1/endpoints/fee_templates.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_db
from app.schemas.fee_template_schema import (
    FeeTemplateCreate,
    FeeTemplateOut,
    FeeTemplateUpdate,
)
from app.services import fee_template_service

router = APIRouter()


@router.post(
    "/",
    response_model=FeeTemplateOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def create_new_fee_template(
    year_in: FeeTemplateCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new fee structure template. Admin only."""
    return await fee_template_service.create_template(db=db, obj_in=year_in)


@router.get(
    "/{school_id}",
    response_model=list[FeeTemplateOut],
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def get_all_fee_templates(school_id: int, db: AsyncSession = Depends(get_db)):
    """Get all fee templates for a specific school. Admin only."""
    return await fee_template_service.get_all_templates(db=db, school_id=school_id)


# NOTE: You must also create endpoints for GET /{id},
#  PUT /{id}, and DELETE /{id}
# following the pattern established in the classes module.
# backend/app/api/v1/endpoints/fee_templates.py
#  (Add the following to your existing file)


@router.get(
    "/{template_id}",
    response_model=FeeTemplateOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def get_fee_template_by_id(template_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific fee template by its ID. Admin only.
    """
    template = await fee_template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found"
        )
    return template


@router.put(
    "/{template_id}",
    response_model=FeeTemplateOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def update_fee_template_by_id(
    template_id: int, template_in: FeeTemplateUpdate, db: AsyncSession = Depends(get_db)
):
    """
    Update a fee template (e.g., change name or status). Admin only.
    """
    template = await fee_template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found"
        )

    return await fee_template_service.update_template(
        db=db, db_obj=template, obj_in=template_in
    )


@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def delete_fee_template_by_id(
    template_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Delete a fee template. Admin only (Use with caution in production).
    """
    template = await fee_template_service.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fee Template not found"
        )

    await fee_template_service.delete_template(db=db, db_obj=template)
    # Note: In a real system, you would check if this
    # template is linked to any active invoices before deleting.
    return None  # FastAPI sends 204 No Content for successful DELETE with no body.
