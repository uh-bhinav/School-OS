# backend/app/agents/tool_context.py
"""Shared context wiring for agent tool execution.

This module lets API layers inject request-scoped dependencies (like the
current database session and authenticated profile) so that LangGraph tools can
retrieve them without exposing those fields in their schema. Tools read the
context via :func:`get_tool_context`, and API layers should wrap invocations in
:func:`use_tool_context`.
"""

from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Optional

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile


@dataclass
class ToolRuntimeContext:
    """Holds ambient dependencies required by agent tools.

    For HTTP-based agents:
    - jwt_token: JWT token from the frontend client that will be used to authenticate
      HTTP requests to the backend API. This token is passed from the frontend through
      the agent invocation layer.
    - api_base_url: Base URL for the backend API (e.g., http://localhost:8000/api/v1)

    For legacy service-based agents (deprecated):
    - db: Database session for direct service calls
    - current_profile: Authenticated user profile
    """

    db: Optional[AsyncSession] = None
    current_profile: Optional[Profile] = None
    jwt_token: Optional[str] = None
    api_base_url: Optional[str] = None
    client: Optional[httpx.AsyncClient] = None


class ToolContextError(RuntimeError):
    """Raised when a tool tries to execute without the required context."""


_tool_context_var: ContextVar[Optional[ToolRuntimeContext]] = ContextVar(
    "tool_runtime_context",
    default=None,
)


@contextmanager
def use_tool_context(context: ToolRuntimeContext):
    """Temporarily set the tool runtime context for the current call stack."""

    token = _tool_context_var.set(context)
    try:
        yield
    finally:
        _tool_context_var.reset(token)


def get_tool_context() -> ToolRuntimeContext:
    """Return the active tool runtime context or raise if none is set."""

    context = _tool_context_var.get()
    if context is None:
        raise ToolContextError("Tool runtime context has not been configured for this request.")
    return context
