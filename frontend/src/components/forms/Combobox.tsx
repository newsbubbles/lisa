/**
 * Combobox Component
 * 
 * A searchable dropdown/combobox with keyboard navigation.
 * Used as the base for ContactSelector, PropertySelector, etc.
 */

import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface ComboboxProps {
  /** Currently selected value */
  value: string | null
  /** Callback when value changes */
  onChange: (value: string | null) => void
  /** Options to display */
  options: ComboboxOption[]
  /** Placeholder text when no selection */
  placeholder?: string
  /** Search input placeholder */
  searchPlaceholder?: string
  /** Label for the field */
  label?: string
  /** Error message */
  error?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is loading */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Render custom footer (e.g., "Add New" button) */
  footer?: React.ReactNode
  /** Additional class names */
  className?: string
  /** Allow clearing the selection */
  clearable?: boolean
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  label,
  error,
  required,
  disabled,
  loading,
  emptyMessage = 'No results found',
  footer,
  className,
  clearable = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const lowerSearch = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        opt.description?.toLowerCase().includes(lowerSearch)
    )
  }, [options, search])

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Reset highlight when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions.length])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]')
      highlighted?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (open && filteredOptions[highlightedIndex]) {
          const option = filteredOptions[highlightedIndex]
          if (!option.disabled) {
            onChange(option.value)
            setOpen(false)
            setSearch('')
          }
        } else if (!open) {
          setOpen(true)
        }
        break
      case 'Escape':
        setOpen(false)
        setSearch('')
        break
      case 'Tab':
        setOpen(false)
        setSearch('')
        break
    }
  }

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return
    onChange(option.value)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearch('')
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!open)
      if (!open) {
        // Focus input when opening
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
  }

  const inputId = React.useId()

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={inputId}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:border-gray-400',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          )}
        >
          <span
            className={cn(
              'truncate',
              selectedOption ? 'text-gray-900' : 'text-gray-400'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && selectedOption && !disabled && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
            role="listbox"
          >
            {/* Search Input */}
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto p-1"
            >
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    data-highlighted={index === highlightedIndex}
                    disabled={option.disabled}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                      index === highlightedIndex && 'bg-gray-100',
                      option.disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                      option.value === value && 'bg-primary-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-gray-900">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="truncate text-xs text-gray-500">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer (e.g., Add New button) */}
            {footer && (
              <div className="border-t border-gray-100 p-2">
                {footer}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
