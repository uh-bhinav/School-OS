"""
Academics Module (L2 Orchestrator)

This package contains the L2 Orchestrator for the Academics module,
as well as the sub-packages for its L3 Routers and L4 Leaf Agents.
"""
from .module_agent import (
    academics_module_orchestrator_app,
    academics_module_orchestrator_instance,
    invoke_academics_module,
)

__all__ = [
    "academics_module_orchestrator_app",
    "academics_module_orchestrator_instance",
    "invoke_academics_module",
]
