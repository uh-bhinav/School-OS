# app/services/discount_service.py

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.discount import Discount
from app.models.student_fee_discount import StudentFeeDiscount
from app.schemas.audit_schema import AuditCreate
from app.schemas.discount_schema import DiscountCreate
from app.schemas.student_fee_discount_schema import StudentFeeDiscountCreate
from app.services import audit_service


class DiscountService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # --- Methods for Discount Templates ---

    async def create_discount_template(self, discount_data: DiscountCreate) -> Discount:
        """
        Creates a new reusable discount template in the master 'discounts' table.
        """
        # --- FIX: Convert to async query pattern ---
        stmt = select(Discount).where(Discount.school_id == discount_data.school_id, Discount.name == discount_data.name)
        result = await self.db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            raise HTTPException(status_code=409, detail="A discount with this name already exists for this school.")

        new_discount = Discount(**discount_data.model_dump())
        self.db.add(new_discount)

        # --- FIX: Await database operations ---
        await self.db.commit()
        await self.db.refresh(new_discount)

        return new_discount

    async def get_discount_by_id(self, discount_id: int) -> Discount:
        """Fetches a single discount template by its ID."""
        discount = self.db.query(Discount).filter(Discount.id == discount_id).first()
        if not discount:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount template not found")
        return discount

    async def get_discounts_by_school(self, school_id: int) -> list[Discount]:
        """Fetches all discount templates for a given school."""
        return self.db.query(Discount).filter(Discount.school_id == school_id).all()

    # --- Methods for Applying Discounts ---

    async def apply_discount_to_student(self, *, application_data: StudentFeeDiscountCreate, user_id: UUID, ip_address: str) -> StudentFeeDiscount:
        """
        Applies a discount template to a student by creating a record
        in the 'student_fee_discounts' link table and logs the action.
        """
        # --- Step 1: Check if discount is already applied ---
        stmt = select(StudentFeeDiscount).where(StudentFeeDiscount.student_id == application_data.student_id, StudentFeeDiscount.discount_id == application_data.discount_id)
        result = await self.db.execute(stmt)
        existing_link = result.scalars().first()

        if existing_link:
            raise HTTPException(status_code=409, detail="This discount is already applied to this student.")

        # --- Step 2: Create new discount link ---
        new_application = StudentFeeDiscount(**application_data.model_dump(), applied_by_user_id=user_id)  # Set the required field from the function argument
        self.db.add(new_application)
        await self.db.flush()  # Ensure ID is available before logging

        # --- Step 3: Create audit log entry ---
        audit_log = AuditCreate(
            user_id=user_id,
            action_type="CREATE",
            table_name="student_fee_discounts",
            record_id=str(new_application.id),
            ip_address=ip_address,
            new_data=application_data.model_dump(),
        )
        await audit_service.create_audit_log(db=self.db, audit_data=audit_log)

        # --- Step 4: Commit and refresh ---
        await self.db.commit()
        await self.db.refresh(new_application)
        return new_application

    async def get_discounts_for_student(self, student_id: int) -> list[StudentFeeDiscount]:
        """Gets all specific discounts applied to a student."""
        return self.db.query(StudentFeeDiscount).filter(StudentFeeDiscount.student_id == student_id).all()

    async def get_discount_templates_by_school(self, school_id: int) -> list[Discount]:
        """
        Retrieves all active discount templates for a given school.
        """
        return self.db.query(Discount).filter(Discount.school_id == school_id, Discount.is_active.is_(True)).all()
