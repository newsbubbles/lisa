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

/**
 * Default icon mapping for EmptyState
 * @type {Record<string, LucideIcon>}
 */
const defaultIcons: Record<string, LucideIcon> = {
  jobs: Briefcase,
  contacts: Users,
  estimates: FileText,
  documents: FileX,
  search: Search,
  default: FileX,
}

/**
 * Action button configuration object
 * @typedef {Object} EmptyStateAction
 * @property {string} label - Button text
 * @property {() => void} onClick - Click handler
 * @property {React.ReactNode} [icon] - Optional icon to display
 */
interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display - can be a string key for default icons or a LucideIcon component */
  icon?: LucideIcon | keyof typeof defaultIcons
  /** Main heading */
  title: string
  /** Description text */
  description?: string
  /** Primary action - can be a React element or an action config object */
  action?: React.ReactNode | EmptyStateAction
  /** Secondary action config */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Type guard to check if action is an EmptyStateAction object
 * @param {unknown} action - The action prop to check
 * @returns {action is EmptyStateAction}
 */
function isActionObject(action: unknown): action is EmptyStateAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    'onClick' in action &&
    typeof (action as EmptyStateAction).label === 'string' &&
    typeof (action as EmptyStateAction).onClick === 'function'
  )
}

/**
 * EmptyState component for displaying placeholder content when no data is available.
 * Supports both JSX elements and action config objects for the action prop.
 *
 * @param {EmptyStateProps} props - Component props
 * @returns {JSX.Element}
 *
 * @example
 * // Using string icon key
 * <EmptyState
 *   icon="jobs"
 *   title="No jobs yet"
 *   description="Create your first job to get started."
 *   action={<Button onClick={handleCreate}>Create Job</Button>}
 * />
 *
 * @example
 * // Using action config object
 * <EmptyState
 *   icon="contacts"
 *   title="No contacts"
 *   action={{ label: 'Add Contact', onClick: handleAdd }}
 * />
 */
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

    /**
     * Render the action element - supports both JSX and config objects
     * @returns {React.ReactNode}
     */
    const renderAction = (): React.ReactNode => {
      if (!action) return null

      // If action is a config object, render a Button
      if (isActionObject(action)) {
        return (
          <Button
            onClick={action.onClick}
            leftIcon={action.icon || <Plus className="h-4 w-4" />}
          >
            {action.label}
          </Button>
        )
      }

      // Otherwise, render the JSX element directly
      return action
    }

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
            {renderAction()}
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
