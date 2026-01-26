# app/schemas/fee_component.py

from typing import Optional

from pydantic import BaseModel


class FeeComponentBase(BaseModel):
    component_name: str
    component_type: str
    base_amount: Optional[float] = None
    is_mandatory: bool = True
    payment_frequency: str = "Annual"


class FeeComponentCreate(FeeComponentBase):
    school_id: int


class FeeComponentUpdate(FeeComponentBase):
    component_name: Optional[str] = None
    component_type: Optional[str] = None


class FeeComponentOut(FeeComponentBase):
    id: int
    school_id: int

    class Config:
        from_attributes = True
