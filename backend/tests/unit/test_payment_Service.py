import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest
import razorpay.errors
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gateway_webhook_event import GatewayWebhookEvent
from app.models.invoice import Invoice
from app.models.order import Order
from app.models.payment import Payment
from app.models.school import School
from app.models.student import Student
from app.schemas.payment_schema import PaymentInitiateRequest, PaymentVerificationRequest

# --- Imports from your app ---
from app.services.payment_service import PaymentService

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio


async def test_initiate_payment_for_invoice(mocker, mock_razorpay_client: MagicMock):  # Using the fixture from conftest.py
    """
    Parent initiates payment for fee invoice (Unit test version)
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    parent_uuid = uuid.uuid4()
    school_id = 1
    student_id = 22
    invoice_id = 101

    # Create mock ORM objects that satisfy the service's logic
    mock_school = MagicMock(spec=School)
    mock_school.school_id = school_id
    mock_school.name = "Test School"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id_bytes"
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes"

    mock_class = MagicMock()
    mock_class.school_id = school_id

    mock_student = MagicMock(spec=Student)
    mock_student.student_id = student_id
    mock_student.current_class = mock_class

    mock_invoice = MagicMock(spec=Invoice)
    mock_invoice.id = invoice_id
    mock_invoice.student_id = student_id
    mock_invoice.student = mock_student
    mock_invoice.amount_due = Decimal("1500.00")
    mock_invoice.invoice_number = "INV-001"

    # --- Mock Dependencies ---

    # Mock crypto_service (still needed)
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key_12345", "rzp_secret_67890"])

    # Configure the mock_razorpay_client *instance* from the fixture
    mock_razorpay_client.order.create.return_value = {"id": "order_FROM_FIXTURE_MOCK", "amount": 150000}  # 1500.00 * 100

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # Configure db.get to return our mock objects
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Invoice and pk == invoice_id:
            return mock_invoice
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # Capture the object passed to db.add()
    payment_capture = {}

    def add_side_effect(obj):
        if isinstance(obj, Payment):
            payment_capture["payment"] = obj

    db.add = MagicMock(side_effect=add_side_effect)

    # Mock db.flush to simulate the DB assigning an ID
    async def flush_side_effect():
        if "payment" in payment_capture:
            payment_capture["payment"].id = 999

    db.flush = AsyncMock(side_effect=flush_side_effect)

    # --- Service and Request ---
    service = PaymentService(db)
    request = PaymentInitiateRequest(invoice_id=invoice_id, order_id=None)

    # 2. --- ACT ---
    response = await service.initiate_payment(request_data=request, user_id=str(parent_uuid))

    # 3. --- ASSERT ---

    # Assert: Payment record created and captured
    db.add.assert_called_once()
    assert "payment" in payment_capture
    created_payment = payment_capture["payment"]

    assert isinstance(created_payment, Payment)
    assert created_payment.status == "pending"
    assert created_payment.invoice_id == invoice_id
    assert created_payment.amount_paid == Decimal("1500.00")
    assert created_payment.gateway_order_id == "order_FROM_FIXTURE_MOCK"

    # Assert: Razorpay client.order.create called with correct data
    # We no longer assert on the class constructor (mocker.patch("razorpay.Client"))
    # We now assert on the mock_razorpay_client instance itself.
    mock_razorpay_client.order.create.assert_called_once()
    razorpay_call_data = mock_razorpay_client.order.create.call_args[1]["data"]

    assert razorpay_call_data["amount"] == 150000
    assert razorpay_call_data["currency"] == "INR"
    assert razorpay_call_data["notes"]["target_invoice_id"] == invoice_id
    assert razorpay_call_data["notes"]["target_order_id"] is None

    # Assert: Response contains correct Razorpay and internal IDs
    assert response["razorpay_order_id"] == "order_FROM_FIXTURE_MOCK"
    assert response["razorpay_key_id"] == "rzp_key_12345"
    assert response["amount"] == 150000
    assert response["internal_payment_id"] == 999
    assert response["school_name"] == "Test School"
    assert response["description"] == "Payment for Invoice INV-001"


async def test_initiate_payment_for_order(mocker, mock_razorpay_client: MagicMock):  # Using the fixture from conftest.py
    """
    Parent initiates payment for e-commerce order
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    parent_uuid = uuid.uuid4()
    school_id = 3
    student_id = 23
    order_id = 101

    # Create mock ORM objects
    # NOTE: The Order object itself contains school_id.
    # This is the key difference from the invoice flow.
    mock_order = MagicMock(spec=Order)
    mock_order.order_id = order_id
    mock_order.school_id = school_id  # Assert: school_id fetched from order.school_id
    mock_order.student_id = student_id
    mock_order.total_amount = Decimal("2050.00")
    mock_order.order_number = "ORD-3-20250115-101"

    mock_school = MagicMock(spec=School)
    mock_school.school_id = school_id
    mock_school.name = "Test School Ecom"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id_bytes_ecom"
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes_ecom"

    # --- Mock Dependencies ---

    # Mock crypto_service
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key_ecom", "rzp_secret_ecom"])

    # Configure the mock_razorpay_client *instance* from the fixture
    mock_razorpay_client.order.create.return_value = {"id": "order_ECOMMERCE_MOCK_ID", "amount": 205000}  # 2050.00 * 100

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # Configure db.get to return our mock objects
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Order and pk == order_id:
            return mock_order
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # Capture the object passed to db.add()
    payment_capture = {}

    def add_side_effect(obj):
        if isinstance(obj, Payment):
            payment_capture["payment"] = obj

    db.add = MagicMock(side_effect=add_side_effect)

    # Mock db.flush to simulate the DB assigning an ID
    async def flush_side_effect():
        if "payment" in payment_capture:
            payment_capture["payment"].id = 1000  # Assign a new mock ID

    db.flush = AsyncMock(side_effect=flush_side_effect)

    # --- Service and Request ---
    service = PaymentService(db)
    request = PaymentInitiateRequest(invoice_id=None, order_id=order_id)

    # 2. --- ACT ---
    response = await service.initiate_payment(request_data=request, user_id=str(parent_uuid))

    # 3. --- ASSERT ---

    # Assert: Payment record created with order_id=101, invoice_id=None
    db.add.assert_called_once()
    assert "payment" in payment_capture
    created_payment = payment_capture["payment"]

    assert isinstance(created_payment, Payment)
    assert created_payment.status == "pending"
    assert created_payment.invoice_id is None
    assert created_payment.order_id == order_id
    assert created_payment.amount_paid == Decimal("2050.00")
    assert created_payment.gateway_order_id == "order_ECOMMERCE_MOCK_ID"
    assert created_payment.user_id == str(parent_uuid)
    assert created_payment.school_id == school_id  # Assert: school_id fetched from order.school_id

    # Assert: Razorpay client.order.create called with correct data
    mock_razorpay_client.order.create.assert_called_once()
    razorpay_call_data = mock_razorpay_client.order.create.call_args[1]["data"]

    assert razorpay_call_data["amount"] == 205000
    assert razorpay_call_data["notes"]["target_invoice_id"] is None
    assert razorpay_call_data["notes"]["target_order_id"] == order_id

    # Assert: Response contains correct data
    assert response["razorpay_order_id"] == "order_ECOMMERCE_MOCK_ID"
    assert response["razorpay_key_id"] == "rzp_key_ecom"
    assert response["internal_payment_id"] == 1000
    assert response["school_name"] == "Test School Ecom"
    # Assert: Description = "Payment for Order #ORD-3-..."
    assert response["description"] == "Payment for Order #ORD-3-20250115-101"


def test_initiate_payment_validates_exactly_one_target():
    """
    Cannot initiate payment with both invoice_id AND order_id
    """
    # 1. Test with BOTH IDs provided
    with pytest.raises(ValidationError) as exc_info_both:
        PaymentInitiateRequest(invoice_id=1, order_id=1)

    # Check that the error message is the one we expect from the validator
    assert "Exactly one of invoice_id or order_id must be provided" in str(exc_info_both.value)

    # 2. Test with NEITHER ID provided
    with pytest.raises(ValidationError) as exc_info_none:
        PaymentInitiateRequest(invoice_id=None, order_id=None)

    assert "Exactly one of invoice_id or order_id must be provided" in str(exc_info_none.value)

    # 3. (Optional) Test for success cases just to be sure
    try:
        PaymentInitiateRequest(invoice_id=1, order_id=None)
        PaymentInitiateRequest(invoice_id=None, order_id=1)
    except ValidationError:
        pytest.fail("Validation failed on valid cases (only one ID provided)")


async def test_initiate_payment_gateway_not_configured(mocker):
    """
    Payment fails if school hasn't configured Razorpay.

    This test checks the first check in the service function.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    parent_uuid = uuid.uuid4()
    school_id = 1
    student_id = 22
    invoice_id = 101

    # Mock the object chain to resolve school_id
    mock_class = MagicMock()
    mock_class.school_id = school_id

    mock_student = MagicMock(spec=Student)
    mock_student.student_id = student_id
    mock_student.current_class = mock_class

    mock_invoice = MagicMock(spec=Invoice)
    mock_invoice.id = invoice_id
    mock_invoice.student_id = student_id
    mock_invoice.student = mock_student
    mock_invoice.amount_due = Decimal("1500.00")

    # --- CRITICAL: Mock a school *without* credentials ---
    mock_school_no_keys = MagicMock(spec=School)
    mock_school_no_keys.school_id = school_id
    mock_school_no_keys.name = "Test School (No Keys)"
    mock_school_no_keys.razorpay_key_id_encrypted = None  # Key is missing
    mock_school_no_keys.razorpay_key_secret_encrypted = b"some_secret"  # Even if one is missing

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # Configure db.get to return our mock objects
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Invoice and pk == invoice_id:
            return mock_invoice
        if model == School and pk == school_id:
            return mock_school_no_keys  # Return the misconfigured school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # We don't need to mock db.add or db.flush, as it should fail before that.

    # --- Service and Request ---
    service = PaymentService(db)
    request = PaymentInitiateRequest(invoice_id=invoice_id, order_id=None)

    # 2. --- ACT & ASSERT ---

    # We expect an HTTPException with status code 503
    with pytest.raises(HTTPException) as exc_info:
        await service.initiate_payment(request_data=request, user_id=str(parent_uuid))

    assert exc_info.value.status_code == 503
    assert "Payment gateway is not configured" in exc_info.value.detail


async def test_verify_payment_valid_signature_for_order(mocker, mock_razorpay_client: MagicMock):
    """
    Verify payment with correct Razorpay signature for an E-COMMERCE ORDER.
    This is the KEY INTEGRATION TEST.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 999
    order_id = 101
    school_id = 3

    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_VALID_SIG", razorpay_order_id="order_FROM_FIXTURE_MOCK", razorpay_signature="valid_signature_string", internal_payment_id=payment_id)

    # Mock the internal payment record, status is 'pending'
    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"
    mock_pending_payment.school_id = school_id
    mock_pending_payment.invoice_id = None  # This is for an Order
    mock_pending_payment.order_id = order_id  # Linked to the order

    # Mock the school to get credentials
    mock_school = MagicMock(spec=School)
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id_bytes"  # For _get_razorpay_client

    # Mock the order that needs its status updated
    mock_order = MagicMock(spec=Order)
    mock_order.order_id = order_id
    mock_order.status = "pending_payment"  # Initial state

    # --- Mock Dependencies ---

    # Mock crypto_service (called for verify_payment AND _get_razorpay_client)
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_secret_123", "rzp_key_123", "rzp_secret_123"])  # For verify_payment signature  # For _get_razorpay_client auth  # For _get_razorpay_client auth

    # Configure mock_razorpay_client (from conftest)
    # 1. Signature verification succeeds (returns None)
    mock_razorpay_client.utility.verify_payment_signature.return_value = None
    # 2. Payment fetch succeeds
    mock_razorpay_client.payment.fetch.return_value = {"method": "upi", "notes": {"internal_payment_id": payment_id}}

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.get fetches the payment and the school
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # db.execute fetches the order
    mock_sql_result = MagicMock()
    mock_sql_result.scalar_one_or_none.return_value = mock_order
    db.execute = AsyncMock(return_value=mock_sql_result)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    payment_result = await service.verify_payment(verification_data=verify_request)

    # 3. --- ASSERT ---

    # Assert: Payment status updated to 'captured'
    assert payment_result == mock_pending_payment
    assert mock_pending_payment.status == "captured"
    assert mock_pending_payment.gateway_payment_id == "pay_VALID_SIG"
    assert mock_pending_payment.gateway_signature == "valid_signature_string"
    assert mock_pending_payment.method == "upi"  # From payment.fetch

    # Assert: Signature verification was called
    mock_razorpay_client.utility.verify_payment_signature.assert_called_once_with({"razorpay_order_id": "order_FROM_FIXTURE_MOCK", "razorpay_payment_id": "pay_VALID_SIG", "razorpay_signature": "valid_signature_string"})

    # Assert: Payment fetch was called
    mock_razorpay_client.payment.fetch.assert_called_once_with("pay_VALID_SIG")

    # Assert: If order: order.status = 'processing' (KEY TEST)
    db.execute.assert_called_once()  # Check that the select(Order) query was run
    # Check the *mock_order* object itself was modified
    assert mock_order.status == "processing"

    # Assert: Transaction was committed
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(mock_pending_payment)


async def test_verify_payment_valid_signature_for_invoice(mocker, mock_razorpay_client: MagicMock):
    """
    Verify payment with correct Razorpay signature for a FEE INVOICE.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 998
    invoice_id = 102
    school_id = 4
    parent_uuid = uuid.uuid4()

    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_VALID_SIG_INV", razorpay_order_id="order_INVOICE_MOCK", razorpay_signature="valid_signature_string_inv", internal_payment_id=payment_id)

    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"
    mock_pending_payment.school_id = school_id
    mock_pending_payment.invoice_id = invoice_id  # Linked to the invoice
    mock_pending_payment.order_id = None
    mock_pending_payment.user_id = parent_uuid

    mock_school = MagicMock(spec=School)
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes_inv"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id_bytes_inv"

    mock_invoice = MagicMock(spec=Invoice)
    mock_invoice.id = invoice_id
    mock_invoice.payment_status = "Unpaid"  # Initial state

    # --- Mock Dependencies ---

    # Mock crypto_service
    mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_secret_inv", "rzp_key_inv", "rzp_secret_inv"])  # For verify_payment  # For _get_razorpay_client  # For _get_razorpay_client

    # Mock invoice_service.allocate_payment_to_invoice_items
    # The code calls this function. We must mock it.
    mock_allocate = mocker.patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock)

    # Configure mock_razorpay_client
    mock_razorpay_client.utility.verify_payment_signature.return_value = None
    mock_razorpay_client.payment.fetch.return_value = {"method": "netbanking", "notes": {}}

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.get fetches payment, school, AND invoice
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        if model == Invoice and pk == invoice_id:
            # This is the `if invoice:` check in the service
            return mock_invoice
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    await service.verify_payment(verification_data=verify_request)

    # 3. --- ASSERT ---

    # Assert: Payment status updated
    assert mock_pending_payment.status == "captured"
    assert mock_pending_payment.method == "netbanking"

    # Assert: Signature verification was called
    mock_razorpay_client.utility.verify_payment_signature.assert_called_once()

    # Assert: If invoice: allocate_payment_to_invoice_items is called
    # We assert that the `if invoice:` block was entered
    mock_allocate.assert_called_once_with(db=db, payment_id=payment_id, user_id=parent_uuid)

    # Assert: Transaction was committed
    db.commit.assert_called_once()


async def test_verify_payment_invalid_signature_fails(mocker, mock_razorpay_client: MagicMock):
    """
    Verification with invalid signature marks payment as 'failed'
    and raises HTTPException 400.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 997
    school_id = 5

    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_INVALID_SIG", razorpay_order_id="order_INVALID", razorpay_signature="invalid_signature_string", internal_payment_id=payment_id)

    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"
    mock_pending_payment.school_id = school_id
    mock_pending_payment.invoice_id = None
    mock_pending_payment.order_id = 103

    mock_school = MagicMock(spec=School)
    mock_school.razorpay_key_secret_encrypted = b"encrypted_key_secret_bytes_invalid"

    # --- Mock Dependencies ---

    # Mock crypto_service
    mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_secret_invalid")

    # --- CRITICAL: Mock signature verification to FAIL ---
    mock_razorpay_client.utility.verify_payment_signature.side_effect = razorpay.errors.SignatureVerificationError("Invalid signature")

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.get fetches the payment and the school
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT & ASSERT ---

    # Assert: HTTPException 400 raised
    with pytest.raises(HTTPException) as exc_info:
        await service.verify_payment(verification_data=verify_request)

    assert exc_info.value.status_code == 400
    assert "Invalid payment signature" in exc_info.value.detail

    # 3. --- POST-ASSERT (Check state after exception) ---

    # Assert: Payment status = 'failed'
    assert mock_pending_payment.status == "failed"
    assert mock_pending_payment.error_description == "Signature verification failed."

    # Assert: Transaction was committed (to save the 'failed' status)
    db.commit.assert_called_once()

    # Assert: Order/Invoice status NOT updated
    # We check that db.execute (to fetch Order) was NEVER called
    db.execute.assert_not_called()
    # We check that _get_razorpay_client (to fetch payment details) was NEVER called
    mock_razorpay_client.payment.fetch.assert_not_called()


async def test_verify_payment_idempotent(mocker, mock_razorpay_client: MagicMock):
    """
    Verifying an already-captured payment returns immediately
    and makes no database changes.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 996

    verify_request = PaymentVerificationRequest(razorpay_payment_id="pay_ALREADY_CAPTURED", razorpay_order_id="order_ALREADY_CAPTURED", razorpay_signature="some_signature", internal_payment_id=payment_id)

    # --- CRITICAL: Mock a payment that is *already* 'captured' ---
    mock_captured_payment = MagicMock(spec=Payment)
    mock_captured_payment.id = payment_id
    mock_captured_payment.status = "captured"

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.get fetches the already-captured payment
    db.get = AsyncMock(return_value=mock_captured_payment)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    result = await service.verify_payment(verification_data=verify_request)

    # 3. --- ASSERT ---

    # Assert: Returns the existing payment object
    assert result == mock_captured_payment

    # Assert: No database changes were made
    db.commit.assert_not_called()
    db.flush.assert_not_called()
    db.refresh.assert_not_called()

    # Assert: No calls to Razorpay or crypto service were made
    mocker.patch("app.core.crypto_service.decrypt_value").assert_not_called()
    mock_razorpay_client.utility.verify_payment_signature.assert_not_called()
    mock_razorpay_client.payment.fetch.assert_not_called()


async def test_webhook_payment_captured_event_for_order(mocker, mock_razorpay_client: MagicMock):
    """
    Razorpay sends 'payment.captured' webhook for an E-COMMERCE ORDER.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 995
    order_id = 105
    school_id = 6

    # This is the payload Razorpay would send
    payload = {
        "id": "evt_unique_webhook_id_123",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_WEBHOOK_CAPTURE",
                    "notes": {
                        # CRITICAL: This is how we link it to our internal DB
                        "internal_payment_id": payment_id
                    },
                }
            }
        },
    }

    # Mock the internal payment record, status is 'pending'
    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"  # It's pending before the webhook
    mock_pending_payment.school_id = school_id
    mock_pending_payment.invoice_id = None
    mock_pending_payment.order_id = order_id

    # Mock the school to get the webhook secret
    mock_school = MagicMock(spec=School)
    mock_school.razorpay_webhook_secret_encrypted = b"encrypted_webhook_secret"

    # Mock the order that needs its status updated
    mock_order = MagicMock(spec=Order)
    mock_order.order_id = order_id
    mock_order.status = "pending_payment"  # Initial state

    # --- Mock Dependencies ---

    # Mock crypto_service
    mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_webhook_secret_123")

    # Configure mock_razorpay_client
    # 1. Webhook signature verification succeeds
    mock_razorpay_client.utility.verify_webhook_signature.return_value = None

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.execute for idempotency check (returns no existing event)
    mock_idempotency_check_result = MagicMock()
    mock_idempotency_check_result.scalars.return_value.first.return_value = None

    # db.execute for fetching the order
    mock_order_fetch_result = MagicMock()
    mock_order_fetch_result.scalar_one_or_none.return_value = mock_order

    db.execute = AsyncMock(side_effect=[mock_idempotency_check_result, mock_order_fetch_result])  # First call (idempotency)  # Second call (fetch order)

    # db.get fetches the payment and the school
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # Capture the object passed to db.add()
    webhook_event_capture = {}

    def add_side_effect(obj):
        if isinstance(obj, GatewayWebhookEvent):
            webhook_event_capture["event"] = obj

    db.add = MagicMock(side_effect=add_side_effect)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    await service.handle_webhook_event(payload=payload, signature="valid_webhook_sig")

    # 3. --- ASSERT ---

    # Assert: gateway_webhook_events record created
    db.add.assert_called_once()
    assert "event" in webhook_event_capture
    created_event = webhook_event_capture["event"]

    assert isinstance(created_event, GatewayWebhookEvent)
    assert created_event.event_id == "evt_unique_webhook_id_123"
    assert created_event.status == "processed"  # Final status

    # Assert: Webhook signature was verified
    mock_razorpay_client.utility.verify_webhook_signature.assert_called_once_with(str(payload), "valid_webhook_sig", "rzp_webhook_secret_123")  # The service stringifies the payload

    # Assert: Payment status updated to 'captured'
    assert mock_pending_payment.status == "captured"
    assert mock_pending_payment.gateway_payment_id == "pay_WEBHOOK_CAPTURE"

    # Assert: Order status updated to 'processing'
    assert mock_order.status == "processing"

    # Assert: Transaction was committed
    # Called twice: once for 'received', once for 'processed'
    assert db.commit.call_count == 2


async def test_webhook_payment_captured_event_for_invoice(mocker, mock_razorpay_client: MagicMock):
    """
    Razorpay sends 'payment.captured' webhook for a FEE INVOICE.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 994
    invoice_id = 106
    school_id = 7

    payload = {"id": "evt_unique_webhook_id_456", "event": "payment.captured", "payload": {"payment": {"entity": {"id": "pay_WEBHOOK_CAPTURE_INV", "notes": {"internal_payment_id": payment_id}}}}}

    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"
    mock_pending_payment.school_id = school_id
    mock_pending_payment.invoice_id = invoice_id  # Linked to invoice
    mock_pending_payment.order_id = None

    mock_school = MagicMock(spec=School)
    mock_school.razorpay_webhook_secret_encrypted = b"encrypted_webhook_secret_inv"

    mock_invoice = MagicMock(spec=Invoice)
    mock_invoice.id = invoice_id
    mock_invoice.payment_status = "Unpaid"  # Initial state

    # --- Mock Dependencies ---

    mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_webhook_secret_456")

    mock_razorpay_client.utility.verify_webhook_signature.return_value = None

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.execute for idempotency check (returns no existing event)
    mock_idempotency_check_result = MagicMock()
    mock_idempotency_check_result.scalars.return_value.first.return_value = None
    db.execute = AsyncMock(return_value=mock_idempotency_check_result)

    # db.get fetches payment, school, AND invoice
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        if model == Invoice and pk == invoice_id:
            return mock_invoice  # For updating invoice.payment_status
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    db.add = MagicMock()  # We just need to check it was called

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    await service.handle_webhook_event(payload=payload, signature="valid_webhook_sig_inv")

    # 3. --- ASSERT ---

    # Assert: Webhook signature was verified
    mock_razorpay_client.utility.verify_webhook_signature.assert_called_once()

    # Assert: Payment status updated
    assert mock_pending_payment.status == "captured"

    # Assert: Invoice status updated
    assert mock_invoice.payment_status == "paid"

    # Assert: Transaction was committed twice
    assert db.commit.call_count == 2


async def test_webhook_idempotent_duplicate_event_id(mocker, mock_razorpay_client: MagicMock, db_session: AsyncSession):  # Using a mock, but could be db_session
    """
    Receiving the same webhook event ID twice does nothing.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    event_id = "evt_ALREADY_PROCESSED_456"

    payload = {
        "id": event_id,
        "event": "payment.captured",
        # ... other payload data ...
    }

    # --- CRITICAL: Mock an *existing* webhook event in the DB ---
    mock_existing_event = MagicMock(spec=GatewayWebhookEvent)
    mock_existing_event.event_id = event_id
    mock_existing_event.status = "processed"

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.execute for idempotency check *finds* the existing event
    mock_idempotency_check_result = MagicMock()
    mock_idempotency_check_result.scalars.return_value.first.return_value = mock_existing_event
    db.execute = AsyncMock(return_value=mock_idempotency_check_result)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    await service.handle_webhook_event(payload=payload, signature="some_signature")

    # 3. --- ASSERT ---

    # Assert: The idempotency check was performed
    stmt = db.execute.call_args[0][0]
    assert GatewayWebhookEvent.__table__ in [t for t in stmt.froms]
    assert stmt.selected_columns._all_columns[0].name == "id"

    # Assert: NO new webhook event was added
    db.add.assert_not_called()

    # Assert: NO transaction was committed
    db.commit.assert_not_called()

    # Assert: NO further processing (like fetching Payment or School) happened
    db.get.assert_not_called()

    # Assert: NO signature verification was performed
    mock_razorpay_client.utility.verify_webhook_signature.assert_not_called()


async def test_webhook_invalid_signature_fails(mocker, mock_razorpay_client: MagicMock):
    """
    Webhook with invalid signature is logged as 'failed' and does not
    update the payment.
    """
    # 1. --- ARRANGE ---

    # --- Mock Data ---
    payment_id = 993
    school_id = 8

    payload = {"id": "evt_unique_webhook_id_789_INVALID", "event": "payment.captured", "payload": {"payment": {"entity": {"id": "pay_WEBHOOK_INVALID", "notes": {"internal_payment_id": payment_id}}}}}

    mock_pending_payment = MagicMock(spec=Payment)
    mock_pending_payment.id = payment_id
    mock_pending_payment.status = "pending"  # Initial 'pending' status
    mock_pending_payment.school_id = school_id

    mock_school = MagicMock(spec=School)
    mock_school.razorpay_webhook_secret_encrypted = b"encrypted_webhook_secret_invalid"

    # --- Mock Dependencies ---

    mocker.patch("app.core.crypto_service.decrypt_value", return_value="rzp_webhook_secret_invalid")

    # --- CRITICAL: Mock signature verification to FAIL ---
    mock_razoray_exception = Exception("Webhook signature verification failed")
    mock_razorpay_client.utility.verify_webhook_signature.side_effect = mock_razoray_exception

    # Mock AsyncSession
    db = AsyncMock(spec=AsyncSession)

    # db.execute for idempotency check (returns no existing event)
    mock_idempotency_check_result = MagicMock()
    mock_idempotency_check_result.scalars.return_value.first.return_value = None
    db.execute = AsyncMock(return_value=mock_idempotency_check_result)

    # db.get fetches payment and school
    async def db_get_side_effect(model, pk, **kwargs):
        if model == Payment and pk == payment_id:
            return mock_pending_payment
        if model == School and pk == school_id:
            return mock_school
        return None

    db.get = AsyncMock(side_effect=db_get_side_effect)

    # Capture the new GatewayWebhookEvent
    webhook_event_capture = {}

    def add_side_effect(obj):
        if isinstance(obj, GatewayWebhookEvent):
            webhook_event_capture["event"] = obj

    db.add = MagicMock(side_effect=add_side_effect)

    # --- Service ---
    service = PaymentService(db)

    # 2. --- ACT ---
    await service.handle_webhook_event(payload=payload, signature="invalid_webhook_sig")

    # 3. --- ASSERT ---

    # Assert: gateway_webhook_events record created and marked as 'failed'
    db.add.assert_called_once()
    assert "event" in webhook_event_capture
    created_event = webhook_event_capture["event"]

    assert created_event.event_id == "evt_unique_webhook_id_789_INVALID"
    # The status should be 'failed' after the exception is caught
    assert created_event.status == "failed"
    # Assert: processing_error field populated
    assert created_event.processing_error == str(mock_razoray_exception)

    # Assert: Signature verification was called (and failed)
    mock_razorpay_client.utility.verify_webhook_signature.assert_called_once()

    # Assert: Payment status was NOT updated
    assert mock_pending_payment.status == "pending"  # Remains unchanged

    # Assert: Transaction was committed twice
    # 1. To save the 'received' event
    # 2. To save the 'failed' status and error message
    assert db.commit.call_count == 2
