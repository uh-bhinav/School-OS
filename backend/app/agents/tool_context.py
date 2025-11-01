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

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile


@dataclass
class ToolRuntimeContext:
    """Holds ambient dependencies required by agent tools."""

    db: Optional[AsyncSession] = None
    current_profile: Optional[Profile] = None


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
