"""
Class Analytics Template
=========================
Generates a class performance analytics report PDF with:
  - School header
  - Class information
  - Performance metrics (average, highest, lowest, pass rate)
  - Subject-wise performance breakdown
  - Student rankings table
  - Attendance summary for the class
  - Fee collection status
  - Recommendations

Uses ReportLab for PDF generation.
"""

from io import BytesIO
from typing import Dict, Any
from datetime import datetime
from collections import defaultdict

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, mm  # noqa: F401
    from reportlab.platypus import (
        SimpleDocTemplate,
        Table,
        TableStyle,
        Paragraph,
        Spacer,
        HRFlowable,
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT  # noqa: F401

    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ClassAnalyticsTemplate:
    """Generates a class analytics report PDF."""

    PRIMARY_COLOR = colors.HexColor("#4a148c")  # Deep purple
    SECONDARY_COLOR = colors.HexColor("#6a1b9a")
    ACCENT_GREEN = colors.HexColor("#2e7d32")
    ACCENT_RED = colors.HexColor("#c62828")
    ACCENT_ORANGE = colors.HexColor("#ef6c00")
    HEADER_BG = colors.HexColor("#f3e5f5")
    ROW_ALT_BG = colors.HexColor("#f5f5f5")
    BORDER_COLOR = colors.HexColor("#bdbdbd")

    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.school_name = data.get("school_name", "SchoolOS Academy")
        self.school_address = data.get("school_address", "")
        self.class_name = data.get("class_name", "Unknown Class")
        self.academic_year = data.get("academic_year", "2024-2025")

        self.marks = data.get("marks", [])
        self.attendance = data.get("attendance", [])
        self.fees = data.get("fees", [])
        self.students = data.get("students", [])
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None

    def build(self, buffer: BytesIO) -> None:
        """Build the PDF class analytics report."""
        if not REPORTLAB_AVAILABLE:
            raise ImportError("reportlab is required for PDF generation")

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=25,
            leftMargin=25,
            topMargin=25,
            bottomMargin=25,
        )

        elements = []

        # Header
        elements.extend(self._build_header())
        elements.append(Spacer(1, 6))
        elements.append(
            HRFlowable(
                width="100%",
                thickness=2,
                color=self.PRIMARY_COLOR,
                spaceAfter=8,
            )
        )

        # Title
        title_style = ParagraphStyle(
            "Title",
            parent=self.styles["Heading1"],
            fontSize=16,
            textColor=self.PRIMARY_COLOR,
            alignment=TA_CENTER,
            spaceAfter=10,
        )
        elements.append(Paragraph("CLASS ANALYTICS REPORT", title_style))

        # Class info
        elements.extend(self._build_class_info())
        elements.append(Spacer(1, 10))

        # Performance metrics
        elements.extend(self._build_performance_metrics())
        elements.append(Spacer(1, 10))

        # Subject-wise performance
        if self.marks:
            elements.extend(self._build_subject_performance())
            elements.append(Spacer(1, 10))

        # Student rankings
        if self.marks:
            elements.extend(self._build_student_rankings())
            elements.append(Spacer(1, 10))

        # Attendance summary
        if self.attendance:
            elements.extend(self._build_attendance_summary())
            elements.append(Spacer(1, 10))

        # Fee collection status
        if self.fees:
            elements.extend(self._build_fee_summary())
            elements.append(Spacer(1, 10))

        # Recommendations
        elements.extend(self._build_recommendations())

        # Footer
        elements.append(Spacer(1, 12))
        elements.extend(self._build_footer())

        doc.build(elements)

    def _build_header(self) -> list:
        elements = []
        school_style = ParagraphStyle(
            "School",
            parent=self.styles["Heading1"],
            fontSize=18,
            textColor=self.PRIMARY_COLOR,
            alignment=TA_CENTER,
            spaceAfter=2,
        )
        elements.append(Paragraph(self.school_name.upper(), school_style))

        if self.school_address:
            addr_style = ParagraphStyle(
                "Addr",
                parent=self.styles["Normal"],
                fontSize=9,
                textColor=colors.grey,
                alignment=TA_CENTER,
            )
            elements.append(Paragraph(self.school_address, addr_style))

        return elements

    def _build_class_info(self) -> list:
        elements = []

        label_style = ParagraphStyle(
            "Label",
            parent=self.styles["Normal"],
            fontSize=10,
            fontName="Helvetica-Bold",
            textColor=self.PRIMARY_COLOR,
        )
        value_style = ParagraphStyle(
            "Value",
            parent=self.styles["Normal"],
            fontSize=10,
        )

        info_data = [
            [
                Paragraph("Class:", label_style),
                Paragraph(self.class_name, value_style),
                Paragraph("Academic Year:", label_style),
                Paragraph(self.academic_year, value_style),
            ],
            [
                Paragraph("Total Students:", label_style),
                Paragraph(str(len(self.students)), value_style),
                Paragraph("Report Date:", label_style),
                Paragraph(datetime.now().strftime("%d-%m-%Y"), value_style),
            ],
        ]

        table = Table(info_data, colWidths=[100, 170, 100, 160])
        table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("BACKGROUND", (0, 0), (-1, -1), self.HEADER_BG),
                    ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
                ]
            )
        )

        elements.append(table)
        return elements

    def _build_performance_metrics(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Performance Metrics", section_style))

        if not self.marks:
            elements.append(
                Paragraph("No marks data available.", self.styles["Normal"])
            )
            return elements

        # Calculate metrics
        percentages = [
            float(m.get("percentage", 0)) for m in self.marks if m.get("percentage")
        ]
        if not percentages:
            return elements

        avg_pct = sum(percentages) / len(percentages)
        max_pct = max(percentages)
        min_pct = min(percentages)
        pass_count = sum(1 for p in percentages if p >= 50)
        pass_rate = (pass_count / len(percentages) * 100) if percentages else 0

        # Grade distribution
        grade_counts = defaultdict(int)
        for m in self.marks:
            grade_counts[m.get("grade", "N/A")] += 1

        metrics_data = [
            ["Class Average", "Highest Score", "Lowest Score", "Pass Rate"],
            [
                f"{avg_pct:.1f}%",
                f"{max_pct:.1f}%",
                f"{min_pct:.1f}%",
                f"{pass_rate:.1f}%",
            ],
        ]

        table = Table(metrics_data, colWidths=[132, 132, 132, 132])

        style_commands = [
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("FONTSIZE", (0, 1), (-1, 1), 16),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ]

        # Color code values
        if avg_pct >= 75:
            style_commands.append(("TEXTCOLOR", (0, 1), (0, 1), self.ACCENT_GREEN))
        elif avg_pct < 50:
            style_commands.append(("TEXTCOLOR", (0, 1), (0, 1), self.ACCENT_RED))

        table.setStyle(TableStyle(style_commands))
        elements.append(table)

        # Grade distribution
        elements.append(Spacer(1, 8))
        elements.append(
            Paragraph(
                "Grade Distribution",
                ParagraphStyle(
                    "SubSection",
                    parent=self.styles["Heading3"],
                    fontSize=10,
                    textColor=self.PRIMARY_COLOR,
                    spaceAfter=4,
                ),
            )
        )

        grade_header = ["Grade", "Count", "Percentage"]
        grade_table_data = [grade_header]
        for grade in ["A+", "A", "B", "C", "D", "F"]:
            count = grade_counts.get(grade, 0)
            pct = (count / len(self.marks) * 100) if self.marks else 0
            if count > 0:
                grade_table_data.append([grade, str(count), f"{pct:.1f}%"])

        if len(grade_table_data) > 1:
            grade_table = Table(grade_table_data, colWidths=[80, 80, 80])
            grade_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]
                )
            )
            elements.append(grade_table)

        return elements

    def _build_subject_performance(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Subject-wise Performance", section_style))

        # Group marks by subject
        subject_data = defaultdict(list)
        for m in self.marks:
            subject = m.get("subject", "Unknown")
            pct = float(m.get("percentage", 0))
            subject_data[subject].append(pct)

        header = ["Subject", "Avg %", "Highest", "Lowest", "Students"]
        table_data = [header]

        for subject, pcts in sorted(subject_data.items()):
            avg = sum(pcts) / len(pcts)
            table_data.append(
                [
                    subject,
                    f"{avg:.1f}%",
                    f"{max(pcts):.1f}%",
                    f"{min(pcts):.1f}%",
                    str(len(pcts)),
                ]
            )

        col_widths = [160, 80, 80, 80, 70]
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )

        elements.append(table)
        return elements

    def _build_student_rankings(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Student Rankings (Top 10)", section_style))

        # Calculate per-student averages
        student_scores = defaultdict(list)
        for m in self.marks:
            name = m.get("student_name", "Unknown")
            pct = float(m.get("percentage", 0))
            student_scores[name].append(pct)

        # Sort by average score
        rankings = sorted(
            [
                (name, sum(pcts) / len(pcts), len(pcts))
                for name, pcts in student_scores.items()
            ],
            key=lambda x: x[1],
            reverse=True,
        )[:10]

        header = ["Rank", "Student Name", "Avg %", "Subjects", "Grade"]
        table_data = [header]

        for rank, (name, avg, subjects) in enumerate(rankings, 1):
            grade = self._pct_to_grade(avg)
            table_data.append([str(rank), name, f"{avg:.1f}%", str(subjects), grade])

        col_widths = [40, 180, 80, 70, 60]
        table = Table(table_data, colWidths=col_widths)

        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]

        # Highlight top 3
        for i in range(1, min(4, len(table_data))):
            style_commands.append(("FONTNAME", (0, i), (-1, i), "Helvetica-Bold"))

        # Color code grades
        for i in range(1, len(table_data)):
            grade = table_data[i][-1]
            if grade in ("A+", "A"):
                style_commands.append(
                    ("TEXTCOLOR", (-1, i), (-1, i), self.ACCENT_GREEN)
                )
            elif grade == "F":
                style_commands.append(("TEXTCOLOR", (-1, i), (-1, i), self.ACCENT_RED))

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_attendance_summary(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Class Attendance Overview", section_style))

        total = len(self.attendance)
        present = sum(
            1 for a in self.attendance if a.get("status", "").lower() == "present"
        )
        absent = sum(
            1 for a in self.attendance if a.get("status", "").lower() == "absent"
        )
        late = sum(1 for a in self.attendance if a.get("status", "").lower() == "late")

        # Average attendance percentage
        pct_values = [
            float(a.get("attendance_pct", 0))
            for a in self.attendance
            if a.get("attendance_pct")
        ]
        avg_pct = sum(pct_values) / len(pct_values) if pct_values else 0

        # At-risk students (below 75%)
        at_risk = sum(1 for p in pct_values if p < 75)

        att_data = [
            ["Records", "Present", "Absent", "Late", "Avg %", "At Risk (<75%)"],
            [
                str(total),
                str(present),
                str(absent),
                str(late),
                f"{avg_pct:.1f}%",
                str(at_risk),
            ],
        ]

        table = Table(att_data, colWidths=[80, 80, 80, 80, 80, 100])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("FONTSIZE", (0, 1), (-1, 1), 12),
                    ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        elements.append(table)
        return elements

    def _build_fee_summary(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Fee Collection Status", section_style))

        total_amount = sum(float(f.get("amount", 0)) for f in self.fees)
        total_paid = sum(float(f.get("paid", 0)) for f in self.fees)
        total_balance = total_amount - total_paid
        collection_rate = (total_paid / total_amount * 100) if total_amount > 0 else 0

        # Count by status
        paid_count = sum(1 for f in self.fees if f.get("status", "").lower() == "paid")
        pending_count = sum(
            1
            for f in self.fees
            if f.get("status", "").lower() in ("pending", "partial")
        )
        overdue_count = sum(
            1 for f in self.fees if f.get("status", "").lower() == "overdue"
        )

        fee_data = [
            ["Total Fee", "Collected", "Pending", "Collection Rate"],
            [
                f"₹{total_amount:,.0f}",
                f"₹{total_paid:,.0f}",
                f"₹{total_balance:,.0f}",
                f"{collection_rate:.1f}%",
            ],
            ["Paid", "Pending/Partial", "Overdue", ""],
            [str(paid_count), str(pending_count), str(overdue_count), ""],
        ]

        table = Table(fee_data, colWidths=[132, 132, 132, 132])
        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTSIZE", (0, 1), (-1, 1), 12),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("BACKGROUND", (0, 2), (-1, 2), self.HEADER_BG),
            ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
        ]

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_recommendations(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Recommendations", section_style))

        recommendations = []

        # Academic recommendations
        if self.marks:
            percentages = [
                float(m.get("percentage", 0)) for m in self.marks if m.get("percentage")
            ]
            avg_pct = sum(percentages) / len(percentages) if percentages else 0
            fail_count = sum(1 for p in percentages if p < 50)

            if avg_pct < 60:
                recommendations.append(
                    "Class average is below standard. Consider remedial classes for weak subjects."
                )
            if fail_count > 0:
                recommendations.append(
                    f"{fail_count} failing grades detected. Individual attention needed for struggling students."
                )

        # Attendance recommendations
        if self.attendance:
            pct_values = [
                float(a.get("attendance_pct", 0))
                for a in self.attendance
                if a.get("attendance_pct")
            ]
            at_risk = sum(1 for p in pct_values if p < 75)
            if at_risk > 0:
                recommendations.append(
                    f"{at_risk} student(s) with attendance below 75%. Parental meetings recommended."
                )

        # Fee recommendations
        if self.fees:
            overdue = sum(
                1 for f in self.fees if f.get("status", "").lower() == "overdue"
            )
            if overdue > 0:
                recommendations.append(
                    f"{overdue} overdue fee record(s). Send payment reminders to parents."
                )

        if not recommendations:
            recommendations.append(
                "All metrics are within acceptable range. Continue current teaching strategies."
            )

        remark_style = ParagraphStyle(
            "Rec",
            parent=self.styles["Normal"],
            fontSize=9,
            leading=13,
        )

        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(f"  {i}. {rec}", remark_style))

        return elements

    def _build_footer(self) -> list:
        elements = []
        footer_style = ParagraphStyle(
            "Footer",
            parent=self.styles["Normal"],
            fontSize=7,
            textColor=colors.lightgrey,
            alignment=TA_CENTER,
        )
        elements.append(
            Paragraph(
                f"Generated by SchoolOS on {datetime.now().strftime('%d-%m-%Y %H:%M')} | This is a computer-generated report",
                footer_style,
            )
        )
        return elements

    @staticmethod
    def _pct_to_grade(pct: float) -> str:
        if pct >= 90:
            return "A+"
        elif pct >= 80:
            return "A"
        elif pct >= 70:
            return "B"
        elif pct >= 60:
            return "C"
        elif pct >= 50:
            return "D"
        return "F"
