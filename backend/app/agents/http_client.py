# backend/app/agents/http_client.py
"""HTTP client for agents to communicate with backend API endpoints.

This module provides a reusable HTTP client that agents use to make authenticated
requests to the backend API, replacing direct service calls. The client:

1. Uses JWT tokens passed from the frontend (not from env variables)
2. Automatically injects Authorization headers
3. Handles common HTTP errors with detailed messages
4. Provides retry logic for transient failures
5. Validates responses and provides structured error information

Architecture:
- Frontend sends JWT token → Agent Invocation API → Tool Context → HTTP Client → Backend API
- Backend API validates JWT using existing get_current_user_profile dependency
- No changes needed to backend API endpoints or security logic
"""

import logging
import os
from typing import Any, Optional

import httpx
from fastapi import status

from app.agents.tool_context import ToolContextError, get_tool_context

logger = logging.getLogger(__name__)


class AgentHTTPClientError(Exception):
    """Base exception for HTTP client errors in agents."""

    def __init__(self, message: str, status_code: Optional[int] = None, detail: Optional[dict[str, Any]] = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail or {}
        super().__init__(self.message)


class AgentAuthenticationError(AgentHTTPClientError):
    """Raised when authentication fails (401/403)."""

    pass


class AgentResourceNotFoundError(AgentHTTPClientError):
    """Raised when a requested resource is not found (404)."""

    pass


class AgentValidationError(AgentHTTPClientError):
    """Raised when request validation fails (422)."""

    pass


class AgentHTTPClient:
    """
    HTTP client for agents to make authenticated API requests.

    Usage:
        async with AgentHTTPClient() as client:
            data = await client.get("/attendance/students/123")
            result = await client.post("/attendance/", json={...})

    The client automatically:
    - Retrieves JWT token from tool context
    - Injects Authorization header
    - Handles common HTTP errors
    - Provides structured error messages
    """

    def __init__(
        self,
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        """
        Initialize the HTTP client.

        Args:
            timeout: Request timeout in seconds (default: 30s)
            max_retries: Number of retries for transient failures (default: 3)
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self._client: Optional[httpx.AsyncClient] = None
        self._is_external_client = False

    async def __aenter__(self) -> "AgentHTTPClient":
        """Context manager entry - creates or accepts the HTTP client."""
        context = get_tool_context()  # Get context

        if context.client:
            # A client was injected (e.g., from pytest)
            self._client = context.client
            self._is_external_client = True
        else:
            # No client injected (production), create a new one
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout),
                follow_redirects=True,
            )
            self._is_external_client = False

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - closes the HTTP client only if we created it."""
        # Only close the client if this class created it
        if self._client and not self._is_external_client:
            await self._client.aclose()

    def _get_auth_headers(self) -> dict[str, str]:
        """
        Retrieve JWT token from tool context and build authorization headers.

        The JWT token is passed from the frontend client through the agent
        invocation API layer into the tool context.

        Returns:
            Dictionary with Authorization and Content-Type headers

        Raises:
            ToolContextError: If tool context is not configured
            AgentAuthenticationError: If JWT token is not available
        """
        try:
            context = get_tool_context()
        except ToolContextError as e:
            raise AgentAuthenticationError(
                message="Tool context not configured. Agent must be invoked through proper API layer.",
                status_code=500,
            ) from e

        if not context.jwt_token:
            raise AgentAuthenticationError(
                message="JWT token not available. Ensure the frontend passes a valid token to the agent API.",
                status_code=401,
                detail={
                    "error": "Missing JWT token in tool context",
                    "suggestion": "The frontend must include a valid JWT token when invoking the agent.",
                },
            )

        if not context.api_base_url:
            raise AgentAuthenticationError(
                message="API base URL not configured in tool context.",
                status_code=500,
                detail={
                    "error": "Missing API base URL",
                    "suggestion": "Configure API_BASE_URL in environment or tool context.",
                },
            )

        return {
            "Authorization": f"Bearer {context.jwt_token}",
            "Content-Type": "application/json",
        }

    def _get_full_url(self, endpoint: str) -> str:
        """
        Build full API URL from endpoint path.
        """
        context = get_tool_context()
        base_url = ""

        # If using an external client (pytest), its base_url is 'http://test'
        if self._is_external_client and self._client:
            base_url = str(self._client.base_url).rstrip("/")
        else:
            # In production, get the base_url from the context
            if not context.api_base_url:
                raise AgentAuthenticationError(
                    message="API base URL not configured in tool context.",
                    status_code=500,
                )
            base_url = context.api_base_url.rstrip("/")

        endpoint = endpoint.lstrip("/")

        # The base_url from get_api_base_url() already includes /api/v1
        # so we just append the endpoint
        if self._is_external_client:
            # Pytest client base_url is 'http://test', we need to add /api/v1
            api_v1_str = os.getenv("API_V1_STR", "/api/v1")
            return f"{base_url}{api_v1_str}/{endpoint}"

        return f"{base_url}/{endpoint}"

    def _handle_http_error(self, response: httpx.Response, endpoint: str) -> None:
        """
        Handle HTTP error responses with detailed error messages.

        Args:
            response: HTTP response object
            endpoint: API endpoint that was called

        Raises:
            AgentAuthenticationError: For 401/403 errors
            AgentResourceNotFoundError: For 404 errors
            AgentValidationError: For 422 errors
            AgentHTTPClientError: For other HTTP errors
        """
        try:
            error_detail = response.json()
        except Exception:
            error_detail = {"detail": response.text or "Unknown error"}

        status_code = response.status_code
        detail_message = error_detail.get("detail", "Unknown error")

        # Authentication/Authorization errors
        if status_code == status.HTTP_401_UNAUTHORIZED:
            raise AgentAuthenticationError(
                message=f"Authentication failed: {detail_message}",
                status_code=status_code,
                detail={
                    "error": "Invalid or expired JWT token",
                    "endpoint": endpoint,
                    "suggestion": "Request a fresh token from the frontend and retry.",
                },
            )

        if status_code == status.HTTP_403_FORBIDDEN:
            raise AgentAuthenticationError(
                message=f"Authorization failed: {detail_message}",
                status_code=status_code,
                detail={
                    "error": "Insufficient permissions",
                    "endpoint": endpoint,
                    "suggestion": "The current user does not have permission to perform this action.",
                },
            )

        # Resource not found
        if status_code == status.HTTP_404_NOT_FOUND:
            raise AgentResourceNotFoundError(
                message=f"Resource not found: {detail_message}",
                status_code=status_code,
                detail={
                    "error": "The requested resource does not exist",
                    "endpoint": endpoint,
                    "suggestion": "Verify the resource ID or parameters.",
                },
            )

        # Validation errors
        if status_code == status.HTTP_422_UNPROCESSABLE_ENTITY:
            raise AgentValidationError(
                message=f"Validation error: {detail_message}",
                status_code=status_code,
                detail=error_detail,
            )

        # Generic HTTP errors
        raise AgentHTTPClientError(
            message=f"HTTP {status_code} error: {detail_message}",
            status_code=status_code,
            detail=error_detail,
        )

    async def get(
        self,
        endpoint: str,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """
        Make a GET request to the API.

        Args:
            endpoint: API endpoint path (e.g., "/attendance/students/123")
            params: Optional query parameters

        Returns:
            Response data as dictionary

        Raises:
            AgentHTTPClientError: On request failure or HTTP error
        """
        if not self._client:
            raise AgentHTTPClientError("HTTP client not initialized. Use 'async with' context manager.")

        url = self._get_full_url(endpoint)
        headers = self._get_auth_headers()

        try:
            logger.info(f"Agent HTTP GET: {url}")
            response = await self._client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            self._handle_http_error(e.response, endpoint)

        except httpx.RequestError as e:
            raise AgentHTTPClientError(
                message=f"Network error: {str(e)}",
                detail={
                    "error": "Failed to connect to backend API",
                    "endpoint": endpoint,
                    "suggestion": "Check network connectivity and API server status.",
                },
            ) from e

    async def post(
        self,
        endpoint: str,
        json: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """
        Make a POST request to the API.

        Args:
            endpoint: API endpoint path
            json: Request body as dictionary
            params: Optional query parameters

        Returns:
            Response data as dictionary

        Raises:
            AgentHTTPClientError: On request failure or HTTP error
        """
        if not self._client:
            raise AgentHTTPClientError("HTTP client not initialized. Use 'async with' context manager.")

        url = self._get_full_url(endpoint)
        headers = self._get_auth_headers()

        try:
            logger.info(f"Agent HTTP POST: {url}")
            response = await self._client.post(url, headers=headers, json=json, params=params)
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            self._handle_http_error(e.response, endpoint)

        except httpx.RequestError as e:
            raise AgentHTTPClientError(
                message=f"Network error: {str(e)}",
                detail={
                    "error": "Failed to connect to backend API",
                    "endpoint": endpoint,
                    "suggestion": "Check network connectivity and API server status.",
                },
            ) from e

    async def put(
        self,
        endpoint: str,
        json: Optional[dict[str, Any]] = None,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """
        Make a PUT request to the API.

        Args:
            endpoint: API endpoint path
            json: Request body as dictionary
            params: Optional query parameters

        Returns:
            Response data as dictionary

        Raises:
            AgentHTTPClientError: On request failure or HTTP error
        """
        if not self._client:
            raise AgentHTTPClientError("HTTP client not initialized. Use 'async with' context manager.")

        url = self._get_full_url(endpoint)
        headers = self._get_auth_headers()

        try:
            logger.info(f"Agent HTTP PUT: {url}")
            response = await self._client.put(url, headers=headers, json=json, params=params)
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            self._handle_http_error(e.response, endpoint)

        except httpx.RequestError as e:
            raise AgentHTTPClientError(
                message=f"Network error: {str(e)}",
                detail={
                    "error": "Failed to connect to backend API",
                    "endpoint": endpoint,
                    "suggestion": "Check network connectivity and API server status.",
                },
            ) from e

    async def delete(
        self,
        endpoint: str,
        params: Optional[dict[str, Any]] = None,
    ) -> Optional[dict[str, Any]]:
        """
        Make a DELETE request to the API.

        Args:
            endpoint: API endpoint path
            params: Optional query parameters

        Returns:
            Response data as dictionary, or None for 204 No Content

        Raises:
            AgentHTTPClientError: On request failure or HTTP error
        """
        if not self._client:
            raise AgentHTTPClientError("HTTP client not initialized. Use 'async with' context manager.")

        url = self._get_full_url(endpoint)
        headers = self._get_auth_headers()

        try:
            logger.info(f"Agent HTTP DELETE: {url}")
            response = await self._client.delete(url, headers=headers, params=params)
            response.raise_for_status()

            # Handle 204 No Content
            if response.status_code == status.HTTP_204_NO_CONTENT:
                return None

            return response.json()

        except httpx.HTTPStatusError as e:
            self._handle_http_error(e.response, endpoint)

        except httpx.RequestError as e:
            raise AgentHTTPClientError(
                message=f"Network error: {str(e)}",
                detail={
                    "error": "Failed to connect to backend API",
                    "endpoint": endpoint,
                    "suggestion": "Check network connectivity and API server status.",
                },
            ) from e
