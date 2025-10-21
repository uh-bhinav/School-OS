from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.invoice import Invoice
from app.schemas.invoice_schema import BulkInvoiceCreate, InvoiceCreate, InvoiceOut
from app.schemas.payment_schema import PaymentCreate, PaymentOut
from app.services import invoice_service  # Import the service module

router = APIRouter()


@router.post("/invoices/generate", response_model=InvoiceOut, status_code=201)
async def generate_new_invoice(
    invoice_in: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a new invoice for a student.
    The service will automatically calculate the amount due based on fees and discounts.
    """
    try:
        return await invoice_service.generate_invoice_for_student(db=db, obj_in=invoice_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/invoices/student/{student_id}", response_model=list[InvoiceOut])
async def get_student_invoices(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all active invoices for a specific student."""
    return await invoice_service.get_all_invoices_for_student(db=db, student_id=student_id)


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Invoice).options(selectinload(Invoice.items), selectinload(Invoice.payments)).where(Invoice.id == invoice_id, Invoice.is_active.is_(True))
    result = await db.execute(stmt)
    invoice = result.scalars().first()
    return invoice


@router.post("/invoices/payments", response_model=PaymentOut, status_code=201)
async def log_new_payment(
    payment_in: PaymentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Log a new payment against an invoice."""
    try:
        return await invoice_service.log_payment(db=db, obj_in=payment_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/invoices/generate-for-class", status_code=200)
async def generate_class_invoices(
    bulk_invoice_in: BulkInvoiceCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate invoices for all students in an entire class for a specific fee term.
    """
    try:
        result = await invoice_service.generate_invoices_for_class(db=db, obj_in=bulk_invoice_in)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
