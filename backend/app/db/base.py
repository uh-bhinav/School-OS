# backend/app/db/base.py
"""Centralized model registry - imports all models for SQLAlchemy.

This module serves as the single source of truth for model imports.
All models must be imported here to ensure SQLAlchemy's mapper registry
is properly configured before any database operations occur.

CRITICAL: This module should be imported ONCE at application startup
(via main.py) to register all models with SQLAlchemy.
"""

from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path

from .base_class import Base


def _import_all_models() -> None:
    models_path = Path(__file__).resolve().parent.parent / "models"
    for module in pkgutil.iter_modules([str(models_path)]):
        if module.name.startswith("_"):
            continue
        importlib.import_module(f"app.models.{module.name}")


_import_all_models()

__all__ = ["Base"]
