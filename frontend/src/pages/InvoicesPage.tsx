import * as React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button, Spinner, EmptyState } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/stores/uiStore'
import { useInvoicesStore } from '@/stores/invoices'
import { InvoiceDetailsDrawer } from '@/components/invoices/InvoiceDetailsDrawer'
import {
  type Invoice,
  type InvoiceStatus,
  INVOICE_STATUS_CONFIG,
  formatCurrency,
} from '@/types/invoice'
import { formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Send,
  Trash2,
  Eye,
  Edit,
  Download,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

// Status badge component
function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.draft

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  )
}

interface InvoiceRowProps {
  invoice: Invoice
  onView: () => void
  onEdit: () => void
  onSend: () => void
  onRecordPayment: () => void
  onDelete: () => void
}

function InvoiceRow({
  invoice,
  onView,
  onEdit,
  onSend,
  onRecordPayment,
  onDelete,
}: InvoiceRowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Derive customer name from job if available
  const customerName = invoice.job?.customerName || 'Unknown Customer'

  const isOverdue = invoice.status === 'overdue' || 
    (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled')

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onView}>
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {invoice.job?.title || 'No job'}
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-900">{customerName}</p>
      </td>
      <td className="px-4 py-4 text-right">
        <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
        {invoice.balanceDue > 0 && invoice.balanceDue < invoice.total && (
          <p className="text-sm text-yellow-600">
            {formatCurrency(invoice.balanceDue)} due
          </p>
        )}
      </td>
      <td className="px-4 py-4">
        <InvoiceStatusBadge status={isOverdue ? 'overdue' : invoice.status} />
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        <div>
          <p>{formatDate(invoice.invoiceDate)}</p>
          {invoice.dueDate && (
            <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
              Due: {formatDate(invoice.dueDate)}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onView()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              {invoice.status === 'draft' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onSend()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Send className="h-4 w-4" />
                  Send Invoice
                </button>
              )}
              {invoice.balanceDue > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onRecordPayment()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <DollarSign className="h-4 w-4" />
                  Record Payment
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implement PDF download
                  console.log('Download PDF:', invoice.id)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <hr className="my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function InvoiceCard({
  invoice,
  onView,
}: {
  invoice: Invoice
  onView: () => void
}) {
  const customerName = invoice.job?.customerName || 'Unknown Customer'

  const isOverdue = invoice.status === 'overdue' || 
    (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled')

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{customerName}</p>
          </div>
          <InvoiceStatusBadge status={isOverdue ? 'overdue' : invoice.status} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Invoice Date</span>
            <span>{formatDate(invoice.invoiceDate)}</span>
          </div>
          {invoice.dueDate && (
            <div className={`flex justify-between ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <span>Due Date</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-900">
              {formatCurrency(invoice.total)}
            </span>
            {invoice.balanceDue > 0 && invoice.balanceDue < invoice.total && (
              <span className="text-yellow-600">
                {formatCurrency(invoice.balanceDue)} due
              </span>
            )}
            {invoice.status === 'paid' && (
              <span className="text-green-600">Paid in full</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface InvoicesPageProps {
  onNavigate?: (path: string) => void
}

export function InvoicesPage({ onNavigate }: InvoicesPageProps) {
  const { setPageTitle } = useUIStore()
  const {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    deleteInvoice,
    sendInvoice,
    clearError,
  } = useInvoicesStore()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | 'all'>(
    'all'
  )
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    setPageTitle('Invoices')
  }, [setPageTitle])

  // Fetch invoices on mount
  React.useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Filter invoices
  const filteredInvoices = React.useMemo(() => {
    let result = invoices

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          (inv.job?.title?.toLowerCase().includes(query) ?? false)
      )
    }

    return result
  }, [invoices, searchQuery, statusFilter])

  // Stats
  const stats = React.useMemo(() => {
    const total = invoices.length
    const draft = invoices.filter((inv) => inv.status === 'draft').length
    const pending = invoices.filter((inv) =>
      ['sent', 'viewed', 'partial'].includes(inv.status)
    ).length
    const paid = invoices.filter((inv) => inv.status === 'paid').length
    const overdue = invoices.filter(
      (inv) =>
        inv.status === 'overdue' ||
        (inv.dueDate &&
          new Date(inv.dueDate) < new Date() &&
          inv.status !== 'paid' &&
          inv.status !== 'cancelled')
    ).length
    const totalValue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + inv.balanceDue,
      0
    )

    return { total, draft, pending, paid, overdue, totalValue, totalOutstanding }
  }, [invoices])

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    // Clear selected invoice after animation completes
    setTimeout(() => setSelectedInvoice(null), 300)
  }

  const handleEdit = (id: string) => {
    onNavigate?.(`/invoices/${id}/edit`)
  }

  const handleSend = async (id: string) => {
    try {
      await sendInvoice(id)
    } catch (err) {
      // Error handled by store
    }
  }

  const handleRecordPayment = (id: string) => {
    onNavigate?.(`/invoices/${id}/payment`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await deleteInvoice(id)
    } catch (err) {
      // Error handled by store
    }
  }

  const handleRefresh = () => {
    clearError()
    fetchInvoices()
  }

  // Loading state
  if (isLoading && invoices.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading invoices...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && invoices.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState
          icon="default"
          title="Failed to load invoices"
          description={error}
          action={
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} invoices · {formatCurrency(stats.totalOutstanding)}{' '}
            outstanding
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button onClick={() => onNavigate?.('/invoices/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            <p className="text-sm text-gray-500">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-sm text-gray-500">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              {stats.overdue > 0 && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(
            [
              'all',
              'draft',
              'sent',
              'viewed',
              'partial',
              'paid',
              'overdue',
              'cancelled',
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all'
                ? 'All'
                : INVOICE_STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredInvoices.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No invoices found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or create a new invoice.
          </p>
          <Button className="mt-4" onClick={() => onNavigate?.('/invoices/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      ) : (
        <>
          {/* Table (Desktop) */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        onView={() => handleView(invoice)}
                        onEdit={() => handleEdit(invoice.id)}
                        onSend={() => handleSend(invoice.id)}
                        onRecordPayment={() => handleRecordPayment(invoice.id)}
                        onDelete={() => handleDelete(invoice.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Cards (Mobile) */}
          <div className="lg:hidden space-y-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => handleView(invoice)}
              />
            ))}
          </div>
        </>
      )}

      {/* Invoice Details Drawer */}
      <InvoiceDetailsDrawer
        invoice={selectedInvoice}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onEdit={(inv) => {
          handleCloseDrawer()
          handleEdit(inv.id)
        }}
        onSend={(inv) => handleSend(inv.id)}
        onRecordPayment={(inv) => {
          handleCloseDrawer()
          handleRecordPayment(inv.id)
        }}
        onDownloadPdf={(inv) => {
          // TODO: Implement PDF download
          console.log('Download PDF for invoice:', inv.id)
        }}
        onViewJob={(jobId) => {
          handleCloseDrawer()
          onNavigate?.(`/jobs/${jobId}`)
        }}
        onDelete={(inv) => handleDelete(inv.id)}
      />
    </div>
  )
}

export default InvoicesPage
