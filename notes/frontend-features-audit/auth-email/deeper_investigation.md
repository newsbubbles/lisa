# Auth & Email Flows - Deeper Investigation

**Date**: 2026-03-07  
**Status**: Investigation Complete  
**Priority**: MEDIUM (Backend Partial, Frontend Stub)

---

## Executive Summary

The backend has **SendGrid email service** configured with helper methods, but the auth endpoints don't use them. Missing:
- Forgot password flow (backend endpoint missing)
- Email verification on registration (skipped)
- Welcome email (not sent)

---

## Current State

### Email Service (`backend/app/services/email.py`)

**Already implemented:**
- `send_email()` - Generic email sender
- `send_welcome_email()` - Welcome new user
- `send_password_reset_email()` - Password reset link
- `send_estimate_email()` - Send estimate to customer

**Configuration (`backend/app/core/config.py`):**
```python
SENDGRID_API_KEY: str | None = None
EMAIL_FROM: str = "noreply@lisaroofing.com"
FRONTEND_URL: str = "http://localhost:3003"  # For email links
```

### Auth Endpoints (`backend/app/api/v1/endpoints/auth.py`)

**Current endpoints:**
- `POST /auth/register` - Register user + org
- `POST /auth/login` - Login (JSON body)
- `POST /auth/token` - Login (OAuth2 form)
- `GET /auth/me` - Get current user

**Missing endpoints:**
- ❌ `POST /auth/forgot-password` - Request password reset
- ❌ `POST /auth/reset-password` - Reset with token
- ❌ `POST /auth/verify-email` - Verify email address
- ❌ `POST /auth/resend-verification` - Resend verification email

### Registration Flow (Current)

```python
# In auth.py register endpoint:
user = User(
    ...
    is_verified=True,  # Auto-verify for now  <-- PROBLEM
)
```

No welcome email is sent. No verification required.

---

## User Question: "MailChimp or something?"

No, the backend uses **SendGrid** for transactional emails.

**SendGrid** is appropriate for:
- Password reset emails
- Email verification
- Welcome emails
- Invoice/estimate emails
- Notification emails

**MailChimp** is for:
- Marketing campaigns
- Newsletters
- Drip campaigns

For auth flows, SendGrid is correct.

---

## Backend Implementation Needed

### 1. Password Reset Token Model

Need to store reset tokens. Options:

**Option A: Database table**
```python
class PasswordResetToken(Base):
    id: UUID
    user_id: UUID
    token: str  # Random secure token
    expires_at: datetime
    used_at: datetime | None
    created_at: datetime
```

**Option B: JWT-based token**
- Encode user_id + expiry in JWT
- No database storage needed
- Stateless but can't invalidate

**Recommendation**: Option A (database) for security - can invalidate tokens.

### 2. Forgot Password Endpoint

```python
@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: DBSession,
):
    """Request password reset email."""
    # 1. Find user by email
    # 2. Generate secure token
    # 3. Store token with expiry (1 hour)
    # 4. Send email with reset link
    # 5. Return success (don't reveal if email exists)
```

### 3. Reset Password Endpoint

```python
@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: DBSession,
):
    """Reset password with token."""
    # 1. Find token, check not expired/used
    # 2. Get user
    # 3. Update password
    # 4. Mark token as used
    # 5. Return success
```

### 4. Email Verification (Optional for MVP)

```python
@router.post("/verify-email")
async def verify_email(
    token: str,
    db: DBSession,
):
    """Verify email address."""
    # Similar to password reset
```

---

## Frontend Implementation Needed

### Forgot Password Page (`/forgot-password`)

Currently a placeholder. Need:

1. **Email Input Form**
   - Email field
   - Submit button
   - "Back to login" link

2. **Success State**
   - "Check your email" message
   - Instructions

3. **Error Handling**
   - Network errors
   - (Don't reveal if email exists - security)

### Reset Password Page (`/reset-password`)

New page needed. Route: `/reset-password?token=xxx`

1. **Password Form**
   - New password
   - Confirm password
   - Submit button

2. **Validation**
   - Password strength
   - Passwords match

3. **States**
   - Loading (validating token)
   - Invalid/expired token
   - Success (redirect to login)

---

## Email Verification Decision

**Question**: Should registration require email verification?

### Arguments FOR verification:
- Prevents fake accounts
- Ensures valid email for notifications
- Security best practice
- Required for password reset to work

### Arguments AGAINST (for MVP):
- Friction in onboarding
- Need to handle "resend" flow
- Users might not check email immediately
- Small team, low abuse risk

**Recommendation for MVP**:
- Skip email verification on registration
- BUT send welcome email
- Require valid email for password reset (implicit verification)

**Post-MVP**:
- Add optional email verification
- Or require for certain features (sending invoices)

---

## Welcome Email

The `send_welcome_email()` method exists but isn't called.

**Fix**: Add to registration endpoint:
```python
# After creating user
await email_service.send_welcome_email(user.email, user.first_name)
```

---

## Frontend Routes Update

Current `App.tsx` routes:
```typescript
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

Need to add:
```typescript
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

---

## Questions for Stakeholder

1. **Email Verification**: Required on registration, or skip for MVP?

2. **Password Requirements**: What password rules?
   - Minimum length (8 chars?)
   - Require numbers/symbols?
   - Or just minimum length?

3. **Reset Token Expiry**: How long should reset links be valid?
   - 1 hour (standard)?
   - 24 hours (more lenient)?

4. **Welcome Email**: Should we send one on registration?
   - If yes, what should it say?

5. **SendGrid Setup**: Is SendGrid API key configured in production?
   - Need to verify `SENDGRID_API_KEY` env var is set

---

## Effort Estimate

### Backend
| Component | Effort |
|-----------|--------|
| PasswordResetToken model | 0.5 day |
| Forgot password endpoint | 0.5 day |
| Reset password endpoint | 0.5 day |
| Add welcome email to registration | 0.25 day |
| **Subtotal** | **~1.75 days** |

### Frontend
| Component | Effort |
|-----------|--------|
| Forgot Password page | 0.5 day |
| Reset Password page | 0.5 day |
| Auth store updates | 0.25 day |
| **Subtotal** | **~1.25 days** |

**Total: ~3 days**

---

## Confidence Level: HIGH

Email service exists. Just need to wire up the endpoints and frontend pages. Standard auth flow - well-understood pattern.
