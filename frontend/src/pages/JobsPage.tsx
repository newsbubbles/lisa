import * as React from 'react'
import { JobBoard, JobDetailsDrawer } from '@/components/jobs'
import { Button, Spinner, EmptyState } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/stores/uiStore'
import { useJobsStore } from '@/stores/jobs'
import type { JobSummary, PipelineColumn } from '@/types/job'
import type { JobStatus } from '@/components/ui/Badge'
import { Plus, Search, Filter, LayoutGrid, List, RefreshCw } from 'lucide-react'

export interface JobsPageProps {
  onNavigate?: (path: string) => void
}

export function JobsPage({ onNavigate }: JobsPageProps) {
  const { setPageTitle, openDrawer, closeDrawer, activeDrawer } = useUIStore()
  const { 
    boardColumns, 
    isLoading, 
    error, 
    fetchBoardData, 
    moveJobToStage,
    clearError 
  } = useJobsStore()
  
  const [selectedJob, setSelectedJob] = React.useState<JobSummary | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'board' | 'list'>('board')

  // Set page title
  React.useEffect(() => {
    setPageTitle('Jobs')
  }, [setPageTitle])

  // Fetch board data on mount
  React.useEffect(() => {
    fetchBoardData()
  }, [fetchBoardData])

  const handleJobClick = (job: JobSummary) => {
    setSelectedJob(job)
    openDrawer('job', job.id)
  }

  const handleJobMove = async (jobId: string, _fromStatus: JobStatus, toStatus: JobStatus) => {
    try {
      // Find the target stage ID for the new status
      const targetColumn = boardColumns.find(col => col.status === toStatus)
      await moveJobToStage(jobId, toStatus, targetColumn?.id)
    } catch (err) {
      console.error('Failed to move job:', err)
      // Error is handled by store
    }
  }

  const handleDrawerClose = () => {
    setSelectedJob(null)
    closeDrawer()
  }

  const handleRefresh = () => {
    clearError()
    fetchBoardData()
  }

  // Filter jobs by search
  const filteredColumns = React.useMemo((): PipelineColumn[] => {
    if (!searchQuery.trim()) return boardColumns

    const query = searchQuery.toLowerCase()
    return boardColumns.map((col) => ({
      ...col,
      jobs: col.jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.customerName.toLowerCase().includes(query) ||
          job.address.toLowerCase().includes(query) ||
          job.jobNumber.toLowerCase().includes(query)
      ),
    }))
  }, [boardColumns, searchQuery])

  // Loading state
  if (isLoading && boardColumns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && boardColumns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState
          icon="jobs"
          title="Failed to load jobs"
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

  // Empty state
  if (boardColumns.length === 0 || boardColumns.every(col => col.jobs.length === 0)) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 lg:px-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Jobs</h2>
          <Button size="sm" onClick={() => onNavigate?.('/jobs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon="jobs"
            title="No jobs yet"
            description="Create your first job to get started with your sales pipeline."
            action={
              <Button onClick={() => onNavigate?.('/jobs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              inputSize="sm"
            />
          </div>
          <Button variant="secondary" size="sm" className="hidden sm:flex">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded ${viewMode === 'board' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => onNavigate?.('/jobs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <JobBoard
          columns={filteredColumns}
          onJobMove={handleJobMove}
          onJobClick={handleJobClick}
          selectedJobId={selectedJob?.id}
        />
      </div>

      {/* Job Details Drawer */}
      {selectedJob && activeDrawer.type === 'job' && (
        <JobDetailsDrawer
          job={{
            id: selectedJob.id,
            title: selectedJob.title,
            description: 'Loading...',
            jobNumber: selectedJob.jobNumber,
            status: selectedJob.status,
            statusChangedAt: selectedJob.statusChangedAt,
            statusHistory: [],
            customer: {
              id: 'cust-1',
              firstName: selectedJob.customerName.split(' ')[0] || '',
              lastName: selectedJob.customerName.split(' ').slice(1).join(' ') || '',
              email: '',
              phone: '',
            },
            address: {
              street: selectedJob.address.split(',')[0] || '',
              city: selectedJob.address.split(',')[1]?.trim() || '',
              state: selectedJob.address.split(',')[2]?.trim().split(' ')[0] || '',
              zip: selectedJob.address.match(/\d{5}/)?.[0] || '',
            },
            estimateAmount: selectedJob.estimateAmount,
            tasks: [],
            notes: [],
            documents: [],
            photos: [],
            tags: selectedJob.tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          open={true}
          onClose={handleDrawerClose}
          onStatusChange={(_jobId, newStatus) => {
            handleJobMove(selectedJob.id, selectedJob.status, newStatus)
            setSelectedJob({ ...selectedJob, status: newStatus })
          }}
        />
      )}
    </div>
  )
}

export default JobsPage
