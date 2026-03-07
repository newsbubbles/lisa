# MVP Gap Analysis - Deeper Investigation

**Created**: 2026-03-07  
**Status**: Investigation Complete  
**Parent**: [investigation.md](./investigation.md)  
**Goal**: Comprehensive gap analysis cross-referenced with original planning docs

---

## Project Status Update

The `notes/lisa-planning/project-status.md` is **severely outdated** (says 15-20% complete). Based on current investigation:

### Actual Completion Status

| Area | Old Status | Actual Status | Notes |
|------|------------|---------------|-------|
| **Planning** | 95% | 95% | ✅ Unchanged |
| **Backend** | 35% | **75%** | All endpoints working, DB seeded |
| **Frontend** | 20% | **65%** | Full component library, all pages scaffolded |
| **Overall** | 15-20% | **~70%** | Much closer to MVP than documented |

---

## What's Actually Built

### Backend (75% Complete)

#### ✅ Fully Working
- **Auth**: `/auth/register`, `/auth/login`, `/auth/me`
- **Contacts**: Full CRUD + properties (`/contacts/*`)
- **Jobs**: Full CRUD + board + notes + tasks (`/jobs/*`)
- **Estimates**: Full CRUD + line items + templates + send (`/estimates/*`)
- **Invoices**: Scaffolded (`/invoices/*`)
- **Organizations**: Current org endpoint
- **Users**: User management
- **Database**: PostgreSQL with 17 tables, Alembic migrations

#### ❌ Not Built (P0 per PRD)
- Email service (notifications)
- File storage (S3)
- PDF generation (proposals/invoices)
- QuickBooks integration
- EagleView integration
- Stripe payments
- Dashboard stats endpoint

### Frontend (65% Complete)

#### ✅ Fully Built
**UI Components (21 files)**:
- Avatar, Badge, Button, Card, Checkbox, DatePicker
- Dialog, Drawer, DropdownMenu, EmptyState, FormField
- Input, Label, Pagination, Select, Spinner, Table
- Tabs, Textarea, Toast, index.ts

**Layout Components (8 files)**:
- AppLayout, AppShell, Header, MobileMenu
- MobileNav, QuickActionSheet, Sidebar, index.ts

**Jobs Components (4 files)**:
- JobBoard (Kanban with @dnd-kit)
- JobCard
- JobDetailsDrawer
- index.ts

**Estimates Components (5 files)**:
- EstimateBuilder (DND line items)
- EstimateLineItem
- EstimateSummary
- EstimateTemplates
- index.ts

**Contacts Components (2 files)**:
- ContactCard
- ContactList

**Pages (8 files)**:
- DashboardPage ❌ (mock data)
- JobsPage ❌ (mock data)
- EstimatesPage ❌ (mock data)
- EstimateBuilderPage ❌ (mock data)
- Login ✅ (ready, not routed)
- Register ✅ (ready, not routed)
- PlaceholderPage (Invoices, Contacts, Calendar, Reports, Settings)
- index.ts (missing Login/Register exports)

**Stores (5 files)**:
- auth.ts ✅ (ready, API mismatch)
- contacts.ts ✅ (ready)
- jobs.ts ✅ (ready)
- uiStore.ts ✅ (ready)
- index.ts

**Types (4 files)**:
- contact.ts
- estimate.ts
- job.ts
- index.ts

**Lib (2 files)**:
- api.ts ✅ (Axios with interceptors)
- utils.ts

**Hooks**: EMPTY (needs custom hooks)

---

## Detailed Gap Analysis

### Gap 1: Authentication Flow (CRITICAL)

#### Current State
```
App.tsx:
  - Uses hardcoded mockUser
  - No auth check on load
  - Login/Register not in routes
  - No ProtectedRoute wrapper

pages/index.ts:
  - Does NOT export LoginPage or RegisterPage

stores/auth.ts:
  - Expects: { user, access_token, refresh_token }
  - Backend returns: { access_token, token_type }
```

#### Backend Auth Response Shapes

**POST /auth/login** (OAuth2PasswordRequestForm):
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**POST /auth/register**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**GET /auth/me** (requires token):
```json
{
  "id": "uuid",
  "email": "...",
  "first_name": "...",
  "last_name": "...",
  "role": "owner",
  "organization_id": "uuid",
  "organization": { "id": "...", "name": "...", "slug": "..." }
}
```

#### Required Changes

1. **Frontend auth store** - After login/register, call `/auth/me` to get user
2. **Frontend User type** - Map backend response to frontend User interface:
   - Backend: `first_name + last_name` → Frontend: `name`
   - Backend: `organization.name` → Frontend: `organizationName`
3. **App.tsx** - Add auth routing:
   - Public routes: `/login`, `/register`
   - Protected routes: everything else
   - Check token on load, validate with `/auth/me`
4. **ProtectedRoute component** - Redirect to login if not authenticated
5. **pages/index.ts** - Export LoginPage, RegisterPage

---

### Gap 2: Login Form Format (CRITICAL)

#### Current State
Frontend sends JSON:
```typescript
await api.post('/auth/login', { email, password })
```

Backend expects OAuth2 form data:
```python
form_data: OAuth2PasswordRequestForm
# Expects: username (not email), password as form fields
```

#### Required Changes

Option A: Change frontend to send form data:
```typescript
const formData = new URLSearchParams()
formData.append('username', email)  // OAuth2 uses 'username'
formData.append('password', password)
await api.post('/auth/login', formData, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
```

Option B: Change backend to accept JSON (cleaner for SPA):
```python
@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: DBSession):  # UserLogin schema
```

**Recommendation**: Option B - more consistent with other endpoints.

---

### Gap 3: Register Schema Mismatch (HIGH)

#### Current State
Frontend sends:
```typescript
{
  name: "John Smith",  // Single name field
  email: "...",
  password: "...",
  organizationName: "..."
}
```

Backend expects:
```python
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str  # Separate fields
    last_name: str
    organization_name: str
    phone: str | None = None
```

#### Required Changes

Option A: Split name in frontend:
```typescript
const [firstName, ...lastParts] = formData.name.split(' ')
const lastName = lastParts.join(' ') || firstName
await api.post('/auth/register', {
  first_name: firstName,
  last_name: lastName,
  email: formData.email,
  password: formData.password,
  organization_name: formData.organizationName,
})
```

Option B: Change backend to accept single name (then split server-side).

**Recommendation**: Option A - minimal backend changes.

---

### Gap 4: Jobs Page Mock Data (CRITICAL)

#### Current State
`JobsPage.tsx` line 10-100+:
```typescript
const generateMockJobs = (): PipelineColumn[] => {
  const mockJobs: Record<JobStatus, JobSummary[]> = {
    lead: [...],
    prospect: [...],
    // etc
  }
}
```

#### Backend Response Shape
`GET /jobs/board` returns:
```json
{
  "columns": [
    {
      "stage": { "id": "...", "name": "Lead", "color": "#3B82F6", "order": 0 },
      "jobs": [
        {
          "id": "uuid",
          "job_number": "JOB-20260307-XXXX",
          "title": "...",
          "status": "lead",  // snake_case values
          "contact": { "first_name": "...", "last_name": "...", "properties": [...] },
          "estimated_value": 15000,
          "days_in_status": 3,
          "tags": [...]
        }
      ],
      "total_value": 45000
    }
  ],
  "total_jobs": 10,
  "total_value": 171000
}
```

#### Frontend Expected Shape
```typescript
interface JobSummary {
  id: string
  title: string
  jobNumber: string
  status: JobStatus  // 'in-progress' (kebab-case)
  statusChangedAt: string
  customerName: string  // Derived from contact
  address: string  // Derived from contact.properties[0]
  estimateAmount?: number  // Backend: estimated_value
  taskCount: number  // Not in backend response
  completedTaskCount: number  // Not in backend response
  photoCount: number  // Not in backend response
  tags: string[]
}
```

#### Required Changes

1. **Create transformer** `lib/transforms/job.ts`:
```typescript
export function transformJobResponse(job: BackendJobResponse): JobSummary {
  const contact = job.contact
  const property = contact?.properties?.[0]
  
  return {
    id: job.id,
    title: job.title,
    jobNumber: job.job_number,
    status: transformStatus(job.status),  // in_progress -> in-progress
    statusChangedAt: job.status_changed_at,
    customerName: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
    address: property ? formatAddress(property) : '',
    estimateAmount: job.estimated_value,
    taskCount: 0,  // TODO: Add to backend or fetch separately
    completedTaskCount: 0,
    photoCount: 0,
    tags: job.tags || [],
  }
}
```

2. **Update JobsPage** to use `useJobsStore().fetchBoardData()`

3. **Status transform utility**:
```typescript
const STATUS_MAP = {
  'in_progress': 'in-progress',
  // others are same
} as const

export function transformStatus(backendStatus: string): JobStatus {
  return STATUS_MAP[backendStatus] || backendStatus
}
```

---

### Gap 5: Dashboard Mock Data (MEDIUM)

#### Current State
`DashboardPage.tsx` has hardcoded:
- Stat cards (Active Jobs: 12, Leads: 8, etc.)
- Revenue numbers ($45,200)
- Recent activity items
- Upcoming tasks

#### Options

**Option A: Create dashboard endpoint** (recommended for production):
```python
@router.get("/dashboard/stats")
async def get_dashboard_stats(...):
    return {
        "active_jobs": count_by_status(["in_progress", "scheduled"]),
        "leads": count_by_status(["lead"]),
        "pending_estimates": count_estimates(status="draft"),
        "revenue_mtd": sum_invoices_paid_this_month(),
        "recent_activity": get_recent_activity(limit=5),
        "upcoming_tasks": get_upcoming_tasks(limit=5),
    }
```

**Option B: Aggregate on frontend** (faster for MVP):
```typescript
// In DashboardPage
const { jobs } = useJobsStore()
const activeJobs = jobs.filter(j => ['in-progress', 'scheduled'].includes(j.status)).length
const leads = jobs.filter(j => j.status === 'lead').length
// etc.
```

**Recommendation**: Option B for MVP, Option A for production.

---

### Gap 6: Contacts Page (HIGH)

#### Current State
`ContactsPage` is a PlaceholderPage:
```typescript
export function ContactsPage({ onNavigate }) {
  return (
    <PlaceholderPage
      title="Contacts"
      description="Customer and contact management coming soon."
    />
  )
}
```

But we have:
- `ContactCard.tsx` component
- `ContactList.tsx` component
- `useContactsStore` with full CRUD
- Backend `/contacts` API fully working

#### Required Changes

1. Create real `ContactsPage.tsx`:
```typescript
export function ContactsPage() {
  const { contacts, fetchContacts, isLoading } = useContactsStore()
  
  useEffect(() => {
    fetchContacts()
  }, [])
  
  return (
    <div>
      <ContactList contacts={contacts} />
    </div>
  )
}
```

2. Wire up contact creation/editing modals

---

### Gap 7: Estimates Page (MEDIUM)

#### Current State
`EstimatesPage.tsx` uses mock data.
`EstimateBuilderPage.tsx` uses mock templates.

Backend has:
- `/estimates` - Full CRUD
- `/estimates/templates` - Template management
- `/estimates/{id}/items` - Line item management
- `/estimates/{id}/send` - Send to customer

#### Required Changes

1. Wire `EstimatesPage` to `useEstimatesStore` (need to create)
2. Wire `EstimateBuilderPage` to backend templates API
3. Create estimate store similar to jobs store

---

### Gap 8: Missing Stores

#### Current Stores
- ✅ auth.ts
- ✅ contacts.ts
- ✅ jobs.ts
- ✅ uiStore.ts

#### Missing Stores
- ❌ estimates.ts (need for EstimatesPage/Builder)
- ❌ invoices.ts (need for InvoicesPage)
- ❌ dashboard.ts (optional, could aggregate)

---

## MVP Feature Checklist (from PRD)

### Core CRM
- [x] Contact model defined (backend)
- [x] Property model defined (backend)
- [x] Contact CRUD API working
- [x] Contact components (ContactCard, ContactList)
- [ ] **Contact CRUD working end-to-end** ← Gap
- [ ] Lead capture forms
- [x] Sales pipeline (Kanban) - Backend done
- [x] Sales pipeline (Kanban) - Frontend components done
- [ ] **Sales pipeline working end-to-end** ← Gap
- [ ] Email integration (P0 per PRD, not built)
- [ ] Basic search & filtering (backend has it, frontend needs wiring)

### Estimating
- [x] Estimate model defined (backend)
- [x] Estimate CRUD API working
- [x] Estimate builder UI components
- [ ] **Estimate builder working end-to-end** ← Gap
- [ ] Good/Better/Best options (backend supports, frontend needs wiring)
- [ ] Proposal generation (backend has share_token)
- [ ] E-signature (not built)
- [ ] EagleView integration (P0 per PRD, not built)

### Project Management
- [x] Job model defined (comprehensive!)
- [x] Job stages model
- [x] Job notes model
- [x] Job tasks model
- [x] Job API endpoints (full CRUD + board)
- [x] Job board UI (Kanban components)
- [ ] **Job board working end-to-end** ← Gap
- [ ] Calendar view (placeholder)
- [ ] Document storage (not built)

### Financial
- [x] Invoice model defined
- [ ] Invoice generation
- [ ] Payment processing (Stripe) - P0, not built
- [ ] QuickBooks integration - P0, not built

### Mobile (Basic)
- [ ] View contacts & jobs (responsive, but not native)
- [ ] Photo capture
- [ ] View documents
- [ ] Push notifications

### Admin
- [x] User model defined
- [x] Organization model defined
- [ ] User management UI (placeholder)
- [x] Role-based permissions (backend has roles)
- [ ] Organization settings (placeholder)

---

## Revised Implementation Plan

### Phase 1: Auth Flow (CRITICAL) - 2-3 hours
1. Fix login to use form data OR change backend to JSON
2. Fix register to split name into first/last
3. Update auth store to call `/auth/me` after login/register
4. Create `ProtectedRoute` component
5. Update `App.tsx` with auth routing
6. Export Login/Register from pages/index.ts
7. Add token validation on app load

### Phase 2: Jobs Board Integration (CRITICAL) - 2-3 hours
1. Create `lib/transforms/job.ts` for data mapping
2. Create status transform utility
3. Update `useJobsStore.fetchBoardData()` to use transforms
4. Replace `generateMockJobs()` in JobsPage with store
5. Wire drag-drop to `PATCH /jobs/{id}` for status changes
6. Handle loading/error states

### Phase 3: Contacts Integration (HIGH) - 1-2 hours
1. Create real `ContactsPage.tsx` using `useContactsStore`
2. Wire `ContactList` to real data
3. Add contact creation modal/form
4. Wire property management

### Phase 4: Dashboard Integration (MEDIUM) - 1-2 hours
1. Create dashboard aggregation (frontend-side for MVP)
2. Replace mock stats with computed values from stores
3. Wire recent activity (from jobs status changes)
4. Wire upcoming tasks (from job tasks)

### Phase 5: Estimates Integration (MEDIUM) - 2-3 hours
1. Create `useEstimatesStore`
2. Wire `EstimatesPage` to store
3. Wire `EstimateBuilderPage` to backend templates
4. Wire line item CRUD
5. Wire estimate send action

### Phase 6: Polish & Remaining Pages (LOW) - 2-3 hours
1. Invoices page (basic list)
2. Settings page (basic org settings)
3. Error handling improvements
4. Loading state improvements

---

## Files to Create

```
frontend/src/
├── components/auth/
│   ├── ProtectedRoute.tsx      # Auth guard
│   └── index.ts
├── lib/
│   └── transforms/
│       ├── job.ts              # Job response transformers
│       ├── contact.ts          # Contact response transformers  
│       ├── status.ts           # Status value mapping
│       └── index.ts
├── stores/
│   └── estimates.ts            # Estimates state management
└── pages/
    └── ContactsPage.tsx        # Real implementation (replace placeholder)
```

## Files to Modify

```
frontend/src/
├── App.tsx                     # Auth routing, remove mockUser
├── stores/auth.ts              # Fix login/register flow
├── pages/index.ts              # Export Login, Register
├── pages/JobsPage.tsx          # Use real API
├── pages/DashboardPage.tsx     # Use real/computed data
├── pages/EstimatesPage.tsx     # Use real API
├── pages/EstimateBuilderPage.tsx # Use real API
└── pages/PlaceholderPage.tsx   # Remove ContactsPage (move to real)

backend/app/api/v1/endpoints/
└── auth.py                     # Option: Accept JSON for login
```

---

## Estimated Total Effort

| Phase | Effort | Priority | Dependencies |
|-------|--------|----------|-------------|
| Phase 1: Auth | 2-3h | CRITICAL | None |
| Phase 2: Jobs | 2-3h | CRITICAL | Phase 1 |
| Phase 3: Contacts | 1-2h | HIGH | Phase 1 |
| Phase 4: Dashboard | 1-2h | MEDIUM | Phase 2, 3 |
| Phase 5: Estimates | 2-3h | MEDIUM | Phase 1 |
| Phase 6: Polish | 2-3h | LOW | All above |

**Total: 10-16 hours** (more comprehensive than initial estimate)

---

## Confidence Level: HIGH

I have examined:
- All frontend components, pages, stores, types
- All backend endpoints, schemas, models
- Original planning docs (PRD, feature prioritization)
- Project status (outdated but useful baseline)
- Memory nodes from previous sessions

The gaps are well-defined and the implementation path is clear.

---

## Next Steps

1. **User Confirmation**: Does this deeper analysis look correct?
2. **Priority Confirmation**: Start with Phase 1 (Auth)?
3. **Backend Change**: Prefer to change login to accept JSON? (cleaner)
