"""
Graph Intelligence Module
==========================
Smart query classifier that determines when and how to auto-generate graphs.
Enhances the existing graph_helpers.py with smarter classification,
chart type detection, and automatic parameter extraction from agent responses.

Used by agents.py to automatically attach visualizations to analytical queries.
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ============================================================================
# GRAPH INTENT CLASSIFICATION
# ============================================================================

# Weighted keyword scoring — higher weight = stronger graph signal
GRAPH_INTENT_KEYWORDS: Dict[str, float] = {
    # Explicit visualization requests (highest weight)
    "visualize": 3.0,
    "visualization": 3.0,
    "chart": 3.0,
    "graph": 3.0,
    "plot": 3.0,
    "show me a chart": 3.0,
    "draw": 2.5,
    "diagram": 2.5,
    # Trend analysis (high weight — always benefits from graphs)
    "trend": 2.5,
    "over time": 2.5,
    "month-wise": 2.5,
    "monthwise": 2.5,
    "week-wise": 2.5,
    "weekwise": 2.5,
    "progression": 2.5,
    "growth": 2.5,
    "decline": 2.5,
    "increasing": 2.0,
    "decreasing": 2.0,
    # Comparisons (high weight)
    "compare": 2.0,
    "comparison": 2.0,
    "versus": 2.0,
    " vs ": 2.0,
    "between": 1.5,
    "difference": 1.5,
    # Distributions / breakdowns (high weight)
    "distribution": 2.0,
    "breakdown": 2.0,
    "proportion": 2.0,
    "composition": 2.0,
    "split": 1.5,
    "category-wise": 2.0,
    "class-wise": 2.0,
    "classwise": 2.0,
    "subject-wise": 2.0,
    "subjectwise": 2.0,
    # Rankings (moderate weight)
    "ranking": 1.8,
    "rank": 1.5,
    "top": 1.5,
    "bottom": 1.5,
    "best": 1.3,
    "worst": 1.3,
    "highest": 1.5,
    "lowest": 1.5,
    "leaderboard": 1.8,
    # Aggregation queries (moderate weight — often need graphs)
    "average": 1.3,
    "total": 1.0,
    "overall": 1.0,
    "summary": 1.3,
    "overview": 1.3,
    "statistics": 1.5,
    "analysis": 1.5,
    "analyze": 1.5,
    # Collection / financial (moderate weight)
    "collection": 1.3,
    "revenue": 1.5,
    "expenditure": 1.5,
    "utilization": 1.5,
}

# Keywords that suppress graph generation
GRAPH_SUPPRESS_KEYWORDS: List[str] = [
    "who is",
    "what is the name",
    "tell me about",
    "send email",
    "send mail",
    "notify",
    "reminder",
    "yes",
    "no",
    "ok",
    "okay",
    "thank",
    "thanks",
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "single student",
    "one student",
    "specific student",
    "individual",
    "particular",
]

# Minimum score threshold for auto-graph generation
GRAPH_SCORE_THRESHOLD = 1.8

# Regex patterns for additional detection
GRAPH_PATTERNS: List[Tuple[str, float]] = [
    (r"show\s+\w+\s+trend", 2.5),
    (r"compare\s+\w+", 2.0),
    (r"\w+\s+over\s+(time|months?|weeks?|years?|days?)", 2.5),
    (r"(monthly|weekly|yearly|annual|daily)\s+\w+", 2.0),
    (
        r"(performance|attendance|fee|collection|budget)\s+(trend|comparison|distribution|analysis)",
        2.5,
    ),
    (r"how\s+has\s+\w+\s+(changed|grown|declined|improved)", 2.0),
    (r"(bar|line|pie|horizontal)\s+chart", 3.0),
    (r"class[\s-]?wise\s+\w+", 2.0),
    (r"subject[\s-]?wise\s+\w+", 2.0),
    (r"grade[\s-]?wise\s+\w+", 2.0),
    (r"(top|bottom)\s+\d+", 1.8),
]


def compute_graph_score(query: str) -> float:
    """
    Compute a weighted score indicating how strongly a query needs a graph.

    Args:
        query: The user's query string

    Returns:
        float: Score (higher = more likely needs graph)
    """
    query_lower = query.lower().strip()
    score = 0.0

    # Check suppression keywords first
    for suppress in GRAPH_SUPPRESS_KEYWORDS:
        if suppress in query_lower:
            return 0.0

    # Score from keyword matches
    for keyword, weight in GRAPH_INTENT_KEYWORDS.items():
        if keyword in query_lower:
            score += weight

    # Score from regex pattern matches
    for pattern, weight in GRAPH_PATTERNS:
        if re.search(pattern, query_lower):
            score += weight

    # Bonus: multiple data entities mentioned (e.g., "Grade 1 vs Grade 5")
    grade_mentions = len(re.findall(r"grade\s*\d+", query_lower))
    if grade_mentions >= 2:
        score += 1.0

    # Bonus: query asks about "all" or "each" (implies multi-point data)
    if re.search(r"\b(all|each|every)\b", query_lower):
        score += 0.5

    return score


def should_auto_graph(query: str) -> Dict[str, Any]:
    """
    Smart classifier that determines if a query should auto-generate a graph.

    Returns:
        Dict with keys:
            - needs_graph (bool): Whether a graph should be generated
            - score (float): Confidence score
            - chart_type (str): Recommended chart type
            - reasoning (str): Why graph was/wasn't recommended
    """
    score = compute_graph_score(query)
    needs_graph = score >= GRAPH_SCORE_THRESHOLD

    if needs_graph:
        chart_type = detect_chart_type_smart(query)
        reasoning = f"Score {score:.1f} >= threshold {GRAPH_SCORE_THRESHOLD} — graph recommended"
    else:
        chart_type = "none"
        reasoning = f"Score {score:.1f} < threshold {GRAPH_SCORE_THRESHOLD} — text-only response"

    return {
        "needs_graph": needs_graph,
        "score": score,
        "chart_type": chart_type,
        "reasoning": reasoning,
    }


# ============================================================================
# SMART CHART TYPE DETECTION
# ============================================================================

# Chart type rules: (pattern, chart_type, priority)
CHART_TYPE_RULES: List[Tuple[str, str, int]] = [
    # Trend / time-series → Line
    (
        r"\b(trend|over time|progression|month-wise|monthwise|week-wise|weekwise|growth|decline|historical)\b",
        "line",
        10,
    ),
    (
        r"\b(monthly|weekly|yearly|annual|daily)\s+(trend|report|data|analysis)\b",
        "line",
        10,
    ),
    (r"\w+\s+over\s+(time|months?|weeks?|years?|days?)", "line", 10),
    (r"how\s+has\s+\w+\s+(changed|grown|declined|improved)", "line", 9),
    # Proportion / composition → Pie
    (
        r"\b(proportion|percentage of|composition|breakdown of total|share of|distribution of)\b",
        "pie",
        10,
    ),
    (r"\b(pie\s+chart|percentage\s+split|ratio)\b", "pie", 10),
    # Rankings → Horizontal bar
    (r"\b(ranking|rank|leaderboard)\b", "horizontal_bar", 10),
    (r"\b(top|bottom)\s+\d+", "horizontal_bar", 9),
    (
        r"\b(best|worst|highest|lowest)\s+(performing|scorer|student|class|teacher)\b",
        "horizontal_bar",
        9,
    ),
    # Stacked → Stacked bar
    (r"\b(stacked|breakdown by|composition by|split by)\b", "stacked_bar", 10),
    # Explicit chart type requests
    (r"\bline\s+chart\b", "line", 15),
    (r"\bbar\s+chart\b", "bar", 15),
    (r"\bpie\s+chart\b", "pie", 15),
    (r"\bhorizontal\s+bar\b", "horizontal_bar", 15),
    # Comparison → Bar (default for comparisons)
    (r"\b(compare|comparison|versus|vs|between|difference)\b", "bar", 5),
    (
        r"\b(class-wise|classwise|subject-wise|subjectwise|grade-wise|gradewise)\b",
        "bar",
        6,
    ),
]


def detect_chart_type_smart(query: str) -> str:
    """
    Determine the most appropriate chart type using prioritized rule matching.

    Args:
        query: The user's query string

    Returns:
        str: Chart type (line, bar, pie, horizontal_bar, stacked_bar)
    """
    query_lower = query.lower()
    best_type = "bar"  # default
    best_priority = 0

    for pattern, chart_type, priority in CHART_TYPE_RULES:
        if re.search(pattern, query_lower) and priority > best_priority:
            best_type = chart_type
            best_priority = priority

    return best_type


# ============================================================================
# DATA EXTRACTION FROM AGENT RESPONSES
# ============================================================================


def extract_chart_params_from_response(
    response_text: str,
    query: str,
    agent_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Extract chart parameters from an agent's text response when the LLM
    didn't return structured <CHART_DATA>. This is the fallback intelligence.

    Parses bullet points, tables, and name:value patterns to build chart data.

    Args:
        response_text: The agent's text response
        query: Original user query
        agent_id: Agent identifier for domain context

    Returns:
        Dict with chart payload params, or None if extraction fails
    """
    labels = []
    values = []

    # Domain-specific relevance validation
    domain_keywords = {
        "marks_agent": [
            "marks",
            "score",
            "grade",
            "percentage",
            "obtained",
            "performance",
            "exam",
        ],
        "attendance_agent": ["attendance", "present", "absent", "late", "percentage"],
        "fees_agent": [
            "fee",
            "paid",
            "pending",
            "overdue",
            "balance",
            "amount",
            "dues",
        ],
        "budget_agent": ["budget", "expense", "spent", "allocated", "remaining"],
        "hr_agent": ["staff", "employee", "salary", "leave", "periods"],
    }

    agent_keywords = domain_keywords.get(agent_id, [])
    query_lower = query.lower()
    if agent_keywords and not any(kw in query_lower for kw in agent_keywords):
        logger.debug(f"Query doesn't match {agent_id} domain, skipping extraction")
        return None

    # Extraction patterns (ordered by specificity)
    extraction_patterns = [
        # "• Name: 95.5%" or "• Name: 95.5"
        (r"[•\-\*→]\s*([^:]+?):\s*([\d,]+(?:\.\d+)?)\s*%?", "bullet_colon"),
        # "• Name – 95" or "• Name - 95"
        (r"[•\-\*→]\s*([^–\-]+?)\s*[–\-]\s*([\d,]+(?:\.\d+)?)", "bullet_dash"),
        # "Name scored 95" or "Name: scored 95"
        (
            r"(\w[\w\s]{2,25}?)\s+(?:scored?|got|obtained|has|received)\s+([\d,]+(?:\.\d+)?)",
            "verb_pattern",
        ),
        # "Name (95%)" or "Name (₹95,000)"
        (r"(\w[\w\s]{2,25}?)\s*\([\₹$]?([\d,]+(?:\.\d+)?)\s*%?\)", "parenthetical"),
        # Table-like: "Name    95"
        (r"^(\w[\w\s]{2,25}?)\s{2,}([\d,]+(?:\.\d+)?)\s*$", "table_row"),
    ]

    for pattern, pattern_name in extraction_patterns:
        matches = re.findall(pattern, response_text, re.MULTILINE)
        if matches and len(matches) >= 2:
            for match in matches[:12]:  # Limit to 12 data points
                label = match[0].strip().rstrip(":")
                try:
                    value = float(match[1].replace(",", ""))
                    if label and 1 <= len(label) <= 30:
                        # Filter out non-entity labels
                        skip_labels = [
                            "total",
                            "average",
                            "overall",
                            "sum",
                            "max",
                            "min",
                            "count",
                            "note",
                        ]
                        if label.lower() not in skip_labels:
                            labels.append(label)
                            values.append(value)
                except ValueError:
                    continue
            if labels:
                logger.debug(
                    f"Extracted {len(labels)} data points using {pattern_name}"
                )
                break

    if len(labels) < 2:
        logger.debug(
            f"Insufficient data points extracted ({len(labels)}), skipping chart"
        )
        return None

    # Determine chart type
    chart_type = detect_chart_type_smart(query)

    # Generate contextual title
    title = _generate_smart_title(query, agent_id, chart_type)

    # Build axis labels based on agent type
    x_label, y_label = _get_axis_labels(agent_id, chart_type)

    return {
        "chart_type": chart_type,
        "title": title,
        "labels": labels,
        "values": values,
        "x_label": x_label,
        "y_label": y_label,
    }


def _generate_smart_title(query: str, agent_id: str, chart_type: str) -> str:
    """Generate a contextual chart title from the query."""
    # Clean query for title extraction
    query_clean = re.sub(
        r"\b(show|me|the|a|an|please|can|you|display|visualize|generate|create)\b",
        "",
        query,
        flags=re.IGNORECASE,
    ).strip()

    # Capitalize first few meaningful words
    words = [w for w in query_clean.split() if len(w) > 2][:6]
    if words:
        title = " ".join(w.capitalize() for w in words)
    else:
        # Fallback based on agent
        domain_titles = {
            "marks_agent": "Academic Performance Analysis",
            "attendance_agent": "Attendance Analysis",
            "fees_agent": "Fee Collection Analysis",
            "budget_agent": "Budget Analysis",
            "hr_agent": "Staff Analysis",
        }
        title = domain_titles.get(agent_id, "Data Analysis")

    return title


def _get_axis_labels(agent_id: str, chart_type: str) -> Tuple[str, str]:
    """Get appropriate axis labels based on agent domain and chart type."""
    if chart_type == "pie":
        return ("", "")

    axis_map = {
        "marks_agent": ("Student / Subject", "Marks / Percentage"),
        "attendance_agent": ("Student / Class", "Attendance %"),
        "fees_agent": ("Student / Class", "Amount (₹)"),
        "budget_agent": ("Budget / Category", "Amount (₹)"),
        "hr_agent": ("Staff", "Value"),
    }

    x_label, y_label = axis_map.get(agent_id, ("Category", "Value"))

    if chart_type == "horizontal_bar":
        return (y_label, x_label)  # Swap for horizontal

    return (x_label, y_label)


# ============================================================================
# GRAPH DECISION PIPELINE
# ============================================================================


def graph_decision_pipeline(
    query: str,
    response_text: str,
    agent_id: str,
    existing_chart: Optional[Dict] = None,
) -> Dict[str, Any]:
    """
    Complete pipeline: should we graph? → what type? → extract data → build payload.

    This is the main entry point called from agents.py.

    Args:
        query: User's original query
        response_text: Agent's text response
        agent_id: Which agent responded
        existing_chart: If LLM already provided structured chart data

    Returns:
        Dict with:
            - should_graph (bool)
            - chart_params (dict or None): Ready for build_graph_payload()
            - chart_type (str)
            - reasoning (str)
    """
    # If chart already exists from LLM structured output, keep it
    if existing_chart:
        return {
            "should_graph": True,
            "chart_params": None,  # Already have chart
            "chart_type": existing_chart.get("chart_type", "bar"),
            "reasoning": "LLM provided structured chart data",
        }

    # Step 1: Should we graph?
    decision = should_auto_graph(query)

    if not decision["needs_graph"]:
        return {
            "should_graph": False,
            "chart_params": None,
            "chart_type": "none",
            "reasoning": decision["reasoning"],
        }

    # Step 2: Extract chart parameters from response
    chart_params = extract_chart_params_from_response(
        response_text=response_text,
        query=query,
        agent_id=agent_id,
    )

    if chart_params:
        return {
            "should_graph": True,
            "chart_params": chart_params,
            "chart_type": chart_params["chart_type"],
            "reasoning": f"{decision['reasoning']} — extracted {len(chart_params.get('labels', []))} data points",
        }

    # Step 3: Graph desired but couldn't extract data
    return {
        "should_graph": True,
        "chart_params": None,  # Signal: use LLM chart instruction fallback
        "chart_type": decision["chart_type"],
        "reasoning": f"{decision['reasoning']} — no extractable data, will use LLM chart instruction",
    }


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "should_auto_graph",
    "detect_chart_type_smart",
    "compute_graph_score",
    "extract_chart_params_from_response",
    "graph_decision_pipeline",
    "GRAPH_SCORE_THRESHOLD",
]
