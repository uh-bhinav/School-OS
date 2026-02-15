"""
Dummy Multi-Agent System
========================
Multi-agent orchestration for school management analytics.

Includes:
- Principal-level agents (attendance, marks, fees, budget, etc.)
- Super admin agents (group-level analytics across schools)
- Graph generation capabilities for data visualization
"""

from .agents import get_agent_response, detect_agent, AGENT_DEFINITIONS
from .super_admin_agents import (
    get_super_admin_agent_response,
    detect_super_admin_agent,
    SUPER_ADMIN_AGENTS,
)
from .graph_helpers import (
    should_generate_graph,
    build_graph_payload,
    generate_chart_safe,
    format_chart_response,
    detect_chart_type,
    # Template utilities
    USE_RESPONSE_TEMPLATES,
    TEMPLATES_ENABLED,
    detect_query_type,
    select_template,
    format_agent_response,
    validate_response,
    apply_template_to_message,
)

# Import templates from manager
from .manager.templates import (
    ResponseTemplates,
    ResponseNormalizer,
    TemplateValidator,
    TextProcessor,
    StatusIcon,
)

__all__ = [
    # Principal agents
    "get_agent_response",
    "detect_agent",
    "AGENT_DEFINITIONS",
    # Super admin agents
    "get_super_admin_agent_response",
    "detect_super_admin_agent",
    "SUPER_ADMIN_AGENTS",
    # Graph helpers
    "should_generate_graph",
    "build_graph_payload",
    "generate_chart_safe",
    "format_chart_response",
    "detect_chart_type",
    # Template utilities
    "USE_RESPONSE_TEMPLATES",
    "TEMPLATES_ENABLED",
    "detect_query_type",
    "select_template",
    "format_agent_response",
    "validate_response",
    "apply_template_to_message",
    # Template classes
    "ResponseTemplates",
    "ResponseNormalizer",
    "TemplateValidator",
    "TextProcessor",
    "StatusIcon",
]
