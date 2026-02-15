"""
Response Governor - Strict output control layer for School ERP Multi-Agent System
==================================================================================
Enforces concise, software-like outputs with mandatory graph generation.
No chatbot behavior. System console only.
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

MAX_LINES = 15  # Increased: Allow more content for comprehensive responses
MAX_WORDS_PER_LINE = 30  # Increased: Allow fuller sentences per bullet point
MAX_BULLETS = 8  # Increased: Allow more bullet points for detailed responses

# ============================================================================
# PROHIBITED CONTENT
# ============================================================================

PROHIBITED_PHRASES = [
    r"\bhello\b",
    r"\bhi\b",
    r"\bhey\b",
    r"\bhere is\b",
    r"\bhere are\b",
    r"\bi can\b",
    r"\bi cannot\b",
    r"\bi can\'t\b",
    r"\byou can\b",
    r"\bthis shows\b",
    r"\bbased on\b",
    r"\boverall\b",
    r"\bin conclusion\b",
    r"\blet me\b",
    r"\bi\'ve analyzed\b",
    r"\bi have analyzed\b",
    r"\bi found\b",
    r"\baccording to\b",
    r"\bplease note\b",
    r"\bit appears\b",
    r"\bwe can see\b",
    r"\bas we can see\b",
    r"\bthe data shows\b",
    r"\binterestingly\b",
    r"\bnotably\b",
    r"\bbasically\b",
    r"\bessentially\b",
    r"\bactually\b",
    r"\bhowever\b",
    r"\btherefore\b",
    r"\bmoreover\b",
    r"\bfurthermore\b",
    r"\badditionally\b",
    r"\bin summary\b",
    r"\bto summarize\b",
    r"\bin other words\b",
    r"\bthat being said\b",
    r"\bhaving said that\b",
    r"\bwith that in mind\b",
    r"\bit\'s worth noting\b",
    r"\bit should be noted\b",
    r"\bas mentioned\b",
    r"\bas you can see\b",
    r"\bif you look at\b",
    r"\bwhen we look at\b",
    r"\btaking a look at\b",
    r"\bupon analysis\b",
    r"\bafter analyzing\b",
    r"\bhappy to help\b",
    r"\bglad to assist\b",
    r"\bfeel free\b",
    r"\bdon\'t hesitate\b",
    r"\blet me know\b",
]

PROHIBITED_EMOJIS = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001f926-\U0001f937"
    "\U00010000-\U0010ffff"
    "\u2640-\u2642"
    "\u2600-\u2B55"
    "\u200d"
    "\u23cf"
    "\u23e9"
    "\u231a"
    "\ufe0f"
    "\u3030"
    "]+",
    flags=re.UNICODE,
)

# ============================================================================
# GRAPH TRIGGER PATTERNS
# ============================================================================

GRAPH_TRIGGERS = [
    r"\bgraph\b",
    r"\bchart\b",
    r"\bvisualize\b",
    r"\bvisualization\b",
    r"\bcompare\b",
    r"\bcomparison\b",
    r"\btrend\b",
    r"\btrends\b",
    r"\bdistribution\b",
    r"\bperformance\s+analysis\b",
    r"\banalysis\b",
    r"\banalyze\b",
    r"\banalyse\b",
    r"\bstudents?\s+vs\b",
    r"\bvs\s+students?\b",
    r"\bmarks?\s+vs\b",
    r"\bvs\s+marks?\b",
    r"\battendance\s+analysis\b",
    r"\bfee\s+analysis\b",
    r"\bfees?\s+analysis\b",
    r"\bmonth-wise\b",
    r"\bmonthwise\b",
    r"\bclass-wise\b",
    r"\bclasswise\b",
    r"\bschool-wise\b",
    r"\bschoolwise\b",
    r"\bsubject-wise\b",
    r"\bsubjectwise\b",
    r"\bover\s+time\b",
    r"\bhistorical\b",
    r"\bgrowth\b",
    r"\bdecline\b",
    r"\bprogression\b",
    r"\branking\b",
    r"\brank\b",
    r"\btop\s+\d+\b",
    r"\bbottom\s+\d+\b",
    r"\bbest\b",
    r"\bworst\b",
    r"\bhighest\b",
    r"\blowest\b",
    r"\bplot\b",
    r"\bbar\b",
    r"\bpie\b",
    r"\bline\b",
]

# ============================================================================
# RESPONSE GOVERNOR CLASS
# ============================================================================


class ResponseGovernor:
    """
    Strict response control layer.
    Enforces length, structure, tool usage, and formatting.
    """

    @staticmethod
    def requires_graph(query: str) -> bool:
        """
        Determine if query mandates graph generation.

        Args:
            query: User query string

        Returns:
            True if graph is required
        """
        query_lower = query.lower().strip()

        for pattern in GRAPH_TRIGGERS:
            if re.search(pattern, query_lower):
                return True

        return False

    @staticmethod
    def strip_prohibited(text: str) -> str:
        """
        Remove all prohibited phrases and emojis.

        Args:
            text: Input text

        Returns:
            Cleaned text
        """
        result = text

        # Remove emojis
        result = PROHIBITED_EMOJIS.sub("", result)

        # Remove prohibited phrases
        for pattern in PROHIBITED_PHRASES:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)

        # Clean up whitespace
        result = re.sub(r"\s+", " ", result)
        result = re.sub(r"\n\s*\n", "\n", result)

        return result.strip()

    @staticmethod
    def strip_code_blocks(text: str) -> str:
        """
        Remove ALL code blocks, Mermaid diagrams, and text-based charts from response.
        This is CRITICAL - LLMs often output diagrams as text which looks terrible.

        Args:
            text: Input text

        Returns:
            Text with all code/diagram blocks removed
        """
        result = text

        # Remove Mermaid diagrams (```mermaid ... ```)
        result = re.sub(r"```mermaid[\s\S]*?```", "", result, flags=re.IGNORECASE)

        # Remove graph/flowchart definitions
        result = re.sub(r"```graph[\s\S]*?```", "", result, flags=re.IGNORECASE)
        result = re.sub(
            r"graph\s+(LR|TD|TB|RL|BT)\s+[\s\S]*?(?=\n\n|\Z)",
            "",
            result,
            flags=re.IGNORECASE,
        )

        # Remove subgraph blocks
        result = re.sub(r"subgraph[\s\S]*?end", "", result, flags=re.IGNORECASE)

        # Remove ASCII art charts (lines with arrows, boxes)
        result = re.sub(r".*--+>.*\n?", "", result)
        result = re.sub(r".*\|.*\|.*\n?", "", result)
        result = re.sub(r"\+[-+]+\+", "", result)
        result = re.sub(r"\[[^\]]*\][\s]*--+[>\-]", "", result)

        # Remove any remaining code blocks
        result = re.sub(r"```[\s\S]*?```", "", result)

        # Remove inline code that looks like diagram syntax
        result = re.sub(r"`[^`]*-->[^`]*`", "", result)
        result = re.sub(r"`[^`]*\|[^`]*`", "", result)

        # Remove flowchart-style content
        result = re.sub(r"\w+\[[^\]]+\]\s*--+>\s*\w+", "", result)
        result = re.sub(r"[A-Za-z]+\([^)]*\)\s*--+>\s*[A-Za-z_]+", "", result)

        # Clean up multiple newlines
        result = re.sub(r"\n\s*\n\s*\n+", "\n\n", result)

        return result.strip()

    @staticmethod
    def limit_words(line: str, max_words: int = MAX_WORDS_PER_LINE) -> str:
        """
        Limit line to max words.

        Args:
            line: Input line
            max_words: Maximum words allowed

        Returns:
            Truncated line
        """
        words = line.split()
        if len(words) <= max_words:
            return line
        return " ".join(words[:max_words])

    @staticmethod
    def extract_bullets(text: str) -> List[str]:
        """
        Extract bullet points from text.

        Args:
            text: Input text

        Returns:
            List of bullet contents
        """
        bullets = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Match bullet patterns
            if re.match(r"^[•\-\*→·]\s*", line):
                content = re.sub(r"^[•\-\*→·]\s*", "", line)
                bullets.append(content)
            elif re.match(r"^\d+\.\s*", line):
                content = re.sub(r"^\d+\.\s*", "", line)
                bullets.append(content)

        return bullets[:MAX_BULLETS]

    @staticmethod
    def format_bullets(items: List[str]) -> str:
        """
        Format items as bullet list.

        Args:
            items: List of items

        Returns:
            Formatted bullet string
        """
        formatted = []
        for item in items[:MAX_BULLETS]:
            clean = ResponseGovernor.strip_prohibited(item)
            clean = ResponseGovernor.limit_words(clean)
            if clean:
                formatted.append(f"• {clean}")
        return "\n".join(formatted)

    @staticmethod
    def format_graph_response(
        chart_data: Optional[Dict[str, Any]], insights: List[str]
    ) -> Dict[str, Any]:
        """
        Format response with graph and insights.

        Args:
            chart_data: Chart generation result
            insights: List of insight strings

        Returns:
            Formatted response dict
        """
        # Format insights as bullets
        clean_insights = []
        for insight in insights[:3]:
            clean = ResponseGovernor.strip_prohibited(insight)
            clean = ResponseGovernor.limit_words(clean)
            if clean:
                clean_insights.append(f"• {clean}")

        insight_text = "\n".join(clean_insights) if clean_insights else ""

        if chart_data and chart_data.get("base64_image"):
            message = "[GRAPH]\n\nKey Insight:"
            if insight_text:
                message += f"\n{insight_text}"

            return {
                "message": message,
                "chart": chart_data,
                "formatted": {
                    "text": "Key Insight:",
                    "bullets": [i.lstrip("• ") for i in clean_insights],
                },
            }
        else:
            # Graph failed
            return {
                "message": "GRAPH ERROR\n\n• Retry request",
                "chart": None,
                "formatted": {"text": "GRAPH ERROR", "bullets": ["Retry request"]},
            }

    @staticmethod
    def format_comparison_response(
        chart_data: Optional[Dict[str, Any]], winner: str, gap: str
    ) -> Dict[str, Any]:
        """
        Format comparison response with graph.

        Args:
            chart_data: Chart generation result
            winner: Winner entity
            gap: Gap value

        Returns:
            Formatted response dict
        """
        winner_clean = ResponseGovernor.strip_prohibited(winner)
        winner_clean = ResponseGovernor.limit_words(winner_clean, 8)

        gap_clean = ResponseGovernor.strip_prohibited(gap)
        gap_clean = ResponseGovernor.limit_words(gap_clean, 8)

        if chart_data and chart_data.get("base64_image"):
            message = f"[GRAPH]\n\nWinner:\n• {winner_clean}\n\nGap:\n• {gap_clean}"

            return {
                "message": message,
                "chart": chart_data,
                "formatted": {
                    "text": f"Winner: {winner_clean}",
                    "bullets": [winner_clean, f"Gap: {gap_clean}"],
                },
            }
        else:
            return {
                "message": "GRAPH ERROR\n\n• Retry request",
                "chart": None,
                "formatted": {"text": "GRAPH ERROR", "bullets": ["Retry request"]},
            }

    @staticmethod
    def format_alert_response(who: str, issue: str, action: str) -> Dict[str, Any]:
        """
        Format alert response.

        Args:
            who: Affected entity
            issue: Issue description
            action: Required action

        Returns:
            Formatted response dict
        """
        who_clean = ResponseGovernor.limit_words(
            ResponseGovernor.strip_prohibited(who), 8
        )
        issue_clean = ResponseGovernor.limit_words(
            ResponseGovernor.strip_prohibited(issue), 8
        )
        action_clean = ResponseGovernor.limit_words(
            ResponseGovernor.strip_prohibited(action), 8
        )

        message = f"ALERT:\n\n• {who_clean}\n• {issue_clean}\n• {action_clean}"

        return {
            "message": message,
            "chart": None,
            "formatted": {
                "text": "ALERT:",
                "bullets": [who_clean, issue_clean, action_clean],
            },
        }

    @staticmethod
    def format_list_response(title: str, items: List[str]) -> Dict[str, Any]:
        """
        Format list response.

        Args:
            title: List title
            items: List items

        Returns:
            Formatted response dict
        """
        title_clean = ResponseGovernor.limit_words(
            ResponseGovernor.strip_prohibited(title), 8
        )

        bullets = []
        for item in items[:MAX_BULLETS]:
            clean = ResponseGovernor.limit_words(
                ResponseGovernor.strip_prohibited(item), 10
            )
            if clean:
                bullets.append(clean)

        bullet_text = "\n".join(f"• {b}" for b in bullets)
        message = f"{title_clean}:\n\n{bullet_text}"

        return {
            "message": message,
            "chart": None,
            "formatted": {"text": f"{title_clean}:", "bullets": bullets},
        }

    @staticmethod
    def format_metric_response(
        name: str, value: str, status: str = None
    ) -> Dict[str, Any]:
        """
        Format single metric response.

        Args:
            name: Metric name
            value: Metric value
            status: Optional status

        Returns:
            Formatted response dict
        """
        name_clean = ResponseGovernor.limit_words(
            ResponseGovernor.strip_prohibited(name), 6
        )

        bullets = [f"{name_clean}: {value}"]
        if status:
            bullets.append(f"Status: {status}")

        message = "\n".join(f"• {b}" for b in bullets)

        return {
            "message": message,
            "chart": None,
            "formatted": {"text": f"{name_clean}: {value}", "bullets": bullets},
        }

    @staticmethod
    def format_as_pretty_bullets(lines: List[str]) -> str:
        """
        Format lines as pretty bullet points with proper spacing and newlines.
        Each bullet point gets its own paragraph-like spacing.

        Args:
            lines: List of content lines

        Returns:
            Formatted bullet string with newlines
        """
        formatted_bullets = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Remove existing bullet markers
            line = re.sub(r"^[•\-\*→·]\s*", "", line)
            line = re.sub(r"^\d+\.\s*", "", line)

            # Limit words per line
            line = ResponseGovernor.limit_words(line)

            # Add bullet marker and newline for readability
            if line:
                formatted_bullets.append(f"• {line}")

        # Join with double newlines for better spacing (paragraph-like)
        return "\n\n".join(formatted_bullets[:MAX_BULLETS])

    @staticmethod
    def enforce(response: Dict[str, Any], query: str = "") -> Dict[str, Any]:
        """
        Enforce all governance rules on response.

        Args:
            response: Raw response dict
            query: Original user query

        Returns:
            Governed response dict with pretty formatting
        """
        message = response.get("message", "")
        chart = response.get("chart")

        # CRITICAL: First strip any code blocks, Mermaid, diagrams
        message = ResponseGovernor.strip_code_blocks(message)

        # Strip prohibited content (emojis, filler phrases)
        message = ResponseGovernor.strip_prohibited(message)

        # Check if graph was required but not provided
        if ResponseGovernor.requires_graph(query) and not chart:
            logger.warning(f"Graph required but not generated for query: {query}")

        # CRITICAL: Split inline bullets (• Item1 • Item2 → separate lines)
        # This handles LLM responses that put all bullets on one line
        message = re.sub(r"\s*•\s*", "\n• ", message)  # Split on bullet markers
        message = re.sub(r"^\n• ", "• ", message)  # Remove leading newline

        # Also handle numbered lists that might be inline
        message = re.sub(r"\s+(\d+)\.\s+", r"\n\1. ", message)
        message = re.sub(r"^\n(\d+)\. ", r"\1. ", message)

        # Split into lines and clean
        lines = message.split("\n")
        clean_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            clean_lines.append(line)

            # Enforce max lines
            if len(clean_lines) >= MAX_LINES:
                break

        # Format as pretty bullet points with newlines
        governed_message = ResponseGovernor.format_as_pretty_bullets(clean_lines)

        # Build formatted structure
        bullets = ResponseGovernor.extract_bullets(governed_message)

        # Get title from first non-bullet line (if any)
        title_line = ""
        for line in clean_lines[:3]:  # Check first 3 lines for title
            if not re.match(r"^[•\-\*→·]\s*", line) and not re.match(
                r"^\d+\.\s*", line
            ):
                title_line = line
                break

        return {
            "message": governed_message,
            "chart": chart,
            "formatted": {"text": title_line, "bullets": bullets},
            "agent_id": response.get("agent_id", "unknown"),
        }

    @staticmethod
    def validate(response: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate response meets governance rules.

        Args:
            response: Response to validate

        Returns:
            Tuple of (is_valid, list_of_violations)
        """
        violations = []
        message = response.get("message", "")

        # Check line count
        lines = [line for line in message.split("\n") if line.strip()]
        if len(lines) > MAX_LINES:
            violations.append(f"Line count {len(lines)} exceeds max {MAX_LINES}")

        # Check words per line
        for i, line in enumerate(lines):
            words = len(line.split())
            if words > MAX_WORDS_PER_LINE:
                violations.append(
                    f"Line {i+1} has {words} words, max is {MAX_WORDS_PER_LINE}"
                )

        # Check prohibited phrases
        message_lower = message.lower()
        for pattern in PROHIBITED_PHRASES:
            if re.search(pattern, message_lower):
                violations.append(f"Contains prohibited phrase: {pattern}")

        # Check emojis
        if PROHIBITED_EMOJIS.search(message):
            violations.append("Contains prohibited emojis")

        return len(violations) == 0, violations


# ============================================================================
# QUERY ANALYZER
# ============================================================================


class QueryAnalyzer:
    """
    Analyzes queries to determine response type and requirements.
    """

    @staticmethod
    def analyze(query: str) -> Dict[str, Any]:
        """
        Full query analysis - determines response type, entities, and whether graph is required.

        Args:
            query: User query

        Returns:
            Dict with analysis results including requires_graph, response_type, entities
        """
        return {
            "requires_graph": ResponseGovernor.requires_graph(query),
            "response_type": QueryAnalyzer.get_response_type(query),
            "entities": QueryAnalyzer.extract_entities(query),
        }

    @staticmethod
    def get_response_type(query: str) -> str:
        """
        Determine required response type.

        Args:
            query: User query

        Returns:
            Response type: 'graph', 'comparison', 'alert', 'list', 'metric'
        """
        query_lower = query.lower()

        # Check for graph triggers first
        if ResponseGovernor.requires_graph(query):
            # Check if it's a comparison
            if any(
                word in query_lower for word in ["compare", "vs", "versus", "between"]
            ):
                return "comparison"
            return "graph"

        # Check for alerts
        alert_words = [
            "alert",
            "warning",
            "critical",
            "urgent",
            "issue",
            "problem",
            "at risk",
            "failing",
            "defaulter",
            "overdue",
            "absent",
            "missing",
        ]
        if any(word in query_lower for word in alert_words):
            return "alert"

        # Check for single metrics
        metric_words = [
            "average",
            "total",
            "count",
            "percentage",
            "rate",
            "how many",
            "how much",
        ]
        if any(word in query_lower for word in metric_words):
            return "metric"

        # Default to list
        return "list"

    @staticmethod
    def extract_entities(query: str) -> Dict[str, Any]:
        """
        Extract key entities from query.

        Args:
            query: User query

        Returns:
            Dict with extracted entities
        """
        entities = {
            "classes": [],
            "subjects": [],
            "students": [],
            "metrics": [],
        }

        query_lower = query.lower()

        # Extract class references
        class_pattern = r"(?:grade|class)\s*(\d+)(?:\s*-?\s*([a-z]))?"
        matches = re.findall(class_pattern, query_lower)
        for match in matches:
            if match[1]:
                entities["classes"].append(f"Grade {match[0]}-{match[1].upper()}")
            else:
                entities["classes"].append(f"Grade {match[0]}")

        # Extract subject references
        subjects = [
            "math",
            "mathematics",
            "science",
            "english",
            "hindi",
            "physics",
            "chemistry",
            "biology",
            "history",
            "geography",
        ]
        for subject in subjects:
            if subject in query_lower:
                entities["subjects"].append(subject.title())

        # Extract metric references
        metrics = ["attendance", "marks", "fees", "score", "grade", "percentage"]
        for metric in metrics:
            if metric in query_lower:
                entities["metrics"].append(metric)

        return entities


# ============================================================================
# INTEGRATION HELPER
# ============================================================================


def govern_response(
    raw_response: str | Dict[str, Any],
    query: str,
    agent_id: str = "unknown",
    chart: Optional[Dict[str, Any]] = None,
    chart_generator=None,
) -> Dict[str, Any]:
    """
    Main integration function for response governance.

    Args:
        raw_response: Raw agent response text or dict with 'message' key
        query: Original user query
        agent_id: ID of the agent generating the response
        chart: Optional chart data dict
        chart_generator: Optional function to generate charts

    Returns:
        Governed response dict with message, chart, formatted, agent_id
    """
    # Normalize raw_response to dict format
    if isinstance(raw_response, str):
        response_dict = {"message": raw_response, "agent_id": agent_id, "chart": chart}
    else:
        response_dict = raw_response
        if chart and not response_dict.get("chart"):
            response_dict["chart"] = chart
        if agent_id and not response_dict.get("agent_id"):
            response_dict["agent_id"] = agent_id

    response_type = QueryAnalyzer.get_response_type(query)

    # If graph is required but not present, try to generate
    if response_type in ["graph", "comparison"] and not response_dict.get("chart"):
        if chart_generator:
            try:
                chart_data = chart_generator(query, response_dict)
                if chart_data:
                    response_dict["chart"] = chart_data
            except Exception as e:
                logger.error(f"Chart generation failed: {e}")

    # Apply governance
    governed = ResponseGovernor.enforce(response_dict, query)

    # Validate
    is_valid, violations = ResponseGovernor.validate(governed)
    if not is_valid:
        logger.warning(f"Response validation failures: {violations}")

    return governed


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "ResponseGovernor",
    "QueryAnalyzer",
    "govern_response",
    "MAX_LINES",
    "MAX_WORDS_PER_LINE",
    "MAX_BULLETS",
]
