"""
Response Templates for School ERP Multi-Agent System
Enforces concise, scannable, operationally useful outputs
"""

from typing import Dict, List, Any
import re


class ResponseTemplates:
    """Central registry of response formatting templates"""

    @staticmethod
    def simple_list(title: str, items: List[str]) -> Dict[str, Any]:
        """
        Returns clean list format

        Args:
            title: Single line title
            items: List of items to display

        Returns:
            Formatted response dictionary
        """
        clean_title = TextProcessor.limit_words(TextProcessor.strip_fillers(title), 12)
        clean_items = [
            TextProcessor.limit_words(TextProcessor.strip_fillers(item), 8)
            for item in items[:5]
        ]

        return {"text": clean_title, "bullets": clean_items}

    @staticmethod
    def insight_summary(headline: str, points: List[str]) -> Dict[str, Any]:
        """
        Returns analytical insight format

        Args:
            headline: One sentence summary
            points: Key insights (max 5)

        Returns:
            Formatted response dictionary
        """
        clean_headline = TextProcessor.limit_words(
            TextProcessor.strip_fillers(headline), 12
        )
        clean_points = [
            TextProcessor.limit_words(TextProcessor.strip_fillers(point), 8)
            for point in points[:5]
        ]

        return {"text": clean_headline, "bullets": clean_points}

    @staticmethod
    def metric_snapshot(
        name: str, value: str, change: str, status: str
    ) -> Dict[str, Any]:
        """
        Returns single metric display

        Args:
            name: Metric name
            value: Current value
            change: Change indicator (+ / -)
            status: Good / Watch / Critical

        Returns:
            Formatted response dictionary
        """
        clean_name = TextProcessor.limit_words(name, 6)

        return {
            "text": f"{clean_name}: {value}",
            "bullets": [f"Change: {change}", f"Status: {status}"],
        }

    @staticmethod
    def comparison(
        a_name: str, a_value: str, b_name: str, b_value: str, winner: str
    ) -> Dict[str, Any]:
        """
        Returns comparison format

        Args:
            a_name: First entity name
            a_value: First entity value
            b_name: Second entity name
            b_value: Second entity value
            winner: Winning entity name

        Returns:
            Formatted response dictionary
        """
        clean_a = TextProcessor.limit_words(a_name, 6)
        clean_b = TextProcessor.limit_words(b_name, 6)
        clean_winner = TextProcessor.limit_words(winner, 6)

        return {
            "text": f"Winner: {clean_winner}",
            "bullets": [f"{clean_a}: {a_value}", f"{clean_b}: {b_value}"],
        }

    @staticmethod
    def alert(issue: str, who: str, what: str, impact: str) -> Dict[str, Any]:
        """
        Returns alert format

        Args:
            issue: Issue description
            who: Affected entity
            what: What happened
            impact: Impact description

        Returns:
            Formatted response dictionary
        """
        clean_issue = TextProcessor.limit_words(TextProcessor.strip_fillers(issue), 8)
        clean_who = TextProcessor.limit_words(who, 6)
        clean_what = TextProcessor.limit_words(TextProcessor.strip_fillers(what), 8)
        clean_impact = TextProcessor.limit_words(TextProcessor.strip_fillers(impact), 8)

        return {
            "text": f"🔴 {clean_issue}",
            "bullets": [clean_who, clean_what, clean_impact],
        }

    @staticmethod
    def chart_insight(one_liner: str) -> Dict[str, Any]:
        """
        Returns minimal chart description

        Args:
            one_liner: Single insight sentence

        Returns:
            Formatted response dictionary
        """
        clean_text = TextProcessor.limit_words(
            TextProcessor.strip_fillers(one_liner), 12
        )

        return {"text": clean_text, "bullets": []}

    @staticmethod
    def action_steps(steps: List[str]) -> Dict[str, Any]:
        """
        Returns actionable steps format

        Args:
            steps: List of action steps

        Returns:
            Formatted response dictionary
        """
        clean_steps = [
            TextProcessor.limit_words(TextProcessor.strip_fillers(step), 8)
            for step in steps[:5]
        ]

        return {"text": "Recommended Action:", "bullets": clean_steps}

    @staticmethod
    def empty() -> Dict[str, Any]:
        """
        Returns empty state format

        Returns:
            Formatted response dictionary
        """
        return {"text": "No data available.", "bullets": []}

    @staticmethod
    def trend_alert(
        metric: str, direction: str, magnitude: str, timeframe: str
    ) -> Dict[str, Any]:
        """
        Returns trend alert format

        Args:
            metric: Metric name
            direction: Up / Down
            magnitude: Change amount
            timeframe: Time period

        Returns:
            Formatted response dictionary
        """
        clean_metric = TextProcessor.limit_words(metric, 6)

        icon = "📈" if direction.lower() in ["up", "increase"] else "📉"

        return {
            "text": f"{icon} {clean_metric} {direction}",
            "bullets": [f"Change: {magnitude}", f"Period: {timeframe}"],
        }

    @staticmethod
    def ranking(title: str, items: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Returns ranked list format

        Args:
            title: Ranking title
            items: List of dicts with 'name' and 'value'

        Returns:
            Formatted response dictionary
        """
        clean_title = TextProcessor.limit_words(TextProcessor.strip_fillers(title), 12)

        bullets = []
        for idx, item in enumerate(items[:5], 1):
            name = TextProcessor.limit_words(item.get("name", ""), 6)
            value = item.get("value", "")
            bullets.append(f"{idx}. {name}: {value}")

        return {"text": clean_title, "bullets": bullets}

    @staticmethod
    def status_grid(statuses: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Returns status overview format

        Args:
            statuses: List of dicts with 'name' and 'status'

        Returns:
            Formatted response dictionary
        """
        bullets = []
        for item in statuses[:5]:
            name = TextProcessor.limit_words(item.get("name", ""), 6)
            status = item.get("status", "")

            icon = StatusIcon.get(status)
            bullets.append(f"{icon} {name}: {status}")

        return {"text": "System Status", "bullets": bullets}

    @staticmethod
    def multi_metric(metrics: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Returns multiple metrics format

        Args:
            metrics: List of dicts with 'name' and 'value'

        Returns:
            Formatted response dictionary
        """
        bullets = []
        for item in metrics[:5]:
            name = TextProcessor.limit_words(item.get("name", ""), 6)
            value = item.get("value", "")
            bullets.append(f"{name}: {value}")

        return {"text": "Key Metrics", "bullets": bullets}


class TextProcessor:
    """Text processing utilities for response formatting"""

    FILLER_PATTERNS = [
        r"\bthere is\b",
        r"\bthere are\b",
        r"\bit is observed\b",
        r"\bwe can see\b",
        r"\bbased on\b",
        r"\bin order to\b",
        r"\bhere is\b",
        r"\bhere are\b",
        r"\bit appears that\b",
        r"\byou can see\b",
        r"\bthis shows that\b",
        r"\boverall\b",
        r"\bin conclusion\b",
        r"\bas we can see\b",
        r"\bit can be seen\b",
        r"\bwhat we see is\b",
        r"\bthe data shows\b",
        r"\baccording to\b",
        r"\bplease note\b",
        r"\bit should be noted\b",
    ]

    @staticmethod
    def limit_words(text: str, max_words: int) -> str:
        """
        Limits text to maximum word count

        Args:
            text: Input text
            max_words: Maximum number of words

        Returns:
            Truncated text
        """
        if not text:
            return ""

        words = text.split()
        if len(words) <= max_words:
            return text

        truncated = " ".join(words[:max_words])
        return truncated.rstrip(".,;:") + "..."

    @staticmethod
    def strip_fillers(text: str) -> str:
        """
        Removes filler phrases from text

        Args:
            text: Input text

        Returns:
            Text with fillers removed
        """
        if not text:
            return ""

        result = text
        for pattern in TextProcessor.FILLER_PATTERNS:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)

        result = re.sub(r"\s+", " ", result)
        result = result.strip()

        if result and result[0].islower():
            result = result[0].upper() + result[1:]

        return result

    @staticmethod
    def trim_bullets(bullets: List[str], max_count: int = 5) -> List[str]:
        """
        Trims bullet list to maximum count

        Args:
            bullets: List of bullet points
            max_count: Maximum bullets to keep

        Returns:
            Trimmed bullet list
        """
        return bullets[:max_count]

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Applies all cleaning operations

        Args:
            text: Input text

        Returns:
            Cleaned text
        """
        cleaned = TextProcessor.strip_fillers(text)
        cleaned = re.sub(r"\s+", " ", cleaned)
        cleaned = cleaned.strip()
        return cleaned


class StatusIcon:
    """Status icon mapping"""

    ICONS = {
        "good": "✅",
        "success": "✅",
        "ok": "✅",
        "active": "✅",
        "watch": "⚠️",
        "warning": "⚠️",
        "pending": "⚠️",
        "critical": "🔴",
        "error": "🔴",
        "failed": "🔴",
        "inactive": "⚪",
        "unknown": "⚪",
    }

    @staticmethod
    def get(status: str) -> str:
        """
        Gets icon for status

        Args:
            status: Status string

        Returns:
            Icon character
        """
        return StatusIcon.ICONS.get(status.lower(), "⚪")


class ResponseNormalizer:
    """Normalizes agent outputs to template format"""

    @staticmethod
    def normalize(response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes response to standard format

        Args:
            response: Raw response dictionary

        Returns:
            Normalized response
        """
        if "text" not in response:
            response["text"] = ""

        if "bullets" not in response:
            response["bullets"] = []

        response["text"] = TextProcessor.clean_text(response["text"])

        response["bullets"] = [
            TextProcessor.clean_text(bullet) for bullet in response["bullets"]
        ]

        response["bullets"] = TextProcessor.trim_bullets(response["bullets"], 5)

        return response

    @staticmethod
    def apply_word_limits(response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Applies word limits to response

        Args:
            response: Response dictionary

        Returns:
            Response with word limits applied
        """
        if "text" in response:
            response["text"] = TextProcessor.limit_words(response["text"], 12)

        if "bullets" in response:
            response["bullets"] = [
                TextProcessor.limit_words(bullet, 8) for bullet in response["bullets"]
            ]

        if "notes" in response:
            response["notes"] = [
                TextProcessor.limit_words(note, 10) for note in response["notes"]
            ]

        return response


class TemplateValidator:
    """Validates response adherence to templates"""

    @staticmethod
    def validate(response: Dict[str, Any]) -> bool:
        """
        Validates response format

        Args:
            response: Response to validate

        Returns:
            True if valid
        """
        if not isinstance(response, dict):
            return False

        if "text" not in response:
            return False

        if "bullets" not in response:
            return False

        if not isinstance(response["bullets"], list):
            return False

        if len(response["bullets"]) > 5:
            return False

        return True

    @staticmethod
    def check_forbidden_phrases(text: str) -> List[str]:
        """
        Checks for forbidden filler phrases

        Args:
            text: Text to check

        Returns:
            List of found forbidden phrases
        """
        found = []
        forbidden = [
            "here is the",
            "based on the",
            "it appears that",
            "you can see that",
            "this shows that",
            "overall",
            "in conclusion",
        ]

        text_lower = text.lower()
        for phrase in forbidden:
            if phrase in text_lower:
                found.append(phrase)

        return found
