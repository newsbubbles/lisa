import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { FormField, FormSection, FormActions } from '@/components/ui/FormField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Save, X, AlertCircle } from 'lucide-react'
import {
  InvoiceLineItems,
  toCreateLineItemData,
  toEditableLineItems,
  calculateSubtotal,
  type EditableLineItem,
} from './InvoiceLineItems'
import { useInvoicesStore } from '@/stores/invoices'
import { useJobsStore } from '@/stores/jobs'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
} from '@/types/invoice'

export interface InvoiceFormProps {
  /** Invoice to edit (null for create mode) */
  invoice?: Invoice | null
  /** Pre-selected job ID (for creating from job page) */
  preselectedJobId?: string
  /** Callback on successful save */
  onSuccess?: (invoice: Invoice) => void
  /** Callback on cancel */
  onCancel?: () => void
  /** Additional class name */
  className?: string
}

interface FormData {
  jobId: string
  invoiceDate: Date | null
  dueDate: Date | null
  taxRate: number
  discountAmount: number
  notes: string
  terms: string
}

interface FormErrors {
  jobId?: string
  invoiceDate?: string
  lineItems?: string
  general?: string
}

/**
 * InvoiceForm - Create or edit an invoice
 *
 * Features:
 * - Job selector (required)
 * - Date pickers for invoice date and due date
 * - Tax rate and discount inputs
 * - Notes and terms textareas
 * - Integrated line items editor
 * - Real-time totals calculation
 */
export function InvoiceForm({
  invoice,
  preselectedJobId,
  onSuccess,
  onCancel,
  className,
}: InvoiceFormProps) {
  const isEditMode = !!invoice

  // Store hooks
  const { createInvoice, updateInvoice, isLoading } = useInvoicesStore()
  const { jobs, fetchJobs, isLoading: jobsLoading } = useJobsStore()

  // Form state
  const [formData, setFormData] = React.useState<FormData>(() => {
    if (invoice) {
      return {
        jobId: invoice.jobId,
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
        taxRate: invoice.taxRate || 0,
        discountAmount: invoice.discountAmount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
      }
    }
    return {
      jobId: preselectedJobId || '',
      invoiceDate: new Date(),
      dueDate: getDefaultDueDate(),
      taxRate: 0,
      discountAmount: 0,
      notes: '',
      terms: 'Payment due upon receipt.',
    }
  })

  // Line items state
  const [lineItems, setLineItems] = React.useState<EditableLineItem[]>(() => {
    if (invoice?.lineItems) {
      return toEditableLineItems(invoice.lineItems)
    }
    return []
  })

  // Validation errors
  const [errors, setErrors] = React.useState<FormErrors>({})

  // Fetch jobs on mount
  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Calculate totals
  const subtotal = calculateSubtotal(lineItems)
  const taxAmount = subtotal * (formData.taxRate / 100)
  const total = subtotal + taxAmount - formData.discountAmount

  // Update form field
  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.jobId) {
      newErrors.jobId = 'Please select a job'
    }

    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required'
    }

    if (lineItems.length === 0) {
      newErrors.lineItems = 'At least one line item is required'
    } else {
      // Check for empty descriptions
      const hasEmptyDescription = lineItems.some(
        (item) => !item.description.trim()
      )
      if (hasEmptyDescription) {
        newErrors.lineItems = 'All line items must have a description'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      if (isEditMode && invoice) {
        // Update existing invoice
        const updateData: UpdateInvoiceData = {
          invoiceDate: formData.invoiceDate?.toISOString().split('T')[0],
          dueDate: formData.dueDate?.toISOString().split('T')[0],
          taxRate: formData.taxRate,
          discountAmount: formData.discountAmount,
          notes: formData.notes || undefined,
          terms: formData.terms || undefined,
        }
        await updateInvoice(invoice.id, updateData)
        // TODO: Handle line item updates separately
        onSuccess?.(invoice)
      } else {
        // Create new invoice
        const createData: CreateInvoiceData = {
          jobId: formData.jobId,
          invoiceDate: formData.invoiceDate?.toISOString().split('T')[0],
          dueDate: formData.dueDate?.toISOString().split('T')[0],
          taxRate: formData.taxRate,
          discountAmount: formData.discountAmount,
          notes: formData.notes || undefined,
          terms: formData.terms || undefined,
        }
        const lineItemsData = toCreateLineItemData(lineItems)
        const newInvoice = await createInvoice(createData, lineItemsData)
        onSuccess?.(newInvoice)
      }
    } catch (error) {
      console.error('Failed to save invoice:', error)
      setErrors({
        general: 'Failed to save invoice. Please try again.',
      })
    }
  }

  // Get selected job details
  const selectedJob = jobs.find((j) => j.id === formData.jobId)

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* General Error */}
      {errors.general && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Job Selection */}
      <FormSection title="Job" description="Select the job this invoice is for">
        <FormField
          label="Job"
          htmlFor="job-select"
          error={errors.jobId}
          required
        >
          {jobsLoading ? (
            <div className="flex items-center gap-2 h-10 text-gray-500">
              <Spinner size="sm" />
              <span className="text-sm">Loading jobs...</span>
            </div>
          ) : (
            <Select
              value={formData.jobId}
              onValueChange={(value) => updateField('jobId', value)}
              disabled={isEditMode} // Can't change job on existing invoice
            >
              <SelectTrigger error={!!errors.jobId}>
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <span className="font-medium">{job.jobNumber}</span>
                    <span className="text-gray-500 ml-2">{job.title}</span>
                    <span className="text-gray-400 ml-2">- {job.customerName}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        {/* Selected Job Details */}
        {selectedJob && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 text-sm">
            <p className="font-medium text-gray-900">{selectedJob.title}</p>
            <p className="text-gray-500">{selectedJob.customerName}</p>
            <p className="text-gray-500">{selectedJob.address}</p>
          </div>
        )}
      </FormSection>

      {/* Dates */}
      <FormSection title="Dates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Invoice Date"
            htmlFor="invoice-date"
            error={errors.invoiceDate}
            required
          >
            <DatePicker
              value={formData.invoiceDate}
              onChange={(date) => updateField('invoiceDate', date)}
              placeholder="Select invoice date"
              error={!!errors.invoiceDate}
            />
          </FormField>

          <FormField
            label="Due Date"
            htmlFor="due-date"
          >
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => updateField('dueDate', date)}
              placeholder="Select due date"
              minDate={formData.invoiceDate || undefined}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Line Items */}
      <FormSection
        title="Line Items"
        description="Add items, services, or materials to the invoice"
      >
        {errors.lineItems && (
          <div className="mb-3 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.lineItems}
          </div>
        )}
        <InvoiceLineItems
          items={lineItems}
          onChange={(items) => {
            setLineItems(items)
            if (errors.lineItems) {
              setErrors((prev) => ({ ...prev, lineItems: undefined }))
            }
          }}
          disabled={false}
        />
      </FormSection>

      {/* Tax & Discount */}
      <FormSection title="Tax & Discount">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Tax Rate"
            htmlFor="tax-rate"
            labelSuffix="%"
          >
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) =>
                updateField('taxRate', parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              rightIcon={<span className="text-gray-400">%</span>}
            />
          </FormField>

          <FormField
            label="Discount"
            htmlFor="discount"
          >
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) =>
                updateField('discountAmount', parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              leftIcon={<span className="text-gray-400">$</span>}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Totals Summary */}
      {lineItems.length > 0 && (
        <Card className="bg-gray-50">
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            {formData.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {formData.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatCurrency(formData.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-lg text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Notes & Terms */}
      <FormSection title="Notes & Terms">
        <div className="space-y-4">
          <FormField
            label="Notes"
            htmlFor="notes"
            helperText="Visible to customer on the invoice"
          >
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Add any notes for the customer..."
              rows={3}
            />
          </FormField>

          <FormField
            label="Terms & Conditions"
            htmlFor="terms"
          >
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => updateField('terms', e.target.value)}
              placeholder="Payment terms, conditions, etc."
              rows={3}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Form Actions */}
      <FormActions align="between">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          leftIcon={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          leftIcon={
            isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
        >
          {isLoading
            ? 'Saving...'
            : isEditMode
            ? 'Update Invoice'
            : 'Create Invoice'}
        </Button>
      </FormActions>
    </form>
  )
}

// --- Helpers ---

/**
 * Get default due date (30 days from now)
 */
function getDefaultDueDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date
}

export default InvoiceForm
