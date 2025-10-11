from decimal import Decimal

from pydantic import BaseModel


class InvoiceItemOut(BaseModel):
    id: int
    component_name: str
    amount: Decimal

    class Config:
        from_attributes = True
