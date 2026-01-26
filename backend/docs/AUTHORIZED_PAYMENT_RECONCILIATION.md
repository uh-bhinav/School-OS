# Authorized Payment Reconciliation - Implementation Guide

## Overview

This document describes the **Authorized Payment Reconciliation** feature, which handles the two-step payment flow (Authorize → Capture) for certain payment methods, particularly international credit cards.

---

## 📋 Background: The Two-Step Payment Flow

### Standard Payment Flow (One-Step)
```
User Pays → Gateway Processes → Payment Captured → Funds Transferred
```

### Two-Step Payment Flow (Authorize + Capture)
```
User Pays → Gateway Authorizes → Funds on Hold → Merchant Captures → Funds Transferred
              (Step 1)            (Bank holds)      (Step 2)          (Complete)
```

### Why Two Steps?

Certain payment methods (especially international cards, American Express, etc.) use this two-step flow:

1. **Authorization**: Bank verifies funds are available and places a temporary hold
2. **Capture**: Merchant explicitly requests fund transfer (must happen within 5 days)

**If capture never happens**: The authorization expires after ~5 days, the hold is released, and no money is transferred.

---

## 🎯 Problem Statement

### The "Money on Hold" Scenario

**Example**: A parent in the US pays their child's school fees using an American Express card.

1. ✅ Payment is authorized successfully
2. ✅ Razorpay sends webhook with `status: "authorized"`
3. ✅ Our system updates Payment record to `status: "authorized"`
4. ❌ **PROBLEM**: The capture step never happens automatically
5. ❌ After 5 days, authorization expires at the bank
6. ❌ Money is never transferred to school
7. ❌ Parent sees temporary charge, then it disappears
8. ❌ Invoice remains unpaid in our system

**Business Impact**:
- Financial reconciliation nightmares
- Poor user experience (parent thinks they paid)
- Revenue leakage (money never received)
- Manual intervention required

---

## ✅ Solution: Automated Reconciliation Job

### What It Does

The `reconcile_authorized_payments()` background task:

1. **Finds** all payments with `status = 'authorized'`
2. **Checks** their age
3. **Captures** payments within the valid window (< 5 days)
4. **Expires** old authorizations (≥ 5 days)
5. **Allocates** captured payments to invoices/orders
6. **Handles** errors gracefully

---

## 🔧 Technical Implementation

### Service Method: `reconcile_authorized_payments()`

**Location**: `app/services/payment_service.py`

```python
async def reconcile_authorized_payments(self, db: AsyncSession):
    """
    Captures authorized payments or marks them as expired.

    Razorpay Authorization Window: 5 days (120 hours)
    """
    # 1. Find all authorized payments
    # 2. Check each payment's age
    # 3. For recent payments (< 5 days): Attempt capture via Razorpay API
    # 4. For expired payments (≥ 5 days): Mark as EXPIRED
    # 5. Handle capture failures (already captured, invalid, etc.)
    # 6. Allocate captured payments to invoices/orders
```

### Key Logic Flow

```python
for authorized_payment in authorized_payments:
    age_hours = calculate_age(payment)

    if age_hours >= 120:  # 5 days
        # Too old - mark as expired
        payment.status = PaymentStatus.EXPIRED
        payment.error_description = "Authorization expired"

    else:
        # Still valid - attempt capture
        try:
            captured = razorpay_client.payment.capture(
                payment.gateway_payment_id,
                amount_in_paise
            )

            if captured['status'] == 'captured':
                payment.status = PaymentStatus.CAPTURED
                # Allocate to invoice/order

        except BadRequestError as e:
            if 'expired' in str(e):
                payment.status = PaymentStatus.EXPIRED
            else:
                payment.status = PaymentStatus.FAILED
```

---

## 🚀 API Endpoints

### Admin Endpoint to Trigger Reconciliation

**Endpoint**: `POST /api/v1/finance/payments/admin/reconcile-authorized`

**Authentication**: Admin role required

**Example Request**:
```bash
curl -X POST https://api.schoolos.com/api/v1/finance/payments/admin/reconcile-authorized \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response**:
```json
{
  "message": "Authorized payment reconciliation task started in the background.",
  "info": "This will attempt to capture authorized payments or mark expired ones."
}
```

**Task Returns** (in logs):
```json
{
  "processed": 15,
  "captured": 12,
  "expired": 2,
  "failed": 1
}
```

---

## 📊 Payment Status Transitions

### Successful Capture Flow
```
AUTHORIZED → CAPTURED → (allocation) → Invoice/Order Updated
```

### Expired Authorization Flow
```
AUTHORIZED → EXPIRED (if > 5 days old)
```

### Failed Capture Flow
```
AUTHORIZED → FAILED (if capture error)
```

### Capture with Allocation Failure
```
AUTHORIZED → CAPTURED_ALLOCATION_FAILED (rare edge case)
```

---

## ⏰ Scheduling Recommendations

### Option 1: Cron Job (Recommended)

Run every 6 hours to ensure timely capture:

```python
# In your scheduler (e.g., APScheduler, Celery Beat)
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour='*/6')  # Every 6 hours
async def capture_authorized_payments():
    async with get_db_session() as db:
        service = PaymentService(db)
        result = await service.reconcile_authorized_payments(db)
        logger.info(f"Authorized payment reconciliation: {result}")
```

**Cron Expression**: `0 */6 * * *` (every 6 hours)

### Option 2: Manual Admin Trigger

Use the admin endpoint for immediate processing:
- During reconciliation exercises
- After detecting authorization issues
- For debugging/testing

---

## 🔍 Monitoring & Alerting

### Key Metrics to Track

```python
# Log output from reconciliation
{
  "processed": 50,      # Total authorized payments found
  "captured": 45,       # Successfully captured
  "expired": 4,         # Marked as expired
  "failed": 1           # Capture failed (investigate)
}
```

### Alerts to Configure

1. **High Expiry Rate**: If `expired > 10% of processed`
   - Indicates capture window is being missed
   - May need more frequent reconciliation runs

2. **High Failure Rate**: If `failed > 5% of processed`
   - Investigate Razorpay API issues
   - Check for authorization edge cases

3. **Large Backlog**: If `processed > 100` consistently
   - Increase reconciliation frequency
   - Check if authorizations are being created correctly

---

## 🧪 Testing

### Unit Tests

**Location**: `tests/test_authorized_payment_reconciliation.py`

**Test Coverage**:
- ✅ Successful capture of recent authorized payments
- ✅ Marking expired authorizations (> 5 days)
- ✅ Handling capture failures (already captured, invalid amount)
- ✅ Gateway errors and retry logic
- ✅ Allocation to invoices and orders
- ✅ Batch processing limits (100 per run)
- ✅ Edge cases (missing payment IDs, etc.)

**Run Tests**:
```bash
cd backend
pytest tests/test_authorized_payment_reconciliation.py -v
```

### Manual Testing Checklist

1. **Create Authorized Payment** (via Razorpay test mode)
2. **Trigger Reconciliation** via admin endpoint
3. **Verify Capture** in Razorpay dashboard
4. **Check Payment Status** in database (should be CAPTURED)
5. **Verify Invoice/Order** updated correctly
6. **Test Expiry** by creating old authorized payment

---

## 🛡️ Error Handling

### Capture Errors Handled

| Error Scenario | Status Transition | Retry? |
|----------------|-------------------|--------|
| Already captured | AUTHORIZED → FAILED | No |
| Authorization expired | AUTHORIZED → EXPIRED | No |
| Invalid amount | AUTHORIZED → FAILED | No |
| Gateway timeout | AUTHORIZED (unchanged) | Yes (next run) |
| Network error | AUTHORIZED (unchanged) | Yes (next run) |
| Allocation failure | AUTHORIZED → CAPTURED_ALLOCATION_FAILED | Manual fix |

### Logging Examples

```python
# Successful capture
✅ Successfully captured authorized payment 123. Amount: ₹50000

# Expired authorization
⏰ Authorized Payment 456 is 145.2 hours old (threshold: 120 hours). Marking as EXPIRED.

# Capture failure
❌ Capture failed for payment 789: The authorization has expired and cannot be captured

# Allocation failure
🚨 CAPTURE_ALLOCATION_FAILURE: Payment 101 captured but FAILED allocation. Error: ...
```

---

## 🔐 Security Considerations

1. **Admin-Only Access**: Reconciliation endpoint requires Admin role
2. **Rate Limiting**: Apply rate limits to prevent abuse
3. **Idempotency**: Multiple captures of same payment handled gracefully
4. **Audit Trail**: All actions logged with payment IDs and timestamps
5. **Credential Encryption**: School Razorpay credentials encrypted at rest

---

## 📈 Performance Considerations

1. **Batch Processing**: Limits to 100 payments per run to avoid memory issues
2. **Individual Commits**: Each payment committed separately (isolation)
3. **Error Isolation**: Failure on one payment doesn't stop others
4. **Database Queries**: Indexed on `status` and `gateway_payment_id` columns

---

## 🚨 Troubleshooting

### Issue: Payments Not Being Captured

**Check**:
1. Is reconciliation job running? (Check scheduler/cron)
2. Are payments within capture window? (< 5 days old)
3. Do payments have `gateway_payment_id`? (Required for capture)
4. Check Razorpay dashboard for authorization status
5. Review logs for capture errors

### Issue: High Expiry Rate

**Root Causes**:
- Reconciliation job not running frequently enough
- Payments created without proper gateway_payment_id
- Razorpay webhook not updating status to 'authorized'

**Fix**:
- Increase reconciliation frequency (e.g., every 3 hours instead of 6)
- Verify webhook configuration
- Check payment creation flow

### Issue: Allocation Failures After Capture

**Symptoms**:
- Payment status: `CAPTURED_ALLOCATION_FAILED`
- Logs show allocation errors

**Fix**:
1. Check invoice/order exists and is in correct state
2. Verify allocation service logic
3. Manual allocation may be required:
   ```python
   await invoice_service.allocate_payment_to_invoice_items(
       db=db, payment_id=<payment_id>, user_id=<system_user_id>
   )
   ```

---

## 📚 Related Documentation

- [Payment Service Overview](./PAYMENT_SERVICE.md)
- [Pending Payment Reconciliation](./PENDING_RECONCILIATION.md)
- [Webhook Security](./WEBHOOK_SECURITY_LOGGING.md)
- [Razorpay Integration Guide](./RAZORPAY_INTEGRATION.md)

---

## 🎓 Business Impact

### Before This Feature
- ❌ Authorized payments stuck forever
- ❌ Manual capture required (human error prone)
- ❌ Revenue leakage from expired authorizations
- ❌ Reconciliation headaches

### After This Feature
- ✅ Automatic capture within authorization window
- ✅ Proactive expiry detection
- ✅ Zero manual intervention needed
- ✅ Clean financial records
- ✅ Improved parent experience

---

## 📝 Summary

The **Authorized Payment Reconciliation** feature ensures that:

1. **Money is actually captured** from authorized payments
2. **Expired authorizations are detected** and marked appropriately
3. **Financial records stay accurate** and up-to-date
4. **Manual intervention is minimized** through automation
5. **Edge cases are handled** gracefully with proper error handling

This creates a **self-healing payment system** that maintains consistency with the payment gateway without requiring manual reconciliation or support intervention.
