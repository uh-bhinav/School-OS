# app/services/discount_service.py

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.discount import Discount
from app.models.student_fee_discount import StudentFeeDiscount
from app.schemas.audit_schema import AuditCreate
from app.schemas.discount_schema import DiscountCreate
from app.schemas.student_fee_discount_schema import StudentFeeDiscountCreate
from app.services import audit_service


class DiscountService:
    def __init__(self, db: Session):
        self.db = db

    # --- Methods for Discount Templates ---

    def create_discount_template(self, discount_data: DiscountCreate) -> Discount:
        """
        Creates a new reusable discount template in the master 'discounts' table.
        This corresponds to an admin defining a new discount type .
        """
        # Check for duplicate discount name within the same school
        existing = self.db.query(Discount).filter_by(school_id=discount_data.school_id, name=discount_data.name).first()
        if existing:
            raise HTTPException(status_code=409, detail="A discount with this name already exists for this school.")

        new_discount = Discount(**discount_data.model_dump())
        self.db.add(new_discount)
        self.db.commit()
        self.db.refresh(new_discount)
        return new_discount

    def get_discount_by_id(self, discount_id: int) -> Discount:
        """Fetches a single discount template by its ID."""
        discount = self.db.query(Discount).filter(Discount.id == discount_id).first()
        if not discount:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount template not found")
        return discount

    def get_discounts_by_school(self, school_id: int) -> list[Discount]:
        """Fetches all discount templates for a given school."""
        return self.db.query(Discount).filter(Discount.school_id == school_id).all()

    # --- Methods for Applying Discounts ---

    def apply_discount_to_student(self, *, application_data: StudentFeeDiscountCreate, user_id: UUID, ip_address: str) -> StudentFeeDiscount:
        """
        Applies a discount template to a student by creating a record
        in the 'student_fee_discounts' link table [cite: 1028-1030].
        """
        # Check if the link already exists
        existing_link = self.db.query(StudentFeeDiscount).filter_by(student_id=application_data.student_id, discount_id=application_data.discount_id).first()
        if existing_link:
            raise HTTPException(status_code=409, detail="This discount is already applied to this student.")

        # You might add further validation here to ensure student and discount IDs are valid

        new_application = StudentFeeDiscount(**application_data.model_dump())
        self.db.add(new_application)
        self.db.flush()

        # Create the audit log for this action
        audit_log = AuditCreate(user_id=user_id, action_type="CREATE", table_name="student_fee_discounts", record_id=str(new_application.id), ip_address=ip_address, new_data=application_data.model_dump())
        audit_service.create_audit_log(db=self.db, audit_data=audit_log)

        self.db.commit()
        self.db.refresh(new_application)
        return new_application

    def get_discounts_for_student(self, student_id: int) -> list[StudentFeeDiscount]:
        """Gets all specific discounts applied to a student."""
        return self.db.query(StudentFeeDiscount).filter(StudentFeeDiscount.student_id == student_id).all()

    def get_discount_templates_by_school(self, school_id: int) -> list[Discount]:
        """
        Retrieves all active discount templates for a given school.
        """
        return self.db.query(Discount).filter(Discount.school_id == school_id, Discount.is_active.is_(True)).all()
