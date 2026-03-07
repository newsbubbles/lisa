# MVP Gap Analysis - Frontend/Backend Integration

**Created**: 2026-03-07  
**Status**: Investigation  
**Goal**: Identify all gaps between current frontend stub implementation and backend API to achieve working MVP

---

## Executive Summary

The frontend has well-structured components, stores, and types but uses **mock/stub data** everywhere. The backend API is functional with auth, contacts, jobs, estimates, invoices, and organization endpoints. The primary work is:

1. **Authentication flow** - Login/Register pages exist but aren't wired into App routing
2. **Protected routes** - App.tsx bypasses auth entirely with mock user
3. **API integration** - Stores are ready but pages use local mock data instead
4. **Schema alignment** - Frontend types don't fully match backend response shapes

---

## Current State Analysis

### Frontend Structure

```
frontend/src/
├── components/          # UI components (well-built)
│   ├── contacts/
│   ├── estimates/
│   ├── jobs/
│   ├── layout/
│   └── ui/
├── hooks/               # EMPTY - needs custom hooks
├── lib/
│   ├── api.ts          # ✅ Axios client with auth interceptors
│   └── utils.ts
├── pages/
│   ├── Login.tsx       # ✅ Exists, uses auth store
│   ├── Register.tsx    # ✅ Exists
│   ├── DashboardPage   # ❌ Uses mock data
│   ├── JobsPage        # ❌ Uses mock data (generateMockJobs)
│   ├── EstimatesPage   # ❌ Uses mock data
│   └── ...             # Other placeholder pages
├── stores/
│   ├── auth.ts         # ✅ Ready - login/logout/register actions
│   ├── jobs.ts         # ✅ Ready - fetchJobs, CRUD actions
│   ├── contacts.ts     # ✅ Ready - fetchContacts, CRUD actions
│   └── uiStore.ts      # ✅ UI state management
├── types/              # TypeScript types
└── App.tsx             # ❌ No auth guards, uses mockUser
```

### Backend Endpoints Available

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/auth/register` | POST | ✅ Working | Returns Token only (no user) |
| `/api/v1/auth/login` | POST | ✅ Working | OAuth2 form, returns Token |
| `/api/v1/auth/me` | GET | ✅ Working | Returns UserResponse |
| `/api/v1/contacts` | GET/POST | ✅ Working | Paginated list |
| `/api/v1/contacts/{id}` | GET/PATCH/DELETE | ✅ Working | |
| `/api/v1/jobs` | GET/POST | ✅ Working | Paginated list |
| `/api/v1/jobs/{id}` | GET/PATCH/DELETE | ✅ Working | |
| `/api/v1/jobs/board` | GET | ❓ Unknown | Need to verify |
| `/api/v1/estimates` | GET/POST | ✅ Working | |
| `/api/v1/invoices` | GET/POST | ✅ Working | |
| `/api/v1/organizations/current` | GET | ✅ Working | |

---

## Gap Categories

### 1. Authentication & Routing (CRITICAL)

**Current State:**
- `App.tsx` renders `AppLayout` with hardcoded `mockUser`
- Login/Register pages exist but aren't in the route tree
- No auth guards or protected routes
- No redirect to login when unauthenticated

**Required Changes:**

```
frontend/src/
├── App.tsx                    # MODIFY: Add auth routing
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx # CREATE: Auth guard wrapper
└── pages/
    └── index.ts               # MODIFY: Export Login/Register
```

**Implementation:**
- Create `ProtectedRoute` component that checks `useAuthStore().isAuthenticated`
- Modify `App.tsx` to have public routes (login, register) and protected routes (everything else)
- On app load, check for stored token and call `/auth/me` to validate
- Redirect to `/login` if not authenticated

---

### 2. Auth Store / API Mismatch (HIGH)

**Current State:**
- Frontend `auth.ts` expects login to return `{ user, access_token, refresh_token }`
- Backend `/auth/login` returns only `{ access_token, token_type }`
- No `/auth/refresh` endpoint exists
- Registration expects user data back but only gets token

**Options:**

A) **Modify Backend** (recommended for MVP):
   - `/auth/login` returns `{ access_token, user: UserResponse }`
   - `/auth/register` returns `{ access_token, user: UserResponse }`
   - Add `/auth/refresh` endpoint (or skip refresh for MVP)

B) **Modify Frontend**:
   - After login/register, immediately call `/auth/me` to get user data
   - Remove refresh token handling for MVP

**Recommendation**: Option B is faster for MVP - just chain a `/auth/me` call after login.

---

### 3. Jobs Page Integration (HIGH)

**Current State:**
- `JobsPage.tsx` has `generateMockJobs()` function creating fake data
- `useJobsStore` is ready with `fetchJobs()`, `fetchBoardData()` etc.
- Backend returns different shape than frontend expects

**Schema Differences:**

| Frontend (JobSummary) | Backend (JobResponse) | Action |
|-----------------------|----------------------|--------|
| `customerName` | `contact.full_name` | Transform |
| `address` | `contact.properties[0].full_address` | Transform |
| `estimateAmount` | `estimated_value` | Rename |
| `taskCount` | Not available | Remove or add to backend |
| `photoCount` | Not available | Remove or add to backend |
| `tags` | `tags` | ✅ Match |
| `status` (kebab-case) | `status` (snake_case) | Transform |

**Required Changes:**
- Create data transformer in `lib/transforms.ts` or in store
- Update `JobsPage` to use `useJobsStore` instead of mock data
- Handle loading/error states

---

### 4. Contacts Page Integration (HIGH)

**Current State:**
- `ContactsPage` is a placeholder
- `useContactsStore` is ready
- `ContactList` component exists in `components/contacts/`

**Required Changes:**
- Wire `ContactsPage` to use `useContactsStore`
- Implement contact CRUD UI
- Handle property management

---

### 5. Dashboard Integration (MEDIUM)

**Current State:**
- All stats are hardcoded mock values
- Recent activity is mock data
- Upcoming tasks are mock data

**Required Changes:**
- Create `/api/v1/dashboard/stats` endpoint OR aggregate from existing endpoints
- Fetch real job counts by status
- Fetch real revenue totals
- Recent activity could come from job status changes

---

### 6. Estimates Integration (MEDIUM)

**Current State:**
- `EstimatesPage` and `EstimateBuilderPage` exist
- Uses mock templates and line items
- Backend has estimates endpoints

**Required Changes:**
- Wire to backend API
- Implement estimate creation flow
- Link estimates to jobs/contacts

---

### 7. Status Value Mapping (HIGH)

**Critical Mismatch:**

| Frontend Status | Backend Status |
|-----------------|----------------|
| `lead` | `lead` ✅ |
| `prospect` | `prospect` ✅ |
| `approved` | `approved` ✅ |
| `scheduled` | `scheduled` ✅ |
| `in-progress` | `in_progress` ❌ |
| `completed` | `completed` ✅ |
| `invoiced` | `invoiced` ✅ |
| `paid` | `paid` ✅ |

**Fix:** Transform `in_progress` <-> `in-progress` in API layer

---

## Implementation Priority

### Phase 1: Auth Flow (Must Have)
1. Create `ProtectedRoute` component
2. Update `App.tsx` with auth routing
3. Fix auth store to call `/auth/me` after login
4. Add token validation on app load
5. Wire Login/Register pages into routes

### Phase 2: Jobs Board (Must Have)
1. Create status transform utilities
2. Create job data transformer
3. Update `JobsPage` to use store
4. Implement job board with real data
5. Wire drag-drop status changes to API

### Phase 3: Contacts (Must Have)
1. Build out `ContactsPage` with real data
2. Implement contact creation modal
3. Wire property management

### Phase 4: Dashboard (Should Have)
1. Create dashboard stats endpoint OR aggregate calls
2. Wire stats cards to real data
3. Implement recent activity feed

### Phase 5: Estimates (Nice to Have for MVP)
1. Wire estimate list to backend
2. Implement estimate builder with real templates
3. Link to jobs/contacts

---

## Files to Create/Modify

### New Files
```
frontend/src/
├── components/auth/
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── hooks/
│   ├── useAuth.ts           # Auth state helpers
│   └── useApi.ts            # Generic API hooks (optional)
└── lib/
    └── transforms.ts        # API response transformers
```

### Modified Files
```
frontend/src/
├── App.tsx                  # Auth routing
├── stores/auth.ts           # Fix login flow
├── pages/JobsPage.tsx       # Use real API
├── pages/DashboardPage.tsx  # Use real API
├── pages/index.ts           # Export auth pages
└── types/job.ts             # Align with backend
```

### Backend Changes (Optional)
```
backend/app/api/v1/endpoints/
├── auth.py                  # Return user with token
└── dashboard.py             # CREATE: Stats endpoint
```

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Auth | 2-3 hours | CRITICAL |
| Phase 2: Jobs | 2-3 hours | CRITICAL |
| Phase 3: Contacts | 1-2 hours | HIGH |
| Phase 4: Dashboard | 1-2 hours | MEDIUM |
| Phase 5: Estimates | 2-3 hours | LOW |

**Total MVP Estimate**: 6-10 hours

---

## Next Steps

1. **User Confirmation**: Does this analysis look correct?
2. **Priority Confirmation**: Should we proceed with Phase 1 (Auth) first?
3. **Backend vs Frontend**: Prefer to fix mismatches on frontend or backend?

---

## Confidence Level: HIGH

I've examined:
- Frontend App.tsx routing structure
- All Zustand stores (auth, jobs, contacts)
- API client configuration
- Login/Register page implementations
- JobsPage mock data patterns
- Backend auth endpoints and schemas
- Backend job/contact API responses

The gaps are well-defined and the path to MVP is clear.
