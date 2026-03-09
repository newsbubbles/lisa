# Deferred: Email Verification on Registration

**Date**: 2026-03-08  
**Status**: DEFERRED for MVP/Demo  
**Reason**: Stakeholder decision - not needed for demo

---

## Current Behavior

In `backend/app/api/v1/endpoints/auth.py`:

```python
user = User(
    ...
    is_verified=True,  # Auto-verify for now
)
```

Users are auto-verified on registration. No email sent.

---

## Future Implementation Plan

### Backend Changes

1. **Create EmailVerificationToken model**
```python
class EmailVerificationToken(Base):
    id: UUID
    user_id: UUID
    token: str  # Secure random token
    expires_at: datetime
    verified_at: datetime | None
    created_at: datetime
```

2. **Update registration endpoint**
```python
@router.post("/register")
async def register(...):
    user = User(
        ...
        is_verified=False,  # Change to False
    )
    # Create verification token
    token = EmailVerificationToken(...)
    # Send verification email
    await email_service.send_verification_email(user.email, token.token)
```

3. **Add verify-email endpoint**
```python
@router.post("/verify-email")
async def verify_email(token: str, db: DBSession):
    # Find token, check not expired
    # Mark user as verified
    # Mark token as used
```

4. **Add resend-verification endpoint**
```python
@router.post("/resend-verification")
async def resend_verification(email: str, db: DBSession):
    # Find user by email
    # Generate new token
    # Send new email
```

### Frontend Changes

1. **Update registration flow**
   - After registration, show "Check your email" message
   - Don't auto-login until verified

2. **Create VerifyEmailPage**
   - Route: `/verify-email?token=xxx`
   - Validate token with backend
   - Show success/error
   - Redirect to login on success

3. **Add resend verification UI**
   - On login page, if user not verified
   - Show "Resend verification email" link

### Email Template

```html
Subject: Verify your Lisa account

Hi {{first_name}},

Welcome to Lisa! Please verify your email address by clicking the link below:

{{verification_link}}

This link expires in 24 hours.

If you didn't create an account, you can ignore this email.

- The Lisa Team
```

---

## When to Implement

- After demo is complete
- When ready for production launch
- When SendGrid API key is configured

---

## Effort Estimate

| Component | Effort |
|-----------|--------|
| Backend model + endpoints | 1 day |
| Email template | 0.25 day |
| Frontend pages | 0.5 day |
| Testing | 0.25 day |
| **Total** | **2 days** |
