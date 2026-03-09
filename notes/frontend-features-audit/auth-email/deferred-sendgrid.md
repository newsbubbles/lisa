# Deferred: SendGrid Email Integration

**Date**: 2026-03-08  
**Status**: DEFERRED for MVP/Demo  
**Reason**: No API key yet - will configure at launch

---

## Current State

SendGrid email service exists in `backend/app/services/email.py` with methods:
- `send_email()` - Generic sender
- `send_welcome_email()` - Welcome new user
- `send_password_reset_email()` - Password reset link
- `send_estimate_email()` - Send estimate to customer

Configuration in `backend/app/core/config.py`:
```python
SENDGRID_API_KEY: str | None = None  # Not set
EMAIL_FROM: str = "noreply@lisaroofing.com"
FRONTEND_URL: str = "http://localhost:3003"
```

---

## What's Deferred

### 1. Forgot Password Flow
- Backend endpoint exists but won't send email
- Frontend page is placeholder
- **Impact**: Users can't reset password via email
- **Workaround**: Admin can reset password manually in database

### 2. Welcome Email
- Method exists but not called
- **Impact**: No welcome email on registration
- **Workaround**: None needed for demo

### 3. Email Verification
- See [deferred-email-verification.md](deferred-email-verification.md)
- Already decided to skip for demo

### 4. Send Invoice/Estimate to Customer
- Methods exist in email service
- **Impact**: Can't email invoices/estimates
- **Workaround**: Export to PDF, email manually

---

## Launch Checklist

When ready to launch:

### 1. SendGrid Account Setup
- [ ] Create SendGrid account (or use existing)
- [ ] Verify sender domain (`lisaroofing.com` or actual domain)
- [ ] Create API key with Mail Send permission
- [ ] Set up email templates in SendGrid (optional)

### 2. Environment Configuration
- [ ] Set `SENDGRID_API_KEY` in production environment
- [ ] Set `EMAIL_FROM` to verified sender address
- [ ] Set `FRONTEND_URL` to production URL

### 3. Backend Updates
- [ ] Add PasswordResetToken model (see auth-email/deeper_investigation.md)
- [ ] Add `/auth/forgot-password` endpoint
- [ ] Add `/auth/reset-password` endpoint
- [ ] Call `send_welcome_email()` in registration
- [ ] Test email delivery

### 4. Frontend Updates
- [ ] Implement ForgotPasswordPage
- [ ] Create ResetPasswordPage
- [ ] Test full flow

### 5. Email Templates
Create/customize templates for:
- [ ] Welcome email
- [ ] Password reset email
- [ ] Email verification (if implementing)
- [ ] Invoice sent notification
- [ ] Estimate sent notification

---

## SendGrid Alternatives

If SendGrid is not preferred:
- **Mailgun** - Similar API, good deliverability
- **Amazon SES** - Cheapest at scale
- **Postmark** - Best for transactional email
- **Resend** - Modern, developer-friendly

Would require updating `backend/app/services/email.py` to use different SDK.

---

## Effort Estimate (at launch)

| Task | Effort |
|------|--------|
| SendGrid setup | 0.5 day |
| Backend endpoints | 1 day |
| Frontend pages | 1 day |
| Email templates | 0.5 day |
| Testing | 0.5 day |
| **Total** | **3.5 days** |
