# backend/app/db/base.py
"""Centralized model registry - imports all models for SQLAlchemy.

This module serves as the single source of truth for model imports.
All models must be imported here to ensure SQLAlchemy's mapper registry
is properly configured before any database operations occur.

CRITICAL: This module should be imported ONCE at application startup
(via main.py) to register all models with SQLAlchemy.
"""

from __future__ import annotations

from sqlalchemy.orm import configure_mappers

# Import Base first - this is the declarative base all models inherit from
from app.db.base_class import Base

# Import all models through the centralized __init__.py
# This ensures models are imported in the correct dependency order
# and prevents duplicate mapper registration.
# Using __import__ with fromlist forces module execution but doesn't
# pollute the namespace.
__import__("app.models", fromlist=["*"])

# CRITICAL: Force SQLAlchemy to complete all pending mapper configurations
# This must be called after all models are imported to ensure relationships
# are fully resolved before any database operations. This prevents the
# "UnmappedColumnError" that occurs when mappers are partially configured.
configure_mappers()

__all__ = ["Base"]
