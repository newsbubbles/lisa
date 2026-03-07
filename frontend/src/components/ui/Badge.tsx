import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Job Status Types for Lisa roofing software
 * Maps to the pipeline stages from AccuLynx research
 */
export type JobStatus =
  | 'lead'
  | 'prospect'
  | 'approved'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'invoiced'
  | 'paid'

const badgeVariants = cva(
  // Base styles - pill shape with good mobile touch target
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        // Generic variants
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-gray-200 text-gray-700',
        outline: 'bg-transparent border border-gray-300 text-gray-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        
        // Job status variants (from Lisa pipeline)
        lead: 'bg-indigo-100 text-indigo-800',
        prospect: 'bg-purple-100 text-purple-800',
        approved: 'bg-emerald-100 text-emerald-800',
        scheduled: 'bg-amber-100 text-amber-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        invoiced: 'bg-cyan-100 text-cyan-800',
        paid: 'bg-teal-100 text-teal-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      /** Add a colored dot indicator */
      withDot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      withDot: false,
    },
  }
)

// Dot colors matching each variant
const dotColors: Record<string, string> = {
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
  secondary: 'bg-gray-500',
  outline: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  lead: 'bg-indigo-500',
  prospect: 'bg-purple-500',
  approved: 'bg-emerald-500',
  scheduled: 'bg-amber-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
  invoiced: 'bg-cyan-500',
  paid: 'bg-teal-500',
}

// Human-readable labels for job statuses
const statusLabels: Record<JobStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  approved: 'Approved',
  scheduled: 'Scheduled',
  'in-progress': 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Use a job status to automatically set variant and label */
  status?: JobStatus
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, withDot, status, children, ...props }, ref) => {
    // If status is provided, use it for variant and default children
    const effectiveVariant = status || variant
    const displayText = status ? (children || statusLabels[status]) : children

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant: effectiveVariant, size, withDot }),
          className
        )}
        {...props}
      >
        {withDot && effectiveVariant && (
          <span
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              dotColors[effectiveVariant] || dotColors.default
            )}
          />
        )}
        {displayText}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

/**
 * StatusBadge - Convenience component for job status badges
 * Automatically applies correct colors and labels
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'status'> {
  status: JobStatus
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => (
    <Badge ref={ref} status={status} withDot {...props} />
  )
)
StatusBadge.displayName = 'StatusBadge'

export { Badge, StatusBadge, badgeVariants, statusLabels }
