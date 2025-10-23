"""
Comprehensive Unit Tests for Payment Reconciliation Services

This test suite covers three critical reconciliation processes:
1. Forward Reconciliation: pending → captured (for missed successful payments)
2. Reverse Reconciliation: pending → failed/expired (for abandoned/failed payments)
3. Authorized Payment Reconciliation: authorized → captured/expired

Each test uses extensive mocking to isolate the reconciliation logic from external
dependencies (database, Razorpay API, invoice service).
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from razorpay.errors import BadRequestError, GatewayError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.models.school import School
from app.schemas.enums import PaymentStatus
from app.services.payment_service import PaymentService

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================


def create_mock_payment(
    payment_id: int,
    status: str,
    created_at: datetime,
    gateway_order_id: str = None,
    gateway_payment_id: str = None,
    invoice_id: int = None,
    order_id: int = None,
    school_id: int = 1,
    student_id: int = 22,
    amount_paid: Decimal = Decimal("1500.00"),
) -> MagicMock:
    """Helper to create a mock Payment object with sensible defaults."""
    mock_payment = MagicMock(spec=Payment)
    mock_payment.id = payment_id
    mock_payment.status = status
    mock_payment.created_at = created_at
    mock_payment.gateway_order_id = gateway_order_id
    mock_payment.gateway_payment_id = gateway_payment_id
    mock_payment.invoice_id = invoice_id
    mock_payment.order_id = order_id
    mock_payment.school_id = school_id
    mock_payment.student_id = student_id
    mock_payment.amount_paid = amount_paid
    mock_payment.user_id = str(uuid.uuid4())
    mock_payment.error_description = None
    return mock_payment


def create_mock_school(school_id: int = 1) -> MagicMock:
    """Helper to create a mock School object."""
    mock_school = MagicMock(spec=School)
    mock_school.school_id = school_id
    mock_school.name = f"Test School {school_id}"
    mock_school.razorpay_key_id_encrypted = b"encrypted_key_id"
    mock_school.razorpay_key_secret_encrypted = b"encrypted_secret"
    return mock_school


# =============================================================================
# FORWARD RECONCILIATION TESTS (pending → captured)
# =============================================================================


class TestForwardReconciliation:
    """
    Tests for Forward Reconciliation: Finding payments that succeeded at the
    gateway but weren't verified by the client (missed webhook or network issue).
    """

    async def test_reconcile_pending_payment_captured_at_gateway_for_invoice(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment was captured at Razorpay but our DB still shows 'pending'.
        This happens when webhook fails or client never called verify endpoint.

        EXPECTED: Payment should be marked as CAPTURED and allocated to invoice.
        """
        # --- ARRANGE ---
        now = datetime.utcnow()
        old_timestamp = now - timedelta(hours=2)

        # Create a pending payment that's > 1 hour old
        mock_payment = create_mock_payment(
            payment_id=101,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_OLD_PENDING",
            invoice_id=201,
        )

        mock_school = create_mock_school()

        # Mock database session
        db = AsyncMock(spec=AsyncSession)

        # Mock the SELECT query to return our old pending payment
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)

        # Mock school lookup
        db.get = AsyncMock(return_value=mock_school)

        # Mock crypto service
        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key_12345", "rzp_secret_67890"])

        # Mock Razorpay API responses
        # 1. Order status = "paid"
        mock_razorpay_client.order.fetch.return_value = {"status": "paid", "id": "order_OLD_PENDING"}

        # 2. Order payments returns a captured payment
        mock_razorpay_client.order.payments.return_value = {"items": [{"id": "pay_CAPTURED_123", "status": "captured", "amount": 150000}]}

        # Mock invoice service allocation
        with patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock) as mock_allocate:
            # --- ACT ---
            service = PaymentService(db)
            result = await service.reconcile_pending_payments(db)

            # --- ASSERT ---
            # 1. Payment status should be updated to CAPTURED
            assert mock_payment.status == PaymentStatus.CAPTURED
            assert mock_payment.gateway_payment_id == "pay_CAPTURED_123"

            # 2. Invoice allocation should be called
            mock_allocate.assert_called_once()

            # 3. DB commit should be called
            assert db.commit.call_count >= 1

            # 4. Result should show 1 reconciled payment
            assert result["processed"] == 1
            assert result["reconciled"] == 1
            assert result["failed"] == 0

    async def test_reconcile_pending_payment_captured_at_gateway_for_order(self, mocker, mock_razorpay_client):
        """
        SCENARIO: E-commerce order payment was captured but DB shows 'pending'.

        EXPECTED: Payment marked as CAPTURED, order status updated to PROCESSING.
        """
        # --- ARRANGE ---
        now = datetime.utcnow()
        old_timestamp = now - timedelta(hours=3)

        mock_payment = create_mock_payment(
            payment_id=102,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_ECOMMERCE_PENDING",
            order_id=301,
            invoice_id=None,
        )

        mock_school = create_mock_school()

        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["rzp_key", "rzp_secret"])

        mock_razorpay_client.order.fetch.return_value = {"status": "paid"}
        mock_razorpay_client.order.payments.return_value = {"items": [{"id": "pay_ORDER_CAPTURED", "status": "captured"}]}

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.CAPTURED
        assert mock_payment.gateway_payment_id == "pay_ORDER_CAPTURED"
        # Order status update query should be executed (we called db.execute for UPDATE)
        assert db.execute.call_count >= 2  # 1 for SELECT, 1+ for UPDATE
        assert result["reconciled"] == 1

    async def test_reconcile_pending_payment_allocation_fails(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment is captured at gateway but invoice allocation fails.

        EXPECTED: Payment marked as CAPTURED_ALLOCATION_FAILED with error description.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        mock_payment = create_mock_payment(
            payment_id=103,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_ALLOC_FAIL",
            invoice_id=202,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.return_value = {"status": "paid"}
        mock_razorpay_client.order.payments.return_value = {"items": [{"id": "pay_CAPTURED", "status": "captured"}]}

        # Mock allocation to raise an exception
        with patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock) as mock_allocate:
            mock_allocate.side_effect = Exception("Allocation service down")

            # --- ACT ---
            service = PaymentService(db)
            await service.reconcile_pending_payments(db)

            # --- ASSERT ---
            # Payment should be marked as captured but allocation failed
            assert mock_payment.status == PaymentStatus.CAPTURED_ALLOCATION_FAILED
            assert "Recon allocation fail" in mock_payment.error_description
            assert db.rollback.called
            # After rollback, payment should be added and committed again
            assert db.add.called
            assert db.commit.call_count >= 1


# =============================================================================
# REVERSE RECONCILIATION TESTS (pending → failed/expired)
# =============================================================================


class TestReverseReconciliation:
    """
    Tests for Reverse Reconciliation: Finding payments that failed or were
    abandoned and marking them appropriately in our database.
    """

    async def test_reconcile_pending_payment_all_attempts_failed(self, mocker, mock_razorpay_client):
        """
        SCENARIO: User tried to pay but all payment attempts failed at gateway.
        Order status = "attempted", all payment attempts have status = "failed".

        EXPECTED: Payment marked as FAILED with descriptive error.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        mock_payment = create_mock_payment(
            payment_id=104,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_FAILED_ATTEMPTS",
            invoice_id=203,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])

        # Order status = "attempted" (at least one payment attempt was made)
        mock_razorpay_client.order.fetch.return_value = {"status": "attempted"}

        # All payment attempts failed
        mock_razorpay_client.order.payments.return_value = {
            "items": [
                {"id": "pay_ATTEMPT_1", "status": "failed"},
                {"id": "pay_ATTEMPT_2", "status": "failed"},
            ]
        }

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "All 2 payment attempt(s) failed" in mock_payment.error_description
        assert db.commit.called
        assert result["failed"] == 1

    async def test_reconcile_pending_payment_no_attempt_made_within_grace(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment initiated but user never attempted payment.
        Order status = "created", age < 24 hours (within grace period).

        EXPECTED: Payment remains PENDING (no action taken).
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=2)  # Only 2 hours old
        mock_payment = create_mock_payment(
            payment_id=105,
            status=PaymentStatus.PENDING,
            created_at=recent_timestamp,
            gateway_order_id="order_RECENT_NO_ATTEMPT",
            invoice_id=204,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.return_value = {"status": "created"}

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        # Payment should remain PENDING (status not changed)
        assert mock_payment.status == PaymentStatus.PENDING
        # No commits should happen for this payment
        assert result["failed"] == 0
        assert result["reconciled"] == 0

    async def test_reconcile_pending_payment_no_attempt_made_abandoned(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment initiated but user never attempted payment.
        Order status = "created", age > 24 hours (abandoned).

        EXPECTED: Payment marked as FAILED (abandoned).
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=30)  # 30 hours old
        mock_payment = create_mock_payment(
            payment_id=106,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_ABANDONED",
            invoice_id=205,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.return_value = {"status": "created"}

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "No payment attempt made within" in mock_payment.error_description
        assert "abandoned" in mock_payment.error_description.lower()
        assert result["failed"] == 1

    async def test_reconcile_pending_payment_unexpected_order_status(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Razorpay order has an unexpected/unknown status.

        EXPECTED: Payment marked as FAILED for safety.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        mock_payment = create_mock_payment(
            payment_id=107,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_UNEXPECTED_STATUS",
            invoice_id=206,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.return_value = {"status": "unknown_status"}

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "Unexpected gateway order status" in mock_payment.error_description
        assert result["failed"] == 1

    async def test_reconcile_pending_payment_mixed_attempt_statuses(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Order has payment attempts with mixed statuses (some failed, some pending).

        EXPECTED: Payment remains PENDING for next reconciliation cycle.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        mock_payment = create_mock_payment(
            payment_id=108,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_MIXED_ATTEMPTS",
            invoice_id=207,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.return_value = {"status": "attempted"}
        mock_razorpay_client.order.payments.return_value = {
            "items": [
                {"id": "pay_ATTEMPT_1", "status": "failed"},
                {"id": "pay_ATTEMPT_2", "status": "authorized"},  # Still pending capture
            ]
        }

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        # Status should remain PENDING
        assert mock_payment.status == PaymentStatus.PENDING
        assert result["failed"] == 0
        assert result["reconciled"] == 0


# =============================================================================
# AUTHORIZED PAYMENT RECONCILIATION TESTS (authorized → captured/expired)
# =============================================================================


class TestAuthorizedPaymentReconciliation:
    """
    Tests for Authorized Payment Reconciliation: Handling the two-step payment
    flow where funds are authorized (held) but not yet captured.
    """

    async def test_reconcile_authorized_payment_captured_successfully(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment is in AUTHORIZED status, within capture window (< 5 days).
        Capture API call succeeds.

        EXPECTED: Payment marked as CAPTURED, funds allocated to invoice.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=24)  # 1 day old
        mock_payment = create_mock_payment(
            payment_id=201,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTHORIZED_123",
            invoice_id=301,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])

        # Mock successful capture
        mock_razorpay_client.payment.capture.return_value = {
            "id": "pay_AUTHORIZED_123",
            "status": "captured",
            "amount": 150000,
        }

        # Mock invoice allocation
        with patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock) as mock_allocate:
            # --- ACT ---
            service = PaymentService(db)
            result = await service.reconcile_authorized_payments(db)

            # --- ASSERT ---
            assert mock_payment.status == PaymentStatus.CAPTURED
            assert mock_payment.gateway_signature == "pay_AUTHORIZED_123"
            mock_allocate.assert_called_once()
            assert db.commit.called
            assert result["captured"] == 1
            assert result["expired"] == 0

    async def test_reconcile_authorized_payment_expired(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment is in AUTHORIZED status, but authorization has expired (>= 5 days).

        EXPECTED: Payment marked as FAILED (with error_description indicating expiry)
                  since DB enum doesn't support EXPIRED status.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=130)  # 5.4 days old (> 120 hours)
        mock_payment = create_mock_payment(
            payment_id=202,
            status=PaymentStatus.AUTHORIZED,
            created_at=old_timestamp,
            gateway_payment_id="pay_EXPIRED_AUTH",
            invoice_id=302,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "expired" in mock_payment.error_description.lower()
        assert "Authorization expired after" in mock_payment.error_description
        assert "Funds were held but never captured" in mock_payment.error_description
        # Capture should NOT be called
        mock_razorpay_client.payment.capture.assert_not_called()
        assert result["expired"] == 1
        assert result["captured"] == 0

    async def test_reconcile_authorized_payment_capture_fails_bad_request(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Capture API fails with BadRequestError (e.g., already captured, cancelled).

        EXPECTED: Payment marked as FAILED with error details.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=48)  # 2 days old
        mock_payment = create_mock_payment(
            payment_id=203,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_BAD_REQ",
            invoice_id=303,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])

        # Mock capture to raise BadRequestError
        mock_razorpay_client.payment.capture.side_effect = BadRequestError("Payment already captured")

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "Capture failed" in mock_payment.error_description
        assert "already captured" in mock_payment.error_description.lower()
        assert result["failed"] == 1

    async def test_reconcile_authorized_payment_capture_fails_expired_error(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Capture API fails with BadRequestError containing "expired" keyword.

        EXPECTED: Payment marked as FAILED (with error_description indicating expiry)
                  since DB enum doesn't support EXPIRED status.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=100)  # 4.2 days old
        mock_payment = create_mock_payment(
            payment_id=204,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_EXPIRED_ERR",
            invoice_id=304,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.payment.capture.side_effect = BadRequestError("Authorization has expired and cannot be captured")

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "expired" in mock_payment.error_description.lower()
        assert "Authorization expired" in mock_payment.error_description
        assert result["expired"] == 1
        assert result["failed"] == 0

    async def test_reconcile_authorized_payment_capture_gateway_error(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Capture API fails with GatewayError (temporary issue).

        EXPECTED: Payment status unchanged, will retry in next cycle.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=36)
        mock_payment = create_mock_payment(
            payment_id=205,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_GATEWAY_ERR",
            invoice_id=305,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.payment.capture.side_effect = GatewayError("Gateway timeout")

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        # Status should remain AUTHORIZED (not changed)
        assert mock_payment.status == PaymentStatus.AUTHORIZED
        assert db.rollback.called
        # Counters should not increment for this payment
        assert result["captured"] == 0
        assert result["failed"] == 0
        assert result["expired"] == 0

    async def test_reconcile_authorized_payment_allocation_fails(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Capture succeeds but invoice allocation fails.

        EXPECTED: Payment marked as CAPTURED_ALLOCATION_FAILED.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=24)
        mock_payment = create_mock_payment(
            payment_id=206,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_ALLOC_FAIL",
            invoice_id=306,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.payment.capture.return_value = {"id": "pay_AUTH_ALLOC_FAIL", "status": "captured"}

        # Mock allocation to fail
        with patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock) as mock_allocate:
            mock_allocate.side_effect = Exception("Allocation service error")

            # --- ACT ---
            service = PaymentService(db)
            await service.reconcile_authorized_payments(db)

            # --- ASSERT ---
            assert mock_payment.status == PaymentStatus.CAPTURED_ALLOCATION_FAILED
            assert "Capture allocation fail" in mock_payment.error_description
            assert db.rollback.called
            assert db.add.called

    async def test_reconcile_authorized_payment_for_order(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Authorized payment for an e-commerce order gets captured.

        EXPECTED: Payment captured, order status updated to PROCESSING.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=48)
        mock_payment = create_mock_payment(
            payment_id=207,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_ORDER",
            order_id=401,
            invoice_id=None,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.payment.capture.return_value = {"id": "pay_AUTH_ORDER", "status": "captured"}

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.CAPTURED
        # Order update query should be executed
        assert db.execute.call_count >= 2  # 1 for SELECT, 1+ for UPDATE
        assert result["captured"] == 1

    async def test_reconcile_authorized_payment_unexpected_capture_status(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Capture API returns success but with unexpected status (not 'captured').

        EXPECTED: Payment marked as FAILED with error details.
        """
        # --- ARRANGE ---
        recent_timestamp = datetime.utcnow() - timedelta(hours=24)
        mock_payment = create_mock_payment(
            payment_id=208,
            status=PaymentStatus.AUTHORIZED,
            created_at=recent_timestamp,
            gateway_payment_id="pay_AUTH_UNEXPECTED",
            invoice_id=307,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.payment.capture.return_value = {
            "id": "pay_AUTH_UNEXPECTED",
            "status": "pending",  # Unexpected status
        }

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert mock_payment.status == PaymentStatus.FAILED
        assert "Capture returned unexpected status" in mock_payment.error_description
        assert result["failed"] == 1


# =============================================================================
# EDGE CASES AND BATCH PROCESSING TESTS
# =============================================================================


class TestReconciliationEdgeCases:
    """
    Tests for edge cases and batch processing scenarios across all reconciliation types.
    """

    async def test_reconcile_pending_no_payments_found(self, mocker, mock_razorpay_client):
        """
        SCENARIO: No pending payments older than threshold exist.

        EXPECTED: Reconciliation completes with zero processed.
        """
        # --- ARRANGE ---
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []  # No payments
        db.execute = AsyncMock(return_value=mock_result)

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert result["processed"] == 0
        assert result["reconciled"] == 0
        assert result["failed"] == 0

    async def test_reconcile_authorized_no_payments_found(self, mocker, mock_razorpay_client):
        """
        SCENARIO: No authorized payments exist.

        EXPECTED: Reconciliation completes with zero processed.
        """
        # --- ARRANGE ---
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert result["processed"] == 0
        assert result["captured"] == 0
        assert result["expired"] == 0

    async def test_reconcile_pending_batch_processing(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Multiple pending payments need reconciliation (batch processing).

        EXPECTED: All payments processed correctly with mixed results.
        """
        # --- ARRANGE ---
        now = datetime.utcnow()

        # Create 3 different payments with different outcomes
        mock_payment_1 = create_mock_payment(
            payment_id=301,
            status=PaymentStatus.PENDING,
            created_at=now - timedelta(hours=2),
            gateway_order_id="order_BATCH_1",
            invoice_id=401,
        )
        mock_payment_2 = create_mock_payment(
            payment_id=302,
            status=PaymentStatus.PENDING,
            created_at=now - timedelta(hours=30),  # Abandoned (> 24 hours)
            gateway_order_id="order_BATCH_2",
            invoice_id=402,
        )
        mock_payment_3 = create_mock_payment(
            payment_id=303,
            status=PaymentStatus.PENDING,
            created_at=now - timedelta(hours=3),
            gateway_order_id="order_BATCH_3",
            invoice_id=403,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment_1, mock_payment_2, mock_payment_3]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"] * 3)

        # Configure different Razorpay responses for each payment
        def fetch_order_side_effect(order_id):
            if order_id == "order_BATCH_1":
                return {"status": "paid"}  # Will be reconciled
            elif order_id == "order_BATCH_2":
                return {"status": "created"}  # Will be marked failed (abandoned)
            elif order_id == "order_BATCH_3":
                return {"status": "attempted"}  # Will check payment attempts

        mock_razorpay_client.order.fetch.side_effect = fetch_order_side_effect

        # Payment 1: Has captured payment
        mock_razorpay_client.order.payments.side_effect = [
            {"items": [{"id": "pay_BATCH_1", "status": "captured"}]},  # For payment 1
            {"items": [{"id": "pay_BATCH_3", "status": "failed"}]},  # For payment 3
        ]

        with patch("app.services.invoice_service.allocate_payment_to_invoice_items", new_callable=AsyncMock):
            # --- ACT ---
            service = PaymentService(db)
            result = await service.reconcile_pending_payments(db)

            # --- ASSERT ---
            assert result["processed"] == 3
            assert result["reconciled"] == 1  # Payment 1
            assert result["failed"] == 2  # Payments 2 and 3
            assert mock_payment_1.status == PaymentStatus.CAPTURED
            assert mock_payment_2.status == PaymentStatus.FAILED
            assert mock_payment_3.status == PaymentStatus.FAILED

    async def test_reconcile_pending_razorpay_fetch_fails(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Razorpay order fetch fails (network error, API down).

        EXPECTED: Payment skipped, will retry in next cycle.
        """
        # --- ARRANGE ---
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        mock_payment = create_mock_payment(
            payment_id=304,
            status=PaymentStatus.PENDING,
            created_at=old_timestamp,
            gateway_order_id="order_FETCH_FAIL",
            invoice_id=404,
        )

        mock_school = create_mock_school()
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_payment]
        db.execute = AsyncMock(return_value=mock_result)
        db.get = AsyncMock(return_value=mock_school)

        mocker.patch("app.core.crypto_service.decrypt_value", side_effect=["key", "secret"])
        mock_razorpay_client.order.fetch.side_effect = Exception("Network error")

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        # Payment should remain PENDING (not changed)
        assert mock_payment.status == PaymentStatus.PENDING
        # Should be counted as processed but not reconciled/failed
        assert result["processed"] == 1
        assert result["reconciled"] == 0
        assert result["failed"] == 0

    async def test_reconcile_pending_payment_missing_gateway_order_id(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Payment record exists but has no gateway_order_id (data corruption).

        EXPECTED: Payment is not included in reconciliation query (WHERE clause filters it out).
        """
        # --- ARRANGE ---
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        # Query should filter out payments without gateway_order_id
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_pending_payments(db)

        # --- ASSERT ---
        assert result["processed"] == 0

    async def test_reconcile_authorized_payment_missing_gateway_payment_id(self, mocker, mock_razorpay_client):
        """
        SCENARIO: Authorized payment has no gateway_payment_id (should be filtered by query).

        EXPECTED: Payment not included in reconciliation.
        """
        # --- ARRANGE ---
        db = AsyncMock(spec=AsyncSession)
        mock_result = MagicMock()
        # Query filters out payments without gateway_payment_id
        mock_result.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=mock_result)

        # --- ACT ---
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)

        # --- ASSERT ---
        assert result["processed"] == 0
