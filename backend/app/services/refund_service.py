from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

# Import all necessary models and schemas
from app.models.payment import Payment
from app.models.refund import Refund
from app.schemas.refund_schema import RefundCreate


class RefundService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_refund(self, refund_data: RefundCreate) -> Refund:
        """
        Processes a refund against a successful payment, including validation checks.
        """
        # 1. Fetch the original payment to ensure it can be refunded.
        payment_stmt = select(Payment).where(Payment.id == refund_data.payment_id)
        payment_result = await self.db.execute(payment_stmt)
        payment = payment_result.scalars().first()

        if not payment:
            raise HTTPException(status_code=404, detail="Original payment transaction not found.")

        if payment.status != "captured":
            raise HTTPException(status_code=400, detail=f"Cannot refund a payment with status '{payment.status}'. Only 'captured' payments are refundable.")

        # 2. Calculate the total amount already refunded for this payment.
        refunded_stmt = select(func.sum(Refund.amount)).where(Refund.payment_id == refund_data.payment_id, Refund.status == "processed")
        refunded_result = await self.db.execute(refunded_stmt)
        already_refunded_amount = refunded_result.scalar_one_or_none() or Decimal("0.0")

        # 3. Determine the maximum refundable amount.
        refundable_amount = Decimal(payment.amount_paid) - already_refunded_amount

        # 4. Validate the requested refund amount.
        if refund_data.amount > refundable_amount:
            raise HTTPException(status_code=400, detail=f"Refund amount ({refund_data.amount}) exceeds the refundable amount ({refundable_amount}).")

        # 5. Create the new refund record with a 'pending' status.
        # In the full Razorpay integration, this is where you would call the Razorpay API.
        # If the API call is successful, you would then save this record with a 'processed' status.
        new_refund = Refund(**refund_data.model_dump())
        self.db.add(new_refund)
        await self.db.commit()
        await self.db.refresh(new_refund)

        return new_refund
