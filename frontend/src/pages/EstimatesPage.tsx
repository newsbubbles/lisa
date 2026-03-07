import * as React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button, Spinner, EmptyState } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/stores/uiStore'
import { useEstimatesStore, type EstimateStatus, type Estimate } from '@/stores/estimates'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Send,
  Copy,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// Status config
const statusConfig: Record<EstimateStatus, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', icon: Send, color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-purple-100 text-purple-700' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', icon: XCircle, color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' },
}

function EstimateStatusBadge({ status }: { status: EstimateStatus }) {
  const config = statusConfig[status] || statusConfig.draft
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}

interface EstimateRowProps {
  estimate: Estimate
  onView: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function EstimateRow({ estimate, onView, onEdit, onDuplicate, onDelete }: EstimateRowProps) {
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

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onView}>
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{estimate.estimateNumber}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">{estimate.name}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">-</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">-</p>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <p className="font-medium text-gray-900">{formatCurrency(estimate.total)}</p>
        <p className="text-sm text-green-600">{estimate.profitMargin.toFixed(1)}% margin</p>
      </td>
      <td className="px-4 py-4">
        <EstimateStatusBadge status={estimate.status} />
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(estimate.createdAt)}
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
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDuplicate()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Copy className="h-4 w-4" />
                Duplicate
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

function EstimateCard({ estimate, onView }: { estimate: Estimate; onView: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium text-gray-900">{estimate.estimateNumber}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{estimate.name}</p>
          </div>
          <EstimateStatusBadge status={estimate.status} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-900">{formatCurrency(estimate.total)}</span>
            <span className="text-green-600">{estimate.profitMargin.toFixed(1)}% margin</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface EstimatesPageProps {
  onNavigate?: (path: string) => void
}

export function EstimatesPage({ onNavigate }: EstimatesPageProps) {
  const { setPageTitle } = useUIStore()
  const {
    estimates,
    isLoading,
    error,
    totalCount,
    fetchEstimates,
    deleteEstimate,
    clearError,
  } = useEstimatesStore()
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<EstimateStatus | 'all'>('all')

  React.useEffect(() => {
    setPageTitle('Estimates')
  }, [setPageTitle])

  // Fetch estimates on mount
  React.useEffect(() => {
    fetchEstimates()
  }, [fetchEstimates])

  // Filter estimates
  const filteredEstimates = React.useMemo(() => {
    let result = estimates

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.estimateNumber.toLowerCase().includes(query) ||
          e.name.toLowerCase().includes(query)
      )
    }

    return result
  }, [estimates, searchQuery, statusFilter])

  // Stats
  const stats = React.useMemo(() => {
    const total = estimates.length
    const draft = estimates.filter((e) => e.status === 'draft').length
    const pending = estimates.filter((e) => ['sent', 'viewed'].includes(e.status)).length
    const accepted = estimates.filter((e) => e.status === 'accepted').length
    const totalValue = estimates.reduce((sum, e) => sum + e.total, 0)

    return { total, draft, pending, accepted, totalValue }
  }, [estimates])

  const handleView = (id: string) => {
    onNavigate?.(`/estimates/${id}`)
  }

  const handleEdit = (id: string) => {
    onNavigate?.(`/estimates/${id}/edit`)
  }

  const handleDuplicate = (id: string) => {
    console.log('Duplicate estimate:', id)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEstimate(id)
    } catch (err) {
      // Error handled by store
    }
  }

  const handleRefresh = () => {
    clearError()
    fetchEstimates()
  }

  // Loading state
  if (isLoading && estimates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading estimates...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && estimates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Failed to load estimates"
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
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-500 mt-1">
            {totalCount || stats.total} estimates · {formatCurrency(stats.totalValue)} total value
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => onNavigate?.('/estimates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
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
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-gray-500">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            <p className="text-sm text-gray-500">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredEstimates.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No estimates found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new estimate.</p>
          <Button className="mt-4" onClick={() => onNavigate?.('/estimates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Estimate
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEstimates.map((estimate) => (
                      <EstimateRow
                        key={estimate.id}
                        estimate={estimate}
                        onView={() => handleView(estimate.id)}
                        onEdit={() => handleEdit(estimate.id)}
                        onDuplicate={() => handleDuplicate(estimate.id)}
                        onDelete={() => handleDelete(estimate.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Cards (Mobile) */}
          <div className="lg:hidden space-y-4">
            {filteredEstimates.map((estimate) => (
              <EstimateCard
                key={estimate.id}
                estimate={estimate}
                onView={() => handleView(estimate.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EstimatesPage
