"""
Report Generator Tool
======================
PDF report generation engine for SchoolOS.
Uses ReportLab to generate professional PDF reports from structured data.

Supported report types:
  - report_card: Student academic report
  - fee_receipt: Fee payment receipt
  - attendance_report: Attendance summary
  - class_analytics: Class performance analytics

Each report type has a dedicated template in the templates/ directory.
"""

import base64
import io
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# ============================================================================
# REPORT GENERATION DIRECTORY
# ============================================================================

REPORTS_DIR = Path(__file__).parent / "generated_reports"
REPORTS_DIR.mkdir(exist_ok=True)


# ============================================================================
# TEMPLATE IMPORTS (lazy-loaded to avoid import errors if reportlab missing)
# ============================================================================

_templates_loaded = False
_template_classes = {}


def _load_templates():
    """Lazy-load report templates."""
    global _templates_loaded, _template_classes
    if _templates_loaded:
        return

    try:
        from templates.report_card_template import ReportCardTemplate
        from templates.fee_receipt_template import FeeReceiptTemplate
        from templates.attendance_report_template import AttendanceReportTemplate
        from templates.class_analytics_template import ClassAnalyticsTemplate

        _template_classes = {
            "report_card": ReportCardTemplate,
            "fee_receipt": FeeReceiptTemplate,
            "attendance_report": AttendanceReportTemplate,
            "class_analytics": ClassAnalyticsTemplate,
        }
        _templates_loaded = True
        logger.info("Report templates loaded successfully")
    except ImportError as e:
        logger.error(f"Failed to load report templates: {e}")
        _templates_loaded = False


# ============================================================================
# MAIN REPORT GENERATION FUNCTION
# ============================================================================


def generate_report(
    report_type: str,
    data: Dict[str, Any],
    output_format: str = "pdf",
) -> Dict[str, Any]:
    """
    Generate a report from structured data.

    Args:
        report_type: Type of report (report_card, fee_receipt, attendance_report, class_analytics)
        data: Resolved data dictionary from report_intelligence.resolve_report_data()
        output_format: Output format — "pdf" (default) or "base64"

    Returns:
        Dict with:
            - status: "success" or "error"
            - file_name: Name of generated file
            - file_path: Absolute path to generated file (if pdf)
            - base64_data: Base64 encoded PDF (if base64 format)
            - file_size: Size in bytes
            - report_type: Type of report generated
            - message: Human-readable description
    """
    _load_templates()

    if not _templates_loaded:
        return {
            "status": "error",
            "message": "Report templates not available. Install reportlab: pip install reportlab",
        }

    if report_type not in _template_classes:
        return {
            "status": "error",
            "message": f"Unknown report type: {report_type}. Valid types: {list(_template_classes.keys())}",
        }

    try:
        # Create template instance
        template_class = _template_classes[report_type]
        template = template_class(data)

        # Generate PDF to buffer
        buffer = io.BytesIO()
        template.build(buffer)
        buffer.seek(0)
        pdf_bytes = buffer.read()
        file_size = len(pdf_bytes)

        # Generate filename
        entity = data.get("entity", {})
        student_name = (
            entity.get("student_name", "")
            or data.get("student", {}).get("student_name", "")
            or data.get("class_name", "")
            or "report"
        )
        safe_name = student_name.replace(" ", "_").lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"{report_type}_{safe_name}_{timestamp}.pdf"

        result = {
            "status": "success",
            "file_name": file_name,
            "file_size": file_size,
            "report_type": report_type,
            "message": _get_success_message(report_type, student_name),
        }

        if output_format == "base64":
            result["base64_data"] = base64.b64encode(pdf_bytes).decode("utf-8")
        else:
            # Save to file
            file_path = REPORTS_DIR / file_name
            with open(file_path, "wb") as f:
                f.write(pdf_bytes)
            result["file_path"] = str(file_path)

        logger.info(f"Generated {report_type} report: {file_name} ({file_size} bytes)")
        return result

    except Exception as e:
        logger.exception(f"Report generation failed for {report_type}: {e}")
        return {
            "status": "error",
            "message": f"Failed to generate {report_type}: {str(e)}",
        }


def _get_success_message(report_type: str, entity_name: str) -> str:
    """Generate a user-friendly success message."""
    messages = {
        "report_card": f"📄 Report card generated for {entity_name}",
        "fee_receipt": f"🧾 Fee receipt generated for {entity_name}",
        "attendance_report": f"📋 Attendance report generated for {entity_name}",
        "class_analytics": f"📊 Class analytics report generated for {entity_name}",
    }
    return messages.get(report_type, f"Report generated for {entity_name}")


# ============================================================================
# REPORT LISTING & CLEANUP
# ============================================================================


def list_generated_reports() -> list:
    """List all generated reports in the reports directory."""
    reports = []
    for f in REPORTS_DIR.glob("*.pdf"):
        reports.append(
            {
                "file_name": f.name,
                "file_path": str(f),
                "file_size": f.stat().st_size,
                "created": datetime.fromtimestamp(f.stat().st_ctime).isoformat(),
            }
        )
    return sorted(reports, key=lambda x: x["created"], reverse=True)


def get_report_base64(file_name: str) -> Optional[str]:
    """Get a generated report as base64 string."""
    file_path = REPORTS_DIR / file_name
    if file_path.exists():
        with open(file_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return None


def cleanup_old_reports(max_age_hours: int = 24):
    """Remove reports older than max_age_hours."""
    cutoff = datetime.now().timestamp() - (max_age_hours * 3600)
    removed = 0
    for f in REPORTS_DIR.glob("*.pdf"):
        if f.stat().st_ctime < cutoff:
            f.unlink()
            removed += 1
    if removed:
        logger.info(f"Cleaned up {removed} old report(s)")


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "generate_report",
    "list_generated_reports",
    "get_report_base64",
    "cleanup_old_reports",
    "REPORTS_DIR",
]
