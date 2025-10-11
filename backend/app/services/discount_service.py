# app/services/discount_service.py

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Discount, FeeDiscount
from app.schemas.discount_schema import DiscountCreate
from app.schemas.student_fee_discount_schema import FeeDiscountCreate


class DiscountService:
    def __init__(self, db: Session):
        self.db = db

    # --- Methods for Discount Templates ---

    def create_discount(self, discount_data: DiscountCreate) -> Discount:
        """Creates a new reusable discount template."""
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

    def apply_discount_to_student(self, application_data: FeeDiscountCreate) -> FeeDiscount:
        """Applies a specific discount amount to a student for a fee term."""
        # You might add validation here to ensure student_id and fee_term_id are valid
        new_applied_discount = FeeDiscount(**application_data.model_dump())
        self.db.add(new_applied_discount)
        self.db.commit()
        self.db.refresh(new_applied_discount)
        return new_applied_discount

    def get_discounts_for_student(self, student_id: int) -> list[FeeDiscount]:
        """Gets all specific discounts applied to a student."""
        return self.db.query(FeeDiscount).filter(FeeDiscount.student_id == student_id).all()
