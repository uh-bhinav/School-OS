from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.applied_discount import AppliedDiscount
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
from app.schemas.log_schema import LogCreate
from app.schemas.payment_allocation_schema import PaymentAllocationCreate
from app.schemas.payment_schema import PaymentCreate
from app.services import logging_service


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

    # --- NEW: ENHANCED DISCOUNT LOGIC ---
    # 4. Fetch all of the student's discounts and their rules at once
    student_discounts_stmt = select(StudentFeeDiscount).options(selectinload(StudentFeeDiscount.discount)).where(StudentFeeDiscount.student_id == student.student_id)  # Eager load the master discount template
    student_discounts_result = await db.execute(student_discounts_stmt)
    applied_discounts = student_discounts_result.scalars().all()

    # 5. Create Final Invoice Items and Calculate Total
    invoice_items_to_create = []
    final_amount_due = Decimal("0.0")
    applied_discounts_to_log = []

    if billable_components:
        component_ids = list(billable_components.keys())
        components_result = await db.execute(select(FeeComponent).where(FeeComponent.id.in_(component_ids)))
        components_map = {c.id: c.component_name for c in components_result.scalars().all()}

        for component_id, original_amount in billable_components.items():
            item_amount = original_amount

            # For this specific item, check if any of the student's discounts apply
            for applied_discount in applied_discounts:
                discount_template = applied_discount.discount
                if not discount_template or not discount_template.is_active:
                    continue

                # Check the 'rules' JSON to see if this discount applies to this component
                rules = discount_template.rules or {}
                applicable_ids = rules.get("applicable_to_component_ids")

                # The discount applies if there are no rules, or if the component is in the list
                if applicable_ids is None or component_id in applicable_ids:
                    if discount_template.type == "percentage":
                        discount_value = item_amount * (Decimal(discount_template.value) / Decimal(100))
                    else:  # fixed_amount
                        discount_value = Decimal(discount_template.value)

                    if discount_value > 0:
                        applied_discounts_to_log.append({"discount_id": discount_template.id, "amount_discounted": discount_value})

                    item_amount -= discount_value

            # Ensure the final amount for an item isn't negative
            if item_amount < 0:
                item_amount = Decimal("0.0")

            item = InvoiceItem(fee_component_id=component_id, component_name=components_map.get(component_id, "Unknown Fee"), amount=item_amount)
            invoice_items_to_create.append(item)
            final_amount_due += item_amount

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
    await db.flush()

    for discount_log in applied_discounts_to_log:
        audit_record = AppliedDiscount(invoice_id=db_obj.id, discount_id=discount_log["discount_id"], amount_discounted=discount_log["amount_discounted"])
        db.add(audit_record)

    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def allocate_payment_to_invoice_items(db: AsyncSession, *, payment_id: int, user_id: UUID) -> list[PaymentAllocation]:
    """
    Allocates funds from a successful payment across its invoice's line items.
    This creates an immutable audit trail for how money was distributed.
    """
    # Use selectinload to fetch the related invoice efficiently
    payment_stmt = select(Payment).options(selectinload(Payment.invoice)).where(Payment.id == payment_id)
    payment_result = await db.execute(payment_stmt)
    payment = payment_result.scalars().first()
    if not payment or not payment.invoice_id:
        raise ValueError("Payment or associated invoice not found.")

    # Fetch the invoice items that need payment
    stmt = select(InvoiceItem).where(InvoiceItem.invoice_id == payment.invoice_id).order_by(InvoiceItem.id)  # Pay in a predictable order

    items_result = await db.execute(stmt)
    invoice_items = items_result.scalars().all()

    amount_to_allocate = Decimal(payment.amount_paid)
    allocations_to_create = []

    for item in invoice_items:
        if amount_to_allocate <= 0:
            break

        # --- NEW: PARTIAL PAYMENT LOGIC ---
        # 2. Calculate how much has already been paid on this specific item from previous payments
        paid_stmt = select(func.sum(PaymentAllocation.amount_allocated)).where(PaymentAllocation.invoice_item_id == item.id)
        paid_result = await db.execute(paid_stmt)
        already_paid_on_item = paid_result.scalar_one_or_none() or Decimal("0.0")

        # 3. Determine the remaining amount needed for this item
        amount_needed = Decimal(item.amount) - already_paid_on_item
        if amount_needed <= 0:
            continue  # This item is already fully paid, skip to the next one

        # 4. Allocate the smaller of the two amounts: what's left of the payment, or what's needed for the item
        allocation_amount = min(amount_to_allocate, amount_needed)

        allocation_data = PaymentAllocationCreate(payment_id=payment.id, invoice_item_id=item.id, amount_allocated=allocation_amount, allocated_by_user_id=user_id)
        new_allocation = PaymentAllocation(**allocation_data.model_dump())
        allocations_to_create.append(new_allocation)

        amount_to_allocate -= allocation_amount

    if allocations_to_create:
        db.add_all(allocations_to_create)
        await db.commit()

    # --- NEW: INVOICE STATUS UPDATE LOGIC ---
    # 2. After allocations are saved, calculate the new total paid on the invoice
    total_paid_stmt = select(func.sum(PaymentAllocation.amount_allocated)).join(PaymentAllocation.invoice_item).where(InvoiceItem.invoice_id == payment.invoice_id)
    total_paid_result = await db.execute(total_paid_stmt)
    total_paid_so_far = total_paid_result.scalar_one_or_none() or Decimal("0.0")

    # 3. Update the parent invoice's status and amount_paid
    invoice = payment.invoice
    invoice.amount_paid = total_paid_so_far

    if total_paid_so_far >= Decimal(invoice.amount_due):
        invoice.payment_status = "paid"
    elif total_paid_so_far > 0:
        invoice.payment_status = "partially_paid"
    else:
        invoice.payment_status = "unpaid"

    await db.commit()

    return allocations_to_create


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

    # --- NEW: ATOMIC TRANSACTION LOGIC ---
    try:
        # Start a transaction that will encompass the entire loop
        async with db.begin_nested():
            for student in students:
                single_invoice_data = InvoiceCreate(student_id=student.student_id, fee_term_id=obj_in.fee_term_id)
                # We call the single-invoice generator for each student
                await generate_invoice_for_student(db=db, obj_in=single_invoice_data)
                successful_invoices += 1
        # If the loop completes without error, the transaction is automatically committed here.
    except Exception as e:
        # --- NEW: ROBUST LOGGING LOGIC ---
        # If the transaction fails, log the error to the database before re-raising.
        log_message = "Critical failure during bulk invoice generation. Operation rolled back."
        log_details = {"class_id": obj_in.class_id, "fee_term_id": obj_in.fee_term_id, "total_students_affected": len(students), "error_type": type(e).__name__, "error_message": str(e)}
        log_entry = LogCreate(log_level="CRITICAL", message=log_message, details=log_details)

        # We create a separate, independent database session for logging
        # to ensure the log is saved even if the main session is rolled back.
        # This requires your get_db dependency to be set up to yield a new session.
        async for log_db in get_db():  # A way to get a fresh session
            await logging_service.create_log_entry(db=log_db, log_data=log_entry)

        failed_invoices = len(students)
        successful_invoices = 0
        raise ValueError(log_message)

    return {"detail": "Bulk invoice generation complete.", "successful": successful_invoices, "failed": failed_invoices}
