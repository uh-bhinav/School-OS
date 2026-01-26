# backend/app/services/pdf_service.py

import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .. import schemas


async def create_report_card_pdf(report_data: schemas.ReportCard) -> bytes:
    """
    Generates a report card PDF from the ReportCard schema data.
    """
    buffer = io.BytesIO()
    # Set up the PDF document
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch)

    elements = []  # A list to hold all our PDF elements (text, tables, etc.)
    styles = getSampleStyleSheet()

    # --- 1. Add Title and Student Info ---
    elements.append(Paragraph("Report Card", styles["h1"]))
    elements.append(Spacer(1, 0.1 * inch))
    # Using 'Normal' style but with inline HTML-like tags for bolding
    elements.append(Paragraph(f"<b>Student:</b> {report_data.student_name}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Class:</b> {report_data.class_name}", styles["Normal"]))
    elements.append(Spacer(1, 0.2 * inch))  # Add some empty space

    # --- 2. Loop through each Exam Summary ---
    for exam in report_data.exam_summaries:
        elements.append(Paragraph(exam.exam_name, styles["h2"]))

        # 2a. Create table data for subjects in this exam
        table_data = [["Subject", "Marks Obtained", "Max Marks"]]  # Header Row
        for mark in exam.marks:
            table_data.append([mark.subject_name, str(mark.marks_obtained), str(mark.max_marks)])

        # 2b. Add the 'Exam Total' row
        table_data.append(["Exam Total", str(exam.total_obtained), str(exam.total_max_marks)])

        # 2c. Create and style the table
        table = Table(table_data)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),  # Header row background
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),  # Header row text
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),  # Header row font
                    ("BACKGROUND", (0, -1), (-1, -1), colors.lightgrey),  # Total row background
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),  # Total row font
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),  # Grid for all cells
                    ("ALIGN", (1, 1), (-1, -1), "CENTER"),  # Center-align numbers
                ]
            )
        )
        elements.append(table)

        # 2d. Add Exam Percentage
        if exam.percentage is not None:
            elements.append(Paragraph(f"<b>Percentage: {exam.percentage:.2f}%</b>", styles["Normal"]))

        elements.append(Spacer(1, 0.2 * inch))  # Space after each exam block

    # --- 3. Add Final Summary ---
    elements.append(Paragraph("Overall Summary", styles["h2"]))

    # Format percentage string, handling None
    overall_perc_str = f"{report_data.overall_percentage:.2f}%" if report_data.overall_percentage is not None else "N/A"

    summary_data = [["Grand Total Obtained", f"{report_data.grand_total_obtained}"], ["Grand Total Max Marks", f"{report_data.grand_total_max_marks}"], ["Overall Percentage", overall_perc_str]]

    summary_table = Table(summary_data)
    summary_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),  # Bold labels
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),  # Center-align values
            ]
        )
    )
    elements.append(summary_table)

    # --- 4. Build the PDF ---
    doc.build(elements)

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
