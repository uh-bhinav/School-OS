"""
Context Chip Handler
======================
Backend processing for context chips sent from the frontend.

Context chips are created when users Cmd/Ctrl+Click on dashboard elements.
They provide structured context (KPIs, chart points, entities, classes)
that enrich the AI agent's understanding of "what the user is looking at."

Frontend sends chips in the chat request body:
    {
        "message": "Why did this happen?",
        "context_chips": [
            {"type": "kpi", "key": "attendance", "value": "+5%"},
            {"type": "entity", "key": "Aarav Kumar", "value": "student_id_1"}
        ]
    }

This module converts those chips into a context prompt that is prepended
to the user's message before routing to agents.
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


# ============================================================================
# CHIP TYPE DEFINITIONS
# ============================================================================

CHIP_TYPE_ICONS = {
    "kpi": "📊",
    "chart_point": "📈",
    "entity": "👤",
    "class": "🏫",
    "metric_insight": "💡",
    "student": "🎓",
    "chart_datapoint": "📉",
}


# ============================================================================
# CONTEXT BUILDING
# ============================================================================


def build_context_from_chips(
    chips: List[Dict[str, Any]],
) -> str:
    """
    Convert a list of context chips into a natural-language context prompt.

    This prompt is prepended to the user's message so the agent
    understands what the user is referring to.

    Args:
        chips: List of chip dicts from frontend

    Returns:
        Context string to prepend to user message.
        Empty string if no valid chips.
    """
    if not chips:
        return ""

    context_parts = []

    for chip in chips:
        chip_text = _format_chip(chip)
        if chip_text:
            context_parts.append(chip_text)

    if not context_parts:
        return ""

    context = (
        "\n[CONTEXT FROM DASHBOARD — the user is looking at the following data]:\n"
        + "\n".join(f"  • {part}" for part in context_parts)
        + "\n[END CONTEXT]\n\n"
    )

    logger.info(f"Built context from {len(chips)} chips")
    return context


def _format_chip(chip: Dict[str, Any]) -> Optional[str]:
    """
    Format a single chip into a readable context line.

    Args:
        chip: Chip dict with type, key, value, etc.

    Returns:
        Formatted string or None if invalid.
    """
    chip_type = chip.get("type", "")
    icon = CHIP_TYPE_ICONS.get(chip_type, "📌")

    if chip_type == "kpi":
        key = chip.get("key", "Unknown KPI")
        value = chip.get("value", "")
        return f"{icon} KPI — {key}: {value}"

    elif chip_type in ("metric_insight",):
        metadata = chip.get("metadata", {})
        metric = metadata.get("metric", chip.get("key", "Unknown"))
        change = metadata.get("change", chip.get("value", ""))
        period = metadata.get("period", "")
        start = metadata.get("start_date", "")
        end = metadata.get("end_date", "")
        line = f"{icon} Insight — {metric}: {change}"
        if period:
            line += f" (period: {period})"
        if start and end:
            line += f" [{start} to {end}]"
        return line

    elif chip_type in ("entity", "student"):
        key = chip.get("key", "")
        value = chip.get("value", "")
        metadata = chip.get("metadata", {})
        student_class = metadata.get("class", "")
        attendance = metadata.get("attendance", "")
        line = f"{icon} {key}"
        if value:
            line += f" (ID: {value})"
        if student_class:
            line += f" — Class: {student_class}"
        if attendance:
            line += f" — Attendance: {attendance}"
        return line

    elif chip_type in ("chart_point", "chart_datapoint"):
        dataset = chip.get("dataset", "")
        x = chip.get("x", "")
        y = chip.get("y", "")
        metadata = chip.get("metadata", {})
        label = chip.get("label", chip.get("key", ""))

        if metadata:
            month = metadata.get("month", "")
            value = metadata.get("value", y)
            subject = metadata.get("subject", dataset)
            return f"{icon} Chart point — {subject}: {month} = {value}"
        elif dataset:
            return f"{icon} Chart point — {dataset}: ({x}, {y})"
        elif label:
            return f"{icon} Chart point — {label}"
        return None

    elif chip_type == "class":
        key = chip.get("key", "")
        value = chip.get("value", "")
        return f"{icon} Class — {key}" + (f": {value}" if value else "")

    else:
        # Generic fallback
        key = chip.get("key", chip.get("label", ""))
        value = chip.get("value", "")
        if key:
            return f"📌 {key}" + (f": {value}" if value else "")
        return None


# ============================================================================
# MESSAGE ENRICHMENT
# ============================================================================


def enrich_message_with_context(
    message: str,
    context_chips: List[Dict[str, Any]],
) -> str:
    """
    Combine context chips with the user's message into an enriched prompt.

    This is the main function called by the API layer.

    Args:
        message: Original user message
        context_chips: List of chip dicts from the request

    Returns:
        Enriched message string with context prepended.
    """
    context = build_context_from_chips(context_chips)
    if context:
        return f"{context}User question: {message}"
    return message


# ============================================================================
# CHIP VALIDATION
# ============================================================================


def validate_chips(chips: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and sanitize context chips from the frontend.

    Removes invalid chips, truncates overly long values.

    Args:
        chips: Raw chip list from request

    Returns:
        Cleaned chip list.
    """
    valid_types = {
        "kpi",
        "chart_point",
        "entity",
        "class",
        "metric_insight",
        "student",
        "chart_datapoint",
    }
    cleaned = []

    for chip in chips[:10]:  # Max 10 chips
        if not isinstance(chip, dict):
            continue

        chip_type = chip.get("type", "")
        if chip_type not in valid_types:
            logger.warning(f"Invalid chip type: {chip_type}")
            continue

        # Truncate long values
        for key in ("key", "value", "dataset", "label"):
            val = chip.get(key)
            if isinstance(val, str) and len(val) > 200:
                chip[key] = val[:200] + "..."

        cleaned.append(chip)

    return cleaned


# ============================================================================
# DETECT IF MESSAGE NEEDS CONTEXT ENRICHMENT
# ============================================================================

CONTEXT_DEPENDENT_PHRASES = [
    "why did this happen",
    "tell me more",
    "explain this",
    "what caused this",
    "break this down",
    "drill down",
    "show details",
    "compare with",
    "compare this",
    "what about this",
    "why is this",
    "how did this",
    "what does this mean",
    "show his",
    "show her",
    "show their",
    "his performance",
    "her performance",
    "their performance",
    "this student",
    "this class",
]


def message_needs_context(message: str) -> bool:
    """
    Check if a message contains ambiguous references that
    would benefit from context chips.

    Args:
        message: User message

    Returns:
        True if the message uses contextual references.
    """
    msg_lower = message.lower().strip()
    return any(phrase in msg_lower for phrase in CONTEXT_DEPENDENT_PHRASES)
