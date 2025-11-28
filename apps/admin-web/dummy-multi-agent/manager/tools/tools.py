"""
Tools for School Management Multi-Agent System
================================================
Includes email notification tool with Gmail SMTP integration.
"""

import os
import smtplib
import re
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

EMAIL_SENDER = os.getenv("EMAIL_SENDER", "abhishekl1792005@gmail.com")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD", "nshmknprzjypkorf")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# ============================================================================
# TIME TOOL
# ============================================================================


def get_current_time() -> dict:
    """
    Get the current time in the format YYYY-MM-DD HH:MM:SS
    """
    return {
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


# ============================================================================
# EMAIL EXTRACTION HELPER
# ============================================================================


def extract_emails_from_text(text: str) -> List[str]:
    """
    Extract all email addresses from a given text.

    Args:
        text: String containing potential email addresses

    Returns:
        List of unique valid email addresses
    """
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    emails = re.findall(email_pattern, text)
    return list(set(emails))  # Remove duplicates


def extract_student_info_from_context(context: str) -> List[Dict[str, str]]:
    """
    Extract student information (name, email) from conversation context.

    Args:
        context: Conversation history or agent response text

    Returns:
        List of dictionaries with student name and email
    """
    students = []

    # Try to match emails with names
    # Pattern: "Name Something" followed by email or email followed by name
    lines = context.split("\n")

    for line in lines:
        email_matches = re.findall(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", line
        )
        if email_matches:
            # Try to find name in the same line
            # Common patterns: "Name: Xyz" or "Student: Xyz" or just "Xyz"
            name_match = re.search(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", line)
            if name_match:
                students.append(
                    {"name": name_match.group(1), "email": email_matches[0]}
                )
            else:
                students.append({"name": "Student", "email": email_matches[0]})

    return students


# ============================================================================
# MAIN EMAIL TOOL
# ============================================================================


def send_bulk_email(
    recipients: List[str],
    subject: str,
    body: str,
    context: Optional[str] = None,
    email_type: str = "general",
) -> Dict[str, any]:
    """
    Send bulk emails to multiple recipients using Gmail SMTP.

    Args:
        recipients: List of email addresses
        subject: Email subject line
        body: Email body content
        context: Optional context for personalizing emails
        email_type: Type of email (attendance, fees, marks, general)

    Returns:
        Dictionary with success status and details
    """
    try:
        # Validate recipients
        if not recipients:
            return {
                "success": False,
                "message": "No recipients provided",
                "sent_count": 0,
                "failed": [],
            }

        # Clean and validate email addresses
        valid_recipients = []
        invalid_recipients = []

        for email in recipients:
            email = email.strip()
            if re.match(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$", email):
                valid_recipients.append(email)
            else:
                invalid_recipients.append(email)

        if not valid_recipients:
            return {
                "success": False,
                "message": "No valid email addresses found",
                "sent_count": 0,
                "failed": invalid_recipients,
            }

        # Connect to Gmail SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_APP_PASSWORD)

        sent_count = 0
        failed_recipients = []

        # Send to each recipient
        for recipient in valid_recipients:
            try:
                msg = MIMEMultipart()
                msg["From"] = f"SchoolOS <{EMAIL_SENDER}>"
                msg["To"] = recipient
                msg["Subject"] = subject

                # Attach body
                msg.attach(MIMEText(body, "plain"))

                # Send email
                server.sendmail(EMAIL_SENDER, recipient, msg.as_string())
                sent_count += 1

            except Exception as e:
                failed_recipients.append(f"{recipient} ({str(e)})")

        # Close connection
        server.quit()

        # Prepare response
        if sent_count == len(valid_recipients):
            return {
                "success": True,
                "message": f"✅ Successfully sent {sent_count} email(s)",
                "sent_count": sent_count,
                "recipients": valid_recipients,
                "failed": invalid_recipients,
            }
        else:
            return {
                "success": False,
                "message": f"⚠️ Sent {sent_count}/{len(valid_recipients)} emails. Some failed.",
                "sent_count": sent_count,
                "recipients": valid_recipients,
                "failed": failed_recipients + invalid_recipients,
            }

    except smtplib.SMTPAuthenticationError:
        return {
            "success": False,
            "message": "❌ Email authentication failed. Check EMAIL_APP_PASSWORD in .env",
            "sent_count": 0,
            "failed": recipients,
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"❌ Failed to send emails: {str(e)}",
            "sent_count": 0,
            "failed": recipients,
        }


# ============================================================================
# EMAIL TEMPLATE GENERATORS
# ============================================================================


def generate_attendance_email(
    student_name: str, attendance_pct: float, details: str = ""
) -> tuple:
    """Generate attendance alert email content."""
    subject = f"Attendance Alert - {student_name}"

    body = f"""Dear Parent/Guardian,

This is an automated notification regarding your ward's attendance.

Student Name: {student_name}
Current Attendance: {attendance_pct}%
Status: {"⚠️ Below Required Threshold (75%)" if attendance_pct < 75 else "✅ Satisfactory"}

{details}

Consistent attendance is crucial for academic success. Please ensure your ward attends school regularly.

If there are any concerns or special circumstances, please contact the school administration.

Best regards,
School Administration Team
SchoolOS - Smart School Management System

---
This is an automated message. Please do not reply to this email.
For queries, contact: admin@school.com"""

    return subject, body


def generate_fee_reminder_email(
    student_name: str, amount_due: float, due_date: str, details: str = ""
) -> tuple:
    """Generate fee payment reminder email content."""
    subject = f"Fee Payment Reminder - {student_name}"

    body = f"""Dear Parent/Guardian,

This is a reminder regarding pending fee payment for your ward.

Student Name: {student_name}
Amount Due: ₹{amount_due:,.2f}
Due Date: {due_date}
Status: Payment Pending

{details}

Please make the payment at the earliest to avoid any inconvenience.

Payment Methods:
- Online: Visit school portal at portal.school.com
- Offline: Visit accounts office during working hours
- UPI: schoolfees@upi

For any clarifications, please contact the accounts department.

Best regards,
Accounts Department
SchoolOS - Smart School Management System

---
This is an automated message. Please do not reply to this email.
For queries, contact: accounts@school.com"""

    return subject, body


def generate_marks_notification_email(
    student_name: str, subject_name: str, marks: float, grade: str, details: str = ""
) -> tuple:
    """Generate academic performance notification email content."""
    subject_line = f"Academic Performance Update - {student_name}"

    body = f"""Dear Parent/Guardian,

This is a notification regarding your ward's recent academic performance.

Student Name: {student_name}
Subject: {subject_name}
Marks Obtained: {marks}
Grade: {grade}

{details}

We encourage parents to discuss the performance with their ward and provide necessary support.

For detailed academic counseling, please schedule a meeting with the class teacher.

Best regards,
Academic Team
SchoolOS - Smart School Management System

---
This is an automated message. Please do not reply to this email.
For queries, contact: academics@school.com"""

    return subject_line, body


def generate_general_notification_email(subject_line: str, message: str) -> tuple:
    """Generate general notification email content."""
    body = f"""Dear Parent/Guardian,

{message}

For any questions or concerns, please contact the school administration.

Best regards,
School Administration Team
SchoolOS - Smart School Management System

---
This is an automated message. Please do not reply to this email.
For queries, contact: admin@school.com"""

    return subject_line, body


# ============================================================================
# SMART EMAIL DISPATCHER
# ============================================================================


def send_smart_email(
    email_type: str, recipients: List[str], context_data: Dict[str, any] = None
) -> Dict[str, any]:
    """
    Smart email dispatcher that generates appropriate content based on email type.

    Args:
        email_type: Type of email (attendance, fees, marks, general)
        recipients: List of recipient email addresses
        context_data: Dictionary containing relevant data for email generation

    Returns:
        Result dictionary from send_bulk_email
    """
    context_data = context_data or {}

    if email_type == "attendance":
        student_name = context_data.get("student_name", "Student")
        attendance_pct = context_data.get("attendance_pct", 0)
        details = context_data.get("details", "")
        subject, body = generate_attendance_email(student_name, attendance_pct, details)

    elif email_type == "fees":
        student_name = context_data.get("student_name", "Student")
        amount_due = context_data.get("amount_due", 0)
        due_date = context_data.get("due_date", "N/A")
        details = context_data.get("details", "")
        subject, body = generate_fee_reminder_email(
            student_name, amount_due, due_date, details
        )

    elif email_type == "marks":
        student_name = context_data.get("student_name", "Student")
        subject_name = context_data.get("subject_name", "Subject")
        marks = context_data.get("marks", 0)
        grade = context_data.get("grade", "N/A")
        details = context_data.get("details", "")
        subject, body = generate_marks_notification_email(
            student_name, subject_name, marks, grade, details
        )

    else:  # general
        subject = context_data.get("subject", "School Notification")
        message = context_data.get(
            "message", "This is a general notification from the school."
        )
        subject, body = generate_general_notification_email(subject, message)

    return send_bulk_email(recipients, subject, body, email_type=email_type)


# ============================================================================
# TOOL EXPORT FOR AGENTS
# ============================================================================

__all__ = [
    "get_current_time",
    "send_bulk_email",
    "send_smart_email",
    "extract_emails_from_text",
    "extract_student_info_from_context",
    "generate_attendance_email",
    "generate_fee_reminder_email",
    "generate_marks_notification_email",
    "generate_general_notification_email",
]
