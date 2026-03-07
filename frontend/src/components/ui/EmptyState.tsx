import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import {
  FileX,
  Users,
  Briefcase,
  FileText,
  Search,
  Plus,
  type LucideIcon,
} from 'lucide-react'

const defaultIcons: Record<string, LucideIcon> = {
  jobs: Briefcase,
  contacts: Users,
  estimates: FileText,
  documents: FileX,
  search: Search,
  default: FileX,
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display (or type string for default icons) */
  icon?: LucideIcon | keyof typeof defaultIcons
  /** Main heading */
  title: string
  /** Description text */
  description?: string
  /** Primary action button */
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  /** Secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = 'default',
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const Icon =
      typeof icon === 'string' ? defaultIcons[icon] || defaultIcons.default : icon

    const sizeClasses = {
      sm: {
        container: 'py-8',
        icon: 'h-10 w-10',
        title: 'text-base',
        description: 'text-sm',
      },
      md: {
        container: 'py-12',
        icon: 'h-12 w-12',
        title: 'text-lg',
        description: 'text-sm',
      },
      lg: {
        container: 'py-16',
        icon: 'h-16 w-16',
        title: 'text-xl',
        description: 'text-base',
      },
    }

    const sizes = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        {...props}
      >
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Icon className={cn('text-gray-400', sizes.icon)} />
        </div>
        <h3 className={cn('font-semibold text-gray-900 mb-1', sizes.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-gray-500 max-w-sm mb-6', sizes.description)}>
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {action && (
              <Button
                onClick={action.onClick}
                leftIcon={action.icon || <Plus className="h-4 w-4" />}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
