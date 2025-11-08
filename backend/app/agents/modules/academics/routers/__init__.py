# File: app/agents/modules/academics/routers/__init__.py

# (You might already have the assessment_router here)
from .assessment_router import invoke_assessment_router
from .assessment_schemas import AssessmentRoute
from .core_curriculum_router import invoke_core_curriculum_router
from .core_curriculum_schemas import CoreCurriculumRoute
from .holistic_router import invoke_holistic_router
from .holistic_schemas import HolisticRoute

# --- ADD THESE NEW LINES ---
from .scheduling_router import invoke_scheduling_router
from .scheduling_schemas import SchedulingRoute

# --- END ADD ---

__all__ = [
    # Existing
    "invoke_assessment_router",
    "AssessmentRoute",
    "invoke_core_curriculum_router",
    "CoreCurriculumRoute",
    # New
    "invoke_scheduling_router",
    "SchedulingRoute",
    "invoke_holistic_router",
    "HolisticRoute",
]
