# New Job Form - Deeper Investigation

**Date**: 2026-03-07  
**Status**: Investigation Complete  
**Priority**: HIGH (Backend Ready, Frontend Stub)

---

## Executive Summary

The backend has a **complete Job API** including CRUD, stages, notes, and tasks. The frontend has the JobsPage with list/board views, but the "New Job" button leads to a **placeholder page**.

---

## Backend API Analysis

### Source File
`backend/app/api/v1/endpoints/jobs.py`

### Create Job Endpoint
`POST /api/v1/jobs`

### JobCreate Schema (from `backend/app/schemas/job.py`)

```typescript
// Backend request shape (snake_case)
interface JobCreate {
  title: string                        // REQUIRED
  description: string | null
  job_type: JobType                    // full_replacement, repair, inspection, etc.
  status: JobStatus                    // lead, prospect, approved, etc.
  contact_id: UUID | null              // Link to customer
  property_id: UUID | null             // Link to property
  stage_id: UUID | null                // Kanban stage (auto-assigns if null)
  assigned_to_id: UUID | null          // Assigned team member
  scheduled_date: date | null
  scheduled_time: string | null        // e.g., "09:00"
  estimated_duration_days: int | null
  estimated_value: float               // Default: 0.0
  
  // Insurance fields
  is_insurance_job: boolean            // Default: false
  insurance_company: string | null
  claim_number: string | null
  adjuster_name: string | null
  adjuster_phone: string | null
  adjuster_email: string | null
  deductible: float | null
  
  // Other
  crew_name: string | null
  tags: string[] | null
  custom_fields: dict | null
}
```

### Job Types Enum
```python
class JobType(str, Enum):
    FULL_REPLACEMENT = "full_replacement"
    REPAIR = "repair"
    INSPECTION = "inspection"
    MAINTENANCE = "maintenance"
    INSURANCE_CLAIM = "insurance_claim"
    GUTTER = "gutter"
    SIDING = "siding"
    OTHER = "other"
```

### Job Status Enum
```python
class JobStatus(str, Enum):
    LEAD = "lead"
    PROSPECT = "prospect"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    INVOICED = "invoiced"
    PAID = "paid"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"
```

---

## Frontend Implementation Required

### Current State
- `frontend/src/pages/NewJobPage.tsx` - PlaceholderPage (stub)
- `frontend/src/stores/jobs.ts` - Has `createJob()` method already!
- `frontend/src/types/job.ts` - Has Job types already!

### What's Needed

1. **Replace PlaceholderPage with real form**

### Form Design

The form should have sections:

#### Section 1: Basic Info (Required)
- **Title** (text input, required)
- **Job Type** (select dropdown)
- **Description** (textarea)

#### Section 2: Customer & Property
- **Customer** (searchable select - from contacts)
- **Property** (select - from customer's properties, or add new)

#### Section 3: Assignment & Scheduling
- **Assigned To** (select - from users)
- **Scheduled Date** (date picker)
- **Scheduled Time** (time picker)
- **Estimated Duration** (number input, days)

#### Section 4: Financial
- **Estimated Value** (currency input)

#### Section 5: Insurance (Collapsible, shown if is_insurance_job)
- **Is Insurance Job** (toggle)
- **Insurance Company** (text)
- **Claim Number** (text)
- **Adjuster Name** (text)
- **Adjuster Phone** (phone input)
- **Adjuster Email** (email input)
- **Deductible** (currency input)

#### Section 6: Additional
- **Crew/Team** (text or select)
- **Tags** (tag input)

---

## Integration Points

### Contact Selection
Needs to fetch contacts from `/api/v1/contacts` and allow:
- Search/filter
- Show customer name + primary property address
- Quick "Add New Contact" option

### Property Selection
Once contact selected:
- Load their properties
- Allow selecting existing property
- Allow adding new property inline

### User Selection (Assigned To)
Fetch users from `/api/v1/users` for assignment dropdown.

---

## Existing Frontend Code to Leverage

### Jobs Store (`frontend/src/stores/jobs.ts`)
```typescript
// Already has createJob method
createJob: async (data: CreateJobData) => {
  // Transforms camelCase to snake_case
  // Posts to /jobs
  // Returns created job
}
```

### Job Types (`frontend/src/types/job.ts`)
```typescript
// Already has all types defined
export type JobType = 'full_replacement' | 'repair' | ...
export type JobStatus = 'lead' | 'prospect' | ...
export interface Job { ... }
export interface CreateJobData { ... }
```

---

## UX Considerations

1. **Quick Create vs Full Form**
   - Consider a "Quick Add" mode with just title + contact
   - Full form for detailed entry

2. **From Contact Context**
   - If user clicks "New Job" from a contact's page, pre-fill contact

3. **After Create**
   - Redirect to job detail page? Or stay on jobs list?
   - Show success toast

4. **Validation**
   - Title is required
   - If insurance job, should insurance company be required?

---

## Questions for Stakeholder

1. **Quick Add vs Full Form?** Should there be a simplified "quick add" mode?
2. **Required Fields?** Beyond title, what else should be required?
3. **Insurance Fields?** Are all insurance fields optional, or should some be required when `is_insurance_job` is true?
4. **Default Values?** Should there be org-level defaults for things like tax rate, default crew, etc.?
5. **After Create Behavior?** Where should user go after creating a job?

---

## Effort Estimate

| Component | Effort |
|-----------|--------|
| Form Component | 1.5 days |
| Contact/Property Selection | 1 day |
| User Selection | 0.5 day |
| Insurance Section | 0.5 day |
| Validation & UX | 0.5 day |
| **Total** | **~4 days** |

---

## Confidence Level: HIGH

Backend is complete. Frontend store and types already exist. Just need the form UI.

---

## BONUS: Task Management Discovery

During investigation, discovered that **Job Tasks API already exists** in backend:

- `GET /jobs/{job_id}/tasks` - List tasks
- `POST /jobs/{job_id}/tasks` - Create task
- `PATCH /jobs/{job_id}/tasks/{task_id}` - Update task

This means the "Task management coming soon" on the Dashboard could be implemented! Tasks are per-job, so:
- Dashboard could show "My Tasks" across all jobs
- Job detail page could show tasks for that job

**This is a separate investigation item.**
