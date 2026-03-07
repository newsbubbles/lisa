import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './Dialog'

export interface DatePickerProps {
  /** Selected date */
  value?: Date | null
  /** Callback when date changes */
  onChange: (date: Date | null) => void
  /** Placeholder text */
  placeholder?: string
  /** Disable the picker */
  disabled?: boolean
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Date format string */
  dateFormat?: string
  /** Error state */
  error?: boolean
  /** Additional class names */
  className?: string
}

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  dateFormat = 'MMM d, yyyy',
  error = false,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(value || new Date())

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isSelected = (day: number) => {
    if (!value) return false
    return (
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    )
  }

  const selectDate = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange(date)
    setOpen(false)
  }

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full justify-start text-left font-normal',
          !value && 'text-gray-500',
          error && 'border-red-500',
          className
        )}
        leftIcon={<CalendarIcon className="h-4 w-4" />}
      >
        {value ? format(value, dateFormat) : placeholder}
      </Button>
      <DialogContent size="sm" hideClose>
        <DialogHeader>
          <DialogTitle className="sr-only">Select Date</DialogTitle>
        </DialogHeader>
        <div className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              ←
            </Button>
            <span className="font-semibold">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              →
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}
            {days.map((day) => (
              <button
                key={day}
                type="button"
                disabled={isDateDisabled(day)}
                onClick={() => selectDate(day)}
                className={cn(
                  'h-8 w-8 rounded-full text-sm transition-colors',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
                  isSelected(day) && 'bg-primary-600 text-white hover:bg-primary-700',
                  isToday(day) && !isSelected(day) && 'border border-primary-600',
                  isDateDisabled(day) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date()
                setViewDate(today)
                onChange(today)
                setOpen(false)
              }}
            >
              Today
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
DatePicker.displayName = 'DatePicker'

export { DatePicker }
