from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.discount_schema import DiscountCreate, DiscountOut
from app.schemas.student_fee_discount_schema import FeeDiscountCreate, FeeDiscountOut
from app.services.discount_service import DiscountService

router = APIRouter()


def get_discount_service(db: AsyncSession = Depends(get_db)):
    return DiscountService(db)


@router.post("/discounts/templates", response_model=DiscountOut, status_code=201)
async def create_discount_template(
    discount_in: DiscountCreate,
    service: DiscountService = Depends(get_discount_service),
):
    """Create a new reusable discount template."""
    return await service.create_discount(discount_data=discount_in)


@router.get("/discounts/templates/school/{school_id}", response_model=List[DiscountOut])
async def get_discount_templates_for_school(
    school_id: int,
    service: DiscountService = Depends(get_discount_service),
):
    """Get all discount templates for a school."""
    return await service.get_discounts_by_school(school_id=school_id)


@router.post("/discounts/apply", response_model=FeeDiscountOut, status_code=201)
async def apply_discount(
    application_in: FeeDiscountCreate,
    service: DiscountService = Depends(get_discount_service),
):
    """Apply a specific discount amount to a student for a fee term."""
    return await service.apply_discount_to_student(application_data=application_in)
