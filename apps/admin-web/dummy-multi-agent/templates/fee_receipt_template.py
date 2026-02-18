"""
Fee Receipt Template
=====================
Generates a professional fee payment receipt PDF with:
  - School header
  - Receipt number and date
  - Student info
  - Fee breakdown table (tuition, transport, etc.)
  - Payment summary (total, paid, balance)
  - Payment status indicator
  - Terms and conditions

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


class FeeReceiptTemplate:
    """Generates a fee payment receipt PDF."""

    PRIMARY_COLOR = colors.HexColor("#0d47a1")
    ACCENT_GREEN = colors.HexColor("#2e7d32")
    ACCENT_RED = colors.HexColor("#c62828")
    ACCENT_ORANGE = colors.HexColor("#ef6c00")
    HEADER_BG = colors.HexColor("#e3f2fd")
    ROW_ALT_BG = colors.HexColor("#f5f5f5")
    BORDER_COLOR = colors.HexColor("#bdbdbd")

    STATUS_COLORS = {
        "paid": colors.HexColor("#2e7d32"),
        "partial": colors.HexColor("#ef6c00"),
        "pending": colors.HexColor("#ef6c00"),
        "overdue": colors.HexColor("#c62828"),
    }

    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.school_name = data.get("school_name", "SchoolOS Academy")
        self.school_address = data.get("school_address", "")
        self.school_phone = data.get("school_phone", "")
        self.school_email = data.get("school_email", "")

        student = data.get("student", {})
        self.student_name = student.get("student_name", student.get("name", "Unknown"))
        self.class_name = student.get("class_name", "")
        self.student_id = student.get("id", "")

        self.fees = data.get("fees", [])
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None

    def build(self, buffer: BytesIO) -> None:
        """Build the PDF fee receipt into the given buffer."""
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

        # School header
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

        # Receipt title
        title_style = ParagraphStyle(
            "ReceiptTitle",
            parent=self.styles["Heading1"],
            fontSize=16,
            textColor=self.PRIMARY_COLOR,
            alignment=TA_CENTER,
            spaceAfter=10,
        )
        elements.append(Paragraph("FEE PAYMENT RECEIPT", title_style))

        # Receipt info (number, date)
        elements.extend(self._build_receipt_info())
        elements.append(Spacer(1, 8))

        # Student info
        elements.extend(self._build_student_info())
        elements.append(Spacer(1, 12))

        # Fee breakdown table
        elements.extend(self._build_fee_table())
        elements.append(Spacer(1, 12))

        # Payment summary
        elements.extend(self._build_payment_summary())
        elements.append(Spacer(1, 16))

        # Terms
        elements.extend(self._build_terms())
        elements.append(Spacer(1, 20))

        # Signature
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
                "SchoolAddr",
                parent=self.styles["Normal"],
                fontSize=9,
                textColor=colors.grey,
                alignment=TA_CENTER,
            )
            elements.append(
                Paragraph(
                    f"{self.school_address} | {self.school_phone} | {self.school_email}",
                    addr_style,
                )
            )

        return elements

    def _build_receipt_info(self) -> list:
        elements = []

        # Generate receipt number from first fee record
        first_fee = self.fees[0] if self.fees else {}
        receipt_no = first_fee.get(
            "invoice_no", f"RCP-{datetime.now().strftime('%Y%m%d%H%M')}"
        )

        info_style = ParagraphStyle(
            "ReceiptInfo",
            parent=self.styles["Normal"],
            fontSize=10,
        )
        bold_style = ParagraphStyle(  # noqa: F841
            "ReceiptInfoBold",
            parent=self.styles["Normal"],
            fontSize=10,
            fontName="Helvetica-Bold",
        )

        info_table = Table(
            [
                [
                    Paragraph(f"<b>Receipt No:</b> {receipt_no}", info_style),
                    Paragraph(
                        f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y')}",
                        info_style,
                    ),
                ],
            ],
            colWidths=[280, 240],
        )

        info_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )

        elements.append(info_table)
        return elements

    def _build_student_info(self) -> list:
        elements = []

        label_style = ParagraphStyle(
            "InfoLabel",
            parent=self.styles["Normal"],
            fontSize=10,
            fontName="Helvetica-Bold",
            textColor=self.PRIMARY_COLOR,
        )
        value_style = ParagraphStyle(
            "InfoValue",
            parent=self.styles["Normal"],
            fontSize=10,
        )

        info_data = [
            [
                Paragraph("Student Name:", label_style),
                Paragraph(self.student_name, value_style),
                Paragraph("Student ID:", label_style),
                Paragraph(str(self.student_id), value_style),
            ],
            [
                Paragraph("Class:", label_style),
                Paragraph(self.class_name, value_style),
                Paragraph("Academic Year:", label_style),
                Paragraph(self.data.get("academic_year", "2024-2025"), value_style),
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

    def _build_fee_table(self) -> list:
        elements = []

        section_style = ParagraphStyle(
            "SectionTitle",
            parent=self.styles["Heading2"],
            fontSize=12,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=6,
        )
        elements.append(Paragraph("Fee Breakdown", section_style))

        header = [
            "#",
            "Fee Type",
            "Due Date",
            "Amount (₹)",
            "Paid (₹)",
            "Balance (₹)",
            "Status",
        ]
        table_data = [header]

        for idx, fee in enumerate(self.fees, 1):
            status = fee.get("status", "pending")
            table_data.append(
                [
                    str(idx),
                    fee.get("fee_type", "N/A"),
                    fee.get("due_date", "N/A"),
                    f"₹{self._format_amount(fee.get('amount', 0))}",
                    f"₹{self._format_amount(fee.get('paid', 0))}",
                    f"₹{self._format_amount(fee.get('balance', 0))}",
                    status.upper(),
                ]
            )

        col_widths = [25, 100, 70, 75, 75, 75, 65]
        table = Table(table_data, colWidths=col_widths)

        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), self.PRIMARY_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("ALIGN", (0, 1), (0, -1), "CENTER"),
            ("ALIGN", (3, 1), (5, -1), "RIGHT"),
            ("ALIGN", (6, 1), (6, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, self.BORDER_COLOR),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]

        # Status color coding
        for i in range(1, len(table_data)):
            status = table_data[i][-1].lower()
            color = self.STATUS_COLORS.get(status, colors.black)
            style_commands.append(("TEXTCOLOR", (-1, i), (-1, i), color))
            style_commands.append(("FONTNAME", (-1, i), (-1, i), "Helvetica-Bold"))

            if i % 2 == 0:
                style_commands.append(("BACKGROUND", (0, i), (-1, i), self.ROW_ALT_BG))

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_payment_summary(self) -> list:
        elements = []

        total_amount = sum(float(f.get("amount", 0)) for f in self.fees)
        total_paid = sum(float(f.get("paid", 0)) for f in self.fees)
        total_balance = sum(float(f.get("balance", 0)) for f in self.fees)

        # Overall status
        if total_balance == 0:
            overall_status = "FULLY PAID"
        elif total_paid > 0:
            overall_status = "PARTIALLY PAID"
        else:
            overall_status = "UNPAID"

        summary_data = [
            ["Total Fee Amount", f"₹{self._format_amount(total_amount)}"],
            ["Total Paid", f"₹{self._format_amount(total_paid)}"],
            ["Balance Due", f"₹{self._format_amount(total_balance)}"],
            ["Payment Status", overall_status],
        ]

        label_style = ParagraphStyle(
            "SumLabel",
            parent=self.styles["Normal"],
            fontSize=10,
            fontName="Helvetica-Bold",
        )
        value_style = ParagraphStyle(
            "SumValue",
            parent=self.styles["Normal"],
            fontSize=10,
            alignment=TA_RIGHT,
        )

        table_data = []
        for row in summary_data:
            table_data.append(
                [
                    Paragraph(row[0], label_style),
                    Paragraph(row[1], value_style),
                ]
            )

        table = Table(table_data, colWidths=[300, 200])

        style_commands = [
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, self.BORDER_COLOR),
            ("BOX", (0, 0), (-1, -1), 1, self.BORDER_COLOR),
            ("BACKGROUND", (0, -1), (-1, -1), self.HEADER_BG),
        ]

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        return elements

    def _build_terms(self) -> list:
        elements = []

        terms_title = ParagraphStyle(
            "TermsTitle",
            parent=self.styles["Heading3"],
            fontSize=9,
            textColor=self.PRIMARY_COLOR,
            spaceAfter=4,
        )
        elements.append(Paragraph("Terms & Conditions", terms_title))

        terms_style = ParagraphStyle(
            "Terms",
            parent=self.styles["Normal"],
            fontSize=7,
            textColor=colors.grey,
            leading=10,
        )
        terms = [
            "1. This receipt is computer-generated and valid without signature.",
            "2. Fees once paid are non-refundable unless stated otherwise.",
            "3. Late payment may attract additional charges as per school policy.",
            "4. Please retain this receipt for your records.",
        ]
        for term in terms:
            elements.append(Paragraph(term, terms_style))

        return elements

    def _build_signatures(self) -> list:
        elements = []

        sig_style = ParagraphStyle(
            "Signature",
            parent=self.styles["Normal"],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER,
        )

        sig_data = [
            [
                Paragraph("_________________<br/>Accounts Department", sig_style),
                Paragraph("_________________<br/>Received By", sig_style),
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
                f"Generated by SchoolOS on {datetime.now().strftime('%d-%m-%Y %H:%M')} | This is a computer-generated receipt",
                footer_style,
            )
        )
        return elements

    @staticmethod
    def _format_amount(amount) -> str:
        """Format amount with commas (Indian numbering)."""
        try:
            amt = float(amount)
            if amt == int(amt):
                return f"{int(amt):,}"
            return f"{amt:,.2f}"
        except (ValueError, TypeError):
            return str(amount)
