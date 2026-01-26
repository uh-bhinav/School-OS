from decimal import Decimal

from pydantic import BaseModel


class AppliedDiscountCreate(BaseModel):
    invoice_id: int
    discount_id: int
    amount_discounted: Decimal
