import * as React from 'react'
import {
  Drawer,
  DrawerSection,
  DrawerField,
} from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Copy,
  Check,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Download,
  CreditCard,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Clock,
} from 'lucide-react'
import type {
  Invoice,
  InvoiceLineItem,
  Payment,
  InvoiceStatus,
  PaymentMethod,
} from '@/types/invoice'
import { INVOICE_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/types/invoice'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface InvoiceDetailsDrawerProps {
  /** The invoice to display */
  invoice: Invoice | null
  /** Whether the drawer is open */
  open: boolean
  /** Callback when drawer should close */
  onClose: () => void
  /** Callback to edit invoice */
  onEdit?: (invoice: Invoice) => void
  /** Callback to send invoice */
  onSend?: (invoice: Invoice) => void
  /** Callback to record payment */
  onRecordPayment?: (invoice: Invoice) => void
  /** Callback to download PDF */
  onDownloadPdf?: (invoice: Invoice) => void
  /** Callback to add line item */
  onAddLineItem?: (invoice: Invoice) => void
  /** Callback to edit line item */
  onEditLineItem?: (invoice: Invoice, lineItem: InvoiceLineItem) => void
  /** Callback to delete line item */
  onDeleteLineItem?: (invoice: Invoice, lineItemId: string) => void
  /** Callback to view job */
  onViewJob?: (jobId: string) => void
  /** Callback to delete invoice */
  onDelete?: (invoice: Invoice) => void
}

export function InvoiceDetailsDrawer({
  invoice,
  open,
  onClose,
  onEdit,
  onSend,
  onRecordPayment,
  onDownloadPdf,
  onAddLineItem,
  onEditLineItem,
  onDeleteLineItem,
  onViewJob,
  onDelete,
}: InvoiceDetailsDrawerProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  if (!invoice) return null

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
  const canSend = invoice.status === 'draft'
  const canRecordPayment = ['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status)
  const canEdit = invoice.status === 'draft'
  const isOverdue = invoice.status === 'overdue' || (
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date() &&
    invoice.status !== 'paid' &&
    invoice.status !== 'cancelled'
  )

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Footer with quick actions
  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {canSend && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSend?.(invoice)}
          leftIcon={<Send className="h-4 w-4" />}
          className="flex-1 sm:flex-none"
        >
          Send Invoice
        </Button>
      )}
      {canRecordPayment && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onRecordPayment?.(invoice)}
          leftIcon={<CreditCard className="h-4 w-4" />}
          className="flex-1 sm:flex-none"
        >
          Record Payment
        </Button>
      )}
      {invoice.pdfUrl && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDownloadPdf?.(invoice)}
          leftIcon={<Download className="h-4 w-4" />}
        >
          PDF
        </Button>
      )}
      {canEdit && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit?.(invoice)}
          leftIcon={<Edit className="h-4 w-4" />}
        >
          Edit
        </Button>
      )}
      {invoice.status === 'draft' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(invoice)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Invoice ${invoice.invoiceNumber}`}
      description={invoice.job?.customerName || 'No customer'}
      footer={footer}
      width="lg"
    >
      {/* Status Section */}
      <DrawerSection title="Status">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InvoiceStatusBadge status={invoice.status} size="lg" />
            {isOverdue && invoice.dueDate && (
              <span className="inline-flex items-center gap-1 text-sm text-red-600">
                <Clock className="h-4 w-4" />
                {getDaysOverdue(invoice.dueDate)} days overdue
              </span>
            )}
          </div>
          {invoice.sentAt && (
            <span className="text-sm text-gray-500">
              Sent {formatDate(invoice.sentAt)}
            </span>
          )}
        </div>
      </DrawerSection>

      {/* Job Info */}
      {invoice.job && (
        <DrawerSection title="Job">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {invoice.job.title}
              </p>
              <p className="text-sm text-gray-500">
                {invoice.job.jobNumber}
              </p>
              {invoice.job.propertyAddress && (
                <p className="text-sm text-gray-500 mt-1">
                  {invoice.job.propertyAddress}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewJob?.(invoice.jobId)}
            >
              View Job
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DrawerSection>
      )}

      {/* Customer Info */}
      {invoice.job && (
        <DrawerSection title="Customer">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <DrawerField label="Name">
              {invoice.job.customerName || 'N/A'}
            </DrawerField>
            {invoice.job.customerEmail && (
              <DrawerField label="Email">
                <button
                  onClick={() => handleCopy(invoice.job!.customerEmail!, 'email')}
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 truncate max-w-full"
                >
                  <span className="truncate">{invoice.job.customerEmail}</span>
                  {copiedField === 'email' ? (
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                </button>
              </DrawerField>
            )}
          </div>
        </DrawerSection>
      )}

      {/* Dates */}
      <DrawerSection title="Dates">
        <div className="grid grid-cols-2 gap-x-4">
          <DrawerField label="Invoice Date">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(invoice.invoiceDate)}
            </span>
          </DrawerField>
          <DrawerField label="Due Date">
            <span className={cn(
              'inline-flex items-center gap-1',
              isOverdue && 'text-red-600 font-medium'
            )}>
              <Calendar className="h-4 w-4 text-gray-400" />
              {invoice.dueDate ? formatDate(invoice.dueDate) : 'Not set'}
            </span>
          </DrawerField>
        </div>
      </DrawerSection>

      {/* Line Items */}
      <DrawerSection title="Line Items">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {invoice.lineItems.length} item{invoice.lineItems.length !== 1 ? 's' : ''}
          </span>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => onAddLineItem?.(invoice)}
            >
              Add
            </Button>
          )}
        </div>

        {invoice.lineItems.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No line items yet</p>
        ) : (
          <div className="space-y-2">
            {invoice.lineItems.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                canEdit={canEdit}
                onEdit={() => onEditLineItem?.(invoice, item)}
                onDelete={() => onDeleteLineItem?.(invoice, item.id)}
              />
            ))}
          </div>
        )}
      </DrawerSection>

      {/* Totals */}
      <DrawerSection title="Totals">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
              <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(invoice.total)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Amount Paid</span>
              <span>-{formatCurrency(invoice.amountPaid)}</span>
            </div>
          )}
          <div className={cn(
            'flex justify-between pt-2 border-t border-gray-200 font-semibold text-base',
            invoice.balanceDue > 0 ? 'text-gray-900' : 'text-green-600'
          )}>
            <span>Balance Due</span>
            <span>{formatCurrency(invoice.balanceDue)}</span>
          </div>
        </div>
      </DrawerSection>

      {/* Payments */}
      <DrawerSection title="Payments">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''}
          </span>
          {canRecordPayment && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => onRecordPayment?.(invoice)}
            >
              Record
            </Button>
          )}
        </div>

        {invoice.payments.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No payments recorded</p>
        ) : (
          <div className="space-y-3">
            {invoice.payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </DrawerSection>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <DrawerSection title="Notes & Terms">
          {invoice.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Terms</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {invoice.terms}
              </p>
            </div>
          )}
        </DrawerSection>
      )}
    </Drawer>
  )
}

// --- Sub-components ---

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  size?: 'sm' | 'lg'
}

function InvoiceStatusBadge({ status, size = 'sm' }: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUS_CONFIG[status]
  return (
    <Badge
      variant="default"
      size={size}
      className={cn(config.bgColor, config.color)}
    >
      {config.label}
    </Badge>
  )
}

interface LineItemRowProps {
  item: InvoiceLineItem
  canEdit: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function LineItemRow({ item, canEdit, onEdit, onDelete }: LineItemRowProps) {
  return (
    <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{item.description}</p>
        <p className="text-xs text-gray-500">
          {item.quantity} × {formatCurrency(item.unitPrice)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(item.total)}
        </span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface PaymentRowProps {
  payment: Payment
}

function PaymentRow({ payment }: PaymentRowProps) {
  const methodLabel = PAYMENT_METHOD_LABELS[payment.paymentMethod]
  
  return (
    <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-green-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {formatCurrency(payment.amount)}
          </span>
        </div>
        <p className="text-xs text-green-600 mt-0.5">
          {methodLabel} • {formatDate(payment.paymentDate)}
        </p>
        {payment.referenceNumber && (
          <p className="text-xs text-green-600">
            Ref: {payment.referenceNumber}
          </p>
        )}
        {payment.notes && (
          <p className="text-xs text-green-700 mt-1">{payment.notes}</p>
        )}
      </div>
      <Badge
        variant="default"
        size="sm"
        className={cn(
          payment.status === 'completed' && 'bg-green-100 text-green-700',
          payment.status === 'pending' && 'bg-yellow-100 text-yellow-700',
          payment.status === 'failed' && 'bg-red-100 text-red-700',
          payment.status === 'refunded' && 'bg-gray-100 text-gray-700'
        )}
      >
        {payment.status}
      </Badge>
    </div>
  )
}

// --- Helpers ---

function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
