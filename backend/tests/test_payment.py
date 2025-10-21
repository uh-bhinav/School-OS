import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest
import razorpay.errors
import sqlalchemy.exc
from fastapi import HTTPException
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import json
# Import the real DB session fixture
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.base_class import Base  # Needed to define a temporary User model
from app.models.gateway_webhook_event import GatewayWebhookEvent
from app.models.order import Order
from app.models.payment import Payment
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.school import School
from app.models.student import Student
from app.models.user_roles import UserRole
from app.schemas.payment_schema import PaymentInitiateRequest, PaymentVerificationRequest

# --- Imports from your app ---
from app.services.payment_service import PaymentService

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio


# --- Temporary User Model for auth.users ---
class TempAuthUser(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True)


async def test_initiate_payment_for_order_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
    """
    Integration test for initiating payment for an e-commerce order.
    (Corrected for Student model dependencies and Supabase triggers)
    """

    # 1. --- ARRANGE ---

    # --- Mock Dependencies (External) ---
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key_integration", "rzp_secret_integration"])

    mock_razorpay_client.order.create.return_value = {"id": "order_INTEG_MOCK_ID", "amount": 250000}

    # --- Create Real Data in the DB (in correct order) ---

    # School
    db_school = School(name="Integration Test School", razorpay_key_id_encrypted=b"mock_key_bytes", razorpay_key_secret_encrypted=b"mock_secret_bytes")
    db_session.add(db_school)

    # RoleDefinition
    db_role = RoleDefinition(role_id=999, role_name="Test Parent Role")
    db_session.add(db_role)
    await db_session.flush()

    # --- Create Parent User and Profile ---
    parent_user_uuid = uuid.uuid4()
    parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-{parent_user_uuid}@test.com")
    db_session.add(parent_user)
    await db_session.flush()  # Fires trigger to create profile

    db_parent_profile = await db_session.get(Profile, parent_user_uuid)
    db_parent_profile.first_name = "Test Parent"
    db_parent_profile.school_id = db_school.school_id
    db_parent_profile.is_active = True

    db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))
    await db_session.flush()

    # --- CORRECTED: Create Student User and Profile ---
    student_user_uuid = uuid.uuid4()
    student_user = TempAuthUser(id=student_user_uuid, email=f"student-{student_user_uuid}@test.com")
    db_session.add(student_user)
    await db_session.flush()  # Fires trigger to create profile

    db_student_profile = await db_session.get(Profile, student_user_uuid)
    db_student_profile.first_name = "Test Student"
    db_student_profile.school_id = db_school.school_id
    db_student_profile.is_active = True
    await db_session.flush()

    # --- CORRECTED: Create Student record, linking to its profile ---
    db_student = Student(user_id=student_user_uuid)  # Satisfies the FK constraint
    db_session.add(db_student)
    await db_session.flush()

    # Order
    db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-001", total_amount=Decimal("2500.00"), status="pending_payment")
    db_session.add(db_order)
    await db_session.flush()

    # --- Service and Request ---
    service = PaymentService(db_session)
    request = PaymentInitiateRequest(invoice_id=None, order_id=db_order.order_id)

    # 2. --- ACT ---
    response = await service.initiate_payment(request_data=request, user_id=str(parent_user_uuid))
    await db_session.flush()

    # 3. --- ASSERT ---
    payment_id = response["internal_payment_id"]
    created_payment = await db_session.get(Payment, payment_id)

    assert created_payment is not None
    assert created_payment.status == "pending"
    assert created_payment.order_id == db_order.order_id
    assert created_payment.user_id == parent_user_uuid


async def test_verify_payment_valid_signature_for_order_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
    """
    Integration test for verifying a payment for an e-commerce order.

    This is the KEY INTEGRATION TEST.

    It verifies that when a payment is verified:
    1. The Payment.status is updated to 'captured'.
    2. The related Order.status is updated to 'processing'.
    """

    # 1. --- ARRANGE ---

    # --- Mock Dependencies (External) ---
    # We mock crypto_service twice:
    # 1. For verify_payment (key_secret)
    # 2. For _get_razorpay_client (key_id, key_secret)
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_secret_for_verify", "rzp_key_for_fetch", "rzp_secret_for_fetch"])

    # Configure mock_razorpay_client
    # 1. Signature verification succeeds
    mock_razorpay_client.utility.verify_payment_signature.return_value = None
    # 2. Payment fetch succeeds
    mock_razorpay_client.payment.fetch.return_value = {"method": "upi", "notes": {"internal_payment_id": "test"}}

    # --- Create Real Data in the DB ---

    # School
    db_school = School(name="Integration Verify School", razorpay_key_id_encrypted=b"mock_key_bytes", razorpay_key_secret_encrypted=b"mock_secret_bytes")
    db_session.add(db_school)

    # RoleDefinition
    db_role = RoleDefinition(role_id=998, role_name="Test Verify Role")
    db_session.add(db_role)
    await db_session.flush()

    # Create Parent User and Profile
    parent_user_uuid = uuid.uuid4()
    parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-v-{parent_user_uuid}@test.com")
    db_session.add(parent_user)
    await db_session.flush()

    db_parent_profile = await db_session.get(Profile, parent_user_uuid)
    db_parent_profile.first_name = "Test Parent Verify"
    db_parent_profile.school_id = db_school.school_id
    db_parent_profile.is_active = True
    db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))

    # Create Student User and Profile
    student_user_uuid = uuid.uuid4()
    student_user = TempAuthUser(id=student_user_uuid, email=f"student-v-{student_user_uuid}@test.com")
    db_session.add(student_user)
    await db_session.flush()

    db_student_profile = await db_session.get(Profile, student_user_uuid)
    db_student_profile.first_name = "Test Student Verify"
    db_student_profile.school_id = db_school.school_id
    db_student_profile.is_active = True

    # Create Student record
    db_student = Student(user_id=student_user_uuid)
    db_session.add(db_student)
    await db_session.flush()

    # Create Order
    db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-VERIFY-001", total_amount=Decimal("3000.00"), status="pending_payment")  # CRITICAL: Initial state
    db_session.add(db_order)
    await db_session.flush()

    # --- CRITICAL: Create the 'pending' Payment record ---
    db_payment = Payment(
        order_id=db_order.order_id,
        amount_paid=Decimal("3000.00"),
        status="pending",  # CRITICAL: Initial state
        school_id=db_school.school_id,
        student_id=db_student.student_id,
        user_id=parent_user_uuid,
        gateway_order_id="order_GATEWAY_ID_123",
        gateway_name="razorpay",
    )
    db_session.add(db_payment)
    await db_session.flush()

    payment_id = db_payment.id

    # Commit all setup data
    await db_session.commit()

    # --- Service and Request ---
    service = PaymentService(db_session)
    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_VALID_SIG_INTEG", razorpay_order_id="order_GATEWAY_ID_123", razorpay_signature="valid_signature_string", internal_payment_id=payment_id)  # Use the real payment ID

    # 2. --- ACT ---
    # This call will run the service logic AND commit the changes
    await service.verify_payment(verification_data=verify_request)

    # 3. --- ASSERT ---

    # We must re-fetch the objects from the DB to check their committed state

    # Assert: Payment status updated to 'captured'
    await db_session.refresh(db_payment)  # Refresh the object from the DB
    assert db_payment.status == "captured"
    assert db_payment.gateway_payment_id == "pay_VALID_SIG_INTEG"
    assert db_payment.method == "upi"

    # --- THE KEY ASSERTION ---
    # Assert: If order: order.status = 'processing'
    await db_session.refresh(db_order)  # Refresh the object from the DB
    assert db_order.status == "processing"


class TempClass(Base):
    __tablename__ = "classes"
    __table_args__ = {"extend_existing": True}
    class_id = Column(Integer, primary_key=True, autoincrement=True)
    section = Column(String)
    school_id = Column(Integer, ForeignKey("schools.school_id"))


class TempFeeTerm(Base):
    __tablename__ = "fee_terms"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, default="Test Term 1")
    school_id = Column(Integer, ForeignKey("schools.school_id"))
    # Add other fields if your DB schema requires them


# async def test_webhook_payment_captured_event_for_order_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
#     """
#     Integration test for a 'payment.captured' webhook for an ORDER.
#     (Corrected for chk_payment_target constraint)
#     """

#     # 1. --- ARRANGE ---

#     # --- Mock Dependencies (External) ---
#     mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_webhook_secret_integration")

#     mock_razorpay_client.utility.verify_webhook_signature.return_value = None

#     # --- Create Real Data in the DB ---
#     db_school = School(name="Integration Webhook School", razorpay_key_id_encrypted=b"mock_key_bytes", razorpay_key_secret_encrypted=b"mock_secret_bytes", razorpay_webhook_secret_encrypted=b"mock_webhook_secret_bytes")
#     db_session.add(db_school)

#     db_role = RoleDefinition(role_id=994, role_name="Test Webhook Role")
#     db_session.add(db_role)
#     await db_session.flush()

#     parent_user_uuid = uuid.uuid4()
#     parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-wh-{parent_user_uuid}@test.com")
#     db_session.add(parent_user)
#     await db_session.flush()

#     db_parent_profile = await db_session.get(Profile, parent_user_uuid)
#     db_parent_profile.first_name = "Test Parent Webhook"
#     db_parent_profile.school_id = db_school.school_id
#     db_parent_profile.is_active = True
#     db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))

#     student_user_uuid = uuid.uuid4()
#     student_user = TempAuthUser(id=student_user_uuid, email=f"student-wh-{student_user_uuid}@test.com")
#     db_session.add(student_user)
#     await db_session.flush()

#     db_student_profile = await db_session.get(Profile, student_user_uuid)
#     db_student_profile.first_name = "Test Student Webhook"
#     db_student_profile.school_id = db_school.school_id
#     db_student_profile.is_active = True

#     db_student = Student(user_id=student_user_uuid)
#     db_session.add(db_student)
#     await db_session.flush()

#     db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-WEBHOOK-001", total_amount=Decimal("200.00"), status="pending_payment")
#     db_session.add(db_order)

#     # --- THIS IS THE FIX ---
#     # We must flush here to get the db_order.order_id
#     await db_session.flush()

#     db_payment = Payment(
#         order_id=db_order.order_id,  # Now this has a valid ID
#         amount_paid=Decimal("200.00"),
#         status="pending",
#         school_id=db_school.school_id,
#         student_id=db_student.student_id,
#         user_id=parent_user_uuid,
#         gateway_order_id="order_GATEWAY_ID_WEBHOOK",
#         gateway_name="razorpay",
#     )
#     db_session.add(db_payment)
#     await db_session.flush()

#     payment_id_to_verify = db_payment.id
#     await db_session.commit()

#     # --- Service and Payload ---
#     service = PaymentService(db_session)

#     test_gateway_order_id = "order_GATEWAY_ID_WEBHOOK"

#     webhook_payload = {"id": "evt_unique_webhook_id_123", "event": "payment.captured", "created_at": 1678886400, "payload": {"payment": {"entity": {"id": "pay_WEBHOOK_CAPTURE", "order_id": test_gateway_order_id, "notes": {"internal_payment_id": payment_id_to_verify}}}}}
#     raw_body = json.dumps(webhook_payload).encode("utf-8")

#     # 2. --- ACT ---
#     await service.handle_webhook_event(payload=webhook_payload, raw_body=raw_body, signature="valid_webhook_sig")

#     # 3. --- ASSERT ---

#     await db_session.refresh(db_payment)
#     assert db_payment.status == "captured"
#     assert db_payment.gateway_payment_id == "pay_WEBHOOK_CAPTURE"

#     await db_session.refresh(db_order)
#     assert db_order.status == "processing"

#     stmt = select(GatewayWebhookEvent).where(GatewayWebhookEvent.event_id == "evt_unique_webhook_id_123")
#     result = await db_session.execute(stmt)
#     webhook_event = result.scalar_one_or_none()

#     assert webhook_event is not None
#     assert webhook_event.status == "processed"


# async def test_webhook_idempotent_duplicate_event_id_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
#     """
#     Integration test for webhook idempotency.

#     Verifies that if a webhook event ID has already been processed,
#     the service does nothing on a subsequent attempt.
#     """

#     # 1. --- ARRANGE ---

#     # --- Mock Dependencies (External) ---
#     # These should NOT be called, but we mock them just in case.
#     mocker.patch("app.core.crypto_service.decrypt_value")
#     mock_razorpay_client.utility.verify_webhook_signature

#     # --- Create Real Data in the DB ---
#     db_school = School(name="Integration Idempotent School")
#     db_session.add(db_school)

#     db_role = RoleDefinition(role_id=993, role_name="Test Idempotent Role")
#     db_session.add(db_role)
#     await db_session.flush()

#     parent_user_uuid = uuid.uuid4()
#     parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-idem-{parent_user_uuid}@test.com")
#     db_session.add(parent_user)
#     await db_session.flush()

#     db_parent_profile = await db_session.get(Profile, parent_user_uuid)
#     db_parent_profile.first_name = "Test Parent Idempotent"
#     db_parent_profile.school_id = db_school.school_id
#     db_parent_profile.is_active = True
#     db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))

#     student_user_uuid = uuid.uuid4()
#     student_user = TempAuthUser(id=student_user_uuid, email=f"student-idem-{student_user_uuid}@test.com")
#     db_session.add(student_user)
#     await db_session.flush()

#     db_student_profile = await db_session.get(Profile, student_user_uuid)
#     db_student_profile.first_name = "Test Student Idempotent"
#     db_student_profile.school_id = db_school.school_id
#     db_student_profile.is_active = True

#     db_student = Student(user_id=student_user_uuid)
#     db_session.add(db_student)
#     await db_session.flush()

#     db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-IDEM-001", total_amount=Decimal("10.00"), status="processing")  # Already processed
#     db_session.add(db_order)
#     await db_session.flush()

#     db_payment = Payment(
#         order_id=db_order.order_id,
#         amount_paid=Decimal("10.00"),
#         status="captured",  # Already processed
#         school_id=db_school.school_id,
#         student_id=db_student.student_id,
#         user_id=parent_user_uuid,
#         gateway_order_id="order_GATEWAY_ID_IDEM",
#         gateway_name="razorpay",
#     )
#     db_session.add(db_payment)

#     await db_session.flush()
#     payment_id = db_payment.id

#     processed_event_id = "evt_ALREADY_PROCESSED_789"
#     db_event = GatewayWebhookEvent(event_id=processed_event_id, status="processed", payload={"message": "This was the first event"})
#     db_session.add(db_event)
#     await db_session.commit()

#     # --- Service and Payload ---
#     service = PaymentService(db_session)

#     test_gateway_order_id = "order_GATEWAY_ID_WEBHOOK"

#     webhook_payload = {"id": "evt_unique_webhook_id_123", "event": "payment.captured", "created_at": 1678886400, "payload": {"payment": {"entity": {"id": "pay_WEBHOOK_CAPTURE", "order_id": test_gateway_order_id, "notes": {"internal_payment_id": payment_id}}}}}
#     raw_body = json.dumps(webhook_payload).encode("utf-8")
#     # 2. --- ACT ---
#     await service.handle_webhook_event(payload=webhook_payload, raw_body=raw_body,signature="some_signature")

#     # 3. --- ASSERT ---

#     # Assert: NO calls were made to dependencies
#     # This proves the function returned early
#     mocker.patch("app.core.crypto_service.decrypt_value").assert_not_called()
#     mock_razorpay_client.utility.verify_webhook_signature.assert_not_called()

#     # Assert: The DB state is unchanged
#     await db_session.refresh(db_payment)
#     assert db_payment.status == "captured"  # Unchanged from setup

#     await db_session.refresh(db_order)
#     assert db_order.status == "processing"  # Unchanged from setup

#     # Assert: No *new* event was created
#     stmt = select(GatewayWebhookEvent).where(GatewayWebhookEvent.event_id == processed_event_id)
#     result = await db_session.execute(stmt)
#     events = result.scalars().all()
#     assert len(events) == 1


# async def test_webhook_invalid_signature_fails_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
#     """
#     Integration test for a webhook with an invalid signature.

#     Verifies that on signature failure:
#     1. A GatewayWebhookEvent is created and marked 'failed'.
#     2. The Payment.status in the DB remains 'pending'.
#     3. The related Order.status in the DB remains 'pending_payment'.
#     """

#     # 1. --- ARRANGE ---

#     # --- Mock Dependencies (External) ---
#     mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_webhook_secret_for_fail")

#     # --- CRITICAL: Mock signature verification to FAIL ---
#     mock_failure_exception = Exception("Webhook signature verification failed")
#     mock_razorpay_client.utility.verify_webhook_signature.side_effect = mock_failure_exception

#     # --- Create Real Data in the DB ---
#     db_school = School(name="Integration WH-Fail School", razorpay_key_id_encrypted=b"mock_key", razorpay_key_secret_encrypted=b"mock_secret", razorpay_webhook_secret_encrypted=b"mock_webhook_secret")
#     db_session.add(db_school)

#     db_role = RoleDefinition(role_id=992, role_name="Test WH-Fail Role")
#     db_session.add(db_role)
#     await db_session.flush()

#     parent_user_uuid = uuid.uuid4()
#     parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-whf-{parent_user_uuid}@test.com")
#     db_session.add(parent_user)
#     await db_session.flush()

#     db_parent_profile = await db_session.get(Profile, parent_user_uuid)
#     db_parent_profile.first_name = "Test Parent WH-Fail"
#     db_parent_profile.school_id = db_school.school_id
#     db_parent_profile.is_active = True
#     db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))

#     student_user_uuid = uuid.uuid4()
#     student_user = TempAuthUser(id=student_user_uuid, email=f"student-whf-{student_user_uuid}@test.com")
#     db_session.add(student_user)
#     await db_session.flush()

#     db_student_profile = await db_session.get(Profile, student_user_uuid)
#     db_student_profile.first_name = "Test Student WH-Fail"
#     db_student_profile.school_id = db_school.school_id
#     db_student_profile.is_active = True

#     db_student = Student(user_id=student_user_uuid)
#     db_session.add(db_student)
#     await db_session.flush()

#     db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-WHF-001", total_amount=Decimal("50.00"), status="pending_payment")
#     db_session.add(db_order)
#     await db_session.flush()

#     db_payment = Payment(
#         order_id=db_order.order_id, amount_paid=Decimal("50.00"), status="pending", school_id=db_school.school_id, student_id=db_student.student_id, user_id=parent_user_uuid, gateway_order_id="order_GATEWAY_ID_WHF", gateway_name="razorpay"
#     )
#     db_session.add(db_payment)
#     await db_session.flush()

#     payment_id_to_verify = db_payment.id
#     await db_session.commit()

#     # --- Service and Payload ---
#     service = PaymentService(db_session)
#     test_gateway_order_id = "order_GATEWAY_ID_WEBHOOK"
#     invalid_webhook_payload = {"id": "evt_unique_webhook_id_999_INVALID", "event": "payment.captured", "created_at": 1678886400, "payload": {"payment": {"entity": {"id": "pay_WEBHOOK_INVALID", "order_id": test_gateway_order_id, "notes": {"internal_payment_id": payment_id_to_verify}}}}}
#     raw_body = json.dumps(invalid_webhook_payload).encode("utf-8")
#     # 2. --- ACT ---
#     await service.handle_webhook_event(payload=invalid_webhook_payload, raw_body=raw_body, signature="invalid_webhook_sig")

#     # 3. --- ASSERT ---

#     # Assert: Payment status is UNCHANGED
#     await db_session.refresh(db_payment)
#     assert db_payment.status == "pending"

#     # Assert: Order status is UNCHANGED
#     await db_session.refresh(db_order)
#     assert db_order.status == "pending_payment"

#     # Assert: GatewayWebhookEvent was created and marked 'failed'
#     stmt = select(GatewayWebhookEvent).where(GatewayWebhookEvent.event_id == "evt_unique_webhook_id_999_INVALID")
#     result = await db_session.execute(stmt)
#     webhook_event = result.scalar_one_or_none()

#     assert webhook_event is not None
#     assert webhook_event.status == "failed"
#     assert webhook_event.processing_error == str(mock_failure_exception)


async def test_verify_payment_invalid_signature_fails_integration(db_session: AsyncSession, mocker, mock_razorpay_client: MagicMock):
    """
    Integration test for an invalid signature.
    (Corrected for chk_payment_target constraint)
    """

    # 1. --- ARRANGE ---

    # --- Mock Dependencies (External) ---
    mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_secret_for_fail_test")

    mock_razorpay_client.utility.verify_payment_signature.side_effect = razorpay.errors.SignatureVerificationError("Invalid signature")

    # --- Create Real Data in the DB ---
    db_school = School(name="Integration Fail School", razorpay_key_id_encrypted=b"mock_key_bytes", razorpay_key_secret_encrypted=b"mock_secret_bytes")
    db_session.add(db_school)

    db_role = RoleDefinition(role_id=995, role_name="Test Fail Role")
    db_session.add(db_role)
    await db_session.flush()

    parent_user_uuid = uuid.uuid4()
    parent_user = TempAuthUser(id=parent_user_uuid, email=f"parent-f-{parent_user_uuid}@test.com")
    db_session.add(parent_user)
    await db_session.flush()

    db_parent_profile = await db_session.get(Profile, parent_user_uuid)
    db_parent_profile.first_name = "Test Parent Fail"
    db_parent_profile.school_id = db_school.school_id
    db_parent_profile.is_active = True
    db_session.add(UserRole(user_id=parent_user_uuid, role_id=db_role.role_id))

    student_user_uuid = uuid.uuid4()
    student_user = TempAuthUser(id=student_user_uuid, email=f"student-f-{student_user_uuid}@test.com")
    db_session.add(student_user)
    await db_session.flush()

    db_student_profile = await db_session.get(Profile, student_user_uuid)
    db_student_profile.first_name = "Test Student Fail"
    db_student_profile.school_id = db_school.school_id
    db_student_profile.is_active = True

    db_student = Student(user_id=student_user_uuid)
    db_session.add(db_student)
    await db_session.flush()

    db_order = Order(student_id=db_student.student_id, parent_user_id=db_parent_profile.user_id, school_id=db_school.school_id, order_number="INT-ORD-FAIL-001", total_amount=Decimal("100.00"), status="pending_payment")
    db_session.add(db_order)

    # --- THIS IS THE FIX ---
    # We must flush here to get the db_order.order_id
    await db_session.flush()

    db_payment = Payment(
        order_id=db_order.order_id,  # Now this has a valid ID
        amount_paid=Decimal("100.00"),
        status="pending",
        school_id=db_school.school_id,
        student_id=db_student.student_id,
        user_id=parent_user_uuid,
        gateway_order_id="order_GATEWAY_ID_FAIL",
        gateway_name="razorpay",
    )
    db_session.add(db_payment)
    await db_session.flush()

    payment_id_to_verify = db_payment.id
    await db_session.commit()

    # --- Service and Request ---
    service = PaymentService(db_session)
    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_INVALID_SIG_INTEG", razorpay_order_id="order_GATEWAY_ID_FAIL", razorpay_signature="invalid_signature_string", internal_payment_id=payment_id_to_verify)

    # 2. --- ACT & ASSERT (Exception) ---
    with pytest.raises(HTTPException) as exc_info:
        await service.verify_payment(verification_data=verify_request)

    assert exc_info.value.status_code == 400
    assert "Invalid payment signature" in exc_info.value.detail

    # 3. --- ASSERT (Database State) ---
    await db_session.refresh(db_payment)
    assert db_payment.status == "failed"
    assert db_payment.error_description == "Signature verification failed."

    await db_session.refresh(db_order)
    assert db_order.status == "pending_payment"


async def test_initiate_payment_partial_failure_db_flush_fails(mocker, mock_razorpay_client: MagicMock):
    """
    Tests the edge case where Razorpay order succeeds but the
    database flush (to create the Payment record) fails.

    The transaction should be rolled back by the endpoint's
    dependency manager, so we just assert the DB error is raised.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    parent_uuid = uuid.uuid4()
    school_id = 1
    order_id = 101

    mock_order = MagicMock(spec=Order)
    mock_order.order_id = order_id
    mock_order.school_id = school_id
    mock_order.student_id = 22
    mock_order.total_amount = Decimal("2050.00")
    mock_order.order_number = "ORD-FAIL-001"

    mock_school = MagicMock(spec=School)
    mock_school.school_id = school_id
    mock_school.name = "Test School"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id_bytes"
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes"

    # --- Mock Dependencies ---

    # Mock crypto_service to succeed
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key_123", "rzp_secret_123"])

    # Mock razorpay_client to succeed
    mock_razorpay_client.order.create.return_value = {"id": "order_TEST_RAZORPAY_ID", "amount": 205000}

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    async def db_get_side_effect(model, pk, **kwargs):
        if model == Order and pk == order_id:
            return mock_order
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    db.add = MagicMock()

    # --- CRITICAL: Mock db.flush to FAIL ---
    # We simulate a database constraint violation
    db_error = sqlalchemy.exc.IntegrityError("Mock DB constraint violation", params=None, orig=None)
    db.flush = AsyncMock(side_effect=db_error)

    # --- Service and Request ---
    service = PaymentService(db)
    request = PaymentInitiateRequest(invoice_id=None, order_id=order_id)

    # 2. --- ACT & ASSERT ---

    # We expect the original database error to be raised.
    # The FastAPI `get_db` dependency will catch this and
    # issue a `db.rollback()`.
    with pytest.raises(HTTPException) as exc_info:
        await service.initiate_payment(request_data=request, user_id=str(parent_uuid))

    assert exc_info.value.status_code == 500
    assert "Database error" in exc_info.value.detail

    # 3. --- POST-ASSERT ---

    # Assert: Razorpay *was* called
    mock_razorpay_client.order.create.assert_called_once()

    # Assert: The service *tried* to add the payment
    db.add.assert_called_once()
    assert isinstance(db.add.call_args[0][0], Payment)

    # Assert: The service *tried* to flush (and failed)
    db.flush.assert_called_once()
