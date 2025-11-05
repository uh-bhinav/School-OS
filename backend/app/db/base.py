# backend/app/db/base.py
"""Ensure SQLAlchemy knows about every model before metadata creation.

This module dynamically imports every module inside ``app.models``. Without
doing so, SQLAlchemy relationships that reference other classes (for example,
``Exam.school`` -> ``School``) can fail to resolve, leading to runtime errors
during flush/commit. Importing all models up-front guarantees the mappers are
registered before we interact with the ORM.
"""

from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path

EXCLUDED_MODULES = {"package_item"}


def _import_all_models() -> None:
    models_path = Path(__file__).resolve().parent.parent / "models"
    for module in pkgutil.iter_modules([str(models_path)]):
        if module.name.startswith("_") or module.name in EXCLUDED_MODULES:
            continue
        importlib.import_module(f"app.models.{module.name}")


_import_all_models()

__all__ = ["_import_all_models"]
