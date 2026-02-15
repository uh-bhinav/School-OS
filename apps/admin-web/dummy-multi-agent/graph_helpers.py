"""
Graph Integration Helpers for Multi-Agent System
=================================================
Provides utility functions for agents to decide when to generate charts
and how to build payloads for the graph tool.
Also includes response template utilities for consistent formatting.
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple

# Import the graph tool (handle both relative and direct imports)
try:
    from .manager.tools.graph_tool import generate_chart
except ImportError:
    try:
        from manager.tools.graph_tool import generate_chart
    except ImportError:
        logging.error("Could not import graph_tool - charts will not work")
        generate_chart = None

# Import response templates
try:
    from .manager.templates import (
        ResponseTemplates,
        ResponseNormalizer,
        TemplateValidator,
        TextProcessor,
    )

    TEMPLATES_ENABLED = True
except ImportError:
    try:
        from manager.templates import (
            ResponseTemplates,
            ResponseNormalizer,
            TemplateValidator,
            TextProcessor,
        )

        TEMPLATES_ENABLED = True
    except ImportError:
        TEMPLATES_ENABLED = False
        logging.warning("Response templates not available. Using raw responses.")

logger = logging.getLogger(__name__)

# ============================================================================
# FEATURE FLAGS
# ============================================================================
USE_RESPONSE_TEMPLATES = True  # Toggle templates on/off for testing

# ============================================================================
# VISUALIZATION INTENT DETECTION
# ============================================================================

# Keywords that indicate visualization intent
GRAPH_TRIGGER_KEYWORDS = {
    # Trend-related
    "trend": True,
    "over time": True,
    "month-wise": True,
    "monthwise": True,
    "week-wise": True,
    "weekwise": True,
    "year-wise": True,
    "yearwise": True,
    "historical": True,
    "progression": True,
    "evolution": True,
    # Comparison-related
    "compare": True,
    "comparison": True,
    "versus": True,
    "vs": True,
    "class-wise": True,
    "classwise": True,
    "school-wise": True,
    "schoolwise": True,
    "subject-wise": True,
    "subjectwise": True,
    "between": True,
    # Distribution-related
    "distribution": True,
    "spread": True,
    "breakdown": True,
    "composition": True,
    "proportion": True,
    # Growth/Change-related
    "growth": True,
    "decline": True,
    "increase": True,
    "decrease": True,
    "change": True,
    "improvement": True,
    "deterioration": True,
    # Ranking-related
    "ranking": True,
    "rank": True,
    "top": True,
    "bottom": True,
    "best": True,
    "worst": True,
    "highest": True,
    "lowest": True,
    # Explicit visualization requests
    "visualize": True,
    "visualization": True,
    "chart": True,
    "graph": True,
    "plot": True,
    "show me": True,
    "display": True,
}

# Keywords that should NOT trigger graphs (single value / simple queries)
GRAPH_EXCLUDE_KEYWORDS = [
    "who is",
    "what is the",
    "tell me about",
    "yes or no",
    "is there",
    "how many total",
    "single",
    "one student",
    "one teacher",
    "specific student",
    "individual",
]


def should_generate_graph(query: str) -> bool:
    """
    Determine if a user query warrants a visual chart response.

    Args:
        query: The user's query string

    Returns:
        bool: True if a graph should be generated, False otherwise
    """
    query_lower = query.lower().strip()

    # Check exclusion patterns first
    for exclude in GRAPH_EXCLUDE_KEYWORDS:
        if exclude in query_lower:
            return False

    # Check for graph trigger keywords
    for keyword in GRAPH_TRIGGER_KEYWORDS:
        if keyword in query_lower:
            return True

    # Additional pattern matching for common visualization requests
    visualization_patterns = [
        r"show\s+\w+\s+trend",
        r"compare\s+\w+",
        r"\w+\s+over\s+(time|months?|weeks?|years?)",
        r"(monthly|weekly|yearly|annual)\s+\w+",
        r"(performance|attendance|fee|collection)\s+(trend|comparison|distribution)",
        r"how\s+has\s+\w+\s+(changed|grown|declined)",
        r"(bar|line|pie)\s+chart",
    ]

    for pattern in visualization_patterns:
        if re.search(pattern, query_lower):
            return True

    return False


def detect_chart_type(query: str, data_context: str = "") -> str:
    """
    Determine the most appropriate chart type based on query intent.

    Args:
        query: The user's query string
        data_context: Optional context about the data being visualized

    Returns:
        str: Chart type (line, bar, pie, horizontal_bar, stacked_bar)
    """
    query_lower = query.lower()

    # Trend/time-series → Line chart
    if any(
        word in query_lower
        for word in [
            "trend",
            "over time",
            "month-wise",
            "monthwise",
            "week-wise",
            "weekwise",
            "progression",
            "historical",
            "evolution",
        ]
    ):
        return "line"

    # Proportions/composition → Pie chart
    if any(
        word in query_lower
        for word in [
            "proportion",
            "percentage of",
            "composition",
            "breakdown of total",
            "distribution of",
            "share of",
        ]
    ):
        return "pie"

    # Rankings → Horizontal bar
    if any(
        word in query_lower
        for word in [
            "ranking",
            "rank",
            "top",
            "bottom",
            "best",
            "worst",
            "highest",
            "lowest",
            "leaderboard",
        ]
    ):
        return "horizontal_bar"

    # Stacked composition over categories
    if any(
        word in query_lower
        for word in ["stacked", "breakdown by", "composition by", "split by"]
    ):
        return "stacked_bar"

    # Default to bar for comparisons
    return "bar"


# ============================================================================
# PAYLOAD BUILDERS FOR EACH AGENT TYPE
# ============================================================================


def build_graph_payload(
    agent_type: str,
    intent: str,
    labels: List[str],
    values: List[float],
    title: str = "",
    x_label: str = "",
    y_label: str = "",
    chart_type: str = None,
    series_name: str = None,
    multiple_series: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Build a standardized graph payload for the graph tool.

    Args:
        agent_type: Type of agent (attendance, marks, fees, budget, etc.)
        intent: What the chart is showing (trend, comparison, distribution)
        labels: X-axis labels or category names
        values: Data values (ignored if multiple_series provided)
        title: Chart title (auto-generated if not provided)
        x_label: X-axis label
        y_label: Y-axis label
        chart_type: Override chart type detection
        series_name: Name for single series
        multiple_series: List of {"name": str, "values": list} for multi-series

    Returns:
        Dict: Payload ready for graph_tool.generate_chart()
    """
    # Limit data points to 50
    if len(labels) > 50:
        labels = labels[:50]
        values = values[:50] if values else values
        if multiple_series:
            multiple_series = [
                {"name": s["name"], "values": s["values"][:50]} for s in multiple_series
            ]

    # Auto-detect chart type if not specified
    if not chart_type:
        chart_type = detect_chart_type(intent)

    # Auto-generate title if not provided
    if not title:
        title = _generate_title(agent_type, intent)

    # Build datasets
    if multiple_series:
        datasets = [
            {"name": s.get("name", f"Series {i+1}"), "values": s["values"]}
            for i, s in enumerate(multiple_series)
        ]
    else:
        datasets = [{"name": series_name or "Value", "values": values}]

    payload = {
        "chart_type": chart_type,
        "title": title,
        "x_label": x_label,
        "y_label": y_label,
        "labels": labels,
        "datasets": datasets,
        "output_format": "base64",
        "width": 800,
        "height": 500,
    }

    return payload


def _generate_title(agent_type: str, intent: str) -> str:
    """Generate a default chart title based on agent and intent."""
    titles = {
        "attendance": {
            "trend": "Attendance Trend Over Time",
            "comparison": "Attendance Comparison",
            "distribution": "Attendance Distribution",
            "default": "Attendance Analysis",
        },
        "marks": {
            "trend": "Academic Performance Trend",
            "comparison": "Marks Comparison",
            "distribution": "Grade Distribution",
            "default": "Academic Performance Analysis",
        },
        "fees": {
            "trend": "Fee Collection Trend",
            "comparison": "Fee Collection Comparison",
            "distribution": "Fee Status Distribution",
            "default": "Fee Analysis",
        },
        "budget": {
            "trend": "Budget Utilization Trend",
            "comparison": "Budget Comparison",
            "distribution": "Budget Allocation Distribution",
            "default": "Budget Analysis",
        },
        "group_attendance": {
            "trend": "Group Attendance Trend",
            "comparison": "School Attendance Comparison",
            "distribution": "Attendance Distribution Across Schools",
            "default": "Group Attendance Analysis",
        },
        "group_finance": {
            "trend": "Group Revenue Trend",
            "comparison": "School Financial Comparison",
            "distribution": "Revenue Distribution Across Schools",
            "default": "Group Financial Analysis",
        },
        "schools_overview": {
            "trend": "Schools Performance Trend",
            "comparison": "Schools Comparison",
            "distribution": "Schools Health Distribution",
            "ranking": "Schools Ranking",
            "default": "Schools Overview",
        },
    }

    agent_titles = titles.get(agent_type, {"default": "Data Analysis"})
    return agent_titles.get(intent, agent_titles["default"])


# ============================================================================
# CHART GENERATION WITH ERROR HANDLING
# ============================================================================


def generate_chart_safe(
    payload: Dict[str, Any]
) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Safely generate a chart with error handling.

    Args:
        payload: Chart generation payload

    Returns:
        Tuple of (chart_result, error_message)
        - On success: (result_dict, None)
        - On failure: (None, error_message)
    """
    try:
        result = generate_chart(payload)

        if result.get("status") == "success":
            return result, None
        else:
            error_msg = result.get("message", "Unknown error generating chart")
            logger.error(f"Chart generation failed: {error_msg}")
            return None, error_msg

    except Exception as e:
        logger.exception(f"Exception during chart generation: {e}")
        return None, str(e)


# ============================================================================
# RESPONSE FORMATTERS
# ============================================================================


def format_chart_response(
    text_insight: str,
    chart_result: Optional[Dict],
    observations: List[str] = None,
    fallback_text: str = None,
) -> Dict[str, Any]:
    """
    Format a response that includes a chart.

    Args:
        text_insight: 2-4 line insight summary
        chart_result: Result from generate_chart_safe
        observations: List of bullet point observations
        fallback_text: Text to use if chart generation failed

    Returns:
        Dict with text, chart (if available), and notes
    """
    response = {"text": text_insight}

    if chart_result and chart_result.get("status") == "success":
        response["chart"] = {
            "type": chart_result.get("chart_type"),
            "format": chart_result.get("output_format"),
            "data": chart_result.get("base64_image") or chart_result.get("file_path"),
        }
    elif fallback_text:
        response["text"] = fallback_text

    if observations:
        response["notes"] = observations

    return response


# ============================================================================
# DATA EXTRACTION HELPERS
# ============================================================================


def extract_monthly_data(
    data_rows: List[Dict], date_field: str, value_field: str
) -> Tuple[List[str], List[float]]:
    """
    Extract monthly aggregated data from records.

    Args:
        data_rows: List of data dictionaries
        date_field: Name of the date field
        value_field: Name of the value field to aggregate

    Returns:
        Tuple of (month_labels, aggregated_values)
    """
    from collections import defaultdict

    monthly = defaultdict(list)

    for row in data_rows:
        date_str = row.get(date_field, "")
        value = row.get(value_field, 0)

        if date_str and value is not None:
            # Extract month-year
            try:
                if "-" in str(date_str):
                    parts = str(date_str).split("-")
                    month_key = f"{parts[0]}-{parts[1]}"
                else:
                    month_key = str(date_str)[:7]
                monthly[month_key].append(float(value))
            except (ValueError, IndexError):
                continue

    # Sort by month and calculate averages
    sorted_months = sorted(monthly.keys())
    labels = []
    values = []

    month_names = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }

    for month in sorted_months[-12:]:  # Last 12 months max
        month_num = month.split("-")[1] if "-" in month else month
        labels.append(month_names.get(month_num, month))
        values.append(sum(monthly[month]) / len(monthly[month]))

    return labels, values


def extract_category_data(
    data_rows: List[Dict],
    category_field: str,
    value_field: str,
    aggregation: str = "sum",
) -> Tuple[List[str], List[float]]:
    """
    Extract category-wise aggregated data from records.

    Args:
        data_rows: List of data dictionaries
        category_field: Name of the category field
        value_field: Name of the value field to aggregate
        aggregation: "sum", "avg", "count", "max", "min"

    Returns:
        Tuple of (category_labels, aggregated_values)
    """
    from collections import defaultdict

    category_data = defaultdict(list)

    for row in data_rows:
        category = row.get(category_field, "Unknown")
        value = row.get(value_field, 0)

        if category and value is not None:
            try:
                category_data[str(category)].append(float(value))
            except (ValueError, TypeError):
                continue

    labels = list(category_data.keys())

    if aggregation == "sum":
        values = [sum(v) for v in category_data.values()]
    elif aggregation == "avg":
        values = [sum(v) / len(v) for v in category_data.values()]
    elif aggregation == "count":
        values = [len(v) for v in category_data.values()]
    elif aggregation == "max":
        values = [max(v) for v in category_data.values()]
    elif aggregation == "min":
        values = [min(v) for v in category_data.values()]
    else:
        values = [sum(v) for v in category_data.values()]

    return labels, values


# ============================================================================
# AGENT PROMPT AUGMENTATION
# ============================================================================

GRAPH_PROMPT_ADDITION = """

VISUALIZATION CAPABILITY:
You may generate visual charts using the graph tool when it improves clarity.
Use charts for: trends over time, comparisons between groups, distributions, rankings.
Do NOT use charts for: single values, yes/no answers, simple lookups.
When you include a chart, always explain what it shows in simple language.
"""


# ============================================================================
# RESPONSE TEMPLATE UTILITIES
# ============================================================================

# Query type detection patterns for template selection
QUERY_TYPE_PATTERNS = {
    "list": [
        r"\b(list|show|display|get)\b.*\b(all|students|teachers|staff|classes)\b",
        r"\bwho\b.*(are|is)",
        r"\bwhich\b.*\b(students|teachers|classes)\b",
    ],
    "analysis": [
        r"\b(analyze|analysis|trend|pattern|insight)\b",
        r"\bhow\b.*\b(performing|doing|changed)\b",
        r"\bwhat\b.*\b(insight|observation|finding)\b",
    ],
    "metric": [
        r"\b(average|total|count|percentage|rate|score)\b",
        r"\bhow\s+(many|much)\b",
        r"\bwhat\s+is\s+(the|overall)\b",
    ],
    "comparison": [
        r"\b(compare|comparison|versus|vs|between)\b",
        r"\bwhich\b.*\b(better|worse|higher|lower)\b",
        r"\bdifference\b.*\bbetween\b",
    ],
    "alert": [
        r"\b(alert|urgent|critical|warning|issue|problem)\b",
        r"\b(at\s+risk|failing|defaulter|overdue)\b",
        r"\bwho\b.*\b(absent|missing|late|unpaid)\b",
    ],
    "chart": [
        r"\b(chart|graph|visualize|plot|trend)\b",
        r"\b(month-wise|monthwise|class-wise|classwise)\b",
        r"\bover\s+(time|months|weeks|years)\b",
    ],
    "action": [
        r"\b(what\s+should|recommend|suggest|action|steps)\b",
        r"\bhow\s+to\b.*\b(improve|fix|resolve)\b",
        r"\bnext\s+steps\b",
    ],
    "ranking": [
        r"\b(top|bottom|best|worst|highest|lowest)\b",
        r"\b(ranking|rank|leaderboard)\b",
    ],
}


def detect_query_type(query: str) -> str:
    """
    Detect the type of query to determine appropriate template.

    Args:
        query: User query string

    Returns:
        str: Query type (list, analysis, metric, comparison, alert, chart, action, ranking)
    """
    query_lower = query.lower().strip()

    for query_type, patterns in QUERY_TYPE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, query_lower):
                return query_type

    # Default to list for general queries
    return "list"


def select_template(query_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Selects and applies appropriate template based on query type.

    Args:
        query_type: Type of query (list, analysis, metric, comparison, alert, chart, action, ranking)
        data: Raw agent output data containing response information

    Returns:
        Formatted response dictionary with 'text' and 'bullets'
    """
    if not USE_RESPONSE_TEMPLATES or not TEMPLATES_ENABLED:
        # Return raw response if templates disabled
        return {
            "text": data.get("text", data.get("message", "")),
            "bullets": data.get("bullets", []),
        }

    try:
        # Extract common fields from data
        text = data.get("text", data.get("message", data.get("headline", "")))
        items = data.get("items", data.get("bullets", data.get("points", [])))

        if query_type == "list":
            title = data.get("title", text)
            return ResponseTemplates.simple_list(title, items)

        elif query_type == "analysis":
            headline = data.get("headline", text)
            points = data.get("points", items)
            return ResponseTemplates.insight_summary(headline, points)

        elif query_type == "metric":
            name = data.get("name", data.get("metric_name", "Metric"))
            value = str(data.get("value", data.get("metric_value", "N/A")))
            change = data.get("change", data.get("trend", "0%"))
            status = data.get("status", "Good")
            return ResponseTemplates.metric_snapshot(name, value, change, status)

        elif query_type == "comparison":
            a_name = data.get("a_name", data.get("entity_a", "Option A"))
            a_value = str(data.get("a_value", ""))
            b_name = data.get("b_name", data.get("entity_b", "Option B"))
            b_value = str(data.get("b_value", ""))
            winner = data.get("winner", a_name)
            return ResponseTemplates.comparison(
                a_name, a_value, b_name, b_value, winner
            )

        elif query_type == "alert":
            issue = data.get("issue", text)
            who = data.get("who", data.get("affected", "Unknown"))
            what = data.get("what", data.get("description", ""))
            impact = data.get("impact", "Requires attention")
            return ResponseTemplates.alert(issue, who, what, impact)

        elif query_type == "chart":
            one_liner = data.get("one_liner", data.get("insight", text))
            return ResponseTemplates.chart_insight(one_liner)

        elif query_type == "action":
            steps = data.get("steps", data.get("actions", items))
            return ResponseTemplates.action_steps(steps)

        elif query_type == "ranking":
            title = data.get("title", "Ranking")
            ranking_items = []
            for item in items[:5]:
                if isinstance(item, dict):
                    ranking_items.append(item)
                else:
                    ranking_items.append({"name": str(item), "value": ""})
            return ResponseTemplates.ranking(title, ranking_items)

        else:
            # Default: simple list
            return ResponseTemplates.simple_list(text, items)

    except Exception as e:
        logger.error(f"Template selection error: {e}")
        # Fallback to empty template
        return ResponseTemplates.empty()


def format_agent_response(
    raw_response: str, query: str, chart_result: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Format raw agent response using appropriate template.

    Args:
        raw_response: Raw text response from agent
        query: Original user query
        chart_result: Optional chart data

    Returns:
        Formatted response dictionary
    """
    if not USE_RESPONSE_TEMPLATES or not TEMPLATES_ENABLED:
        return {"text": raw_response, "bullets": []}

    try:
        # Detect query type
        query_type = detect_query_type(query)

        # Parse response into structured data
        parsed_data = parse_response_to_data(raw_response, query_type)

        # Select and apply template
        formatted = select_template(query_type, parsed_data)

        # Apply word limits
        formatted = ResponseNormalizer.apply_word_limits(formatted)

        # Normalize final response
        formatted = ResponseNormalizer.normalize(formatted)

        # Add chart insight if chart is present
        if chart_result and query_type == "chart":
            chart_insight = extract_chart_insight(raw_response)
            if chart_insight:
                formatted = ResponseTemplates.chart_insight(chart_insight)

        return formatted

    except Exception as e:
        logger.error(f"Response formatting error: {e}")
        return ResponseTemplates.empty()


def parse_response_to_data(response: str, query_type: str) -> Dict[str, Any]:
    """
    Parse raw response text into structured data for templating.

    Args:
        response: Raw response text
        query_type: Detected query type

    Returns:
        Structured data dictionary
    """
    data = {}
    lines = response.strip().split("\n")

    # Extract text (first non-empty line that's not a bullet)
    text_lines = []
    bullet_items = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check if it's a bullet point
        if line.startswith(("•", "-", "*", "·", "→")) or re.match(r"^\d+\.", line):
            # Clean bullet marker
            bullet = re.sub(r"^[•\-*·→\d\.]+\s*", "", line)
            bullet_items.append(bullet)
        else:
            text_lines.append(line)

    # First line is typically the main text/headline
    if text_lines:
        data["text"] = text_lines[0]
        data["headline"] = text_lines[0]

    # Additional text lines can be points
    if len(text_lines) > 1:
        data["points"] = text_lines[1:3]  # Max 2 additional points

    # Bullet items
    data["items"] = bullet_items[:5]  # Max 5 bullets
    data["bullets"] = bullet_items[:5]

    # For specific query types, extract additional info
    if query_type == "metric":
        # Try to extract metric value from response
        metric_match = re.search(r"(\d+(?:\.\d+)?%?)", response)
        if metric_match:
            data["value"] = metric_match.group(1)

    if query_type == "alert":
        data["issue"] = data.get("text", "Alert")
        data["who"] = "Affected students/staff"
        data["what"] = bullet_items[0] if bullet_items else ""
        data["impact"] = bullet_items[1] if len(bullet_items) > 1 else "Needs attention"

    return data


def extract_chart_insight(response: str) -> str:
    """
    Extract a single insight line from response for chart annotation.

    Args:
        response: Full response text

    Returns:
        One-liner insight
    """
    if not TEMPLATES_ENABLED:
        return response[:100] if response else ""

    # Get first meaningful sentence
    sentences = re.split(r"[.!?]\s+", response)
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and len(sentence) > 10:
            return TextProcessor.limit_words(TextProcessor.strip_fillers(sentence), 12)

    return "Chart shows data analysis."


def validate_response(response: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate response meets template standards.

    Args:
        response: Response dictionary to validate

    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    if not TEMPLATES_ENABLED:
        return True, []

    issues = []

    # Check basic structure
    if not TemplateValidator.validate(response):
        issues.append("Invalid response structure")

    # Check for forbidden phrases
    text = response.get("text", "")
    forbidden = TemplateValidator.check_forbidden_phrases(text)
    if forbidden:
        issues.append(f"Forbidden phrases found: {', '.join(forbidden)}")

    # Check bullet content
    for bullet in response.get("bullets", []):
        forbidden_in_bullet = TemplateValidator.check_forbidden_phrases(bullet)
        if forbidden_in_bullet:
            issues.append(f"Forbidden phrase in bullet: {forbidden_in_bullet[0]}")

    return len(issues) == 0, issues


def apply_template_to_message(
    message: str, query: str, agent_id: str, chart: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Main entry point for applying templates to agent messages.

    Args:
        message: Raw agent message
        query: Original user query
        agent_id: ID of responding agent
        chart: Optional chart data

    Returns:
        Formatted response with 'message', 'formatted', and optional 'chart'
    """
    if not USE_RESPONSE_TEMPLATES or not TEMPLATES_ENABLED:
        return {"message": message, "formatted": None, "chart": chart}

    try:
        # Format the response
        formatted = format_agent_response(message, query, chart)

        # Validate
        is_valid, issues = validate_response(formatted)

        if not is_valid:
            logger.warning(f"Response validation issues for {agent_id}: {issues}")
            # Still return formatted but log the issues

        # Build final message from formatted response
        formatted_message = formatted.get("text", "")
        bullets = formatted.get("bullets", [])

        if bullets:
            bullet_text = "\n".join(f"• {b}" for b in bullets)
            formatted_message = f"{formatted_message}\n\n{bullet_text}"

        return {"message": formatted_message, "formatted": formatted, "chart": chart}

    except Exception as e:
        logger.error(f"Template application error: {e}")
        return {"message": message, "formatted": None, "chart": chart}


# Export template utilities for use in other modules
__all__ = [
    # Existing exports
    "should_generate_graph",
    "build_graph_payload",
    "generate_chart_safe",
    "detect_chart_type",
    "format_chart_response",
    "extract_monthly_data",
    "extract_category_data",
    "GRAPH_PROMPT_ADDITION",
    # Template exports
    "USE_RESPONSE_TEMPLATES",
    "TEMPLATES_ENABLED",
    "detect_query_type",
    "select_template",
    "format_agent_response",
    "validate_response",
    "apply_template_to_message",
    "parse_response_to_data",
    "extract_chart_insight",
]
