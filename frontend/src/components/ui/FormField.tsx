import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './Label'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string
  /** HTML for attribute for label */
  htmlFor?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Required indicator */
  required?: boolean
  /** Optional suffix for label */
  labelSuffix?: string
  /** Children (the input component) */
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      label,
      htmlFor,
      error,
      helperText,
      required,
      labelSuffix,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('space-y-1.5', className)} {...props}>
        {label && (
          <Label
            htmlFor={htmlFor}
            variant={error ? 'error' : 'default'}
            required={required}
            suffix={labelSuffix}
          >
            {label}
          </Label>
        )}
        {children}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Children */
  children: React.ReactNode
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
)
FormSection.displayName = 'FormSection'

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alignment */
  align?: 'left' | 'right' | 'center' | 'between'
  /** Children (buttons) */
  children: React.ReactNode
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, align = 'right', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col sm:flex-row gap-3 pt-4',
        {
          'justify-start': align === 'left',
          'justify-end': align === 'right',
          'justify-center': align === 'center',
          'justify-between': align === 'between',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
FormActions.displayName = 'FormActions'

export { FormField, FormSection, FormActions }
