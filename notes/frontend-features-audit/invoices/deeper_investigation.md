# Invoices Module - Deeper Investigation

**Date**: 2026-03-07  
**Status**: Investigation Complete  
**Priority**: HIGH (Backend Ready, Frontend Stub)

---

## Executive Summary

The backend has a **fully functional Invoice API** with CRUD, payments, line items, and auto-calculation. The frontend has **zero implementation** - just a placeholder page.

---

## Backend API Analysis

### Source File
`backend/app/api/v1/endpoints/invoices.py`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices (filterable by job_id, status) |
| POST | `/invoices` | Create invoice (from job) |
| GET | `/invoices/{id}` | Get invoice details |
| PATCH | `/invoices/{id}` | Update invoice |
| DELETE | `/invoices/{id}` | Delete invoice |
| POST | `/invoices/{id}/send` | Send invoice to customer |
| POST | `/invoices/{id}/payments` | Record a payment |
| POST | `/invoices/{id}/line-items` | Add line item |
| PATCH | `/invoices/{id}/line-items/{item_id}` | Update line item |
| DELETE | `/invoices/{id}/line-items/{item_id}` | Delete line item |

### Invoice Schema (from `backend/app/schemas/invoice.py`)

```typescript
// Backend response shape (snake_case)
interface InvoiceResponse {
  id: UUID
  organization_id: UUID
  job_id: UUID
  invoice_number: string
  status: InvoiceStatus  // draft, sent, viewed, partial, paid, overdue, cancelled
  invoice_date: date
  due_date: date | null
  subtotal: float
  tax_rate: float
  tax_amount: float
  discount_amount: float
  total: float
  amount_paid: float
  balance_due: float
  notes: string | null
  terms: string | null
  sent_at: datetime | null
  paid_at: datetime | null
  created_at: datetime
  updated_at: datetime
  line_items: InvoiceLineItemResponse[]
  payments: PaymentResponse[]
  job: JobResponse  // nested job info
}

interface InvoiceLineItemResponse {
  id: UUID
  invoice_id: UUID
  description: string
  quantity: float
  unit_price: float
  total: float  // computed: quantity * unit_price
  order: int
}

interface PaymentResponse {
  id: UUID
  invoice_id: UUID
  amount: float
  payment_date: date
  payment_method: PaymentMethod  // cash, check, card, ach, financing, other
  reference_number: string | null
  notes: string | null
  stripe_payment_id: string | null
  status: string  // pending, completed, failed, refunded
  created_at: datetime
}
```

### Invoice Status Enum
```python
class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIAL = "partial"   # Partially paid
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
```

### Payment Method Enum
```python
class PaymentMethod(str, Enum):
    CASH = "cash"
    CHECK = "check"
    CARD = "card"
    ACH = "ach"
    FINANCING = "financing"
    OTHER = "other"
```

### Auto-Calculation Logic
The backend automatically calculates:
- `subtotal` = sum of line item totals
- `tax_amount` = subtotal × (tax_rate / 100)
- `total` = subtotal + tax_amount - discount_amount
- `amount_paid` = sum of completed payments
- `balance_due` = total - amount_paid
- Status auto-updates based on payments (PAID, PARTIAL, OVERDUE)

---

## Frontend Implementation Required

### 1. Types (`frontend/src/types/invoice.ts`)

**Transform snake_case → camelCase:**

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
  paymentDate: string  // ISO date
  paymentMethod: PaymentMethod
  referenceNumber: string | null
  notes: string | null
  stripePaymentId: string | null
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
  job?: Job  // nested job info
}
```

### 2. Store (`frontend/src/stores/invoices.ts`)

Needs:
- `invoices: Invoice[]`
- `selectedInvoice: Invoice | null`
- `isLoading: boolean`
- `error: string | null`
- `fetchInvoices(jobId?: string, status?: InvoiceStatus)`
- `fetchInvoice(id: string)`
- `createInvoice(data: CreateInvoiceData)`
- `updateInvoice(id: string, data: UpdateInvoiceData)`
- `deleteInvoice(id: string)`
- `sendInvoice(id: string)`
- `recordPayment(invoiceId: string, data: CreatePaymentData)`
- `addLineItem(invoiceId: string, data: CreateLineItemData)`
- `updateLineItem(invoiceId: string, itemId: string, data: UpdateLineItemData)`
- `deleteLineItem(invoiceId: string, itemId: string)`

**Transform functions needed** (similar to jobs/estimates stores).

### 3. Page (`frontend/src/pages/InvoicesPage.tsx`)

Replace placeholder with:
- Invoice list view (table or cards)
- Status filter tabs (All, Draft, Sent, Paid, Overdue)
- Search by invoice number or customer name
- Quick actions (Send, Mark Paid, View)
- Create invoice modal/drawer
- Invoice detail view (line items, payments)
- Record payment modal

### 4. Components Needed

- `InvoiceList.tsx` - List/table of invoices
- `InvoiceCard.tsx` - Card view for invoice
- `InvoiceDetail.tsx` - Full invoice view
- `InvoiceForm.tsx` - Create/edit invoice
- `InvoiceLineItems.tsx` - Line items editor
- `PaymentForm.tsx` - Record payment modal
- `PaymentHistory.tsx` - List of payments
- `InvoiceStatusBadge.tsx` - Status indicator

---

## Integration Points

### Job → Invoice Flow
1. User views a Job
2. Clicks "Create Invoice"
3. Invoice created with job_id reference
4. Line items can be copied from estimate or entered manually

### Invoice → Payment Flow
1. Invoice is sent to customer
2. Customer pays (external - card, check, etc.)
3. User records payment in system
4. Balance auto-updates
5. Status changes to PARTIAL or PAID

---

## Questions for Stakeholder

1. **Default payment terms?** What's the default due date (Net 30? Net 15?)?
2. **Tax rate source?** Is tax rate per-org setting or per-job?
3. **Invoice numbering?** Current format is `INV-{YEAR}-{4-char-random}`. Is this acceptable?
4. **Email template?** What should the "Send Invoice" email look like?
5. **Payment processing?** Should we integrate Stripe for online payments, or just record external payments?
6. **PDF generation?** Should invoices be downloadable as PDF?

---

## Effort Estimate

| Component | Effort |
|-----------|--------|
| Types | 0.5 day |
| Store | 1 day |
| InvoicesPage (list) | 1 day |
| Invoice Detail View | 1 day |
| Invoice Form | 1 day |
| Payment Recording | 0.5 day |
| Testing & Polish | 1 day |
| **Total** | **~6 days** |

---

## Confidence Level: HIGH

Backend is complete and well-documented. Frontend implementation is straightforward following existing patterns (jobs, estimates stores).
