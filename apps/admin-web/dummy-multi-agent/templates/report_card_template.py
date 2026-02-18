"""
Report Card Template — CBSE Format
=====================================
Generates a professional student report card PDF matching the frontend
design at /academics/students/:id.

Layout:
  - School header (logo placeholder + name + affiliation + student photo)
  - Report title with academic session and class-section
  - Student details (name, parents, roll no, admission no, DOB, address)
  - Scholastic Areas table: Subject | Half Yearly | Total | Overall | Grade
  - Attendance + Total Marks + Percentage + Overall Grade summary row
  - Co-Scholastic table (3-point A/B/C): Activity | Term-I | Term-II
  - Teacher remarks
  - Signature lines (Class Teacher, Principal, Manager)
  - 8-point grading scale reference
  - Footer

Uses ReportLab for PDF generation.
"""

from io import BytesIO
from typing import Dict, Any, List
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


# ── 8-point CBSE grading scale ──────────────────────────────────────
GRADING_SCALE = [
    ("91 – 100", "A+"),
    ("81 – 90", "A"),
    ("71 – 80", "B+"),
    ("61 – 70", "B"),
    ("51 – 60", "C+"),
    ("41 – 50", "C"),
    ("33 – 40", "D"),
    ("Below 33", "E"),
]

CO_SCHOLASTIC_ACTIVITIES = [
    "Work Education",
    "Art Education",
    "Physical Education",
    "Discipline",
    "Regularity & Punctuality",
]


def _grade_for_pct(pct: float) -> str:
    """Return the CBSE letter-grade for a given percentage."""
    if pct >= 91:
        return "A+"
    if pct >= 81:
        return "A"
    if pct >= 71:
        return "B+"
    if pct >= 61:
        return "B"
    if pct >= 51:
        return "C+"
    if pct >= 41:
        return "C"
    if pct >= 33:
        return "D"
    return "E"


class ReportCardTemplate:
    """Generates a CBSE-format student report card PDF."""

    # ── colour palette (matches frontend MUI primary) ────────────────
    PRIMARY = colors.HexColor("#1976d2")
    PRIMARY_DARK = colors.HexColor("#1565c0")
    HEADER_BG = colors.HexColor("#f5f5f5")
    SUMMARY_BG = colors.HexColor("#fff8e1")  # amber-50 for summary row
    BORDER = colors.HexColor("#e0e0e0")
    GREY = colors.HexColor("#757575")
    GREEN = colors.HexColor("#2e7d32")
    RED = colors.HexColor("#c62828")

    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.school_name = data.get("school_name", "DEMO SCHOOL NAME")
        self.school_address = data.get("school_address", "")
        self.school_phone = data.get("school_phone", "+91 1234567890")
        self.school_email = data.get("school_email", "info@yourschool.com")
        self.academic_year = data.get("academic_year", "2025-2026")

        student = data.get("student", {})
        self.student_name = student.get("student_name", student.get("name", "—"))
        self.class_name = student.get("class_name", "")
        self.section = student.get("section", "")
        self.roll_no = student.get(
            "roll_no",
            student.get("student_id", student.get("id", "—")),
        )
        self.admission_no = student.get(
            "admission_no",
            f"ADM{str(self.roll_no).zfill(4)}",
        )
        self.dob = student.get("dob", student.get("admission_date", "—"))
        self.parent_name = student.get("parent_name", "—")
        self.gender = student.get("gender", "")

        self.marks: List[Dict[str, Any]] = data.get("marks", [])
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None

    # ══════════════════════════════════════════════════════════════════
    # PUBLIC API
    # ══════════════════════════════════════════════════════════════════
    def build(self, buffer: BytesIO) -> None:
        """Build the complete CBSE report-card PDF into *buffer*."""
        if not REPORTLAB_AVAILABLE:
            raise ImportError("reportlab is required for PDF generation")

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=28,
            leftMargin=28,
            topMargin=22,
            bottomMargin=22,
        )

        elems: list = []
        elems.extend(self._school_header())
        elems.append(
            HRFlowable(width="100%", thickness=2, color=self.PRIMARY, spaceAfter=6),
        )
        elems.extend(self._report_title())
        elems.append(Spacer(1, 6))
        elems.extend(self._student_details())
        elems.append(Spacer(1, 10))
        elems.extend(self._scholastic_table())
        elems.append(Spacer(1, 10))
        elems.extend(self._co_scholastic_table())
        elems.append(Spacer(1, 10))
        elems.extend(self._remarks())
        elems.append(Spacer(1, 18))
        elems.extend(self._signatures())
        elems.append(Spacer(1, 10))
        elems.extend(self._grading_scale())
        elems.append(Spacer(1, 6))
        elems.extend(self._footer())

        doc.build(elems)

    # ══════════════════════════════════════════════════════════════════
    # SECTIONS
    # ══════════════════════════════════════════════════════════════════

    # ── 1. SCHOOL HEADER ─────────────────────────────────────────────
    def _school_header(self) -> list:
        elems: list = []

        logo_sty = ParagraphStyle(
            "Logo",
            parent=self.styles["Normal"],
            fontSize=7,
            alignment=TA_CENTER,
            textColor=self.GREY,
        )
        name_sty = ParagraphStyle(
            "SchName",
            parent=self.styles["Heading1"],
            fontSize=16,
            textColor=self.PRIMARY,
            alignment=TA_CENTER,
            spaceAfter=1,
        )
        sub_sty = ParagraphStyle(
            "SchSub",
            parent=self.styles["Normal"],
            fontSize=8,
            textColor=self.GREY,
            alignment=TA_CENTER,
            spaceAfter=1,
        )

        logo_para = Paragraph("SCHOOL<br/>LOGO", logo_sty)
        photo_para = Paragraph("Student<br/>Photo", logo_sty)

        info_lines = [
            Paragraph(self.school_name.upper(), name_sty),
            Paragraph(
                "Affiliated To: CBSE Board &nbsp;|&nbsp; " "Affiliation No: 1234567890",
                sub_sty,
            ),
            Paragraph(
                f"Ph: {self.school_phone} &nbsp;|&nbsp; " f"Email: {self.school_email}",
                sub_sty,
            ),
        ]

        info_table = Table(
            [[p] for p in info_lines],
            colWidths=[360],
        )
        info_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )

        header = Table(
            [[logo_para, info_table, photo_para]],
            colWidths=[65, 400, 65],
        )
        header.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (0, 0), "CENTER"),
                    ("ALIGN", (2, 0), (2, 0), "CENTER"),
                    ("BOX", (0, 0), (0, 0), 1, self.PRIMARY),
                    ("BOX", (2, 0), (2, 0), 1, self.PRIMARY),
                ]
            )
        )

        elems.append(header)
        return elems

    # ── 2. REPORT TITLE ──────────────────────────────────────────────
    def _report_title(self) -> list:
        elems: list = []
        title_sty = ParagraphStyle(
            "RTitle",
            parent=self.styles["Heading2"],
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=2,
            textColor=self.PRIMARY_DARK,
        )
        sub_sty = ParagraphStyle(
            "RSub",
            parent=self.styles["Normal"],
            fontSize=10,
            alignment=TA_CENTER,
            spaceAfter=1,
        )
        bold_sub = ParagraphStyle(
            "RBold",
            parent=self.styles["Normal"],
            fontSize=10,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
        )

        elems.append(Paragraph("Academic Report", title_sty))
        elems.append(
            Paragraph(
                f"Academic Session: {self.academic_year}",
                sub_sty,
            )
        )
        elems.append(
            Paragraph(
                f"{self.class_name} – {self.section}".strip(" –"),
                bold_sub,
            )
        )
        return elems

    # ── 3. STUDENT DETAILS ───────────────────────────────────────────
    def _student_details(self) -> list:
        elems: list = []

        label = ParagraphStyle(
            "DLabel",
            parent=self.styles["Normal"],
            fontSize=9,
            fontName="Helvetica-Bold",
        )
        val = ParagraphStyle(
            "DValue",
            parent=self.styles["Normal"],
            fontSize=9,
        )

        first_name = self.student_name.split()[0] if self.student_name else ""

        rows = [
            [
                Paragraph(f"<b>Name of Student:</b>  {self.student_name}", label),
                Paragraph(f"<b>Roll No.:</b>  {self.roll_no}", label),
            ],
            [
                Paragraph(
                    f"<b>Mother's Name:</b>  Mother of {first_name}",
                    val,
                ),
                Paragraph(
                    f"<b>Admission No.:</b>  {self.admission_no}",
                    val,
                ),
            ],
            [
                Paragraph(
                    f"<b>Father's Name:</b>  {self.parent_name}",
                    val,
                ),
                Paragraph(f"<b>Date of Birth:</b>  {self.dob}", val),
            ],
            [
                Paragraph(
                    "<b>Address:</b>  " + (self.school_address or "—"),
                    val,
                ),
                Paragraph("", val),
            ],
        ]

        tbl = Table(rows, colWidths=[265, 265])
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), self.HEADER_BG),
                    ("BOX", (0, 0), (-1, -1), 1, self.BORDER),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, self.BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        elems.append(tbl)
        return elems

    # ── 4. SCHOLASTIC AREAS TABLE ────────────────────────────────────
    def _scholastic_table(self) -> list:
        elems: list = []

        sec_sty = ParagraphStyle(
            "SecTitle",
            parent=self.styles["Heading3"],
            fontSize=11,
            spaceAfter=4,
            fontName="Helvetica-Bold",
        )
        elems.append(Paragraph("Scholastic Areas – Term 1", sec_sty))

        header = ["Subject", "Half Yearly", "Total", "Overall", "Grade"]
        data_rows: List[list] = [header]

        total_obtained: float = 0.0
        total_max: float = 0.0

        for mark in self.marks:
            subject = mark.get("subject", "N/A")
            obtained = float(mark.get("obtained", 0))
            max_marks = float(mark.get("max_marks", 100))
            pct = (obtained / max_marks * 100) if max_marks > 0 else 0.0
            grade = mark.get("grade") or _grade_for_pct(pct)

            total_obtained += obtained
            total_max += max_marks

            data_rows.append(
                [
                    subject,
                    str(int(obtained)),
                    str(int(obtained)),
                    str(int(obtained)),
                    grade,
                ]
            )

        # Summary / totals row (yellow background)
        overall_pct = (total_obtained / total_max * 100) if total_max > 0 else 0.0
        overall_grade = _grade_for_pct(overall_pct)

        attendance_total = 180
        attendance_present = int(attendance_total * 0.95)

        data_rows.append(
            [
                f"Attendance  {attendance_present}/{attendance_total}",
                "Total Marks",
                f"{int(total_obtained)}/{int(total_max)}",
                f"Percentage  {overall_pct:.1f}%",
                f"Grade  {overall_grade}",
            ]
        )

        col_w = [140, 90, 70, 100, 70]
        tbl = Table(data_rows, colWidths=col_w)

        cmds = [
            # header
            ("BACKGROUND", (0, 0), (-1, 0), self.HEADER_BG),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("ALIGN", (1, 0), (-1, 0), "CENTER"),
            # body
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            # summary row — yellow
            ("BACKGROUND", (0, -1), (-1, -1), self.SUMMARY_BG),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, -1), (-1, -1), 9),
            # grid
            ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]

        # colour-code the Grade column
        for i in range(1, len(data_rows) - 1):
            g = data_rows[i][-1]
            if g in ("A+", "A"):
                cmds.append(("TEXTCOLOR", (-1, i), (-1, i), self.GREEN))
            elif g in ("D", "E", "F"):
                cmds.append(("TEXTCOLOR", (-1, i), (-1, i), self.RED))

        tbl.setStyle(TableStyle(cmds))
        elems.append(tbl)
        return elems

    # ── 5. CO-SCHOLASTIC TABLE ───────────────────────────────────────
    def _co_scholastic_table(self) -> list:
        elems: list = []

        sec_sty = ParagraphStyle(
            "CoSec",
            parent=self.styles["Heading3"],
            fontSize=11,
            spaceAfter=4,
            fontName="Helvetica-Bold",
        )
        elems.append(
            Paragraph(
                "CO-SCHOLASTIC  (3-Point Grading Scale: A, B, C)",
                sec_sty,
            )
        )

        header = ["Activity", "Term-I", "Term-II"]
        rows: List[list] = [header]

        # Default grades — deterministic, not random
        default_grades = ["A", "A", "B", "A", "A"]
        for idx, activity in enumerate(CO_SCHOLASTIC_ACTIVITIES):
            grade = default_grades[idx] if idx < len(default_grades) else "B"
            rows.append([activity, grade, "—"])

        col_w = [265, 130, 130]
        tbl = Table(rows, colWidths=col_w)
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), self.HEADER_BG),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("FONTNAME", (1, 1), (-1, -1), "Helvetica-Bold"),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        elems.append(tbl)
        return elems

    # ── 6. REMARKS ───────────────────────────────────────────────────
    def _remarks(self) -> list:
        elems: list = []
        if not self.marks:
            return elems

        total_obt = sum(float(m.get("obtained", 0)) for m in self.marks)
        total_max = sum(float(m.get("max_marks", 100)) for m in self.marks)
        pct = (total_obt / total_max * 100) if total_max > 0 else 0.0

        if pct >= 90:
            remark = "Outstanding performance! Keep up the excellent work."
        elif pct >= 75:
            remark = "Very good performance. Consistent effort is appreciated."
        elif pct >= 60:
            remark = (
                "Satisfactory performance. Room for improvement in some " "subjects."
            )
        elif pct >= 40:
            remark = "Needs to work harder. Regular practice is recommended."
        else:
            remark = (
                "Needs significant improvement. Extra attention and "
                "parental support required."
            )

        lbl_sty = ParagraphStyle(
            "RLabel",
            parent=self.styles["Normal"],
            fontSize=9,
            fontName="Helvetica-Bold",
        )
        txt_sty = ParagraphStyle(
            "RTxt",
            parent=self.styles["Normal"],
            fontSize=9,
            leading=13,
        )

        elems.append(Paragraph("Teacher's Remarks:", lbl_sty))
        elems.append(Spacer(1, 3))

        box = Table([[Paragraph(remark, txt_sty)]], colWidths=[510])
        box.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.5, self.BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        elems.append(box)
        return elems

    # ── 7. SIGNATURES ────────────────────────────────────────────────
    def _signatures(self) -> list:
        elems: list = []
        sig_sty = ParagraphStyle(
            "Sig",
            parent=self.styles["Normal"],
            fontSize=8,
            textColor=self.GREY,
            alignment=TA_CENTER,
        )

        sig_data = [
            [
                Paragraph("_________________<br/>Sign. of Class Teacher", sig_sty),
                Paragraph("_________________<br/>Sign. of Principal", sig_sty),
                Paragraph("_________________<br/>Sign. of Manager", sig_sty),
            ]
        ]
        tbl = Table(sig_data, colWidths=[170, 170, 170])
        tbl.setStyle(
            TableStyle(
                [
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                    ("TOPPADDING", (0, 0), (-1, -1), 28),
                ]
            )
        )
        elems.append(tbl)
        return elems

    # ── 8. GRADING SCALE ─────────────────────────────────────────────
    def _grading_scale(self) -> list:
        elems: list = []

        cap_sty = ParagraphStyle(
            "GCap",
            parent=self.styles["Normal"],
            fontSize=7,
            fontName="Helvetica-Bold",
        )
        elems.append(
            Paragraph(
                "Grading Scale for Scholastic Areas  –  "
                "Grades are awarded on an 8-point scale as follows:",
                cap_sty,
            )
        )
        elems.append(Spacer(1, 3))

        header = ["Marks Range (%)"] + [g[0] for g in GRADING_SCALE]
        grades_row = ["Grade"] + [g[1] for g in GRADING_SCALE]

        num_cols = len(GRADING_SCALE)
        tbl = Table(
            [header, grades_row],
            colWidths=[80] + [52] * num_cols,
        )
        tbl.setStyle(
            TableStyle(
                [
                    ("FONTSIZE", (0, 0), (-1, -1), 6.5),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                    ("BACKGROUND", (0, 0), (-1, -1), self.HEADER_BG),
                ]
            )
        )
        elems.append(tbl)
        return elems

    # ── 9. FOOTER ────────────────────────────────────────────────────
    def _footer(self) -> list:
        elems: list = []
        sty = ParagraphStyle(
            "Foot",
            parent=self.styles["Normal"],
            fontSize=7,
            textColor=colors.lightgrey,
            alignment=TA_CENTER,
        )
        elems.append(
            Paragraph(
                f"Generated by SchoolOS on "
                f"{datetime.now().strftime('%d-%m-%Y %H:%M')}  |  "
                "This is a computer-generated document",
                sty,
            )
        )
        return elems
