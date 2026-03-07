import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  GripVertical,
  Trash2,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { EstimateLineItem as LineItemType, UnitType } from '@/types/estimate'
import { unitLabels, calculateLineItemTotals } from '@/types/estimate'
import { formatCurrency } from '@/lib/utils'

export interface EstimateLineItemProps {
  item: LineItemType
  /** Called when item is updated */
  onUpdate: (item: LineItemType) => void
  /** Called when item is deleted */
  onDelete: (id: string) => void
  /** Whether margin info is visible (contractor view) */
  showMargin?: boolean
  /** Whether in edit mode */
  isEditing?: boolean
  /** Callback to toggle edit mode */
  onEditToggle?: (editing: boolean) => void
}

export function EstimateLineItem({
  item,
  onUpdate,
  onDelete,
  showMargin = true,
  isEditing: externalIsEditing,
  onEditToggle,
}: EstimateLineItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValues, setEditValues] = React.useState(item)
  
  // Use external edit state if provided
  const editing = externalIsEditing ?? isEditing
  const setEditing = onEditToggle ?? setIsEditing

  // DnD sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Reset edit values when item changes externally
  React.useEffect(() => {
    setEditValues(item)
  }, [item])

  const handleStartEdit = () => {
    setEditValues(item)
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditValues(item)
    setEditing(false)
  }

  const handleSaveEdit = () => {
    const totals = calculateLineItemTotals(editValues)
    onUpdate({ ...editValues, ...totals })
    setEditing(false)
  }

  const handleFieldChange = (
    field: keyof LineItemType,
    value: string | number
  ) => {
    setEditValues((prev) => {
      const updated = { ...prev, [field]: value }
      // Recalculate totals when quantity or prices change
      if (['quantity', 'costPerUnit', 'pricePerUnit'].includes(field)) {
        const totals = calculateLineItemTotals(updated)
        return { ...updated, ...totals }
      }
      return updated
    })
  }

  // Margin indicator
  const MarginIndicator = () => {
    const percent = editing ? editValues.marginPercent : item.marginPercent
    if (percent > 25) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (percent < 15) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <Minus className="h-4 w-4 text-yellow-600" />
  }

  // Editing view
  if (editing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'bg-white border border-primary-200 rounded-lg p-3 shadow-sm',
          isDragging && 'opacity-50'
        )}
      >
        {/* Edit form */}
        <div className="space-y-3">
          {/* Description */}
          <Input
            label="Description"
            value={editValues.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Line item description"
            inputSize="sm"
          />

          {/* Quantity, Unit, Cost, Price row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              label="Qty"
              type="number"
              min={0}
              step={0.01}
              value={editValues.quantity}
              onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
              inputSize="sm"
            />
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                value={editValues.unit}
                onChange={(e) => handleFieldChange('unit', e.target.value as UnitType)}
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(unitLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Cost/Unit"
              type="number"
              min={0}
              step={0.01}
              value={editValues.costPerUnit}
              onChange={(e) => handleFieldChange('costPerUnit', parseFloat(e.target.value) || 0)}
              inputSize="sm"
              leftIcon={<span className="text-xs">$</span>}
            />
            
            <Input
              label="Price/Unit"
              type="number"
              min={0}
              step={0.01}
              value={editValues.pricePerUnit}
              onChange={(e) => handleFieldChange('pricePerUnit', parseFloat(e.target.value) || 0)}
              inputSize="sm"
              leftIcon={<span className="text-xs">$</span>}
            />
          </div>

          {/* Live totals preview */}
          {showMargin && (
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  Cost: <span className="font-medium text-gray-700">{formatCurrency(editValues.totalCost)}</span>
                </span>
                <span className="text-gray-500">
                  Price: <span className="font-medium text-gray-900">{formatCurrency(editValues.totalPrice)}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MarginIndicator />
                <span
                  className={cn(
                    'font-medium',
                    editValues.marginPercent > 25 && 'text-green-600',
                    editValues.marginPercent < 15 && 'text-red-600',
                    editValues.marginPercent >= 15 && editValues.marginPercent <= 25 && 'text-yellow-600'
                  )}
                >
                  {editValues.marginPercent.toFixed(1)}% ({formatCurrency(editValues.marginAmount)})
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              leftIcon={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Display view
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white border border-gray-200 rounded-lg p-3',
        'hover:border-gray-300 hover:shadow-sm transition-all',
        isDragging && 'opacity-50 shadow-lg'
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          className="mt-1 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description + Quantity */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {item.description || <span className="text-gray-400 italic">No description</span>}
              </p>
              <p className="text-sm text-gray-500">
                {item.quantity} {unitLabels[item.unit]} × {formatCurrency(item.pricePerUnit)}
              </p>
            </div>
            <p className="font-medium text-gray-900 whitespace-nowrap">
              {formatCurrency(item.totalPrice)}
            </p>
          </div>

          {/* Margin row (contractor view) */}
          {showMargin && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                Cost: {formatCurrency(item.totalCost)}
              </span>
              <div className="flex items-center gap-1">
                <MarginIndicator />
                <span
                  className={cn(
                    'font-medium',
                    item.marginPercent > 25 && 'text-green-600',
                    item.marginPercent < 15 && 'text-red-600',
                    item.marginPercent >= 15 && item.marginPercent <= 25 && 'text-yellow-600'
                  )}
                >
                  {item.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="h-8 w-8 p-0"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
