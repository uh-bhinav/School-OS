# backend/app/services/invoice_service.py
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
    stmt = select(Invoice).where(Invoice.id == invoice_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_invoices_for_student(
    db: AsyncSession, student_id: int
) -> list[Invoice]:
    # This endpoint is used by Parents/Students to view their history
    stmt = (
        select(Invoice)
        .where(Invoice.student_id == student_id)
        .order_by(Invoice.due_date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_invoice(
    db: AsyncSession, *, db_obj: Invoice, obj_in: InvoiceUpdate
) -> Invoice:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_invoice(db: AsyncSession, *, db_obj: Invoice):
    # Admin only function, possibly used to correct errors
    await db.delete(db_obj)
    await db.commit()
