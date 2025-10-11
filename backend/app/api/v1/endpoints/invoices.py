from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.invoice_schema import InvoiceCreate, InvoiceOut
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


@router.get("/invoices/student/{student_id}", response_model=List[InvoiceOut])
async def get_student_invoices(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all active invoices for a specific student."""
    return await invoice_service.get_all_invoices_for_student(db=db, student_id=student_id)


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
async def get_single_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single invoice by its ID."""
    invoice = await invoice_service.get_invoice(db=db, invoice_id=invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
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
