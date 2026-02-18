"""
Attendance Report Template
===========================
Generates a professional attendance report PDF with:
  - School header
  - Student information
  - Attendance summary (present, absent, late counts)
  - Attendance percentage with status indicator
  - Daily attendance records table
  - Remarks based on attendance level

Uses ReportLab for PDF generation.
"""

from io import BytesIO
from typing import Dict, Any
from datetime import datetime

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


class AttendanceReportTemplate:
    """Generates a student attendance report PDF."""

    PRIMARY_COLOR = colors.HexColor("#1b5e20")  # Dark green
    SECONDARY_COLOR = colors.HexColor("#2e7d32")
    HEADER_BG = colors.HexColor("#e8f5e9")
    ROW_ALT_BG = colors.HexColor("#f5f5f5")
    BORDER_COLOR = colors.HexColor("#bdbdbd")

    STATUS_COLORS = {
        "present": colors.HexColor("#2e7d32"),
        "absent": colors.HexColor("#c62828"),
        "late": colors.HexColor("#ef6c00"),
    }

    STATUS_EMOJIS = {
        "present": "✓",
        "absent": "✗",
        "late": "⏰",
    }

    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.school_name = data.get("school_name", "SchoolOS Academy")
        self.school_address = data.get("school_address", "")

        student = data.get("student", {})
        self.student_name = student.get("student_name", student.get("name", "Unknown"))
        self.class_name = student.get("class_name", "")
        self.section = student.get("section", "")
        self.student_id = student.get("id", "")

        self.attendance = data.get("attendance", [])
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None

    def build(self, buffer: BytesIO) -> None:
        """Build the PDF attendance report."""
        if not REPORTLAB_AVAILABLE:
            raise ImportError("reportlab is required for PDF generation")

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
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
        elements.append(Paragraph("ATTENDANCE REPORT", title_style))

        # Student info
        elements.extend(self._build_student_info())
        elements.append(Spacer(1, 12))

        # Summary stats
        elements.extend(self._build_summary_stats())
        elements.append(Spacer(1, 12))

        # Daily records table
        elements.extend(self._build_records_table())
        elements.append(Spacer(1, 12))

        # Remarks
        elements.extend(self._build_remarks())
        elements.append(Spacer(1, 20))

        # Signatures
        elements.extend(self._build_signatures())

        # Footer
        elements.append(Spacer(1, 12))
        elements.extend(self._build_footer())

        doc.build(elements)

    def _build_header(self) -> list:
        elements = []

        school_style = ParagraphStyle(
            "SchoolName",
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

    def _build_student_info(self) -> list:
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

        # Get attendance percentage from records
        att_pct = "N/A"
        if self.attendance:
            pct_values = [
                float(a.get("attendance_pct", 0))
                for a in self.attendance
                if a.get("attendance_pct")
            ]
            if pct_values:
                att_pct = f"{pct_values[0]:.1f}%"

        info_data = [
            [
                Paragraph("Student Name:", label_style),
                Paragraph(self.student_name, value_style),
                Paragraph("Student ID:", label_style),
                Paragraph(str(self.student_id), value_style),
            ],
            [
                Paragraph("Class:", label_style),
                Paragraph(f"{self.class_name} - {self.section}", value_style),
                Paragraph("Attendance %:", label_style),
                Paragraph(att_pct, value_style),
            ],
        ]

        table = Table(info_data, colWidths=[100, 170, 90, 160])
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

    def _build_summary_stats(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Attendance Summary", section_style))

        # Count statuses
        total = len(self.attendance)
        present = sum(
            1 for a in self.attendance if a.get("status", "").lower() == "present"
        )
        absent = sum(
            1 for a in self.attendance if a.get("status", "").lower() == "absent"
        )
        late = sum(1 for a in self.attendance if a.get("status", "").lower() == "late")

        # Create summary boxes
        stats_data = [
            ["Total Days", "Present", "Absent", "Late"],
            [str(total), str(present), str(absent), str(late)],
        ]

        table = Table(stats_data, colWidths=[130, 130, 130, 130])

        style_commands = [
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("FONTSIZE", (0, 1), (-1, 1), 18),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            # Color code the numbers
            ("TEXTCOLOR", (1, 1), (1, 1), self.STATUS_COLORS["present"]),
            ("TEXTCOLOR", (2, 1), (2, 1), self.STATUS_COLORS["absent"]),
            ("TEXTCOLOR", (3, 1), (3, 1), self.STATUS_COLORS["late"]),
        ]

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_records_table(self) -> list:
        elements = []

        if not self.attendance:
            return elements

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Daily Records", section_style))

        header = ["#", "Date", "Period", "Status", "Remarks"]
        table_data = [header]

        for idx, record in enumerate(self.attendance, 1):
            status = record.get("status", "N/A").lower()
            status_display = (
                f"{self.STATUS_EMOJIS.get(status, '')} {status.capitalize()}"
            )

            table_data.append(
                [
                    str(idx),
                    record.get("date", "N/A"),
                    record.get("period", "N/A"),
                    status_display,
                    record.get("remarks", "-"),
                ]
            )

        col_widths = [30, 100, 60, 100, 230]
        table = Table(table_data, colWidths=col_widths)

        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("ALIGN", (0, 1), (0, -1), "CENTER"),
            ("ALIGN", (2, 1), (2, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]

        # Color-code status column
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                style_commands.append(("BACKGROUND", (0, i), (-1, i), self.ROW_ALT_BG))

            status_text = table_data[i][3].lower()
            for status_key, color in self.STATUS_COLORS.items():
                if status_key in status_text:
                    style_commands.append(("TEXTCOLOR", (3, i), (3, i), color))
                    style_commands.append(
                        ("FONTNAME", (3, i), (3, i), "Helvetica-Bold")
                    )
                    break

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_remarks(self) -> list:
        elements = []

        # Calculate attendance percentage
        total = len(self.attendance)
        present = sum(
            1 for a in self.attendance if a.get("status", "").lower() == "present"
        )
        late = sum(1 for a in self.attendance if a.get("status", "").lower() == "late")
        effective = present + late  # Late still counts as attended
        pct = (effective / total * 100) if total > 0 else 0

        # Or use the stored percentage
        if self.attendance:
            stored_pct = self.attendance[0].get("attendance_pct")
            if stored_pct:
                pct = float(stored_pct)

        section_style = ParagraphStyle(
            "Section",
            parent=self.styles["Heading3"],
            fontSize=11,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Remarks", section_style))

        if pct >= 90:
            remark = "Excellent attendance record. Student demonstrates consistent punctuality and commitment."
            status_label = "EXCELLENT"
        elif pct >= 75:
            remark = "Good attendance. Student maintains satisfactory presence. Minor improvements possible."
            status_label = "GOOD"
        elif pct >= 60:
            remark = "Below average attendance. Student is at risk of falling behind. Regular attendance is strongly advised."
            status_label = "NEEDS IMPROVEMENT"
        else:
            remark = "Critical attendance level. Immediate parental consultation is required. Student may face academic consequences."
            status_label = "CRITICAL"

        remark_style = ParagraphStyle(
            "Remark",
            parent=self.styles["Normal"],
            fontSize=10,
            leading=14,
        )

        remark_table = Table(
            [[Paragraph(f"<b>{status_label}</b>: {remark}", remark_style)]],
            colWidths=[480],
        )
        remark_table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )

        elements.append(remark_table)
        return elements

    def _build_signatures(self) -> list:
        elements = []

        sig_style = ParagraphStyle(
            "Sig",
            parent=self.styles["Normal"],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER,
        )

        sig_data = [
            [
                Paragraph("_________________<br/>Class Teacher", sig_style),
                Paragraph("_________________<br/>Principal", sig_style),
            ]
        ]

        sig_table = Table(sig_data, colWidths=[260, 260])
        sig_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ]
            )
        )

        elements.append(sig_table)
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
                f"Generated by SchoolOS on {datetime.now().strftime('%d-%m-%Y %H:%M')} | This is a computer-generated document",
                footer_style,
            )
        )
        return elements
