# backend/app/services/invoice_service.py (Fixed Logic and Style)
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.invoice import Invoice
from app.schemas.invoice_schema import InvoiceCreate, InvoiceUpdate


async def create_invoice(db: AsyncSession, *, obj_in: InvoiceCreate) -> Invoice:
    db_obj = Invoice(**obj_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_invoice(db: AsyncSession, invoice_id: int) -> Optional[Invoice]:
    """Retrieves an active invoice (READ FILTER APPLIED)."""
    # FIX: Replaced '== True' with the idiomatic SQLAlchemy 'is_(True)'
    stmt = select(Invoice).where(Invoice.id == invoice_id, Invoice.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_invoices_for_student(
    db: AsyncSession, student_id: int
) -> list[Invoice]:
    """Retrieves all active invoices for a student (READ FILTER APPLIED)."""
    stmt = (
        select(Invoice)
        # FIX: Replaced '== True' with the idiomatic SQLAlchemy 'is_(True)'
        .where(Invoice.student_id == student_id, Invoice.is_active.is_(True)).order_by(
            Invoice.due_date.desc()
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_invoice(
    db: AsyncSession, *, db_obj: Invoice, obj_in: InvoiceUpdate
) -> Invoice:
    """Updates invoice details."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_invoice(db: AsyncSession, *, db_obj: Invoice):
    """Deactivates an invoice (SOFT DELETE IMPLEMENTED)."""
    db_obj.is_active = False  # Set the flag to False
    db.add(db_obj)  # Mark the object as modified
    await db.commit()  # Save the change
