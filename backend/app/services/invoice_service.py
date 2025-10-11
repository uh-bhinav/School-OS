from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.fee_term import FeeTerm

# ADDED: Import necessary models and schemas for calculations
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.student_fee_discount import FeeDiscount
from app.schemas.invoice_schema import InvoiceCreate, InvoiceUpdate
from app.schemas.payment_schema import PaymentCreate  # Assuming schema is in its own file


async def get_invoice(db: AsyncSession, invoice_id: int) -> Optional[Invoice]:
    """Retrieves an active invoice (READ FILTER APPLIED)."""
    stmt = select(Invoice).where(Invoice.id == invoice_id, Invoice.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_invoices_for_student(db: AsyncSession, student_id: int) -> list[Invoice]:
    """Retrieves all active invoices for a student (READ FILTER APPLIED)."""
    stmt = select(Invoice).where(Invoice.student_id == student_id, Invoice.is_active.is_(True)).order_by(Invoice.due_date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_invoice(db: AsyncSession, *, db_obj: Invoice, obj_in: InvoiceUpdate) -> Invoice:
    """Updates invoice details."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# ADDED: A function to log payments against an invoice
async def log_payment(db: AsyncSession, *, obj_in: PaymentCreate) -> Payment:
    """Logs a payment record against a specific invoice."""
    # First, verify the invoice exists
    invoice = await get_invoice(db, obj_in.invoice_id)
    if not invoice:
        raise ValueError("Invoice not found to log payment against")

    db_payment = Payment(**obj_in.model_dump())
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment


async def delete_invoice(db: AsyncSession, *, db_obj: Invoice):
    """Deactivates an invoice (SOFT DELETE IMPLEMENTED)."""
    db_obj.is_active = False
    db.add(db_obj)
    await db.commit()


async def generate_invoice_for_student(db: AsyncSession, *, obj_in: InvoiceCreate) -> Invoice:
    """
    Generates a new invoice for a student based on a fee term, automatically
    calculating the final amount due by applying all relevant discounts.
    """
    # 1. Fetch the Fee Term to get the base amount and due date [cite: 972-974]
    term_stmt = select(FeeTerm).where(FeeTerm.id == obj_in.fee_term_id)
    term_result = await db.execute(term_stmt)
    fee_term = term_result.scalars().first()
    if not fee_term:
        raise ValueError("Fee term not found, cannot generate invoice.")

    base_amount = Decimal(fee_term.amount)

    # 2. Find and sum all discounts applied to this student for this term [cite: 998, 1085]
    discount_stmt = select(func.sum(FeeDiscount.amount)).where(
        FeeDiscount.student_id == obj_in.student_id,
        FeeDiscount.fee_term_id == obj_in.fee_term_id,
    )
    discount_result = await db.execute(discount_stmt)
    total_discount = discount_result.scalar_one_or_none() or Decimal("0.0")

    # 3. Calculate the final amount due [cite: 1091]
    amount_due = base_amount - total_discount
    if amount_due < 0:
        amount_due = Decimal("0.0")

    # 4. Generate a unique invoice number
    invoice_number = f"INV-{date.today().year}-{obj_in.student_id}-{obj_in.fee_term_id}"

    # 5. Create the invoice object with the calculated data [cite: 1092]
    db_obj = Invoice(
        student_id=obj_in.student_id,
        fee_term_id=obj_in.fee_term_id,
        fee_structure_id=fee_term.fee_template_id,
        invoice_number=invoice_number,
        due_date=fee_term.due_date,
        amount_due=amount_due,
        status="due",
        # This assumes your Invoice model has an is_active field
        is_active=True,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
