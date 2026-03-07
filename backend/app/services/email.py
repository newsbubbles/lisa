"""Email service using SendGrid."""

import logging
from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending transactional emails."""

    def __init__(self):
        self.client: Optional[SendGridAPIClient] = None
        if settings.SENDGRID_API_KEY:
            self.client = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        from_email: Optional[str] = None,
    ) -> bool:
        """Send an email.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            from_email: Sender email (defaults to settings.EMAIL_FROM)

        Returns:
            True if email was sent successfully
        """
        if not self.client:
            logger.warning("SendGrid not configured, skipping email")
            return False

        try:
            message = Mail(
                from_email=Email(from_email or settings.EMAIL_FROM),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content),
            )

            response = self.client.send(message)
            logger.info(f"Email sent to {to_email}, status: {response.status_code}")
            return response.status_code in (200, 201, 202)

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_welcome_email(self, to_email: str, name: str) -> bool:
        """Send welcome email to new user."""
        subject = f"Welcome to {settings.APP_NAME}!"
        html_content = f"""
        <html>
        <body>
            <h1>Welcome to {settings.APP_NAME}, {name}!</h1>
            <p>Thank you for signing up. We're excited to have you on board.</p>
            <p>Get started by:</p>
            <ul>
                <li>Adding your first contact</li>
                <li>Creating an estimate</li>
                <li>Setting up your team</li>
            </ul>
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            <p>Best regards,<br>The {settings.APP_NAME} Team</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content)

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        subject = f"Reset your {settings.APP_NAME} password"
        html_content = f"""
        <html>
        <body>
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The {settings.APP_NAME} Team</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content)

    async def send_estimate_email(
        self,
        to_email: str,
        customer_name: str,
        estimate_number: str,
        estimate_url: str,
        total: float,
    ) -> bool:
        """Send estimate to customer."""
        subject = f"Estimate {estimate_number} from {settings.APP_NAME}"
        html_content = f"""
        <html>
        <body>
            <h1>Your Estimate is Ready</h1>
            <p>Dear {customer_name},</p>
            <p>Thank you for your interest in our services. Please find your estimate below:</p>
            <p><strong>Estimate Number:</strong> {estimate_number}</p>
            <p><strong>Total:</strong> ${total:,.2f}</p>
            <p><a href="{estimate_url}">View and Approve Estimate</a></p>
            <p>This estimate is valid for 14 days.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Team</p>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content)


# Singleton instance
email_service = EmailService()
