/**
 * PaymentHistory - Displays list of payments for an invoice
 *
 * Features:
 * - Chronological list of payments
 * - Payment method icons
 * - Reference number display
 * - Empty state when no payments
 */

import * as React from 'react'
import {
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Percent,
  HelpCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/invoice'
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@/types/invoice'

export interface PaymentHistoryProps {
  /** List of payments */
  payments: Payment[]
  /** Show compact view */
  compact?: boolean
  /** Custom class name */
  className?: string
}

const paymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  check: <FileText className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  bank_transfer: <Building2 className="h-4 w-4" />,
  financing: <Percent className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
}

const paymentStatusConfig: Record<
  PaymentStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600',
    label: 'Completed',
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-600',
    label: 'Pending',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    label: 'Failed',
  },
  refunded: {
    icon: <RotateCcw className="h-4 w-4" />,
    color: 'text-gray-600',
    label: 'Refunded',
  },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PaymentHistory({
  payments,
  compact = false,
  className = '',
}: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <DollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No payments recorded</p>
      </div>
    )
  }

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  if (compact) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {sortedPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {paymentMethodIcons[payment.paymentMethod]}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(payment.paymentDate)}
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                +{formatCurrency(payment.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Payment History</h3>
        <span className="text-sm text-gray-500">
          {payments.length} payment{payments.length !== 1 ? 's' : ''} •{' '}
          <span className="font-medium text-green-600">
            {formatCurrency(totalPaid)}
          </span>
        </span>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {sortedPayments.map((payment) => {
          const statusConfig = paymentStatusConfig[payment.status]

          return (
            <div
              key={payment.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Method Icon */}
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    {paymentMethodIcons[payment.paymentMethod]}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(payment.paymentDate)}
                      {payment.referenceNumber && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>Ref: {payment.referenceNumber}</span>
                        </>
                      )}
                    </div>

                    {payment.notes && (
                      <p className="mt-2 text-sm text-gray-600">{payment.notes}</p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <span
                    className={`text-lg font-semibold ${
                      payment.status === 'refunded'
                        ? 'text-gray-400 line-through'
                        : payment.status === 'failed'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {payment.status === 'refunded' ? '-' : '+'}
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentHistory
