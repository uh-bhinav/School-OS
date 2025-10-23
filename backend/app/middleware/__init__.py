# app/middleware/__init__.py
"""
Middleware module for the SchoolOS application.

This module contains custom middleware components for request/response processing.
"""

from app.middleware.raw_body import RawBodyMiddleware

__all__ = ["RawBodyMiddleware"]
