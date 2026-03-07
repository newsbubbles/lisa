import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Navigation, Copy, Check, Clock, Camera, CheckSquare } from 'lucide-react'
import type { JobSummary } from '@/types/job'
import { getDaysInStatus, getDirectionsUrl } from '@/types/job'
import { formatCurrency } from '@/lib/utils'

export interface JobCardProps {
  job: JobSummary
  /** Called when card is clicked (opens drawer) */
  onClick?: (job: JobSummary) => void
  /** Whether this card is currently selected */
  isSelected?: boolean
  /** For drag and drop - makes card draggable */
  isDragging?: boolean
  /** Drag handle props from dnd-kit */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export const JobCard = React.forwardRef<HTMLDivElement, JobCardProps>(
  ({ job, onClick, isSelected, isDragging, dragHandleProps, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)
    const daysInStatus = getDaysInStatus(job.statusChangedAt)

    const handleCopyAddress = (e: React.MouseEvent) => {
      e.stopPropagation() // Don't trigger card click
      navigator.clipboard.writeText(job.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const handleDirections = (e: React.MouseEvent) => {
      e.stopPropagation() // Don't trigger card click
      const url = getDirectionsUrl({
        street: job.address.split(',')[0]?.trim() || '',
        city: job.address.split(',')[1]?.trim() || '',
        state: job.address.split(',')[2]?.split(' ')[0]?.trim() || '',
        zip: job.address.split(',')[2]?.split(' ')[1]?.trim() || '',
        lat: job.addressLat,
        lng: job.addressLng,
      })
      window.open(url, '_blank')
    }

    const handleCardClick = () => {
      onClick?.(job)
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'cursor-pointer transition-all',
          'hover:shadow-md hover:border-gray-300',
          isSelected && 'ring-2 ring-primary-500 border-primary-500',
          isDragging && 'shadow-lg opacity-90 rotate-2',
        )}
        onClick={handleCardClick}
        noPadding
        {...props}
      >
        <div className="p-3 sm:p-4" {...dragHandleProps}>
          {/* Header: Customer name + Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {job.customerName}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {job.jobNumber}
              </p>
            </div>
            <StatusBadge status={job.status} size="sm" />
          </div>

          {/* Address */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {job.address}
          </p>

          {/* Quick stats row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {/* Days in status */}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {daysInStatus}d
            </span>

            {/* Tasks */}
            {job.taskCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                {job.completedTaskCount}/{job.taskCount}
              </span>
            )}

            {/* Photos */}
            {job.photoCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" />
                {job.photoCount}
              </span>
            )}

            {/* Estimate amount */}
            {job.estimateAmount && (
              <span className="ml-auto font-medium text-gray-700">
                {formatCurrency(job.estimateAmount)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDirections}
              leftIcon={<Navigation className="h-3.5 w-3.5" />}
              className="flex-1"
            >
              <span className="hidden sm:inline">Directions</span>
              <span className="sm:hidden">Go</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="px-2"
              title="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
              {job.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{job.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }
)
JobCard.displayName = 'JobCard'
