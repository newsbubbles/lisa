/**
 * Invoice Types for Lisa Roofing CRM
 *
 * Data models for invoices, line items, and payments.
 */

/**
 * Job summary for invoice display (from backend).
 */
export interface JobSummaryForInvoice {
  id: string
  title: string
  jobNumber: string
  customerName: string | null
  customerEmail: string | null
  propertyAddress: string | null
}

/**
 * Invoice status values.
 */
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'

/**
 * Payment method options.
 */
export type PaymentMethod =
  | 'cash'
  | 'check'
  | 'card'
  | 'bank_transfer'
  | 'financing'
  | 'other'

/**
 * Payment status values.
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

/**
 * Line item in an invoice.
 */
export interface InvoiceLineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  order: number
  createdAt: string
  updatedAt: string
}

/**
 * Payment received for an invoice.
 */
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
  updatedAt: string
}

/**
 * Invoice - Full model with line items and payments.
 */
export interface Invoice {
  id: string
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
  pdfUrl: string | null
  sentAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  // Related data
  lineItems: InvoiceLineItem[]
  payments: Payment[]
  job?: JobSummaryForInvoice
}

/**
 * Invoice summary for list views (lighter payload).
 */
export interface InvoiceSummary {
  id: string
  jobId: string
  invoiceNumber: string
  status: InvoiceStatus
  invoiceDate: string
  dueDate: string | null
  total: number
  amountPaid: number
  balanceDue: number
  customerName: string
  jobTitle: string
}

/**
 * Data for creating a new invoice.
 */
export interface CreateInvoiceData {
  jobId: string
  invoiceDate?: string
  dueDate?: string
  taxRate?: number
  discountAmount?: number
  notes?: string
  terms?: string
}

/**
 * Data for updating an invoice.
 */
export interface UpdateInvoiceData {
  invoiceDate?: string
  dueDate?: string
  taxRate?: number
  discountAmount?: number
  notes?: string
  terms?: string
  status?: InvoiceStatus
}

/**
 * Data for creating a line item.
 */
export interface CreateLineItemData {
  description: string
  quantity: number
  unitPrice: number
  order?: number
}

/**
 * Data for updating a line item.
 */
export interface UpdateLineItemData {
  description?: string
  quantity?: number
  unitPrice?: number
  order?: number
}

/**
 * Data for recording a payment.
 */
export interface CreatePaymentData {
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
}

/**
 * Invoice status display configuration.
 */
export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  sent: { label: 'Sent', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  viewed: { label: 'Viewed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  partial: { label: 'Partial', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-100' },
}

/**
 * Payment method display labels.
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Credit/Debit Card',
  bank_transfer: 'Bank Transfer (ACH)',
  financing: 'Financing',
  other: 'Other',
}

/**
 * Format currency value.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Check if invoice is overdue.
 */
export function isInvoiceOverdue(invoice: Invoice | InvoiceSummary): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false
  }
  if (invoice.dueDate) {
    return new Date(invoice.dueDate) < new Date()
  }
  return false
}
