/**
 * PaymentForm - Modal for recording payments on an invoice
 *
 * Features:
 * - Amount input with validation (can't exceed balance due)
 * - Payment date picker
 * - Payment method selector
 * - Optional reference number
 * - Optional notes
 */

import * as React from 'react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react'
import type { Invoice, PaymentMethod, CreatePaymentData } from '@/types/invoice'
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@/types/invoice'

export interface PaymentFormProps {
  /** Invoice to record payment for */
  invoice: Invoice
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Callback when form is submitted */
  onSubmit: (data: CreatePaymentData) => void
  /** Callback when form is cancelled */
  onCancel: () => void
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'check', label: PAYMENT_METHOD_LABELS.check },
  { value: 'cash', label: PAYMENT_METHOD_LABELS.cash },
  { value: 'card', label: PAYMENT_METHOD_LABELS.card },
  { value: 'bank_transfer', label: PAYMENT_METHOD_LABELS.bank_transfer },
  { value: 'financing', label: PAYMENT_METHOD_LABELS.financing },
  { value: 'other', label: PAYMENT_METHOD_LABELS.other },
]

export function PaymentForm({
  invoice,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [amount, setAmount] = React.useState(invoice.balanceDue.toFixed(2))
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().split('T')[0]
  )
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('check')
  const [referenceNumber, setReferenceNumber] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else if (amountNum > invoice.balanceDue) {
      newErrors.amount = `Amount cannot exceed balance due (${formatCurrency(invoice.balanceDue)})`
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    onSubmit({
      amount: parseFloat(amount),
      paymentDate,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value)
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: '' }))
      }
    }
  }

  const handleApplyFullBalance = () => {
    setAmount(invoice.balanceDue.toFixed(2))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
            <p className="text-sm text-gray-500">
              Invoice #{invoice.invoiceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Invoice Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice Total</span>
              <span className="font-medium">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-green-600">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-medium">Balance Due</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(invoice.balanceDue)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" required>
              Payment Amount
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="pl-8 pr-24"
                error={errors.amount}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={handleApplyFullBalance}
                  className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                >
                  Full Balance
                </button>
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate" required>
              Payment Date
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10"
                error={errors.paymentDate}
              />
            </div>
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod" required>
              Payment Method
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Reference Number */}
          <div>
            <Label htmlFor="referenceNumber">
              Reference Number
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="referenceNumber"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Check #, transaction ID, etc."
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">
              Notes
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional payment notes..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentForm
