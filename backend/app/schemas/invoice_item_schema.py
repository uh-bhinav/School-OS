from decimal import Decimal

from pydantic import BaseModel


class InvoiceItemOut(BaseModel):
    id: int
    component_name: str

    original_amount: Decimal
    discount_amount: Decimal
    final_amount: Decimal

    class Config:
        from_attributes = True
