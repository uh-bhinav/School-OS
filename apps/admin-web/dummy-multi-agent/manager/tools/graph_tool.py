"""
Chart Generator Tool for AI Agents
Generates various chart types dynamically from structured data.
"""

import base64
import io
import uuid
from typing import Dict, Optional, Any
from abc import ABC, abstractmethod
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # Headless backend
import matplotlib.pyplot as plt  # noqa: E402


# ===========================
# VALIDATION LAYER
# ===========================


class ChartValidator:
    """Validates chart generation payloads"""

    VALID_CHART_TYPES = {
        "line",
        "bar",
        "pie",
        "scatter",
        "multi_line",
        "stacked_bar",
        "horizontal_bar",
    }

    VALID_OUTPUT_FORMATS = {"png", "base64"}

    @staticmethod
    def validate_payload(payload: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validates the input payload.
        Returns (is_valid, error_message)
        """
        if not isinstance(payload, dict):
            return False, "Payload must be a dictionary"

        # Chart type validation
        chart_type = payload.get("chart_type", "").lower()
        if chart_type not in ChartValidator.VALID_CHART_TYPES:
            return (
                False,
                f"Invalid chart_type. Must be one of: {ChartValidator.VALID_CHART_TYPES}",
            )

        # Output format validation
        output_format = payload.get("output_format", "png").lower()
        if output_format not in ChartValidator.VALID_OUTPUT_FORMATS:
            return (
                False,
                f"Invalid output_format. Must be one of: {ChartValidator.VALID_OUTPUT_FORMATS}",
            )

        # Datasets validation
        datasets = payload.get("datasets", [])
        if not datasets:
            return False, "At least one dataset is required"

        if not isinstance(datasets, list):
            return False, "Datasets must be a list"

        # Validate each dataset
        for idx, dataset in enumerate(datasets):
            if not isinstance(dataset, dict):
                return False, f"Dataset {idx} must be a dictionary"

            if "values" not in dataset:
                return False, f"Dataset {idx} missing 'values' field"

            values = dataset["values"]
            if not isinstance(values, list):
                return False, f"Dataset {idx} values must be a list"

            if not values:
                return False, f"Dataset {idx} values cannot be empty"

            # Validate numeric values
            for val_idx, val in enumerate(values):
                if not isinstance(val, (int, float)):
                    return False, f"Dataset {idx}, value {val_idx} must be numeric"

        # Labels validation for non-pie charts
        if chart_type != "scatter":
            labels = payload.get("labels", [])
            if labels and not isinstance(labels, list):
                return False, "Labels must be a list"

            # Check labels count matches values count
            if labels and datasets:
                expected_count = len(datasets[0]["values"])
                if len(labels) != expected_count:
                    return (
                        False,
                        f"Labels count ({len(labels)}) must match values count ({expected_count})",
                    )

        # Dimension validation
        width = payload.get("width", 800)
        height = payload.get("height", 500)

        if not isinstance(width, int) or width <= 0:
            return False, "Width must be a positive integer"

        if not isinstance(height, int) or height <= 0:
            return False, "Height must be a positive integer"

        return True, None


# ===========================
# BASE RENDERER
# ===========================


class ChartRenderer(ABC):
    """Abstract base class for chart renderers"""

    DEFAULT_COLORS = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
    ]

    def __init__(self, payload: Dict[str, Any]):
        self.payload = payload
        self.title = payload.get("title", "Chart")
        self.x_label = payload.get("x_label", "")
        self.y_label = payload.get("y_label", "")
        self.labels = payload.get("labels", [])
        self.datasets = payload.get("datasets", [])
        self.width = payload.get("width", 800)
        self.height = payload.get("height", 500)

    def _get_color(self, dataset: Dict[str, Any], index: int) -> str:
        """Get color for dataset with fallback to default palette"""
        if "color" in dataset and dataset["color"]:
            return dataset["color"]
        return self.DEFAULT_COLORS[index % len(self.DEFAULT_COLORS)]

    def _setup_figure(self) -> tuple:
        """Create and configure figure"""
        fig, ax = plt.subplots(figsize=(self.width / 100, self.height / 100), dpi=100)
        return fig, ax

    def _apply_common_styling(self, ax) -> None:
        """Apply common styling to chart"""
        if self.title:
            ax.set_title(self.title, fontsize=14, fontweight="bold", pad=20)

        if self.x_label:
            ax.set_xlabel(self.x_label, fontsize=11)

        if self.y_label:
            ax.set_ylabel(self.y_label, fontsize=11)

        ax.grid(True, alpha=0.3, linestyle="--", linewidth=0.5)

        # Auto-rotate x labels if many
        if self.labels and len(self.labels) > 10:
            plt.xticks(rotation=45, ha="right")

    @abstractmethod
    def render(self, ax) -> None:
        """Render the specific chart type"""
        pass

    def generate(self) -> plt.Figure:
        """Generate the complete chart"""
        fig, ax = self._setup_figure()
        self.render(ax)
        self._apply_common_styling(ax)
        plt.tight_layout()
        return fig


# ===========================
# CHART TYPE RENDERERS
# ===========================


class LineChartRenderer(ChartRenderer):
    """Renders line charts"""

    def render(self, ax) -> None:
        for idx, dataset in enumerate(self.datasets):
            values = dataset["values"]
            label = dataset.get("name", f"Series {idx + 1}")
            color = self._get_color(dataset, idx)

            x_values = self.labels if self.labels else range(len(values))
            ax.plot(x_values, values, marker="o", label=label, color=color, linewidth=2)

        if len(self.datasets) > 1:
            ax.legend()


class BarChartRenderer(ChartRenderer):
    """Renders vertical bar charts"""

    def render(self, ax) -> None:
        if len(self.datasets) == 1:
            # Single dataset
            dataset = self.datasets[0]
            values = dataset["values"]
            color = self._get_color(dataset, 0)

            x_positions = range(len(values))
            ax.bar(x_positions, values, color=color, alpha=0.8)

            if self.labels:
                ax.set_xticks(x_positions)
                ax.set_xticklabels(self.labels)
        else:
            # Multiple datasets (grouped bars)
            num_datasets = len(self.datasets)
            num_points = len(self.datasets[0]["values"])
            bar_width = 0.8 / num_datasets

            for idx, dataset in enumerate(self.datasets):
                values = dataset["values"]
                label = dataset.get("name", f"Series {idx + 1}")
                color = self._get_color(dataset, idx)

                x_positions = [i + idx * bar_width for i in range(num_points)]
                ax.bar(
                    x_positions, values, bar_width, label=label, color=color, alpha=0.8
                )

            if self.labels:
                ax.set_xticks(
                    [i + bar_width * (num_datasets - 1) / 2 for i in range(num_points)]
                )
                ax.set_xticklabels(self.labels)

            ax.legend()


class PieChartRenderer(ChartRenderer):
    """Renders pie charts"""

    def render(self, ax) -> None:
        dataset = self.datasets[0]
        values = dataset["values"]

        labels = (
            self.labels if self.labels else [f"Slice {i+1}" for i in range(len(values))]
        )
        colors = [self._get_color({"color": None}, i) for i in range(len(values))]

        ax.pie(values, labels=labels, autopct="%1.1f%%", startangle=90, colors=colors)
        ax.axis("equal")


class ScatterPlotRenderer(ChartRenderer):
    """Renders scatter plots"""

    def render(self, ax) -> None:
        for idx, dataset in enumerate(self.datasets):
            values = dataset["values"]
            label = dataset.get("name", f"Series {idx + 1}")
            color = self._get_color(dataset, idx)

            # For scatter, expect x and y in values or use index as x
            if isinstance(values[0], (list, tuple)) and len(values[0]) == 2:
                x_vals = [v[0] for v in values]
                y_vals = [v[1] for v in values]
            else:
                x_vals = range(len(values))
                y_vals = values

            ax.scatter(x_vals, y_vals, label=label, color=color, alpha=0.6, s=100)

        if len(self.datasets) > 1:
            ax.legend()


class MultiLineChartRenderer(ChartRenderer):
    """Renders multi-line charts (same as LineChartRenderer)"""

    def render(self, ax) -> None:
        for idx, dataset in enumerate(self.datasets):
            values = dataset["values"]
            label = dataset.get("name", f"Series {idx + 1}")
            color = self._get_color(dataset, idx)

            x_values = self.labels if self.labels else range(len(values))
            ax.plot(x_values, values, marker="o", label=label, color=color, linewidth=2)

        ax.legend()


class StackedBarChartRenderer(ChartRenderer):
    """Renders stacked bar charts"""

    def render(self, ax) -> None:
        num_points = len(self.datasets[0]["values"])
        x_positions = range(num_points)

        bottoms = [0] * num_points

        for idx, dataset in enumerate(self.datasets):
            values = dataset["values"]
            label = dataset.get("name", f"Series {idx + 1}")
            color = self._get_color(dataset, idx)

            ax.bar(
                x_positions, values, bottom=bottoms, label=label, color=color, alpha=0.8
            )

            # Update bottoms for next stack
            bottoms = [bottoms[i] + values[i] for i in range(num_points)]

        if self.labels:
            ax.set_xticks(x_positions)
            ax.set_xticklabels(self.labels)

        ax.legend()


class HorizontalBarChartRenderer(ChartRenderer):
    """Renders horizontal bar charts"""

    def render(self, ax) -> None:
        if len(self.datasets) == 1:
            dataset = self.datasets[0]
            values = dataset["values"]
            color = self._get_color(dataset, 0)

            y_positions = range(len(values))
            ax.barh(y_positions, values, color=color, alpha=0.8)

            if self.labels:
                ax.set_yticks(y_positions)
                ax.set_yticklabels(self.labels)
        else:
            num_datasets = len(self.datasets)
            num_points = len(self.datasets[0]["values"])
            bar_height = 0.8 / num_datasets

            for idx, dataset in enumerate(self.datasets):
                values = dataset["values"]
                label = dataset.get("name", f"Series {idx + 1}")
                color = self._get_color(dataset, idx)

                y_positions = [i + idx * bar_height for i in range(num_points)]
                ax.barh(
                    y_positions, values, bar_height, label=label, color=color, alpha=0.8
                )

            if self.labels:
                ax.set_yticks(
                    [i + bar_height * (num_datasets - 1) / 2 for i in range(num_points)]
                )
                ax.set_yticklabels(self.labels)

            ax.legend()


# ===========================
# RENDERER FACTORY
# ===========================


class ChartRendererFactory:
    """Factory for creating chart renderers"""

    _renderers = {
        "line": LineChartRenderer,
        "bar": BarChartRenderer,
        "pie": PieChartRenderer,
        "scatter": ScatterPlotRenderer,
        "multi_line": MultiLineChartRenderer,
        "stacked_bar": StackedBarChartRenderer,
        "horizontal_bar": HorizontalBarChartRenderer,
    }

    @classmethod
    def create_renderer(cls, payload: Dict[str, Any]) -> ChartRenderer:
        """Create appropriate renderer based on chart type"""
        chart_type = payload.get("chart_type", "").lower()
        renderer_class = cls._renderers.get(chart_type)

        if not renderer_class:
            raise ValueError(f"Unknown chart type: {chart_type}")

        return renderer_class(payload)


# ===========================
# MAIN GENERATOR FUNCTION
# ===========================


def generate_chart(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a chart from structured data.

    Args:
        payload: Dictionary containing chart specifications
            - chart_type: str (line, bar, pie, scatter, multi_line, stacked_bar, horizontal_bar)
            - title: str (optional)
            - x_label: str (optional)
            - y_label: str (optional)
            - labels: list of str (optional)
            - datasets: list of dict with 'values' and optional 'name', 'color'
            - output_format: str (png or base64, default: png)
            - width: int (default: 800)
            - height: int (default: 500)

    Returns:
        dict: Success response with file_path or base64_image
              Error response with status, error_code, and message

    Example payloads:

    # Line Chart
    {
        "chart_type": "line",
        "title": "Student Attendance Over Time",
        "x_label": "Month",
        "y_label": "Attendance %",
        "labels": ["Jan", "Feb", "Mar", "Apr"],
        "datasets": [
            {"name": "Class A", "values": [95, 92, 94, 96]},
            {"name": "Class B", "values": [88, 90, 87, 91]}
        ],
        "output_format": "base64"
    }

    # Bar Chart
    {
        "chart_type": "bar",
        "title": "Exam Results by Subject",
        "labels": ["Math", "Science", "English", "History"],
        "datasets": [{"values": [85, 78, 92, 88]}],
        "output_format": "png"
    }

    # Pie Chart
    {
        "chart_type": "pie",
        "title": "Student Distribution",
        "labels": ["Grade 1", "Grade 2", "Grade 3"],
        "datasets": [{"values": [120, 150, 130]}]
    }
    """
    try:
        # Validate payload
        is_valid, error_msg = ChartValidator.validate_payload(payload)
        if not is_valid:
            return {
                "status": "error",
                "error_code": "VALIDATION_ERROR",
                "message": error_msg,
            }

        # Create renderer
        renderer = ChartRendererFactory.create_renderer(payload)

        # Generate chart
        fig = renderer.generate()

        # Get output format
        output_format = payload.get("output_format", "png").lower()
        chart_type = payload.get("chart_type", "").lower()

        result = {
            "status": "success",
            "chart_type": chart_type,
            "output_format": output_format,
        }

        if output_format == "base64":
            # Convert to base64
            buffer = io.BytesIO()
            fig.savefig(buffer, format="png", bbox_inches="tight", dpi=100)
            buffer.seek(0)
            base64_str = base64.b64encode(buffer.read()).decode("utf-8")
            plt.close(fig)

            result["base64_image"] = base64_str
        else:
            # Save to file
            charts_dir = Path("charts")
            charts_dir.mkdir(exist_ok=True)

            filename = f"{chart_type}_{uuid.uuid4().hex[:8]}.png"
            file_path = charts_dir / filename

            fig.savefig(file_path, format="png", bbox_inches="tight", dpi=100)
            plt.close(fig)

            result["file_path"] = str(file_path)

        return result

    except ValueError as e:
        return {"status": "error", "error_code": "VALIDATION_ERROR", "message": str(e)}
    except Exception as e:
        return {
            "status": "error",
            "error_code": "RENDER_ERROR",
            "message": f"Failed to render chart: {str(e)}",
        }
