import pytest
from sqlalchemy import select

from app.models.fee_component import FeeComponent
from app.schemas.student_fee_assignment_schema import StudentFeeAssignmentCreate
from app.services.student_fee_assignment_service import StudentFeeAssignmentService

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio


async def test_create_override_to_disable_fee(db_session, mock_admin_profile_1):
    """
    Tests that an admin can create an override to disable a fee for a student.
    """
    # Arrange:
    fee_component_stmt = select(FeeComponent).where(FeeComponent.component_name == "Transport Fee", FeeComponent.school_id == mock_admin_profile_1.school_id)
    component_result = await db_session.execute(fee_component_stmt)
    transport_component = component_result.scalars().first()
    if not transport_component:
        pytest.fail("Test setup failed: 'Transport Fee' component not found.")

    # --- THE CRITICAL FIX ---
    # Store the component's ID in a variable before the service call detaches the object.
    expected_component_id = transport_component.id

    override_data = StudentFeeAssignmentCreate(student_id=23, fee_component_id=expected_component_id, is_active=False)  # Use the stored ID

    service = StudentFeeAssignmentService(db_session)
    user_id = mock_admin_profile_1.user_id
    ip_address = "127.0.0.1"

    # Act: Call the service function which will commit and detach all objects.
    new_override = await service.create_or_update_override(override_data=override_data, user_id=user_id, ip_address=ip_address)

    # Assert: Verify the override was created correctly using the stored ID.
    assert new_override is not None
    assert new_override.student_id == 23
    assert new_override.fee_component_id == expected_component_id
    assert new_override.is_active is False
