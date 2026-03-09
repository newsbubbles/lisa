import * as React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { InvoiceForm } from '@/components/invoices'
import { InvoiceDetailsDrawer } from '@/components/invoices'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useUIStore } from '@/stores/uiStore'
import { useInvoicesStore } from '@/stores/invoices'
import { ArrowLeft, Eye } from 'lucide-react'
import type { Invoice } from '@/types/invoice'

export interface InvoiceFormPageProps {
  onNavigate?: (path: string) => void
}

/**
 * InvoiceFormPage - Page wrapper for creating/editing invoices
 * 
 * Routes:
 * - /invoices/new - Create new invoice
 * - /invoices/new?jobId=xxx - Create invoice for specific job
 * - /invoices/:id/edit - Edit existing invoice
 */
export function InvoiceFormPage({ onNavigate }: InvoiceFormPageProps) {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { setPageTitle } = useUIStore()
  const { invoices, fetchInvoices, isLoading } = useInvoicesStore()

  const isEditing = !!id
  const jobId = searchParams.get('jobId') || undefined

  // Preview drawer state
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [savedInvoice, setSavedInvoice] = React.useState<Invoice | null>(null)

  // Set page title
  React.useEffect(() => {
    setPageTitle(isEditing ? 'Edit Invoice' : 'New Invoice')
  }, [setPageTitle, isEditing])

  // Fetch invoices if editing
  React.useEffect(() => {
    if (isEditing && invoices.length === 0) {
      fetchInvoices()
    }
  }, [isEditing, invoices.length, fetchInvoices])

  // Find invoice being edited
  const invoiceToEdit = isEditing
    ? invoices.find((inv) => inv.id === id)
    : undefined

  // Handle successful save
  const handleSuccess = (invoice: Invoice) => {
    setSavedInvoice(invoice)
    // Navigate back to invoices list
    onNavigate?.('/invoices')
  }

  // Handle cancel
  const handleCancel = () => {
    onNavigate?.('/invoices')
  }

  // Show loading state when editing and invoice not yet loaded
  if (isEditing && isLoading && !invoiceToEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    )
  }

  // Show error if editing but invoice not found
  if (isEditing && !isLoading && !invoiceToEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Invoice not found</p>
          <Button variant="secondary" onClick={() => onNavigate?.('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.('/invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Invoice' : 'New Invoice'}
          </h1>
        </div>

        {/* Preview button (only show if we have a saved invoice) */}
        {savedInvoice && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </div>

      {/* Form */}
      <InvoiceForm
        invoice={invoiceToEdit}
        preselectedJobId={jobId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Preview Drawer */}
      {savedInvoice && (
        <InvoiceDetailsDrawer
          invoice={savedInvoice}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onEdit={() => setPreviewOpen(false)}
          onRecordPayment={() => {}}
        />
      )}
    </div>
  )
}

export default InvoiceFormPage
