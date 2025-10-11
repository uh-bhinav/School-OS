from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

# CHANGE: Import the schemas for FeeTerm to use for nesting
from app.schemas.fee_term_schema import FeeTermCreate, FeeTermOut


# Properties to receive on creation
class FeeTemplateCreate(BaseModel):
    school_id: int = Field(..., description="The ID of the school this fee structure belongs to.")
    academic_year_id: int
    name: str
    description: Optional[str] = None
    # CHANGE: Removed total_amount. It should be derived from the sum of terms, not set directly.
    status: str = "Draft"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    # CHANGE: Added a list to accept fee terms. Using built-in 'list' as requested.
    terms: list[FeeTermCreate] = []


# Properties to receive on update
class FeeTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    # Note: Updating total_amount is now handled by updating the individual terms.
    status: Optional[str] = None


# Properties to return to the client
class FeeTemplateOut(BaseModel):
    id: int
    school_id: int
    academic_year_id: int
    name: str
    # This total_amount should now be a calculated property on your SQLAlchemy model
    total_amount: float
    status: str

    # CHANGE: Added the list of fee terms to the output
    fee_terms: list[FeeTermOut] = []

    class Config:
        from_attributes = True
