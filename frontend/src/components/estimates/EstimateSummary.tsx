import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Percent,
} from 'lucide-react'
import type { DiscountConfig, TaxConfig } from '@/types/estimate'
import { formatCurrency } from '@/lib/utils'

export interface EstimateSummaryProps {
  /** Subtotal (sum of all line items) */
  subtotal: number
  /** Total cost (contractor's cost) */
  totalCost: number
  /** Current discounts */
  discounts: DiscountConfig[]
  /** Current tax config */
  taxConfig?: TaxConfig
  /** Calculated discount amount */
  discountAmount: number
  /** Calculated tax amount */
  taxAmount: number
  /** Grand total */
  grandTotal: number
  /** Total margin (profit) */
  totalMargin: number
  /** Margin percentage */
  marginPercent: number
  /** Show margin info (contractor view) */
  showMargin?: boolean
  /** Callback to update discounts */
  onDiscountsChange?: (discounts: DiscountConfig[]) => void
  /** Callback to update tax config */
  onTaxConfigChange?: (config: TaxConfig | undefined) => void
  /** Mobile collapsed state */
  isCollapsed?: boolean
  /** Toggle collapsed state */
  onToggleCollapsed?: () => void
}

export function EstimateSummary({
  subtotal,
  totalCost,
  discounts,
  taxConfig,
  discountAmount,
  taxAmount,
  grandTotal,
  totalMargin,
  marginPercent,
  showMargin = true,
  onDiscountsChange,
  onTaxConfigChange,
  isCollapsed = false,
  onToggleCollapsed,
}: EstimateSummaryProps) {
  const [showDiscountForm, setShowDiscountForm] = React.useState(false)
  const [showTaxForm, setShowTaxForm] = React.useState(false)
  const [newDiscount, setNewDiscount] = React.useState<DiscountConfig>({
    type: 'percentage',
    value: 0,
    label: '',
  })

  // Margin health indicator
  const MarginHealth = () => {
    if (marginPercent > 25) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Healthy</span>
        </div>
      )
    } else if (marginPercent < 15) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">Low</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">Moderate</span>
      </div>
    )
  }

  const handleAddDiscount = () => {
    if (newDiscount.value > 0 && newDiscount.label) {
      onDiscountsChange?.([...discounts, { ...newDiscount }])
      setNewDiscount({ type: 'percentage', value: 0, label: '' })
      setShowDiscountForm(false)
    }
  }

  const handleRemoveDiscount = (index: number) => {
    const updated = discounts.filter((_, i) => i !== index)
    onDiscountsChange?.(updated)
  }

  const handleUpdateTax = (rate: number) => {
    if (rate > 0) {
      onTaxConfigChange?.({
        rate: rate / 100,
        label: `Sales Tax (${rate}%)`,
        applyToLabor: true,
        applyToMaterials: true,
      })
    } else {
      onTaxConfigChange?.(undefined)
    }
    setShowTaxForm(false)
  }

  // Mobile collapsed view - just shows grand total
  if (isCollapsed) {
    return (
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30"
        onClick={onToggleCollapsed}
      >
        <div className="flex items-center justify-between p-4 cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(grandTotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showMargin && (
              <span
                className={cn(
                  'text-sm font-medium',
                  marginPercent > 25 && 'text-green-600',
                  marginPercent < 15 && 'text-red-600',
                  marginPercent >= 15 && marginPercent <= 25 && 'text-yellow-600'
                )}
              >
                {marginPercent.toFixed(1)}% margin
              </span>
            )}
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Mobile header with collapse button */}
      <div
        className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
        onClick={onToggleCollapsed}
      >
        <span className="font-medium text-gray-900">Estimate Summary</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      <div className="p-4 space-y-4">
        {/* Margin Summary (Contractor View) */}
        {showMargin && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Margin Summary</span>
              <MarginHealth />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="font-medium text-gray-700">{formatCurrency(totalCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Profit</p>
                <p
                  className={cn(
                    'font-medium',
                    totalMargin > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(totalMargin)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Margin</p>
                <p
                  className={cn(
                    'font-medium',
                    marginPercent > 25 && 'text-green-600',
                    marginPercent < 15 && 'text-red-600',
                    marginPercent >= 15 && marginPercent <= 25 && 'text-yellow-600'
                  )}
                >
                  {marginPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing breakdown */}
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discounts */}
          {discounts.map((discount, index) => (
            <div key={index} className="flex items-center justify-between text-green-600">
              <div className="flex items-center gap-2">
                <span>{discount.label}</span>
                <button
                  onClick={() => handleRemoveDiscount(index)}
                  className="p-0.5 hover:bg-green-100 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <span>
                -{discount.type === 'percentage'
                  ? `${discount.value}%`
                  : formatCurrency(discount.value)}
              </span>
            </div>
          ))}

          {/* Add discount */}
          {showDiscountForm ? (
            <div className="flex items-end gap-2 py-2">
              <Input
                label="Label"
                value={newDiscount.label}
                onChange={(e) => setNewDiscount({ ...newDiscount, label: e.target.value })}
                placeholder="Discount name"
                inputSize="sm"
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <select
                  value={newDiscount.type}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      type: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                  className="h-9 rounded-lg border border-gray-300 px-2 text-sm"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
                <Input
                  type="number"
                  min={0}
                  value={newDiscount.value}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })
                  }
                  inputSize="sm"
                  className="w-20"
                />
              </div>
              <Button size="sm" onClick={handleAddDiscount}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowDiscountForm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowDiscountForm(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Discount
            </button>
          )}

          {/* Discount total */}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-green-600 font-medium">
              <span>Total Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* Tax */}
          {taxConfig ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{taxConfig.label}</span>
                <button
                  onClick={() => onTaxConfigChange?.(undefined)}
                  className="p-0.5 hover:bg-gray-100 rounded text-gray-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
            </div>
          ) : showTaxForm ? (
            <div className="flex items-center gap-2 py-2">
              <span className="text-sm text-gray-600">Tax Rate:</span>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.25}
                placeholder="8.25"
                inputSize="sm"
                className="w-20"
                rightIcon={<Percent className="h-3 w-3" />}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateTax(parseFloat((e.target as HTMLInputElement).value) || 0)
                  }
                }}
              />
              <Button
                size="sm"
                onClick={(e) => {
                  const input = (e.target as HTMLElement)
                    .closest('.flex')
                    ?.querySelector('input') as HTMLInputElement
                  handleUpdateTax(parseFloat(input?.value) || 0)
                }}
              >
                Apply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowTaxForm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowTaxForm(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Tax
            </button>
          )}
        </div>

        {/* Grand Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Grand Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
