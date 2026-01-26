# Row-Level Locking Implementation for Payment Race Condition Prevention

## 🎯 Overview

This document describes the implementation of **row-level locking** using PostgreSQL's `SELECT ... FOR UPDATE` to prevent race conditions between concurrent payment verification processes.

---

## 🐛 The Problem: Race Condition Between Webhook and Client Verification

### Scenario: Dual Payment Path Race Condition

When a payment succeeds at Razorpay, there are **two paths** that can update the payment status to "captured":

1. **Client Path**: Frontend calls `/verify` endpoint → `verify_payment()` method
2. **Webhook Path**: Razorpay sends webhook → `handle_webhook_event()` method

**The Race Condition**:
```
Timeline without locking:

T0: User completes payment at Razorpay
T1: Frontend calls /verify endpoint
T2: verify_payment() reads payment (status='pending')
T3: Razorpay webhook arrives
T4: handle_webhook_event() reads payment (status='pending') ← RACE!
T5: verify_payment() updates payment to 'captured' + allocates to invoice
T6: handle_webhook_event() updates payment to 'captured' + allocates to invoice AGAIN ← DOUBLE ALLOCATION!
T7: Both commit → Data corruption, duplicate invoice allocation
```

### Consequences Without Locking

1. **Double Allocation**: Payment allocated to invoice twice → overpayment
2. **Status Corruption**: Both processes think they "won" the update
3. **Inconsistent Data**: Invoice status may not match payment status
4. **Financial Errors**: Reconciliation discrepancies
5. **Non-Deterministic Behavior**: Winner depends on timing/load

---

## ✅ The Solution: Row-Level Locking with `SELECT ... FOR UPDATE`

### What is `SELECT ... FOR UPDATE`?

PostgreSQL's `SELECT ... FOR UPDATE` acquires an **exclusive lock** on the selected row(s) within a transaction:

- **First Process**: Acquires lock, reads data, performs updates
- **Second Process**: Blocks/waits until first process commits or rolls back
- **Guarantee**: Only ONE process can modify the row at a time

### How It Works

```sql
-- Process 1 (verify_payment):
BEGIN;
SELECT * FROM payments WHERE id = 123 FOR UPDATE;  -- Acquires lock
-- Row is now locked exclusively

-- Process 2 (handle_webhook_event):
BEGIN;
SELECT * FROM payments WHERE gateway_order_id = 'order_ABC' FOR UPDATE;  -- BLOCKS HERE
-- Waits until Process 1 commits...

-- Process 1 continues:
UPDATE payments SET status = 'captured' WHERE id = 123;
COMMIT;  -- Releases lock

-- Process 2 now proceeds:
-- Reads the UPDATED status ('captured')
-- Sees payment already processed, skips duplicate update
COMMIT;
```

---

## 🔧 Implementation Details

### 1. Row-Level Lock in `verify_payment()` (Client Path)

**File**: `app/services/payment_service.py`

**Before** (No locking):
```python
async def verify_payment(self, *, verification_data: PaymentVerificationRequest) -> Payment:
    # 1. Fetch payment record
    payment = await self.db.get(Payment, verification_data.internal_payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    # ... rest of verification logic
```

**After** (With row-level lock):
```python
async def verify_payment(self, *, verification_data: PaymentVerificationRequest) -> Payment:
    """
    RACE CONDITION PROTECTION:
    Uses SELECT ... FOR UPDATE to acquire an exclusive row lock, preventing
    concurrent updates from webhook handlers or duplicate verification requests.
    """
    # 1. Fetch payment record with exclusive lock
    # RACE CONDITION FIX: Use SELECT ... FOR UPDATE to prevent concurrent webhook processing
    payment_stmt = (
        select(Payment)
        .where(Payment.id == verification_data.internal_payment_id)
        .with_for_update()  # Acquire exclusive lock - blocks webhook handler until we're done
    )
    payment_result = await self.db.execute(payment_stmt)
    payment = payment_result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    # ... rest of verification logic
    # Lock is held until commit/rollback at end of transaction
```

### 2. Row-Level Lock in `handle_webhook_event()` (Webhook Path)

**File**: `app/services/payment_service.py`

**Before** (No locking):
```python
async def handle_webhook_event(self, *, payload: dict, raw_body: bytes, signature: str, client_ip: str = "unknown") -> None:
    # ...

    # 2. Find our internal payment record using gateway_order_id
    payment_stmt = select(Payment).where(Payment.gateway_order_id == gateway_order_id)
    payment_result = await self.db.execute(payment_stmt)
    payment = payment_result.scalar_one_or_none()

    # ... rest of webhook logic
```

**After** (With row-level lock):
```python
async def handle_webhook_event(self, *, payload: dict, raw_body: bytes, signature: str, client_ip: str = "unknown") -> None:
    # ...

    # 2. Find our internal payment record using gateway_order_id
    # RACE CONDITION FIX: Use SELECT ... FOR UPDATE to acquire exclusive row lock
    # This prevents concurrent updates from verify_payment endpoint and webhook handler
    # ensuring atomic payment status transitions
    payment_stmt = (
        select(Payment)
        .where(Payment.gateway_order_id == gateway_order_id)
        .with_for_update()  # Acquire exclusive lock - blocks until verify_payment releases lock
    )
    payment_result = await self.db.execute(payment_stmt)
    payment = payment_result.scalar_one_or_none()

    # ... rest of webhook logic
    # Lock is held until commit/rollback at end of transaction
```

---

## 🔄 How It Prevents the Race Condition

### Timeline WITH Locking

```
T0: User completes payment at Razorpay

T1: Frontend calls /verify endpoint
T2: verify_payment() executes SELECT ... FOR UPDATE
    → Acquires EXCLUSIVE LOCK on payment row
    → Reads payment (status='pending')

T3: Razorpay webhook arrives
T4: handle_webhook_event() executes SELECT ... FOR UPDATE
    → Attempts to acquire lock on SAME payment row
    → BLOCKS/WAITS because verify_payment() holds the lock

T5: verify_payment() continues:
    - Updates payment.status = 'captured'
    - Allocates payment to invoice
    - Commits transaction
    → RELEASES LOCK

T6: handle_webhook_event() unblocks:
    → Acquires lock (no longer blocked)
    → Reads payment (status='captured') ← Already processed!
    → Sees status != 'captured' check fails
    → Skips duplicate update
    → Commits (idempotent)

Result: ✅ No double allocation, consistent state
```

### Key Protection Points

1. **Mutual Exclusion**: Only ONE process can hold the lock at a time
2. **Automatic Blocking**: Database handles waiting/queuing
3. **Fresh Reads**: Second process always reads latest committed state
4. **Idempotency**: Status checks prevent duplicate updates after lock release
5. **Transaction Isolation**: Updates are atomic within transaction boundaries

---

## 🛡️ Additional Safety Mechanisms

### 1. Idempotency Check (After Lock Acquisition)

Both methods check if payment is already captured:

```python
# In handle_webhook_event():
if payment.status != "captured":
    payment.status = "captured"
    # ... update logic
else:
    # Already processed, skip (idempotent)
    logger.info(f"Payment {payment.id} already captured. Skipping webhook processing.")
```

```python
# In verify_payment():
if payment.status == "captured":
    logger.info(f"Payment {payment.id} already captured. Returning.")
    return payment  # Already verified, do nothing
```

### 2. Event Deduplication (Webhook-Specific)

Webhook handler has additional idempotency via event ID tracking:

```python
# 1. Idempotency Check: Has this event already been processed?
existing_event = await self.db.execute(
    select(GatewayWebhookEvent).where(GatewayWebhookEvent.event_id == event_id)
)
if existing_event.scalars().first():
    logger.info(f"Duplicate webhook event received: {event_id}")
    return  # Skip processing
```

### 3. Database Transaction Isolation

Using PostgreSQL's default `READ COMMITTED` isolation level:
- Changes from one transaction invisible to others until commit
- Lock acquisition ensures serialized access to payment row
- Prevents dirty reads and phantom updates

---

## 📊 Lock Behavior Matrix

| Process 1 (First) | Process 2 (Second) | Outcome |
|-------------------|-------------------|---------|
| verify_payment() locks row | handle_webhook_event() attempts lock | Webhook BLOCKS until verify commits |
| handle_webhook_event() locks row | verify_payment() attempts lock | Client BLOCKS until webhook commits |
| verify_payment() commits | handle_webhook_event() acquires lock | Webhook sees 'captured', skips update |
| handle_webhook_event() commits | verify_payment() acquires lock | Client sees 'captured', returns early |

**Result**: Regardless of arrival order, only ONE process performs the update.

---

## 🧪 Testing Considerations

### Unit Tests

Mock database transactions to verify lock acquisition:

```python
@pytest.mark.asyncio
async def test_verify_payment_acquires_lock(db_session, mock_payment):
    service = PaymentService(db_session)

    with patch.object(db_session, 'execute') as mock_execute:
        await service.verify_payment(verification_data=mock_data)

        # Verify SELECT ... FOR UPDATE was called
        call_args = mock_execute.call_args_list[0][0][0]
        assert 'with_for_update' in str(call_args)
```

### Integration Tests

Test race condition scenarios:

```python
@pytest.mark.asyncio
async def test_concurrent_verification_and_webhook(db_session):
    """Test that concurrent verify + webhook doesn't cause double allocation."""

    payment = create_test_payment(status='pending')

    # Simulate concurrent requests
    async def verify():
        service = PaymentService(db_session)
        await service.verify_payment(verification_data=data)

    async def webhook():
        service = PaymentService(db_session)
        await service.handle_webhook_event(payload=payload, ...)

    # Run both concurrently
    await asyncio.gather(verify(), webhook())

    # Verify: Payment allocated only ONCE
    await db_session.refresh(payment)
    assert payment.status == 'captured'

    # Check invoice allocation happened exactly once
    allocations = await get_payment_allocations(payment.id)
    assert len(allocations) == 1  # Not 2!
```

### Load Testing

Simulate high-concurrency scenarios:
- 1000 concurrent verify + webhook requests
- Measure lock contention and wait times
- Verify no double allocations occur

---

## ⚡ Performance Considerations

### Lock Duration

Locks are held for the **duration of the transaction**:
- `verify_payment()`: ~100-500ms (signature check + allocation)
- `handle_webhook_event()`: ~50-200ms (signature check + update)

**Impact**: Minimal - payments are independent rows, locks don't block OTHER payments.

### Lock Contention

**Low Probability**:
- Race window is narrow (~100-500ms between webhook and verify)
- Most payments only processed once (either webhook OR verify)
- Locks are row-specific (payment ID), not table-level

**Worst Case**:
- Second process waits up to 500ms
- Still faster than handling duplicate allocation errors
- User experience unaffected (async webhook)

### Database Load

- **Row locks** (not table locks) → highly concurrent
- PostgreSQL optimized for `SELECT ... FOR UPDATE`
- No additional queries required
- Negligible overhead vs. consistency guarantee

---

## 🚨 Troubleshooting

### Symptom: Payment Verification Timeouts

**Cause**: Transaction holding lock for too long

**Debug**:
```sql
-- Check for long-running transactions holding locks
SELECT
    pid,
    age(clock_timestamp(), query_start) as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
AND query LIKE '%payments%FOR UPDATE%'
ORDER BY duration DESC;
```

**Fix**:
- Investigate slow allocation logic
- Optimize invoice_service.allocate_payment_to_invoice_items()
- Add query timeouts

### Symptom: Deadlock Detected

**Cause**: Circular lock dependency (extremely rare with current design)

**Example**:
```
Process A: Locks Payment 1, waits for Invoice X
Process B: Locks Invoice X, waits for Payment 1
→ Deadlock
```

**Fix**:
- PostgreSQL auto-detects and kills one transaction
- Retry the failed transaction
- Ensure consistent lock acquisition order

### Symptom: Duplicate Allocations Still Occurring

**Cause**: Lock not being acquired (code regression)

**Debug**:
```python
# Add logging to verify lock acquisition
logger.info(f"Acquiring lock for payment {payment_id}")
payment_stmt = select(Payment).where(...).with_for_update()
logger.info(f"Lock acquired for payment {payment_id}")
```

**Fix**:
- Verify `.with_for_update()` is present in queries
- Check transaction isolation level
- Review database session configuration

---

## 📚 Related Documentation

- [PostgreSQL SELECT FOR UPDATE](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE)
- [SQLAlchemy with_for_update()](https://docs.sqlalchemy.org/en/14/core/selectable.html#sqlalchemy.sql.expression.GenerativeSelect.with_for_update)
- [Payment Verification Flow](./PAYMENT_VERIFICATION_FLOW.md)
- [Webhook Security](./WEBHOOK_SECURITY_LOGGING.md)

---

## ✅ Summary

### What Was Implemented

1. ✅ Row-level locking in `verify_payment()` (client path)
2. ✅ Row-level locking in `handle_webhook_event()` (webhook path)
3. ✅ Idempotency checks after lock acquisition
4. ✅ Transaction-scoped lock duration
5. ✅ Comprehensive documentation

### Benefits Achieved

- ✅ **Prevents race conditions** between verify and webhook
- ✅ **Guarantees single allocation** per payment
- ✅ **Database-enforced mutual exclusion** (not just Python)
- ✅ **Minimal performance overhead** (row locks, not table locks)
- ✅ **Automatic blocking/queuing** (no manual coordination needed)
- ✅ **Production-ready concurrency safety**

### Protection Against

| Attack/Issue | Protected? | How |
|-------------|-----------|-----|
| Concurrent verify + webhook | ✅ Yes | Row-level lock forces serialization |
| Double allocation | ✅ Yes | Only one process can update at a time |
| Duplicate webhook calls | ✅ Yes | Event ID idempotency check |
| Multiple verify requests | ✅ Yes | Lock + status check prevents re-processing |
| Database race conditions | ✅ Yes | PostgreSQL MVCC + FOR UPDATE |

---

## 🎓 Technical Deep Dive: Why This Works

### Database Lock Internals

1. **Lock Acquisition**: First `SELECT ... FOR UPDATE` acquires exclusive row lock
2. **Queue Formation**: Subsequent lock attempts queue at database level
3. **FIFO Processing**: Locks granted in order (fair queuing)
4. **Automatic Release**: Lock released on `COMMIT` or `ROLLBACK`
5. **Deadlock Detection**: PostgreSQL auto-detects and resolves deadlocks

### Transaction Isolation Level

Using PostgreSQL's `READ COMMITTED` (default):
- Each statement sees snapshot of committed data
- Row locks prevent concurrent modifications
- Lock holders see uncommitted changes (own transaction)
- Lock waiters see committed state after lock release

### Why Application-Level Locks Aren't Enough

**Python Locks (asyncio.Lock)** only work within ONE process:
- Multi-process deployments (Gunicorn workers) bypass Python locks
- Horizontal scaling (multiple servers) bypasses Python locks
- Database is single source of truth, must enforce consistency

**Database Locks** work across:
- ✅ Multiple Python processes
- ✅ Multiple application servers
- ✅ Different codepaths (verify vs webhook)
- ✅ Distributed deployments

---

This implementation provides **production-grade race condition protection** for payment verification, ensuring financial data consistency in high-concurrency environments. 🛡️
