import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin text-gray-500', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label */
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, label = 'Loading...', ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={cn('inline-flex', className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      <span className="sr-only">{label}</span>
    </div>
  )
)
Spinner.displayName = 'Spinner'

export interface LoadingOverlayProps {
  /** Whether to show the overlay */
  loading: boolean
  /** Label for screen readers */
  label?: string
  /** Children to render behind the overlay */
  children: React.ReactNode
}

/** Full overlay with centered spinner */
const LoadingOverlay = ({
  loading,
  label = 'Loading...',
  children,
}: LoadingOverlayProps) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
        <Spinner size="lg" label={label} />
      </div>
    )}
  </div>
)
LoadingOverlay.displayName = 'LoadingOverlay'

/** Full page loading state */
const PageLoader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="xl" label={label} className="text-primary-600" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)
PageLoader.displayName = 'PageLoader'

export { Spinner, LoadingOverlay, PageLoader, spinnerVariants }
