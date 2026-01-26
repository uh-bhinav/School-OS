# Webhook Security Logging Enhancement

## Overview
Enhanced webhook security logging to detect and track potential attacks by recording source IP addresses and creating detailed security event logs.

## Changes Made

### 1. **Endpoint Layer** (`app/api/v1/endpoints/webhooks.py`)

#### Added IP Address Extraction
```python
def _get_client_ip(request: Request) -> str:
    """
    Extract the client's IP address from the request.
    Checks X-Forwarded-For header first (for proxied requests),
    then falls back to client.host.
    """
```

**Why This Matters:**
- Captures real client IP even behind proxies/load balancers
- Essential for identifying attack patterns
- Enables IP-based blocking/alerting

#### Enhanced Security Event Logging

**Missing Signature Detection:**
```python
if not x_razorpay_signature:
    logger.warning(
        f"🚨 SECURITY: Webhook signature missing from IP: {client_ip}. "
        f"Potential attack or misconfigured webhook source."
    )
```

**Missing Raw Body Detection:**
```python
if raw_body is None:
    logger.error(
        f"Raw body not available for webhook from IP: {client_ip}. "
        f"RawBodyMiddleware may not be properly configured."
    )
```

### 2. **Service Layer** (`app/services/payment_service.py`)

#### Webhook Event Processing with IP Tracking

**Initial Event Receipt:**
```python
logger.info(f"📥 Received webhook event: {event_type} from IP: {client_ip}")
```

**Duplicate Detection (Idempotency):**
```python
logger.info(
    f"Duplicate webhook event received: {event_id} from IP: {client_ip} "
    f"(idempotency check passed)"
)
```

**Successful Signature Verification:**
```python
logger.info(
    f"✅ Webhook signature verified successfully for payment {gateway_order_id} "
    f"from IP: {client_ip}"
)
```

**Failed Signature Verification (CRITICAL):**
```python
logger.warning(
    f"🚨 SECURITY ALERT: Invalid webhook signature for payment {gateway_order_id}. "
    f"Source IP: {client_ip}. "
    f"This could indicate:\n"
    f"  1. Attack attempt (someone trying to forge webhooks)\n"
    f"  2. Webhook secret mismatch between Razorpay dashboard and database\n"
    f"  3. Request tampering during transmission\n"
    f"Action Required: Review logs for repeated failures from this IP."
)
```

## Security Benefits

### 1. **Attack Detection**
- **Signature Brute-Force Attempts:** Multiple failed signature verifications from same IP
- **Replay Attacks:** Duplicate webhooks from suspicious IPs
- **Reconnaissance:** Requests without signatures (probing)

### 2. **Forensic Analysis**
- Track origin of malicious requests
- Correlate attack patterns across time
- Build IP reputation database

### 3. **Automated Response**
Security monitoring tools can now:
- Alert on repeated failures from same IP
- Automatically block suspicious IPs at firewall/load balancer
- Create security incident tickets
- Generate compliance reports

### 4. **Compliance**
Meets requirements for:
- PCI DSS (logging security events)
- SOC 2 (audit trail)
- GDPR (security monitoring)

## Log Examples

### Legitimate Traffic
```
INFO: 📥 Received webhook event: payment.captured from IP: 35.154.145.67
INFO: ✅ Webhook signature verified successfully for payment order_abc123 from IP: 35.154.145.67
```

### Attack Detection
```
WARNING: 🚨 SECURITY: Webhook signature missing from IP: 192.168.1.100. Potential attack or misconfigured webhook source.

WARNING: 🚨 SECURITY ALERT: Invalid webhook signature for payment order_abc123. Source IP: 45.33.22.11.
This could indicate:
  1. Attack attempt (someone trying to forge webhooks)
  2. Webhook secret mismatch between Razorpay dashboard and database
  3. Request tampering during transmission
Action Required: Review logs for repeated failures from this IP.
```

### Duplicate Detection
```
INFO: Duplicate webhook event received: payment.captured_pay_xyz789_1634567890 from IP: 35.154.145.67 (idempotency check passed)
```

## Monitoring Recommendations

### 1. **Set Up Alerts**
Configure your logging system (e.g., CloudWatch, Datadog, ELK) to alert on:

```python
# Alert Conditions
ALERT if COUNT(logger.warning matching "🚨 SECURITY ALERT") > 3 in 5 minutes from same IP
ALERT if COUNT(logger.warning matching "Webhook signature missing") > 10 in 1 hour
ALERT if ANY log contains "🚨 SECURITY ALERT" (immediate notification)
```

### 2. **IP Blocking Rules**
After 5 failed signature attempts from same IP:
1. Automatically block at WAF/load balancer
2. Create security incident ticket
3. Review manually before unblocking

### 3. **Daily Security Review**
Review logs daily for:
- IPs with multiple failed attempts
- Geographic anomalies (webhooks from unexpected countries)
- Timing patterns (attacks often happen off-hours)

### 4. **Legitimate Razorpay IP Ranges**
Maintain whitelist of known Razorpay webhook IPs:
```
35.154.145.0/24  # Razorpay Mumbai
52.66.0.0/16     # Razorpay AWS Asia Pacific
```

Alert on webhooks from IPs outside these ranges.

## Integration with Security Tools

### CloudWatch Logs (AWS)
```json
{
  "metric_filters": [
    {
      "name": "WebhookSecurityAlert",
      "pattern": "[level=WARNING, ...msg=\"*🚨 SECURITY ALERT*\"]",
      "metric": "webhook_security_events",
      "alarm_threshold": 3,
      "alarm_period": 300
    }
  ]
}
```

### Datadog
```yaml
logs:
  - type: file
    path: /var/log/app/*.log
    service: schoolos
    source: python

  - type: security_rule
    name: "Webhook Attack Detection"
    query: "source:python @msg:*SECURITY ALERT*"
    severity: high
    notification:
      - slack: #security-alerts
      - email: security@school.com
```

### ELK Stack
```
# Kibana Alert
{
  "name": "Webhook Security Alert",
  "schedule": { "interval": "5m" },
  "condition": {
    "script": {
      "source": "ctx.results[0].hits.total > 3"
    }
  },
  "query": {
    "match": {
      "message": "🚨 SECURITY ALERT"
    }
  }
}
```

## Testing the Security Logging

### Test 1: Missing Signature
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.captured"}'
```
**Expected Log:** `WARNING: 🚨 SECURITY: Webhook signature missing from IP: ...`

### Test 2: Invalid Signature
```bash
curl -X POST http://localhost:8000/api/v1/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: invalid_signature_123" \
  -d '{"event": "payment.captured", "payload": {"payment": {"entity": {"id": "pay_test"}}}}'
```
**Expected Log:** `WARNING: 🚨 SECURITY ALERT: Invalid webhook signature...`

### Test 3: Legitimate Webhook
Use Razorpay's test webhook from their dashboard.
**Expected Log:** `INFO: ✅ Webhook signature verified successfully...`

## Next Steps

1. **Configure Monitoring:**
   - Set up log aggregation (CloudWatch/Datadog/ELK)
   - Create alert rules for security events
   - Configure notification channels

2. **Document Razorpay IPs:**
   - Get official IP ranges from Razorpay
   - Whitelist in WAF/firewall
   - Alert on out-of-range webhooks

3. **Response Procedures:**
   - Create runbook for security alerts
   - Define IP blocking procedures
   - Establish escalation path

4. **Regular Reviews:**
   - Weekly security log analysis
   - Monthly IP reputation review
   - Quarterly security audit

## Security Contact
For security concerns or questions:
- Email: security@yourschool.com
- On-call: +1-XXX-XXX-XXXX
- Slack: #security-incidents

---

**Last Updated:** 2025-10-22
**Author:** Security Team
**Version:** 1.0.0
