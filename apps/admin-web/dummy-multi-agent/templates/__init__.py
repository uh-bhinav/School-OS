"""
Report Templates Package
=========================
PDF report templates for SchoolOS report generation.
"""

try:
    from templates.report_card_template import ReportCardTemplate
    from templates.fee_receipt_template import FeeReceiptTemplate
    from templates.attendance_report_template import AttendanceReportTemplate
    from templates.class_analytics_template import ClassAnalyticsTemplate

    __all__ = [
        "ReportCardTemplate",
        "FeeReceiptTemplate",
        "AttendanceReportTemplate",
        "ClassAnalyticsTemplate",
    ]
except ImportError:
    # reportlab not installed — templates unavailable
    __all__ = []
