from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import get_current_user
from app.core.security import require_role
from app.db.session import get_db
from app.models import User
from app.schemas.discount_schema import DiscountCreate, DiscountOut
from app.schemas.student_fee_discount_schema import StudentFeeDiscountCreate, StudentFeeDiscountOut
from app.services.discount_service import DiscountService

router = APIRouter()


def get_discount_service(db: AsyncSession = Depends(get_db)):
    return DiscountService(db)


@router.post("/templates", response_model=DiscountOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
def create_discount_template(
    discount_in: DiscountCreate,
    service: DiscountService = Depends(get_discount_service),
):
    """
    Create a new reusable discount template (e.g., "Scholarship").
    This is the endpoint an admin like Mr. Verma uses to populate the discount library [cite: 507-509].
    """
    return service.create_discount_template(discount_data=discount_in)


@router.get("/discounts/templates/school/{school_id}", response_model=list[DiscountOut])
async def get_discount_templates_for_school(
    school_id: int,
    service: DiscountService = Depends(get_discount_service),
):
    """Get all discount templates for a school."""
    return await service.get_discounts_by_school(school_id=school_id)


@router.post("/apply-to-student", response_model=StudentFeeDiscountOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
def apply_discount_to_student(
    application_in: StudentFeeDiscountCreate,
    request: Request,
    service: DiscountService = Depends(get_discount_service),
    current_user: User = Depends(get_current_user),
):
    """
    Apply a discount template to a specific student.
    This creates the link in the student_fee_discounts table [cite: 518-520].
    """
    return service.apply_discount_to_student(application_data=application_in, user_id=current_user.id, ip_address=request.client.host)


@router.get("/templates/school/{school_id}", response_model=list[DiscountOut])
def get_all_discount_templates_for_school(
    school_id: int,
    service: DiscountService = Depends(get_discount_service),
):
    """
    Retrieve all available discount templates for a specific school.
    """
    return service.get_discount_templates_by_school(school_id=school_id)
