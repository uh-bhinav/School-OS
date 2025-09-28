# backend/app/api/v1/endpoints/invoices.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role  # Assuming this is available
from app.db.session import get_db
from app.schemas.invoice_schema import InvoiceCreate, InvoiceOut, InvoiceUpdate
from app.services import invoice_service

router = APIRouter()


@router.post(
    "/",
    response_model=InvoiceOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def create_new_invoice(
    invoice_in: InvoiceCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new invoice. Admin only (used for bulk generation)."""
    return await invoice_service.create_invoice(db=db, obj_in=invoice_in)


@router.get(
    "/student/{student_id}",
    response_model=list[InvoiceOut],
    dependencies=[
        Depends(require_role("Parent"))
    ],  # RLS will enforce multi-tenancy and ownership
    tags=["Fee Management"],
)
async def get_invoices_for_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """Get all invoices for a specific student.
    Parent/Student access enforced by RLS."""
    return await invoice_service.get_all_invoices_for_student(
        db=db, student_id=student_id
    )


# NOTE: You should also implement endpoints
#  for GET /{id}, PUT /{id}, and DELETE /{id}
# for full administrative control and management.
# backend/app/api/v1/endpoints/invoices.py
# (Add the following to your existing file)


@router.get(
    "/{invoice_id}",
    response_model=InvoiceOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def get_invoice_by_id(invoice_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific invoice by its ID. Admin only.
    """
    invoice = await invoice_service.get_invoice(db=db, invoice_id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found"
        )
    return invoice


@router.put(
    "/{invoice_id}",
    response_model=InvoiceOut,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def update_invoice_by_id(
    invoice_id: int, invoice_in: InvoiceUpdate, db: AsyncSession = Depends(get_db)
):
    """
    Update an invoice (e.g., change status t
    o 'Paid' after manual payment). Admin only.
    """
    invoice = await invoice_service.get_invoice(db=db, invoice_id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found"
        )

    return await invoice_service.update_invoice(
        db=db, db_obj=invoice, obj_in=invoice_in
    )


@router.delete(
    "/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))],
    tags=["Fee Management"],
)
async def delete_invoice_by_id(invoice_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete an invoice. Admin only
      (typically used for correction/error reversal).
    """
    invoice = await invoice_service.get_invoice(db=db, invoice_id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found"
        )

    # In a production environment, this would likely be a status change to 'Cancelled'.
    await invoice_service.delete_invoice(db=db, db_obj=invoice)
    return None
