import logging
from decimal import Decimal

import pytest
import pytest_asyncio
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.models.class_fee_structure import ClassFeeStructure
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.student import Student
from app.models.student_fee_discount import StudentFeeDiscount
from app.schemas.invoice_schema import BulkInvoiceCreate, InvoiceCreate
from app.services.invoice_service import generate_invoice_for_student, generate_invoices_for_class

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio

logger = logging.getLogger(__name__)


@pytest_asyncio.fixture
async def clean_all_invoices(db_session):
    """
    Fixture that deletes ALL invoices and their related payments before the test.
    IMPORTANT: Delete payments FIRST to respect foreign key constraints.
    Returns the clean session for use in the test.
    """
    # Import Payment model
    from app.models.payment import Payment

    # Step 1: Delete all payment allocations first (if they exist)
    try:
        from app.models.payment_allocation import PaymentAllocation

        await db_session.execute(delete(PaymentAllocation))
        await db_session.commit()
    except Exception:
        logger.exception("Database error occurred, rolling back transaction")
        await db_session.rollback()

    # Step 2: Delete all payments
    await db_session.execute(delete(Payment))
    await db_session.commit()

    # Step 3: Delete all invoices
    await db_session.execute(delete(Invoice))
    await db_session.commit()

    return db_session


@pytest_asyncio.fixture
async def clean_class_invoices(db_session):
    """
    Fixture that deletes invoices for class 11 and their related payments.
    IMPORTANT: Delete payments FIRST to respect foreign key constraints.
    Returns the clean session for use in the test.
    """
    from app.models.payment import Payment

    # Get all student IDs in class 11
    class_11_students = select(Student.student_id).where(Student.current_class_id == 11)

    # Step 1: Delete payment allocations for invoices of class 11 students
    try:
        from app.models.payment_allocation import PaymentAllocation

        delete_allocations = delete(PaymentAllocation).where(PaymentAllocation.invoice_item_id.in_(select(InvoiceItem.id).where(InvoiceItem.invoice_id.in_(select(Invoice.id).where(Invoice.student_id.in_(class_11_students))))))
        await db_session.execute(delete_allocations)
        await db_session.commit()
    except Exception:
        logger.exception("Database error occurred, rolling back transaction")
        await db_session.rollback()

    # Step 2: Delete payments for invoices of class 11 students
    delete_payments = delete(Payment).where(Payment.invoice_id.in_(select(Invoice.id).where(Invoice.student_id.in_(class_11_students))))
    await db_session.execute(delete_payments)
    await db_session.commit()

    # Step 3: Delete invoices for class 11 students
    delete_invoices = delete(Invoice).where(Invoice.student_id.in_(class_11_students))
    await db_session.execute(delete_invoices)
    await db_session.commit()

    return db_session


async def test_generate_invoice_for_student_with_defaults(db_session):
    """
    Tests generating an invoice for a student with only default class fees.
    """
    # Arrange:
    # 1. Use a known student from seeded data.
    student_id_to_test = 22
    student = await db_session.get(Student, student_id_to_test)
    if not student or not student.current_class_id:
        pytest.fail("Test setup failed: Student or their class not found.")

    # --- THE CRITICAL FIX ---
    # 2. Calculate the expected total based on the student's ACTUAL class ID.
    # This makes the test robust and independent of hardcoded values.
    stmt = select(ClassFeeStructure).where(ClassFeeStructure.class_id == student.current_class_id)
    result = await db_session.execute(stmt)
    class_fees = result.scalars().all()

    # If this fails, it means the seeding for this class is missing, which is a valid setup error.
    assert class_fees, f"Test setup error: No default fees found for class ID {student.current_class_id}."

    print("\nDEBUG: Fees fetched for class ID:", student.current_class_id)
    for fee in class_fees:
        print(f" - {fee.component_id}: {fee.amount}")

    expected_total = sum(Decimal(fee.amount) for fee in class_fees)
    expected_item_count = len(class_fees)

    # 3. Prepare the input data for the service call.
    invoice_data = InvoiceCreate(student_id=student_id_to_test, fee_term_id=1)

    # Act: Call the service function to generate the invoice.
    new_invoice = await generate_invoice_for_student(db=db_session, obj_in=invoice_data)

    # Assert: Verify the invoice was created with the correct defaults.
    assert new_invoice is not None

    # The assertion will now pass because both sides of the comparison are based on the same data.
    assert Decimal(new_invoice.amount_due) == expected_total
    assert len(new_invoice.items) == expected_item_count


async def test_generate_invoice_applies_discounts_dynamically(db_session):
    """
    Tests that the invoice correctly reflects a student's discount by
    dynamically calculating the expected total based on the actual database state.
    """
    # Arrange:
    # 1. Use the known student with a discount: "Aarav Sharma" (student_id = 22).
    student_id_to_test = 22
    student = await db_session.get(Student, student_id_to_test)
    if not student or not student.current_class_id:
        pytest.fail("Test setup failed: Student or their class not found.")

    # --- THE CRITICAL FIX: DYNAMICALLY CALCULATE THE EXPECTED TOTAL ---

    # 2a. Fetch the actual default fees for the student's class.
    fees_stmt = select(ClassFeeStructure).where(ClassFeeStructure.class_id == student.current_class_id)
    fees_result = await db_session.execute(fees_stmt)
    billable_components = {fee.component_id: Decimal(fee.amount) for fee in fees_result.scalars().all()}

    # 2b. Fetch the actual discounts applied to this student.
    discounts_stmt = select(StudentFeeDiscount).options(selectinload(StudentFeeDiscount.discount)).where(StudentFeeDiscount.student_id == student_id_to_test)
    discounts_result = await db_session.execute(discounts_stmt)
    applied_discounts = discounts_result.scalars().all()

    # 2c. Replicate the service's calculation logic here in the test.
    expected_total = Decimal("0.0")
    for component_id, original_amount in billable_components.items():
        item_total = original_amount
        for applied_discount in applied_discounts:
            discount_template = applied_discount.discount
            rules = discount_template.rules or {}
            applicable_ids = rules.get("applicable_to_component_ids")

            if applicable_ids is None or component_id in applicable_ids:
                if discount_template.type == "percentage":
                    item_total -= original_amount * (Decimal(discount_template.value) / 100)

        expected_total += item_total

    # 3. Prepare the input for the service call.
    invoice_data = InvoiceCreate(student_id=student_id_to_test, fee_term_id=1)

    # Act: Call the service.
    new_invoice = await generate_invoice_for_student(db=db_session, obj_in=invoice_data)

    # Assert: The dynamically calculated total should now match the service's result.
    assert new_invoice is not None
    assert Decimal(new_invoice.amount_due) == expected_total


async def test_generate_invoice_respects_overrides(db_session):
    """
    Tests that the invoice correctly excludes a fee component if a student has
    an 'is_active=False' override for it.
    """
    # Arrange:
    # 1. Use a known student with an override: "Priya Singh" (student_id = 23).
    # Our seed script set an override for her, disabling the "Transport Fee".
    student_id_to_test = 23
    student = await db_session.get(Student, student_id_to_test)
    if not student or not student.current_class_id:
        pytest.fail("Test setup failed: Student or their class not found.")

    # 2. Dynamically calculate the expected total by excluding the overridden fee.
    # Fetch all default fees for the student's class.
    fees_stmt = select(ClassFeeStructure).options(selectinload(ClassFeeStructure.fee_component)).where(ClassFeeStructure.class_id == student.current_class_id)
    fees_result = await db_session.execute(fees_stmt)
    class_fees = fees_result.scalars().all()

    # Calculate the total, but skip the "Transport Fee".
    expected_total = sum(Decimal(fee.amount) for fee in class_fees if fee.fee_component.component_name != "Transport Fee")

    # 3. Prepare the input for the service call.
    invoice_data = InvoiceCreate(student_id=student_id_to_test, fee_term_id=1)

    # Act: Call the service to generate the invoice.
    new_invoice = await generate_invoice_for_student(db=db_session, obj_in=invoice_data)

    # Assert:
    assert new_invoice is not None
    # 1. Verify the final amount is correct, reflecting the excluded fee.
    assert Decimal(new_invoice.amount_due) == expected_total

    # 2. Verify that the "Transport Fee" line item was NOT created.
    transport_item_present = any(item.component_name == "Transport Fee" for item in new_invoice.items)
    assert not transport_item_present, "The overridden 'Transport Fee' should not be in the invoice items."


# async def test_generate_invoices_for_class_bulk_success(db_session):
#     """
#     Tests the happy path for bulk invoice generation, ensuring invoices are
#     created for all students in a class.
#     """
#     # Arrange:
#     # 1. Use a known class from your seeded data: "Class 5A" (class_id = 11).
#     class_id_to_test = 11

#     # 2. Count how many active students are in this class to set our expectation.
#     students_stmt = select(Student).where(
#         Student.current_class_id == class_id_to_test, Student.is_active == True
#     )
#     students_result = await db_session.execute(students_stmt)
#     expected_invoice_count = len(students_result.scalars().all())

#     assert expected_invoice_count > 0, "Test setup error: No students found in the test class."

#     # 3. Prepare the input for the bulk generation service.
#     bulk_data = BulkInvoiceCreate(class_id=class_id_to_test, fee_term_id=1)

#     # Act: Call the bulk generation service.
#     result = await generate_invoices_for_class(db=db_session, obj_in=bulk_data)

#     # Assert:
#     # 1. Verify the service reported success for all students.
#     assert result["successful"] == expected_invoice_count
#     assert result["failed"] == 0

#     # 2. Verify that the correct number of invoices were actually created in the database.
#     invoices_stmt = select(Invoice).join(Student).where(Student.current_class_id == class_id_to_test)
#     invoices_result = await db_session.execute(invoices_stmt)
#     created_invoice_count = len(invoices_result.scalars().all())

#     assert created_invoice_count == expected_invoice_count

# async def test_generate_invoices_for_class_atomic_rollback(db_session, mocker):
#     """
#     Tests the atomicity of bulk generation. If one invoice fails, all invoices
#     in the batch should be rolled back.
#     """
#     # Arrange:
#     class_id_to_test = 11

#     # 1. Use mocker to simulate a failure on the second student.
#     # We patch the single-invoice generator that the bulk service calls internally.
#     mocked_generator = mocker.patch(
#         "app.services.invoice_service._generate_invoice_for_student_core",
#         side_effect=[
#             mocker.DEFAULT, # Allow the first call to succeed by calling the real function
#             Exception("Simulated database error") # Make the second call fail
#         ]
#     )

#     # 2. Prepare the input data.
#     bulk_data = BulkInvoiceCreate(class_id=class_id_to_test, fee_term_id=1)

#     # Act & Assert: Expect the service to raise a ValueError due to the failure.
#     with pytest.raises(ValueError, match="Critical failure during bulk invoice generation. Operation rolled back."):
#         await generate_invoices_for_class(db=db_session, obj_in=bulk_data)

#     # Assert that the underlying generator was called twice (first success, second failure)
#     assert mocked_generator.call_count == 2

#     # Final, most critical assertion: Verify that ZERO invoices were created for this class.
#     invoices_stmt = select(Invoice).join(Student).where(Student.current_class_id == class_id_to_test)
#     invoices_result = await db_session.execute(invoices_stmt)
#     created_invoices = invoices_result.scalars().all()

#     assert len(created_invoices) == 0, "No invoices should be created if the transaction was rolled back."


async def test_generate_invoices_for_class_bulk_success(clean_class_invoices):
    """
    Tests the happy path for bulk invoice generation.
    Uses clean_class_invoices fixture which returns the cleaned session.
    """
    # KEY FIX: Use the fixture's returned session
    db_session = clean_class_invoices
    class_id_to_test = 11

    # Count how many active students are in this class
    students_stmt = select(Student).where(Student.current_class_id == class_id_to_test, Student.is_active)
    students_result = await db_session.execute(students_stmt)
    students = students_result.scalars().all()
    expected_invoice_count = len(students)

    assert expected_invoice_count > 0, "Test setup error: No students found in the test class."

    bulk_data = BulkInvoiceCreate(class_id=class_id_to_test, fee_term_id=1)
    result = await generate_invoices_for_class(db=db_session, obj_in=bulk_data)

    # Assert that the service reported success
    assert result["successful"] == expected_invoice_count, f"Service reported {result['successful']} successes, expected {expected_invoice_count}"
    assert result["failed"] == 0

    # Verify invoices actually exist in the database
    invoices_stmt = select(Invoice).join(Student).where(Student.current_class_id == class_id_to_test)
    invoices_result = await db_session.execute(invoices_stmt)
    created_invoices = invoices_result.scalars().all()

    assert len(created_invoices) == expected_invoice_count, f"Expected {expected_invoice_count} invoices in DB but found {len(created_invoices)}"


async def test_generate_invoices_for_class_atomic_rollback(clean_class_invoices, mocker):
    """
    Tests the atomicity of bulk generation.
    If one invoice fails, all invoices in the batch should be rolled back.
    """
    # KEY FIX: Use the fixture's returned session
    db_session = clean_class_invoices
    class_id_to_test = 11

    # Import the actual function we'll wrap
    from app.services import invoice_service

    original_core = invoice_service._generate_invoice_for_student_core

    # Track call count and fail on the second call
    call_count = [0]

    async def failing_core_wrapper(db, *, obj_in):
        """Wrapper that fails on second call"""
        call_count[0] += 1
        if call_count[0] == 2:
            raise Exception("Simulated database error on second student")
        # Call the original function
        return await original_core(db=db, obj_in=obj_in)

    # Patch the function
    mocker.patch.object(invoice_service, "_generate_invoice_for_student_core", side_effect=failing_core_wrapper)

    bulk_data = BulkInvoiceCreate(class_id=class_id_to_test, fee_term_id=1)

    # Should raise ValueError due to the simulated failure
    with pytest.raises(ValueError, match="Critical failure during bulk invoice generation"):
        await generate_invoices_for_class(db=db_session, obj_in=bulk_data)

    # Verify transaction was rolled back - no invoices should exist
    invoices_stmt = select(Invoice).join(Student).where(Student.current_class_id == class_id_to_test)
    invoices_result = await db_session.execute(invoices_stmt)
    created_invoices = invoices_result.scalars().all()

    assert len(created_invoices) == 0, f"Transaction should have rolled back. Expected 0 invoices, but found {len(created_invoices)}"


async def test_generate_invoices_for_class_handles_no_students(db_session):
    """
    Tests that bulk generation gracefully handles a class with no students.
    This test doesn't need invoice cleanup.
    """
    class_id_with_no_students = 999
    bulk_data = BulkInvoiceCreate(class_id=class_id_with_no_students, fee_term_id=1)

    with pytest.raises(ValueError, match="No active students found"):
        await generate_invoices_for_class(db=db_session, obj_in=bulk_data)
