from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.models.discount import Discount
from app.models.student import Student
from app.schemas.discount_schema import DiscountCreate, DiscountType
from app.schemas.student_fee_discount_schema import StudentFeeDiscountCreate
from app.services.discount_service import DiscountService

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio


async def test_create_discount_template_percentage(db_session, mock_admin_profile):
    """
    Tests that an admin can successfully create a percentage-based discount template.
    """
    # Arrange: Prepare the service and input data
    service = DiscountService(db_session)
    discount_data = DiscountCreate(school_id=mock_admin_profile.school_id, name="15% Early Bird Discount", description="For payments made before the due date.", type=DiscountType.PERCENTAGE, value=15.0)  # Explicitly testing the 'percentage' type

    # Act: Call the service function to create the discount template
    new_discount = await service.create_discount_template(discount_data=discount_data)

    # Assert: Verify the discount was created correctly in the database
    assert new_discount is not None
    assert new_discount.name == "15% Early Bird Discount"
    assert new_discount.school_id == mock_admin_profile.school_id
    assert new_discount.type == DiscountType.PERCENTAGE
    assert float(new_discount.value) == 15.0

    # Double-check by fetching the record directly from the database
    saved_discount = await db_session.get(Discount, new_discount.id)
    assert saved_discount is not None
    assert saved_discount.type == DiscountType.PERCENTAGE


async def test_apply_discount_to_student(db_session, mock_admin_profile, mocker):
    """
    Tests that an admin can successfully apply a discount template to a student
    and that the action is audited.
    """
    # Arrange:
    # 1. Create a master discount template to apply.
    service = DiscountService(db_session)
    discount_template = await service.create_discount_template(DiscountCreate(school_id=mock_admin_profile.school_id, name="Test Merit Scholarship", type=DiscountType.PERCENTAGE, value=25.0))

    # 2. Use a known, existing student.
    test_student_id = 22
    student_to_test = await db_session.get(Student, test_student_id)
    if not student_to_test:
        pytest.fail(f"Test setup failed: Student with ID {test_student_id} not found.")

    # --- FIX: Create a mock audit service ---
    expected_student_id = student_to_test.student_id

    mock_audit_service = mocker.patch("app.services.discount_service.audit_service", new_callable=AsyncMock)

    # 3. Prepare the data for the application.
    application_data = StudentFeeDiscountCreate(student_id=expected_student_id, discount_id=discount_template.id)

    # Act: Call the service function to apply the discount.
    new_application = await service.apply_discount_to_student(
        application_data=application_data,
        user_id=mock_admin_profile.user_id,
        ip_address="127.0.0.1",
        # The service no longer needs the audit_service passed as an argument
        # because we are patching it directly where it's used.
    )

    # Assert: Verify the link was created correctly.
    assert new_application is not None
    assert new_application.student_id == expected_student_id

    # --- FIX: Assert that the audit service was called ---
    # This proves the integration between the services is working.
    mock_audit_service.create_audit_log.assert_awaited_once()


async def test_apply_discount_duplicate_fails(db_session, mock_admin_profile, mocker):
    """
    Tests that applying the same discount to the same student twice fails
    with a 409 Conflict error.
    """
    # Arrange:
    # 1. Create a master discount template.
    service = DiscountService(db_session)
    discount_template = await service.create_discount_template(DiscountCreate(school_id=mock_admin_profile.school_id, name="Test Duplicate Scholarship", type=DiscountType.FIXED_AMOUNT, value=1000.0))

    # 2. Use a known, existing student.
    student_to_test = await db_session.get(Student, 22)
    if not student_to_test:
        pytest.fail("Test setup failed: Student with ID 22 not found.")

    # 3. Prepare the application data.
    application_data = StudentFeeDiscountCreate(student_id=student_to_test.student_id, discount_id=discount_template.id)

    # 4. Mock the audit service as it's not the focus of this test.
    mocker.patch("app.services.discount_service.audit_service", new_callable=AsyncMock)

    # 5. Apply the discount the first time (this should succeed).
    await service.apply_discount_to_student(application_data=application_data, user_id=mock_admin_profile.user_id, ip_address="127.0.0.1")

    # Act & Assert: Attempt to apply the exact same discount again.
    with pytest.raises(HTTPException) as exc_info:
        await service.apply_discount_to_student(application_data=application_data, user_id=mock_admin_profile.user_id, ip_address="127.0.0.1")

    assert exc_info.value.status_code == 409
    assert "already applied" in exc_info.value.detail
