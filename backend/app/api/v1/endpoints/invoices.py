from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

import app.models.profile as Profile
from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.models.class_model import Class
from app.models.invoice import Invoice
from app.models.student import Student
from app.models.student_contact import StudentContact
from app.schemas.invoice_schema import BulkInvoiceCreate, InvoiceCreate, InvoiceOut
from app.schemas.payment_schema import PaymentCreate, PaymentOut
from app.services import invoice_service  # Import the service module

router = APIRouter()


@router.post("/invoices/generate", response_model=InvoiceOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def generate_new_invoice(invoice_in: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: Profile = Depends(get_current_user_profile)):
    """
    Generate a new invoice for a student.
    The service will automatically calculate the amount due based on fees and discounts.
    """
    target_student = await db.get(Student, invoice_in.student_id, options=[joinedload(Student.profile)])
    if not target_student or not target_student.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student or student profile not found")

    if target_student.profile.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot generate invoices for students in other schools.")

    try:
        return await invoice_service.generate_invoice_for_student(db=db, obj_in=invoice_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/invoices/student/{student_id}", response_model=list[InvoiceOut])
async def get_student_invoices(student_id: int, db: AsyncSession = Depends(get_db), current_user: Profile = Depends(get_current_user_profile)):
    """
    Get all active invoices for a specific student.
    Applies application-level authorization check + relies on RLS (if applicable).
    """

    # --- APPLICATION-LEVEL AUTHORIZATION CHECK ---
    # 1. Get the target student's user_id with profile eagerly loaded
    stmt = select(Student).options(selectinload(Student.profile)).where(Student.student_id == student_id)
    result = await db.execute(stmt)
    target_student = result.scalars().first()
    if not target_student:
        # If the student doesn't exist, we can just return an empty list
        # or a 404, depending on desired behavior. Empty list is safer.
        return []

    target_student_user_id = target_student.user_id

    # 2. Check if the current user IS the target student
    is_self = current_user.user_id == target_student_user_id

    # 3. Check if the current user is a parent contact for the target student
    is_parent_contact_stmt = select(StudentContact).where(StudentContact.student_id == student_id).where(StudentContact.profile_user_id == current_user.user_id)
    result = await db.execute(is_parent_contact_stmt)
    is_parent = result.scalars().first() is not None

    # 4. Check if the user is an Admin (Admins might be allowed to see all)
    #    Adjust this role name if needed.
    is_admin = any(role.role_definition.role_name == "Admin" for role in current_user.roles)

    if is_admin and target_student.profile.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot view invoices for students in other schools.")
    # 5. Enforce the rule: Allow if self OR parent OR admin
    if not (is_self or is_parent or is_admin):
        # Using 403 Forbidden is appropriate here because the user is authenticated,
        # but not authorized for this specific student's data.
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view invoices for this student.")
    # --- END AUTHORIZATION CHECK ---

    # If the check passes, proceed to fetch invoices.
    # RLS might still apply additional filtering if connection role changes.
    invoices = await invoice_service.get_all_invoices_for_student(db=db, student_id=student_id)

    return invoices


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_db),
    # --- THIS IS THE CRITICAL FIX ---
    # Add the dependency to ensure the user is authenticated
    # and their context is available for RLS.
    current_user: Profile = Depends(get_current_user_profile),
):
    """
    Get a specific invoice by ID.
    Applies application-level authorization check + relies on RLS (if applicable).
    """
    stmt = select(Invoice).options(
        selectinload(Invoice.items),
        selectinload(Invoice.payments),
        selectinload(Invoice.student).selectinload(Student.profile)
    ).where(Invoice.id == invoice_id, Invoice.is_active.is_(True))
    result = await db.execute(stmt)
    invoice = result.scalars().first()

    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    if not invoice.student or not invoice.student.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student or profile associated with invoice not found")

    target_student_user_id = invoice.student.user_id

    is_self = current_user.user_id == target_student_user_id

    is_parent_contact_stmt = select(StudentContact).where(StudentContact.student_id == invoice.student_id).where(StudentContact.profile_user_id == current_user.user_id)
    parent_result = await db.execute(is_parent_contact_stmt)
    is_parent = parent_result.scalars().first() is not None

    is_admin = any(role.role_definition.role_name == "Admin" for role in current_user.roles)

    # Allow if self OR parent OR admin
    if not (is_self or is_parent or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view this invoice.")
    # --- END CHECK ---

    return invoice


@router.post("/invoices/payments", response_model=PaymentOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def log_new_payment(payment_in: PaymentCreate, db: AsyncSession = Depends(get_db), current_user: Profile = Depends(get_current_user_profile)):
    """Log a new payment against an invoice."""
    target_invoice = await db.get(Invoice, payment_in.invoice_id, options=[joinedload(Invoice.student).joinedload(Student.profile)])
    if not target_invoice or not target_invoice.student or not target_invoice.student.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice or associated student/profile not found")

    if target_invoice.student.profile.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot log payments for invoices in other schools.")

    try:
        return await invoice_service.log_payment(db=db, obj_in=payment_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/invoices/generate-for-class", status_code=200, dependencies=[Depends(require_role("Admin"))])
async def generate_class_invoices(bulk_invoice_in: BulkInvoiceCreate, db: AsyncSession = Depends(get_db), current_user: Profile = Depends(get_current_user_profile)):
    """
    Generate invoices for all students in an entire class for a specific fee term.
    """
    target_class = await db.get(Class, bulk_invoice_in.class_id)
    if not target_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target class not found")

    if target_class.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot generate invoices for classes in other schools.")
    try:
        result = await invoice_service.generate_invoices_for_class(db=db, obj_in=bulk_invoice_in)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/admin/all", response_model=list[InvoiceOut], dependencies=[Depends(require_role("Admin"))])  # Protect with Admin role
async def list_all_school_invoices_admin(db: AsyncSession = Depends(get_db), current_user: Profile = Depends(get_current_user_profile)):  # Get authenticated admin user
    """
    Admin endpoint to list all active invoices within their own school.
    School isolation is implicitly handled by fetching based on the admin's school_id.
    """

    # --- APPLICATION-LEVEL SCHOOL ISOLATION ---
    # We fetch invoices only for the school the logged-in admin belongs to.
    admin_school_id = current_user.school_id

    invoices = await invoice_service.get_all_invoices_for_school(db=db, school_id=admin_school_id)

    return invoices
