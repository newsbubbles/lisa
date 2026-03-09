# Frontend Features Audit - Investigation Summary

**Date**: 2026-03-07 (Updated 2026-03-08)  
**Mode**: Investigation → Implementation Planning  
**Status**: ✅ COMPLETE - Ready for Implementation

---

## Stakeholder Input Received

See [stakeholder-answers.md](stakeholder-answers.md) for full details from Lisa Gibson.

**Key Decisions:**
- Payment terms: Configurable list (not hardcoded)
- Online payments: No Stripe - QuickBooks Online is the payment hub
- PDF export: Required - HIGH priority
- Job form: Only title required (all else nullable)
- Email verification: Skip for demo
- SendGrid: Defer until launch
- Calendar: Defer - needs more stakeholder input

**Implementation Plan:** See [implementation-plan.md](implementation-plan.md)

---

## Overview

Audited all "coming soon" placeholders in the Lisa frontend. Created deeper investigation notes for each feature area.

---

## Feature Status Matrix

| Feature | Backend | Frontend | Priority | Investigation |
|---------|---------|----------|----------|---------------|
| **Invoices** | ✅ Full API | ❌ Stub | HIGH | [invoices/deeper_investigation.md](invoices/deeper_investigation.md) |
| **New Job Form** | ✅ Full API | ❌ Stub | HIGH | [new-job-form/deeper_investigation.md](new-job-form/deeper_investigation.md) |
| **Profile** | ⚠️ Partial | ❌ Stub | MEDIUM | [profile-settings/deeper_investigation.md](profile-settings/deeper_investigation.md) |
| **Settings** | ⚠️ Partial | ❌ Stub | MEDIUM | [profile-settings/deeper_investigation.md](profile-settings/deeper_investigation.md) |
| **Forgot Password** | ⚠️ Email ready, endpoints missing | ❌ Stub | MEDIUM | [auth-email/deeper_investigation.md](auth-email/deeper_investigation.md) |
| **Reports** | ❌ None | ❌ Stub | LOW | [reports/deeper_investigation.md](reports/deeper_investigation.md) |
| **Calendar** | ❌ None | ❌ Stub | LOW | Deferred - Google Calendar integration |
| **Task Management** | ✅ API exists (per-job) | ❌ Not shown | LOW | [task-management-note.md](task-management-note.md) |
| **Activity Feed** | ❌ None | ❌ Stub | LOW | Deferred |
| **Help** | N/A | ❌ Stub | DEFERRED | AI agent planned |

---

## Missing Frontend Types

Need to create:
- `frontend/src/types/invoice.ts`
- `frontend/src/types/user.ts`
- `frontend/src/types/organization.ts`

---

## Effort Estimates Summary

| Feature | Effort |
|---------|--------|
| Invoices Module | ~6 days |
| New Job Form | ~4 days |
| Profile Page | ~3 days |
| Settings Page | ~4.5 days |
| Forgot Password Flow | ~3 days |
| Reports (MVP - 4 reports) | ~8.5 days |
| Task Management | ~2 days |
| **Total** | **~31 days** |

---

## Key Discoveries

### 1. Organization Context
Users belong to ONE organization. Org info is returned with `/auth/me` and stored in auth state. All API calls are scoped via JWT. Multi-org is NOT supported (and not needed for MVP).

### 2. Task Management Already Exists
Backend has full Job Tasks API (`/jobs/{id}/tasks`). Just needs frontend implementation.

### 3. SendGrid Ready
Email service is configured with SendGrid. Helper methods exist for password reset, welcome email, etc. Just need to wire up the auth endpoints.

### 4. Invoices Backend Complete
Full invoice API with line items, payments, auto-calculation. Major gap is frontend only.

---

## Questions for Stakeholder

### HIGH PRIORITY (Invoices)

1. **Default payment terms?** What's the default due date (Net 30? Net 15?)?
2. **Tax rate source?** Is tax rate per-org setting or per-job?
3. **Invoice numbering?** Current format is `INV-{YEAR}-{4-char-random}`. Acceptable?
4. **Payment processing?** Integrate Stripe for online payments, or just record external payments?
5. **PDF generation?** Should invoices be downloadable as PDF?

### HIGH PRIORITY (New Job Form)

6. **Quick Add vs Full Form?** Should there be a simplified "quick add" mode?
7. **Required Fields?** Beyond title, what else should be required?
8. **Insurance Fields?** Required when `is_insurance_job` is true?
9. **After Create Behavior?** Where should user go after creating a job?

### MEDIUM PRIORITY (Profile/Settings)

10. **Password Change?** Should users be able to change their own password?
11. **User Invitation?** How should new users be invited? (Email invite vs admin creates account)
12. **Role Permissions?** What can each role (owner/admin/manager/sales/crew/viewer) do?
13. **Settings Scope?** Which org settings are essential for MVP?

### MEDIUM PRIORITY (Auth/Email)

14. **Email Verification?** Required on registration, or skip for MVP?
15. **Password Requirements?** Minimum length? Require numbers/symbols?
16. **Reset Token Expiry?** How long should reset links be valid? (1 hour standard)
17. **SendGrid Setup?** Is `SENDGRID_API_KEY` configured in production?

### LOW PRIORITY (Reports)

18. **Which reports for MVP?** Revenue, Pipeline, AR Aging, others?
19. **Export formats?** PDF, CSV, both?
20. **Who can access reports?** All users or managers+?

### DEFERRED

21. **Calendar?** You mentioned Google Calendar - is that the plan?
22. **Help?** Confirmed deferring to AI agent approach?

---

## Recommended Implementation Order

### Phase 1: Core Functionality (MVP Baseline)
1. **Invoices Module** - Biggest gap, backend ready
2. **New Job Form** - Essential for workflow
3. **Forgot Password** - Basic auth requirement

### Phase 2: User Management
4. **Profile Page** - User self-service
5. **Settings Page** - Org configuration

### Phase 3: Analytics
6. **Reports** - Business insights
7. **Task Management** - Already backend-ready

### Phase 4: Future
8. Calendar integration
9. Activity feed
10. Help (AI agent)

---

## Next Steps

1. **Review questions above** and provide answers
2. **Confirm priority order** or adjust
3. **Proceed to implementation** starting with Invoices

---

## Files Created

```
notes/frontend-features-audit/
├── investigation.md (this file)
├── invoices/
│   └── deeper_investigation.md
├── new-job-form/
│   └── deeper_investigation.md
├── profile-settings/
│   └── deeper_investigation.md
├── reports/
│   └── deeper_investigation.md
├── auth-email/
│   └── deeper_investigation.md
└── task-management-note.md
```
