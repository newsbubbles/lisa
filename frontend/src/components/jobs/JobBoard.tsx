import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { JobCard } from './JobCard'
import { StatusBadge, type JobStatus, statusLabels } from '@/components/ui/Badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { JobSummary, PipelineColumn } from '@/types/job'

// Pipeline stages in order
const PIPELINE_STAGES: JobStatus[] = [
  'lead',
  'prospect',
  'approved',
  'scheduled',
  'in-progress',
  'completed',
  'invoiced',
  'paid',
]

export interface JobBoardProps {
  /** Jobs grouped by status */
  columns: PipelineColumn[]
  /** Called when a job is moved to a new status */
  onJobMove?: (jobId: string, fromStatus: JobStatus, toStatus: JobStatus) => void
  /** Called when a job card is clicked */
  onJobClick?: (job: JobSummary) => void
  /** Currently selected job ID */
  selectedJobId?: string
  /** Loading state */
  isLoading?: boolean
}

export function JobBoard({
  columns,
  onJobMove,
  onJobClick,
  selectedJobId,
  isLoading,
}: JobBoardProps) {
  const [activeJob, setActiveJob] = React.useState<JobSummary | null>(null)
  const [collapsedColumns, setCollapsedColumns] = React.useState<Set<JobStatus>>(new Set())

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const job = findJobById(active.id as string)
    setActiveJob(job || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveJob(null)

    if (!over) return

    const activeJob = findJobById(active.id as string)
    if (!activeJob) return

    // Determine target status
    let targetStatus: JobStatus | null = null

    // Check if dropped on a column
    if (PIPELINE_STAGES.includes(over.id as JobStatus)) {
      targetStatus = over.id as JobStatus
    } else {
      // Dropped on another job - find its column
      const targetJob = findJobById(over.id as string)
      if (targetJob) {
        targetStatus = targetJob.status
      }
    }

    if (targetStatus && targetStatus !== activeJob.status) {
      onJobMove?.(activeJob.id, activeJob.status, targetStatus)
    }
  }

  const findJobById = (id: string): JobSummary | undefined => {
    for (const column of columns) {
      const job = column.jobs.find((j) => j.id === id)
      if (job) return job
    }
    return undefined
  }

  const toggleColumn = (status: JobStatus) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  // Ensure columns are in pipeline order by status
  const orderedColumns = PIPELINE_STAGES.map((status) => {
    const column = columns.find((c) => c.status === status)
    return column || { id: status, title: statusLabels[status], status, color: '', jobs: [], totalValue: 0 }
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Desktop: Horizontal scroll kanban */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-full px-4">
          {orderedColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              onJobClick={onJobClick}
              selectedJobId={selectedJobId}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Mobile: Accordion columns */}
      <div className="md:hidden space-y-2 px-4">
        {orderedColumns.map((column) => (
          <MobileColumn
            key={column.id}
            column={column}
            isCollapsed={collapsedColumns.has(column.status)}
            onToggle={() => toggleColumn(column.status)}
            onJobClick={onJobClick}
            selectedJobId={selectedJobId}
          />
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeJob && (
          <JobCard
            job={activeJob}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

// --- Desktop Column ---

interface BoardColumnProps {
  column: PipelineColumn
  onJobClick?: (job: JobSummary) => void
  selectedJobId?: string
  isLoading?: boolean
}

function BoardColumn({ column, onJobClick, selectedJobId, isLoading: _isLoading }: BoardColumnProps) {
  // Note: _isLoading available for future loading state UI
  const jobIds = column.jobs.map((j) => j.id)

  return (
    <div className="w-72 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={column.status} />
          <span className="text-sm font-medium text-gray-500">
            {column.jobs.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            'min-h-[200px] space-y-3 p-2 rounded-lg',
            'bg-gray-50 border-2 border-dashed border-transparent',
            'transition-colors',
          )}
          data-column-id={column.status}
        >
          {column.jobs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">
              No jobs
            </div>
          ) : (
            column.jobs.map((job) => (
              <SortableJobCard
                key={job.id}
                job={job}
                onClick={onJobClick}
                isSelected={job.id === selectedJobId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// --- Sortable Job Card wrapper ---

interface SortableJobCardProps {
  job: JobSummary
  onClick?: (job: JobSummary) => void
  isSelected?: boolean
}

function SortableJobCard({ job, onClick, isSelected }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <JobCard
        job={job}
        onClick={onClick}
        isSelected={isSelected}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  )
}

// --- Mobile Accordion Column ---

interface MobileColumnProps {
  column: PipelineColumn
  isCollapsed: boolean
  onToggle: () => void
  onJobClick?: (job: JobSummary) => void
  selectedJobId?: string
}

function MobileColumn({
  column,
  isCollapsed,
  onToggle,
  onJobClick,
  selectedJobId,
}: MobileColumnProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <StatusBadge status={column.status} />
          <span className="text-sm font-medium text-gray-700">
            {column.jobs.length} job{column.jobs.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Collapsible content */}
      {!isCollapsed && column.jobs.length > 0 && (
        <div className="p-3 pt-0 space-y-3">
          {column.jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={onJobClick}
              isSelected={job.id === selectedJobId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
