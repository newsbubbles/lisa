# Frontend Features - Implementation Plan

**Date**: 2026-03-08  
**Status**: Ready for Implementation  
**Total Estimated Effort**: ~20 days (reduced from 31 after deferrals)

---

## Scope Decisions

### IN SCOPE (MVP/Demo)
- ✅ Invoices Module (full implementation)
- ✅ New Job Form
- ✅ Frontend Types (invoice, user, organization)
- ✅ PDF Export (invoices, estimates)
- ✅ CSV Export (reports data)

### DEFERRED
- ❌ Forgot Password (no SendGrid API key)
- ❌ Email Verification (stakeholder decision)
- ❌ Welcome Email (no SendGrid)
- ❌ Calendar (needs more stakeholder input)
- ❌ Profile Page (medium priority, defer)
- ❌ Settings Page (medium priority, defer)
- ❌ Reports (low priority for demo)
- ❌ Help (AI agent planned separately)

---

## Phase 1: Core Types & Infrastructure

**Effort**: 1 day

### 1.1 Create Missing Types

#### `frontend/src/types/invoice.ts`
```typescript
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'cash' | 'check' | 'card' | 'ach' | 'financing' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  order: number
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber: string | null
  notes: string | null
  status: PaymentStatus
  createdAt: string
}

export interface Invoice {
  id: string
  organizationId: string
  jobId: string
  invoiceNumber: string
  status: InvoiceStatus
  invoiceDate: string
  dueDate: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  total: number
  amountPaid: number
  balanceDue: number
  notes: string | null
  terms: string | null
  sentAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  lineItems: InvoiceLineItem[]
  payments: Payment[]
  job?: Job
}

export interface CreateInvoiceData {
  jobId: string
  invoiceDate?: string
  dueDate?: string
  taxRate?: number
  discountAmount?: number
  notes?: string
  terms?: string
}

export interface CreateLineItemData {
  description: string
  quantity: number
  unitPrice: number
  order?: number
}

export interface CreatePaymentData {
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
}
```

#### `frontend/src/types/user.ts`
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
```

#### `frontend/src/types/organization.ts`
```typescript
export type PlanType = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

export type PaymentTerms = 
  | 'due_on_receipt'
  | 'net_15'
  | 'net_30'
  | 'net_60'
  | '1_10_net_30'      // 1% 10 Net 30
  | '1_10th_net_eom'   // 1% 10th Net EOM
  | '2_10_net_30'      // 2% 10 Net 30
  | '2_10th_net_eom'   // 2% 10th Net EOM
  | 'consignment'
  | 'custom'

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
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  defaultTaxRate?: number
  paymentTerms?: PaymentTerms
  customPaymentTerms?: string[]  // For org-specific terms
  invoicePrefix?: string
  defaultInvoiceNotes?: string
  defaultInvoiceTerms?: string
}
```

### 1.2 Update Type Exports

Update `frontend/src/types/index.ts` to export new types.

---

## Phase 2: Invoices Module

**Effort**: 5 days

### 2.1 Invoices Store (`frontend/src/stores/invoices.ts`)

**Day 1**

```typescript
import { create } from 'zustand'
import api from '../lib/api'
import type { Invoice, CreateInvoiceData, ... } from '../types'

interface InvoicesState {
  invoices: Invoice[]
  selectedInvoice: Invoice | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchInvoices: (jobId?: string, status?: InvoiceStatus) => Promise<void>
  fetchInvoice: (id: string) => Promise<void>
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice>
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  sendInvoice: (id: string) => Promise<void>
  
  // Line items
  addLineItem: (invoiceId: string, data: CreateLineItemData) => Promise<void>
  updateLineItem: (invoiceId: string, itemId: string, data: Partial<InvoiceLineItem>) => Promise<void>
  deleteLineItem: (invoiceId: string, itemId: string) => Promise<void>
  
  // Payments
  recordPayment: (invoiceId: string, data: CreatePaymentData) => Promise<void>
  
  // Selection
  setSelectedInvoice: (invoice: Invoice | null) => void
  clearError: () => void
}
```

Include snake_case ↔ camelCase transform functions (follow existing pattern in jobs store).

### 2.2 InvoicesPage (`frontend/src/pages/InvoicesPage.tsx`)

**Day 2**

Replace placeholder with:
- Invoice list (table view)
- Status filter tabs: All | Draft | Sent | Paid | Overdue
- Search by invoice number or customer name
- "Create Invoice" button (links to job selection or direct create)
- Click row to view details

### 2.3 Invoice Components

**Day 3-4**

#### `InvoiceList.tsx`
- Table with columns: Invoice #, Customer, Date, Due Date, Amount, Status, Actions
- Sortable columns
- Row click opens detail

#### `InvoiceStatusBadge.tsx`
- Color-coded status badges
- Draft (gray), Sent (blue), Viewed (purple), Partial (yellow), Paid (green), Overdue (red), Cancelled (gray strikethrough)

#### `InvoiceDetail.tsx` (Drawer or Page)
- Invoice header (number, dates, status)
- Customer info (from job)
- Line items table (editable)
- Totals section (subtotal, tax, discount, total, paid, balance)
- Payment history
- Actions: Edit, Send, Record Payment, Download PDF, Delete

#### `InvoiceForm.tsx`
- Create/Edit invoice form
- Job selector (required)
- Date pickers (invoice date, due date)
- Tax rate input
- Discount input
- Notes/Terms textareas

#### `InvoiceLineItems.tsx`
- Editable line items table
- Add row button
- Delete row button
- Real-time total calculation

#### `PaymentForm.tsx` (Modal)
- Amount input
- Date picker
- Payment method select (Cash, Check, Card, ACH, Financing, Other)
- Reference number (optional)
- Notes (optional)

#### `PaymentHistory.tsx`
- List of payments with date, amount, method, reference

### 2.4 PDF Export

**Day 5**

Using `jspdf` + `html2canvas` or `@react-pdf/renderer`:

#### `InvoicePDF.tsx`
- Formatted invoice for PDF export
- Company logo/header
- Customer info
- Line items table
- Totals
- Terms/Notes
- Footer

#### Export function
```typescript
export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  // Generate PDF
  // Trigger download
}
```

---

## Phase 3: New Job Form

**Effort**: 3 days

### 3.1 NewJobPage (`frontend/src/pages/NewJobPage.tsx`)

**Day 1-2**

Replace placeholder with multi-section form:

#### Section 1: Basic Info
- Title (required)
- Job Type (select - full_replacement, repair, inspection, etc.)
- Description (textarea)

#### Section 2: Customer & Property
- Customer search/select (from contacts)
- Property select (from customer's properties)
- "Add New Contact" quick action

#### Section 3: Assignment & Scheduling
- Assigned To (select from users)
- Scheduled Date (date picker)
- Scheduled Time (time picker or text)
- Estimated Duration (number, days)

#### Section 4: Financial
- Estimated Value (currency input)

#### Section 5: Insurance (Collapsible)
- Is Insurance Job (toggle)
- If true, show:
  - Insurance Company
  - Claim Number
  - Adjuster Name
  - Adjuster Phone
  - Adjuster Email
  - Deductible

#### Section 6: Additional
- Crew/Team (text)
- Tags (tag input)

### 3.2 Form Components

**Day 3**

#### `ContactSelector.tsx`
- Searchable dropdown
- Shows contact name + primary address
- "Add New" option at bottom

#### `PropertySelector.tsx`
- Dropdown filtered by selected contact
- Shows address
- "Add New" option

#### `UserSelector.tsx`
- Dropdown of org users
- Shows name + role

#### `InsuranceFields.tsx`
- Collapsible section
- All insurance-related inputs

### 3.3 Form Submission

- Validate (only title required)
- Call `jobsStore.createJob()`
- On success: Navigate to job detail page
- Show success toast

---

## Phase 4: Job Detail - Invoice Integration

**Effort**: 1 day

### 4.1 Add "Create Invoice" to Job Detail

In `JobDetailsDrawer.tsx` or job detail view:
- Add "Create Invoice" button
- Opens invoice form pre-filled with job
- Or creates invoice directly and opens detail

### 4.2 Show Invoices on Job

- List invoices associated with job
- Show status, amount, balance
- Click to view invoice detail

---

## Phase 5: Quick Wins

**Effort**: 1 day

### 5.1 Task Management on Job Detail

Backend API exists. Add to job detail:
- Tasks list
- Add task form
- Mark complete checkbox
- Delete task

### 5.2 CSV Export Utility

Create reusable CSV export:
```typescript
export function downloadCSV(data: any[], filename: string): void {
  // Convert to CSV
  // Trigger download
}
```

---

## Implementation Order

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Types + Store setup | invoice.ts, user.ts, organization.ts, invoices store |
| 2 | InvoicesPage + List | Working invoice list page |
| 3 | Invoice Detail | View invoice with line items |
| 4 | Invoice Form + Line Items | Create/edit invoices |
| 5 | Payments + PDF | Record payments, PDF export |
| 6 | New Job Form | Basic form with all sections |
| 7 | Contact/Property selectors | Searchable dropdowns |
| 8 | Form polish + validation | Complete new job form |
| 9 | Job-Invoice integration | Create invoice from job, show on job |
| 10 | Task management + CSV | Quick wins |

---

## Dependencies

### NPM Packages to Add

```bash
# PDF generation
npm install jspdf html2canvas
# OR
npm install @react-pdf/renderer

# Date handling (if not already)
npm install date-fns

# Currency formatting
npm install currency.js
```

### Backend Ready

- ✅ Invoices API - Complete
- ✅ Jobs API - Complete
- ✅ Contacts API - Complete
- ✅ Users API - Complete
- ✅ Job Tasks API - Complete

---

## Success Criteria

### Invoices Module
- [ ] Can view list of invoices
- [ ] Can filter by status
- [ ] Can create invoice from job
- [ ] Can add/edit line items
- [ ] Can record payments
- [ ] Can download PDF
- [ ] Totals auto-calculate

### New Job Form
- [ ] Can create job with just title
- [ ] Can select existing contact
- [ ] Can select property
- [ ] Can assign to user
- [ ] Can set schedule
- [ ] Can add insurance info
- [ ] Redirects to job detail on success

### Integration
- [ ] Job detail shows invoices
- [ ] Can create invoice from job detail
- [ ] Job detail shows tasks
- [ ] Can manage tasks on job

---

## Notes for Future

### After Demo (Launch Prep)
1. SendGrid integration (see [auth-email/deferred-sendgrid.md](auth-email/deferred-sendgrid.md))
2. Email verification (see [auth-email/deferred-email-verification.md](auth-email/deferred-email-verification.md))
3. Forgot password flow
4. Profile page
5. Settings page
6. Reports module
7. Calendar integration

### Payment Terms
Payment terms should be configurable per-organization. Default options:
- Due on receipt
- Net 15
- Net 30
- Net 60
- 1% 10 Net 30
- 1% 10th Net EOM
- 2% 10 Net 30
- 2% 10th Net EOM
- Consignment

Store in `organization.settings.paymentTerms` and `organization.settings.customPaymentTerms[]`.
