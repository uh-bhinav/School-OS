"""
Email Workflow Manager
======================
Human-in-the-loop email approval system for SchoolOS.

Workflow:
  1. User requests email send → Agent creates draft
  2. Agent presents draft for review → User sees recipients, subject, body
  3. User approves / edits / rejects → Agent acts accordingly
  4. Only on approval does email get sent

States:
  - DRAFT_PENDING: Email drafted, awaiting user review
  - APPROVED: User approved, ready to send
  - EDITING: User is editing the draft
  - REJECTED: User rejected, workflow cancelled
  - SENT: Email successfully sent
  - FAILED: Send attempt failed
"""

import uuid
import logging
import smtplib
import re
from datetime import datetime
from typing import List, Dict, Optional, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from enum import Enum

logger = logging.getLogger(__name__)


# ============================================================================
# EMAIL CONFIGURATION (shared with agents.py)
# ============================================================================
EMAIL_SENDER = "abhishekl1792005@gmail.com"
EMAIL_APP_PASSWORD = "nshmknprzjypkorf"


# ============================================================================
# DRAFT STATE ENUM
# ============================================================================


class DraftStatus(str, Enum):
    DRAFT_PENDING = "pending_approval"
    APPROVED = "approved"
    EDITING = "editing"
    REJECTED = "rejected"
    SENT = "sent"
    FAILED = "failed"


# ============================================================================
# IN-MEMORY DRAFT STORAGE
# ============================================================================

# { draft_id: { ...draft_data } }
email_drafts: Dict[str, Dict[str, Any]] = {}

# { session_id: draft_id } — tracks the active pending draft per session
session_pending_drafts: Dict[str, str] = {}


# ============================================================================
# APPROVAL / REJECTION KEYWORD DETECTION
# ============================================================================

APPROVAL_KEYWORDS = [
    "approve",
    "approved",
    "send it",
    "looks good",
    "yes send",
    "go ahead",
    "confirm",
    "send the email",
    "send email",
    "yes",
    "lgtm",
    "send them",
    "ok send",
    "okay send",
    "please send",
    "do it",
    "proceed",
    "ship it",
]

REJECTION_KEYWORDS = [
    "cancel",
    "don't send",
    "dont send",
    "reject",
    "no",
    "stop",
    "abort",
    "nevermind",
    "never mind",
    "discard",
    "scratch that",
    "forget it",
    "cancel email",
]

EDIT_KEYWORDS = [
    "change subject",
    "change body",
    "edit subject",
    "edit body",
    "update subject",
    "update body",
    "modify",
    "change the",
    "edit the",
    "update the",
    "rewrite",
]


def is_approval(message: str) -> bool:
    """Check if user message indicates approval."""
    msg_lower = message.lower().strip()
    return any(kw in msg_lower for kw in APPROVAL_KEYWORDS)


def is_rejection(message: str) -> bool:
    """Check if user message indicates rejection."""
    msg_lower = message.lower().strip()
    return any(kw in msg_lower for kw in REJECTION_KEYWORDS)


def is_edit_request(message: str) -> bool:
    """Check if user message indicates an edit to the draft."""
    msg_lower = message.lower().strip()
    return any(kw in msg_lower for kw in EDIT_KEYWORDS)


# ============================================================================
# CONTEXT DETECTION
# ============================================================================


def detect_email_context(message: str, history: List[Dict]) -> str:
    """
    Determine email context from the conversation.

    Returns:
        Context string like "attendance alert", "fee payment reminder", etc.
    """
    combined = message.lower()
    for msg in history[-10:]:
        combined += " " + msg.get("content", "").lower()

    if "attendance" in combined:
        return "attendance alert"
    elif any(w in combined for w in ["fee", "payment", "dues", "overdue", "unpaid"]):
        return "fee payment reminder"
    elif any(w in combined for w in ["marks", "grade", "performance", "score", "exam"]):
        return "academic performance update"
    elif "leave" in combined:
        return "leave request update"
    elif "event" in combined or "annual" in combined:
        return "school event notification"
    else:
        return "school update"


def extract_emails_from_history(history: List[Dict]) -> List[str]:
    """
    Extract unique email addresses from conversation history.

    Returns:
        List of unique, valid email addresses.
    """
    emails: List[str] = []
    for msg in history:
        content = msg.get("content", "")
        found = re.findall(r"[\w\.\-\+]+@[\w\.\-]+\.\w+", content)
        emails.extend(found)

    # Deduplicate while preserving order
    seen = set()
    unique: List[str] = []
    for email in emails:
        email_lower = email.lower()
        if email_lower not in seen and email_lower != EMAIL_SENDER.lower():
            seen.add(email_lower)
            unique.append(email)

    return unique


# ============================================================================
# EMAIL CONTENT GENERATION
# ============================================================================


def generate_email_content(
    context: str,
    recipients: List[str],
    history: List[Dict],
    custom_body: Optional[str] = None,
) -> tuple:
    """
    Generate email subject and body based on context.

    Args:
        context: Email context (e.g. "attendance alert")
        recipients: List of recipient emails
        history: Conversation history
        custom_body: Optional custom body text

    Returns:
        (subject, body) tuple
    """
    subject = f"School Notification — {context.title()}"

    if custom_body:
        body = custom_body
    else:
        body = _build_email_body(context, history)

    return subject, body


def _build_email_body(context: str, history: List[Dict]) -> str:
    """Build a professional email body from context."""
    templates = {
        "attendance alert": (
            "Dear Parent/Guardian,\n\n"
            "This is to inform you about your ward's attendance status. "
            "We have noticed patterns that require your attention.\n\n"
            "We request you to ensure regular attendance as per school policy. "
            "Consistent attendance is crucial for academic performance.\n\n"
            "Please contact the school administration for details or clarifications.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
        "fee payment reminder": (
            "Dear Parent/Guardian,\n\n"
            "This is a reminder regarding pending fee payments for your ward. "
            "Kindly review the outstanding balance and arrange for payment at your earliest convenience.\n\n"
            "You can make payments online through the parent portal or visit the school accounts office.\n\n"
            "For any queries regarding fee structure or payment plans, "
            "please reach out to our accounts department.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
        "academic performance update": (
            "Dear Parent/Guardian,\n\n"
            "We would like to share an update on your ward's academic performance. "
            "Please review the enclosed details and feel free to schedule a "
            "parent-teacher meeting for further discussion.\n\n"
            "We believe in a collaborative approach to help each student achieve their best.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
        "leave request update": (
            "Dear Staff Member,\n\n"
            "This is an update regarding your leave request. "
            "Please check the school portal for the current status.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
        "school event notification": (
            "Dear Parent/Guardian,\n\n"
            "We are excited to inform you about an upcoming school event. "
            "Please find the details below and ensure your ward's participation.\n\n"
            "We look forward to your support and presence.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
    }

    return templates.get(
        context,
        (
            "Dear Parent/Guardian,\n\n"
            "This is an automated notification from the school administration. "
            "Please check the parent portal for detailed information.\n\n"
            "Warm regards,\n"
            "School Administration\n"
            "SchoolOS — Smart School Management"
        ),
    )


# ============================================================================
# DRAFT CRUD OPERATIONS
# ============================================================================


def create_email_draft(
    recipients: List[str],
    subject: str,
    body: str,
    context: str,
    session_id: str,
) -> Dict[str, Any]:
    """
    Create an email draft and store it for approval.

    Args:
        recipients: List of email addresses
        subject: Email subject line
        body: Email body text
        context: Context string (e.g. "attendance alert")
        session_id: Backend session ID

    Returns:
        Draft metadata dict with unique draft_id.
    """
    draft_id = f"draft_{uuid.uuid4().hex[:8]}"

    draft = {
        "draft_id": draft_id,
        "session_id": session_id,
        "recipients": recipients,
        "subject": subject,
        "body": body,
        "context": context,
        "created_at": datetime.now().isoformat(),
        "status": DraftStatus.DRAFT_PENDING,
        "approved_by": None,
        "sent_at": None,
        "error": None,
    }

    email_drafts[draft_id] = draft
    session_pending_drafts[session_id] = draft_id

    logger.info(
        f"Email draft created: {draft_id} | "
        f"recipients={len(recipients)} | context={context}"
    )

    return draft


def get_pending_draft(session_id: str) -> Optional[Dict[str, Any]]:
    """Get the pending draft for a session, if any."""
    draft_id = session_pending_drafts.get(session_id)
    if not draft_id:
        return None

    draft = email_drafts.get(draft_id)
    if not draft or draft["status"] != DraftStatus.DRAFT_PENDING:
        # Clean up stale reference
        session_pending_drafts.pop(session_id, None)
        return None

    return draft


def approve_draft(draft_id: str, user_id: str = "admin") -> Dict[str, Any]:
    """
    Mark a draft as approved and ready to send.

    Args:
        draft_id: The draft identifier
        user_id: Who approved it (default "admin")

    Returns:
        Updated draft dict.
    """
    draft = email_drafts.get(draft_id)
    if not draft:
        return {"status": "error", "message": f"Draft {draft_id} not found"}

    if draft["status"] != DraftStatus.DRAFT_PENDING:
        return {
            "status": "error",
            "message": f"Draft is in '{draft['status']}' state, cannot approve",
        }

    draft["status"] = DraftStatus.APPROVED
    draft["approved_by"] = user_id
    logger.info(f"Draft {draft_id} approved by {user_id}")

    return draft


def reject_draft(draft_id: str, reason: str = "User rejected") -> Dict[str, Any]:
    """
    Mark a draft as rejected and cancel the workflow.

    Args:
        draft_id: The draft identifier
        reason: Rejection reason

    Returns:
        Updated draft dict.
    """
    draft = email_drafts.get(draft_id)
    if not draft:
        return {"status": "error", "message": f"Draft {draft_id} not found"}

    draft["status"] = DraftStatus.REJECTED
    draft["error"] = reason

    # Clean up session reference
    session_id = draft.get("session_id")
    if session_id:
        session_pending_drafts.pop(session_id, None)

    logger.info(f"Draft {draft_id} rejected: {reason}")
    return draft


def update_draft(
    draft_id: str,
    subject: Optional[str] = None,
    body: Optional[str] = None,
    recipients: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Update an existing draft (edit capability).

    Args:
        draft_id: The draft identifier
        subject: New subject (optional)
        body: New body (optional)
        recipients: New recipients list (optional)

    Returns:
        Updated draft dict.
    """
    draft = email_drafts.get(draft_id)
    if not draft:
        return {"status": "error", "message": f"Draft {draft_id} not found"}

    if draft["status"] not in (DraftStatus.DRAFT_PENDING, DraftStatus.EDITING):
        return {
            "status": "error",
            "message": f"Draft is in '{draft['status']}' state, cannot edit",
        }

    if subject is not None:
        draft["subject"] = subject
    if body is not None:
        draft["body"] = body
    if recipients is not None:
        draft["recipients"] = recipients

    draft["status"] = DraftStatus.DRAFT_PENDING  # Back to pending after edit

    logger.info(f"Draft {draft_id} updated")
    return draft


# ============================================================================
# EMAIL SENDING
# ============================================================================


def send_approved_draft(draft_id: str) -> Dict[str, Any]:
    """
    Send an approved email draft via SMTP.

    Args:
        draft_id: The draft identifier

    Returns:
        Result dict with status and details.
    """
    draft = email_drafts.get(draft_id)
    if not draft:
        return {"status": "error", "message": f"Draft {draft_id} not found"}

    # Auto-approve if still pending (for the approve-then-send flow)
    if draft["status"] == DraftStatus.DRAFT_PENDING:
        draft["status"] = DraftStatus.APPROVED
        draft["approved_by"] = "admin"

    if draft["status"] != DraftStatus.APPROVED:
        return {
            "status": "error",
            "message": f"Draft must be approved first (current: {draft['status']})",
        }

    try:
        recipients = draft["recipients"]
        subject = draft["subject"]
        body = draft["body"]

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_APP_PASSWORD)

        msg = MIMEMultipart()
        msg["From"] = EMAIL_SENDER
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server.sendmail(EMAIL_SENDER, recipients, msg.as_string())
        server.quit()

        draft["status"] = DraftStatus.SENT
        draft["sent_at"] = datetime.now().isoformat()

        # Clean up session reference
        session_id = draft.get("session_id")
        if session_id:
            session_pending_drafts.pop(session_id, None)

        logger.info(f"Draft {draft_id} sent to {len(recipients)} recipients")

        return {
            "status": "success",
            "draft_id": draft_id,
            "recipients_count": len(recipients),
            "recipients": recipients,
            "subject": subject,
        }

    except Exception as e:
        draft["status"] = DraftStatus.FAILED
        draft["error"] = str(e)
        logger.exception(f"Failed to send draft {draft_id}: {e}")

        return {
            "status": "error",
            "draft_id": draft_id,
            "message": f"Failed to send email: {str(e)}",
        }


def clear_session_draft(session_id: str) -> None:
    """Remove pending draft reference for a session."""
    session_pending_drafts.pop(session_id, None)


# ============================================================================
# HELPER: FORMAT DRAFT FOR RESPONSE
# ============================================================================


def format_draft_for_response(draft: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a draft into a structured response the frontend can render.

    Returns a dict matching the email_draft response schema.
    """
    recipient_preview = draft["recipients"][:3]
    more = len(draft["recipients"]) - 3

    recipient_display = ", ".join(recipient_preview)
    if more > 0:
        recipient_display += f" (+{more} more)"

    return {
        "message_type": "email_approval_required",
        "email_draft": {
            "draft_id": draft["draft_id"],
            "recipients": draft["recipients"],
            "recipient_count": len(draft["recipients"]),
            "subject": draft["subject"],
            "body": draft["body"],
            "context": draft["context"],
            "status": draft["status"],
            "created_at": draft["created_at"],
        },
        "actions": [
            {"label": "Approve & Send", "action": "approve_draft"},
            {"label": "Edit Draft", "action": "edit_draft"},
            {"label": "Cancel", "action": "reject_draft"},
        ],
    }


# ============================================================================
# MAIN WORKFLOW HANDLER
# ============================================================================


def handle_email_workflow(
    message: str,
    history: List[Dict],
    session_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Main entry point for the email workflow.

    Called by agents.py to handle email-related messages.
    Returns a structured response dict, or None if this message
    is not part of an email workflow.

    Args:
        message: User's current message
        history: Conversation history
        session_id: Backend session ID

    Returns:
        Response dict with message, bullets, email_draft, etc.
        Or None if not handled.
    """
    # ----------------------------------------------------------------
    # Step 1: Check if there's a pending draft for this session
    # ----------------------------------------------------------------
    pending_draft = get_pending_draft(session_id)

    if pending_draft:
        draft_id = pending_draft["draft_id"]

        # Handle APPROVAL
        if is_approval(message):
            result = send_approved_draft(draft_id)

            if result["status"] == "success":
                return {
                    "message": (
                        "### ✅ Emails Sent Successfully\n\n"
                        f"**Recipients:** {result['recipients_count']} people\n\n"
                        f"**Subject:** {result['subject']}\n\n"
                        "All emails have been delivered."
                    ),
                    "agent_id": "email_agent",
                    "email_status": "sent",
                }
            else:
                return {
                    "message": (
                        "### ❌ Email Send Failed\n\n"
                        f"{result.get('message', 'Unknown error')}\n\n"
                        "Please try again or check email configuration."
                    ),
                    "agent_id": "email_agent",
                    "email_status": "failed",
                }

        # Handle REJECTION
        elif is_rejection(message):
            reject_draft(draft_id)
            return {
                "message": (
                    "### 🚫 Email Cancelled\n\n"
                    "The email draft has been discarded. "
                    "No emails were sent."
                ),
                "agent_id": "email_agent",
                "email_status": "rejected",
            }

        # Handle EDIT
        elif is_edit_request(message):
            msg_lower = message.lower()

            # Extract new subject
            subject_match = re.search(
                r"(?:change|edit|update)\s+(?:the\s+)?subject\s+to\s+['\"]?(.+?)['\"]?\s*$",
                msg_lower,
            )
            new_subject = None
            if subject_match:
                new_subject = subject_match.group(1).strip().strip("'\"")
                # Capitalize properly
                new_subject = (
                    new_subject.title() if len(new_subject) < 60 else new_subject
                )

            # Extract new body
            body_match = re.search(
                r"(?:change|edit|update)\s+(?:the\s+)?body\s+to\s+['\"]?(.+?)['\"]?\s*$",
                msg_lower,
                re.DOTALL,
            )
            new_body = body_match.group(1).strip().strip("'\"") if body_match else None

            updated = update_draft(
                draft_id,
                subject=new_subject,
                body=new_body,
            )

            if isinstance(updated, dict) and updated.get("status") == "error":
                return {
                    "message": f"### ⚠️ Edit Failed\n\n{updated['message']}",
                    "agent_id": "email_agent",
                }

            # Show updated draft for re-approval
            draft_response = format_draft_for_response(updated)

            changes = []
            if new_subject:
                changes.append(f"Subject → **{new_subject}**")
            if new_body:
                changes.append("Body updated")

            return {
                "message": (
                    "### ✏️ Draft Updated\n\n"
                    + "\n".join(f"- {c}" for c in changes)
                    + "\n\nPlease review and approve, or continue editing."
                ),
                "agent_id": "email_agent",
                **draft_response,
            }

    # ----------------------------------------------------------------
    # Step 2: Check if this is a NEW email request
    # ----------------------------------------------------------------
    query_lower = message.lower()
    email_triggers = [
        "send email",
        "send mail",
        "email them",
        "mail them",
        "notify them",
        "send notification",
        "email to",
        "mail to",
        "send a reminder",
        "send reminder",
    ]

    is_email_request = any(trigger in query_lower for trigger in email_triggers)

    # Also check for looser triggers if emails exist in history
    if not is_email_request:
        loose_triggers = ["email", "send", "notify", "reminder"]
        if any(w in query_lower for w in loose_triggers):
            # Only trigger if we can find emails in conversation
            test_emails = extract_emails_from_history(history)
            if test_emails:
                is_email_request = True

    if not is_email_request:
        return None  # Not an email workflow message

    # Extract recipients
    recipients = extract_emails_from_history(history)

    if not recipients:
        return {
            "message": (
                "### 📧 No Recipients Found\n\n"
                "I couldn't find any email addresses in our conversation.\n\n"
                "**To send emails, please first:**\n"
                '- Query for student/staff data (e.g., "Show students with low attendance")\n'
                "- Then ask me to send emails to them\n\n"
                "The email addresses will be extracted from the data."
            ),
            "agent_id": "email_agent",
        }

    # Detect context and generate draft
    context = detect_email_context(message, history)
    subject, body = generate_email_content(context, recipients, history)

    # Create draft (don't send!)
    draft = create_email_draft(
        recipients=recipients,
        subject=subject,
        body=body,
        context=context,
        session_id=session_id,
    )

    # Format for frontend
    draft_response = format_draft_for_response(draft)

    return {
        "message": (
            "### 📧 Email Draft Ready for Review\n\n"
            f"**Recipients:** {len(recipients)} people\n\n"
            f"**Subject:** {subject}\n\n"
            f"**Context:** {context.title()}\n\n"
            "---\n\n"
            f"**Preview:**\n\n{body}\n\n"
            "---\n\n"
            "**Reply with:**\n"
            '- **"Approve"** or **"Send it"** to send\n'
            '- **"Cancel"** to discard\n'
            '- **"Change subject to ..."** to edit'
        ),
        "agent_id": "email_agent",
        "awaiting_approval": True,
        **draft_response,
    }
