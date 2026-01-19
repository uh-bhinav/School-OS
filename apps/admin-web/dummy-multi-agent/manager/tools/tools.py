from datetime import datetime


def get_current_time() -> dict:
    """
    Get the current time in the format YYYY-MM-DD HH:MM:SS
    """
    return {
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def send_email_tool(recipient_email: str, subject: str, body: str) -> str:
    """
    Sends an email using Gmail SMTP.
    Useful for sending reports, analysis, or notifications to parents/staff.

    Args:
        recipient_email: Email address(es) of recipient(s).
                        Can be a single email or comma-separated emails.
                        Example: "user@example.com" or "user1@example.com, user2@example.com"
        subject: Subject line of the email
        body: Body content of the email

    Returns:
        Success or error message as string
    """
    # Import inside function to avoid serialization issues
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    SENDER_EMAIL = "abhishekl1792005@gmail.com"
    APP_PASSWORD = "nshmknprzjypkorf"

    try:
        # Parse recipient emails (handle single or comma-separated)
        recipients = [email.strip() for email in recipient_email.split(",")]

        # Setup the email server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        # Login
        server.login(SENDER_EMAIL, APP_PASSWORD)

        # Construct the message
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Send to all recipients
        server.sendmail(SENDER_EMAIL, recipients, msg.as_string())
        server.quit()

        return f"Email successfully sent to {len(recipients)} recipient(s): {', '.join(recipients)}"

    except Exception as e:
        return f"Failed to send email: {str(e)}"


tools_list = [send_email_tool, get_current_time]
