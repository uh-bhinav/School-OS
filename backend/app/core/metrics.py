from prometheus_client import Counter

PAYMENTS_COUNTER = Counter("payments_total", "Total number of payment attempts processed", ["status", "gateway"])  # e.g., status='captured', gateway='razorpay'

ALLOCATION_FAILURES_COUNTER = Counter("payment_allocation_failures_total", "Total number of failed allocations", ["source"])  # e.g., source='verify_payment' or 'webhook'
