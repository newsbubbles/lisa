# Profile & Settings - Deeper Investigation

**Date**: 2026-03-07  
**Status**: Investigation Complete  
**Priority**: MEDIUM (Backend Partial, Frontend Stub)

---

## Executive Summary

Profile and Settings are separate concepts:
- **Profile**: Individual user account management (name, email, password, avatar)
- **Settings**: Organization-level configuration (company info, branding, defaults)

Backend has partial APIs. Frontend has placeholder pages.

---

## What Competitors Have

From AccuLynx/JobNimbus research (`notes/acculynx-research/`):

### Profile Features (User-Level)
- Name, email, phone
- Avatar/profile photo
- Password change
- Notification preferences
- Role/permissions display
- Two-factor authentication

### Settings Features (Organization-Level)

#### Company Settings
- Company name, logo
- Address, phone, email
- Website URL
- Business hours
- Tax ID / business registration

#### Branding
- Logo upload
- Brand colors
- Email templates customization
- Proposal/invoice branding

#### Financial Settings
- Default tax rate
- Payment terms (Net 30, etc.)
- Currency
- QuickBooks integration
- Stripe/payment processing setup

#### Team Management
- User list
- Invite new users
- Role assignment
- User permissions
- User limits (per plan)

#### Workflow Settings
- Job stages customization
- Default job types
- Task templates
- Automation rules

#### Integrations
- QuickBooks connection
- EagleView/HOVER credentials
- Email sync (Gmail/Outlook)
- Calendar sync
- Supplier integrations

---

## Backend API Analysis

### User API (`backend/app/api/v1/endpoints/users.py`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List org users |
| POST | `/users` | Create user (admin only) |
| GET | `/users/{id}` | Get user |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

**UserUpdate Schema:**
```python
class UserUpdate(BaseModel):
    first_name: str | None
    last_name: str | None
    phone: str | None
    avatar_url: str | None
    role: str | None  # admin only
    is_active: bool | None  # admin only
```

**Missing from backend:**
- ❌ Password change endpoint
- ❌ Email change with verification
- ❌ Notification preferences
- ❌ Two-factor authentication

### Organization API (`backend/app/api/v1/endpoints/organizations.py`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations/current` | Get current org |
| PATCH | `/organizations/current` | Update org (admin only) |

**OrganizationUpdate Schema:**
```python
class OrganizationUpdate(BaseModel):
    name: str | None
    email: str | None
    phone: str | None
    website: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    zip_code: str | None
    country: str | None
    logo_url: str | None
    settings: dict | None  # flexible settings object
```

**Organization Model Fields (from model):**
```python
# Subscription/limits
plan: str  # free, starter, professional, business, enterprise
max_users: int
max_jobs_per_month: int | None

# Settings (JSON field)
settings: dict  # Flexible - can store:
  # - default_tax_rate
  # - payment_terms
  # - business_hours
  # - notification_preferences
  # - etc.
```

---

## Frontend Implementation Plan

### Profile Page (`/profile`)

#### Section 1: Personal Information
- First Name, Last Name
- Email (display only - change requires verification)
- Phone
- Avatar upload

#### Section 2: Security
- Change Password
  - Current password
  - New password
  - Confirm new password
- Two-Factor Authentication (future)

#### Section 3: Notifications (future)
- Email notifications toggle
- SMS notifications toggle
- Notification types (new job, payment received, etc.)

#### Section 4: Account Info (read-only)
- Role
- Organization name
- Member since

### Settings Page (`/settings`) - Admin Only

#### Tab 1: Company
- Company name
- Logo upload
- Address
- Phone, email, website

#### Tab 2: Team
- User list table
- Invite new user button
- Edit user roles
- Deactivate users
- User limit indicator (e.g., "3 of 5 users")

#### Tab 3: Financial
- Default tax rate
- Payment terms (Net 15, Net 30, etc.)
- Invoice numbering format
- QuickBooks connection status
- Stripe connection status

#### Tab 4: Workflow
- Job stages editor (reorder, rename, add, delete)
- Default job settings

#### Tab 5: Integrations
- QuickBooks: Connect/Disconnect
- EagleView: API key
- HOVER: Connection
- (Future integrations)

---

## Missing Backend Work

### For Profile

1. **Password Change Endpoint**
```python
@router.post("/users/me/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    db: DBSession,
    current_user: CurrentUser,
):
    # Verify current password
    # Update to new password
```

2. **Email Change with Verification** (complex - defer)

### For Settings

Backend organization settings are **flexible** (JSON `settings` field), so no schema changes needed. Frontend can store:
```json
{
  "default_tax_rate": 8.25,
  "payment_terms": "net_30",
  "invoice_prefix": "INV",
  "business_hours": {
    "monday": {"open": "08:00", "close": "17:00"},
    ...
  }
}
```

---

## Organization Context Question

**User asked:** "Where is your organization when you're using the frontend?"

### Current Implementation

From `frontend/src/stores/auth.ts`:

```typescript
// Backend returns organization nested in user response
interface BackendUser {
  organization_id: string
  organization: {
    id: string
    name: string
    slug: string
  }
}

// Frontend transforms to:
interface User {
  organizationId: string
  organizationName: string
}
```

### How It Works

1. User logs in
2. `/auth/me` returns user WITH organization nested
3. Frontend stores `organizationId` and `organizationName` in auth state
4. All API calls are scoped to user's organization via JWT token
5. Backend extracts org from user's token (see `CurrentOrganization` dependency)

### Multi-Org Support?

**Current: NO** - Users belong to ONE organization.

From the model:
```python
class User:
    organization_id: UUID  # Single org
```

If multi-org is needed later, would require:
- User ↔ Organization many-to-many
- Org switcher in UI
- Context selection on login

**For MVP: Single org per user is fine.**

---

## Frontend Types Needed

### `frontend/src/types/user.ts`
```typescript
export type UserRole = 'owner' | 'admin' | 'manager' | 'sales' | 'crew' | 'viewer'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  role: UserRole
  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: UserRole
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  role?: UserRole  // admin only
  isActive?: boolean  // admin only
}
```

### `frontend/src/types/organization.ts`
```typescript
export type PlanType = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

export interface Organization {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  website: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  logoUrl: string | null
  plan: PlanType
  maxUsers: number
  maxJobsPerMonth: number | null
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  defaultTaxRate?: number
  paymentTerms?: 'due_on_receipt' | 'net_15' | 'net_30' | 'net_60'
  invoicePrefix?: string
  businessHours?: Record<string, { open: string; close: string }>
  // Extensible for future settings
}

export interface UpdateOrganizationData {
  name?: string
  email?: string
  phone?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  logoUrl?: string
  settings?: Partial<OrganizationSettings>
}
```

---

## Questions for Stakeholder

1. **Password Change**: Should users be able to change their own password? (Need backend endpoint)

2. **Email Change**: Should users be able to change their email? (Complex - requires verification flow)

3. **User Invitation**: How should new users be invited?
   - Admin enters email → invitation email sent?
   - Or admin creates account with temporary password?

4. **Role Permissions**: What can each role do?
   - Owner: Everything
   - Admin: Everything except billing?
   - Manager: ?
   - Sales: ?
   - Crew: ?
   - Viewer: Read-only?

5. **Settings Scope**: Which settings are most important for MVP?
   - Company info? ✅
   - Tax rate? ✅
   - Payment terms? ✅
   - Job stages? (Already exists in jobs API)
   - Integrations? (Phase 2?)

6. **Multi-Org**: Is single org per user acceptable for MVP? (Current implementation)

---

## Effort Estimate

### Profile Page
| Component | Effort |
|-----------|--------|
| Types | 0.5 day |
| Profile form UI | 1 day |
| Avatar upload | 0.5 day |
| Password change (needs backend) | 1 day |
| **Subtotal** | **3 days** |

### Settings Page
| Component | Effort |
|-----------|--------|
| Types | 0.5 day |
| Settings store | 0.5 day |
| Company tab | 1 day |
| Team tab (user management) | 1.5 days |
| Financial tab | 0.5 day |
| Workflow tab | 0.5 day |
| **Subtotal** | **4.5 days** |

### Backend Work
| Component | Effort |
|-----------|--------|
| Password change endpoint | 0.5 day |
| User invitation flow | 1 day (if needed) |
| **Subtotal** | **1-1.5 days** |

**Total: ~8-9 days**

---

## Confidence Level: MEDIUM

Backend has partial support. Need stakeholder input on:
- Required settings for MVP
- User invitation flow
- Role permissions
