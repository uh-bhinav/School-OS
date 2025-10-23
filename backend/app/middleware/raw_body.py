# app/middleware/raw_body.py
"""
Raw Body Middleware for Webhook Signature Verification.

This middleware captures the raw, unmodified request body BEFORE FastAPI parses it.
This is critical for cryptographic webhook signature verification (Razorpay, Stripe, etc.)
because the signature is computed over the exact bytes sent by the provider.

Security Rationale:
- FastAPI's automatic JSON parsing can change whitespace, key ordering, etc.
- These changes break signature verification even if the data is semantically identical
- The signature MUST be verified against the raw bytes to prevent tampering

Implementation Details:
- Only captures body for webhook endpoints (to minimize memory overhead)
- Stores raw body in request.state.raw_body for service layer access
- Must be registered BEFORE any other middleware that might consume the body
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class RawBodyMiddleware(BaseHTTPMiddleware):
    """
    Middleware to capture raw request body for webhook signature verification.

    This middleware intercepts the request stream and stores the raw body bytes
    in request.state.raw_body before FastAPI's automatic JSON parsing occurs.

    Usage in main.py:
        app.add_middleware(RawBodyMiddleware)

    Access in endpoints/services:
        raw_body = request.state.raw_body  # bytes object
    """

    async def dispatch(self, request: Request, call_next):
        """
        Intercept request and capture raw body for specific endpoints.

        Performance Optimization:
        - Only captures body for webhook endpoints (path contains 'webhook')
        - Other endpoints proceed without body capture overhead

        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain

        Returns:
            Response from the next handler
        """
        # Only capture raw body for webhook endpoints to minimize memory usage
        if "webhook" in request.url.path.lower():
            # Read the raw body bytes
            body = await request.body()

            # Store in request.state for later access
            # This is the FastAPI-recommended way to pass data between middleware and endpoints
            request.state.raw_body = body

            # CRITICAL: Create a new Request object with the body stream reset
            # FastAPI will try to read request.body() again for JSON parsing
            # We need to "rewind" the stream so it can be read again
            async def receive():
                return {"type": "http.request", "body": body}

            # Create new request with the body available for FastAPI's JSON parser
            request = Request(request.scope, receive)

        # Continue to the next middleware/endpoint
        response = await call_next(request)
        return response
