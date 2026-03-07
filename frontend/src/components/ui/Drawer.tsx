import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './Button'

/**
 * Drawer - Details Drawer component (JobNimbus pattern)
 * Slides in from right, 400px width on desktop, full-width on mobile
 * Critical component for viewing/editing without leaving main screen
 */

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Drawer title */
  title?: string
  /** Drawer description/subtitle */
  description?: string
  /** Main content */
  children: React.ReactNode
  /** Footer content (actions) */
  footer?: React.ReactNode
  /** Width on desktop (default: 400px) */
  width?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show close button */
  showClose?: boolean
  /** Prevent closing by clicking overlay */
  preventOverlayClose?: boolean
}

const widthClasses = {
  sm: 'sm:max-w-sm',   // 384px
  md: 'sm:max-w-md',   // 448px
  lg: 'sm:max-w-lg',   // 512px
  xl: 'sm:max-w-xl',   // 576px
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      footer,
      width = 'md',
      showClose = true,
      preventOverlayClose = false,
    },
    ref
  ) => {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
              'data-[state=open]:animate-fade-in',
              'data-[state=closed]:animate-fade-out'
            )}
            onClick={(e) => {
              if (preventOverlayClose) {
                e.preventDefault()
              }
            }}
          />

          {/* Drawer Content */}
          <Dialog.Content
            ref={ref}
            className={cn(
              // Base styles
              'fixed right-0 top-0 z-50 h-full bg-white shadow-xl',
              'flex flex-col',
              // Mobile: full width
              'w-full',
              // Desktop: fixed width with max
              widthClasses[width],
              // Animation
              'data-[state=open]:animate-slide-in-right',
              'data-[state=closed]:animate-slide-out-right',
              // Focus
              'focus:outline-none'
            )}
            onPointerDownOutside={(e) => {
              if (preventOverlayClose) {
                e.preventDefault()
              }
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex-1 pr-4">
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-gray-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              
              {showClose && (
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-2 -mt-1 h-8 w-8 rounded-full"
                    aria-label="Close drawer"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </Dialog.Close>
              )}
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }
)
Drawer.displayName = 'Drawer'

/**
 * DrawerTrigger - Button that opens the drawer
 */
const DrawerTrigger = Dialog.Trigger
DrawerTrigger.displayName = 'DrawerTrigger'

/**
 * DrawerClose - Button that closes the drawer
 */
const DrawerClose = Dialog.Close
DrawerClose.displayName = 'DrawerClose'

/**
 * DrawerSection - Grouped content section within drawer
 */
export interface DrawerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

const DrawerSection = React.forwardRef<HTMLDivElement, DrawerSectionProps>(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-4 first:pt-0 last:pb-0', className)}
      {...props}
    >
      {title && (
        <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
          {title}
        </h4>
      )}
      {children}
    </div>
  )
)
DrawerSection.displayName = 'DrawerSection'

/**
 * DrawerField - Label/value pair for displaying data
 */
export interface DrawerFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value?: React.ReactNode
  /** Make value copyable */
  copyable?: boolean
}

const DrawerField = React.forwardRef<HTMLDivElement, DrawerFieldProps>(
  ({ className, label, value, copyable, children, ...props }, ref) => {
    const displayValue = value || children
    
    const handleCopy = () => {
      if (typeof displayValue === 'string') {
        navigator.clipboard.writeText(displayValue)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1 py-2', className)}
        {...props}
      >
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd
          className={cn(
            'text-sm text-gray-900',
            copyable && 'cursor-pointer hover:text-primary-600'
          )}
          onClick={copyable ? handleCopy : undefined}
          title={copyable ? 'Click to copy' : undefined}
        >
          {displayValue || <span className="text-gray-400">—</span>}
        </dd>
      </div>
    )
  }
)
DrawerField.displayName = 'DrawerField'

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerSection,
  DrawerField,
}
