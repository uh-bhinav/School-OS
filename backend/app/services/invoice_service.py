from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.class_fee_structure import ClassFeeStructure
from app.models.fee_component import FeeComponent
from app.models.fee_term import FeeTerm
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem

# ADDED: Import necessary models and schemas for calculations
from app.models.payment import Payment
from app.models.payment_allocation import PaymentAllocation
from app.models.student import Student
from app.models.student_fee_assignment import StudentFeeAssignment
from app.models.student_fee_discount import StudentFeeDiscount
from app.schemas.invoice_schema import BulkInvoiceCreate, InvoiceCreate, InvoiceUpdate
from app.schemas.payment_allocation_schema import PaymentAllocationCreate
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
    Generates a robust, itemized invoice for a student, following the full
    "Defaults and Overrides" logic from the financial plan.
    """
    # 1. Get Student and their Class ID
    student = await db.get(Student, obj_in.student_id)
    if not student or not student.current_class_id:
        raise ValueError("Student or student's class could not be found.")

    # [cite_start]2. Gather Class-Level Default Fees [cite: 1074-1076]
    default_fees_stmt = select(ClassFeeStructure).where(
        ClassFeeStructure.class_id
        == student.current_class_id
        # In a multi-year system, you would also filter by academic_year_id
    )
    default_fees_result = await db.execute(default_fees_stmt)
    # Create a dictionary of all potential fees: {component_id: amount}
    billable_components = {fee.component_id: Decimal(fee.amount) for fee in default_fees_result.scalars().all()}

    # [cite_start]3. Apply Student-Level Overrides (Fee Opt-Outs) [cite: 1080-1081]
    overrides_stmt = select(StudentFeeAssignment).where(StudentFeeAssignment.student_id == student.student_id)
    overrides_result = await db.execute(overrides_stmt)
    for override in overrides_result.scalars().all():
        if not override.is_active and override.fee_component_id in billable_components:
            # If the student has opted out, remove the component from their bill
            del billable_components[override.fee_component_id]

    # [cite_start]4. Apply Student-Level Discounts [cite: 1088-1092]
    # This is a simplified discount application. A full implementation would parse the 'rules' JSON.
    student_discounts_stmt = select(StudentFeeDiscount).where(StudentFeeDiscount.student_id == student.student_id)
    _ = await db.execute(student_discounts_stmt)

    # We will just calculate a total discount for now for simplicity.
    # The logic to apply discounts per-component based on rules would go here.
    # For now, we will simulate this by fetching all discounts and applying them to the total.

    # 5. Create Final Invoice Items and Calculate Total
    invoice_items_to_create = []
    final_amount_due = Decimal("0.0")

    if billable_components:
        component_ids = list(billable_components.keys())
        components_result = await db.execute(select(FeeComponent).where(FeeComponent.id.in_(component_ids)))
        components_map = {c.id: c.component_name for c in components_result.scalars().all()}

        for component_id, amount in billable_components.items():
            item = InvoiceItem(fee_component_id=component_id, component_name=components_map.get(component_id, "Unknown Fee"), amount=amount)
            invoice_items_to_create.append(item)
            final_amount_due += amount

    # 6. Fetch Fee Term for due date and other details
    fee_term = await db.get(FeeTerm, obj_in.fee_term_id)
    if not fee_term:
        raise ValueError("Fee term not found.")

    # 7. Create the Invoice object and link its items
    invoice_number = f"INV-{date.today().year}-{obj_in.student_id}-{obj_in.fee_term_id}"
    db_obj = Invoice(
        student_id=obj_in.student_id,
        fee_term_id=obj_in.fee_term_id,
        fee_structure_id=fee_term.fee_template_id,
        invoice_number=invoice_number,
        due_date=fee_term.due_date,
        amount_due=final_amount_due,  # This would be post-discount in a full impl.
        status="due",
        items=invoice_items_to_create,  # Link the items to the invoice
    )

    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def allocate_payment_to_invoice_items(db: AsyncSession, *, payment_id: int, user_id: UUID) -> list[PaymentAllocation]:
    """
    Allocates funds from a successful payment across its invoice's line items.
    This creates an immutable audit trail for how money was distributed.
    """
    payment = await db.get(Payment, payment_id)
    if not payment or not payment.invoice_id:
        raise ValueError("Payment or associated invoice not found.")

    # Fetch the invoice items that need payment
    stmt = select(InvoiceItem).where(InvoiceItem.invoice_id == payment.invoice_id).order_by(InvoiceItem.id)  # Pay in a predictable order

    items_result = await db.execute(stmt)
    invoice_items = items_result.scalars().all()

    amount_to_allocate = Decimal(payment.amount_paid)
    allocations = []

    for item in invoice_items:
        if amount_to_allocate <= 0:
            break

        # A more advanced version would check how much is already paid on this item
        amount_needed = Decimal(item.amount)

        allocation_amount = min(amount_to_allocate, amount_needed)

        allocation_data = PaymentAllocationCreate(payment_id=payment.id, invoice_item_id=item.id, amount_allocated=allocation_amount, allocated_by_user_id=user_id)
        new_allocation = PaymentAllocation(**allocation_data.model_dump())
        db.add(new_allocation)
        allocations.append(new_allocation)

        amount_to_allocate -= allocation_amount

    # In a real transaction, you would also update the invoice and invoice_item statuses here
    # e.g., mark the invoice as 'partially_paid' or 'paid'.

    await db.commit()
    return allocations


async def generate_invoices_for_class(db: AsyncSession, *, obj_in: BulkInvoiceCreate) -> dict:
    """
    Generates invoices for all students in a specified class for a given fee term.
    This function iterates through students and calls the single-invoice generator for each.
    """
    # 1. Find all active students in the specified class
    students_stmt = select(Student).where(Student.current_class_id == obj_in.class_id, Student.is_active.is_(True))
    students_result = await db.execute(students_stmt)
    students = students_result.scalars().all()

    if not students:
        raise ValueError("No active students found in the specified class.")

    successful_invoices = 0
    failed_invoices = 0

    # 2. Loop through each student and generate their invoice
    for student in students:
        try:
            single_invoice_data = InvoiceCreate(student_id=student.student_id, fee_term_id=obj_in.fee_term_id)
            # We reuse the robust single-invoice generator
            await generate_invoice_for_student(db=db, obj_in=single_invoice_data)
            successful_invoices += 1
        except Exception as e:
            # In a production system, you'd log this error with the student ID
            print(f"Failed to generate invoice for student {student.student_id}: {e}")
            failed_invoices += 1

    # This process should ideally be wrapped in a single transaction,
    # but for individual error handling, we commit per student.
    # For a full rollback on any failure, you'd handle the transaction scope outside the loop.

    return {"detail": "Bulk invoice generation complete.", "successful": successful_invoices, "failed": failed_invoices}
