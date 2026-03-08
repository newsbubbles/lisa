import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { InvoiceLineItem, CreateLineItemData } from '@/types/invoice'

/**
 * Line item for editing (can be new or existing)
 */
export interface EditableLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  isNew?: boolean // True if this is a new item not yet saved
}

export interface InvoiceLineItemsProps {
  /** Current line items */
  items: EditableLineItem[]
  /** Callback when items change */
  onChange: (items: EditableLineItem[]) => void
  /** Whether editing is disabled */
  disabled?: boolean
  /** Show validation errors */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * Generate a temporary ID for new items
 */
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create an empty line item
 */
function createEmptyItem(): EditableLineItem {
  return {
    id: generateTempId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    isNew: true,
  }
}

/**
 * Calculate line item total
 */
function calculateTotal(item: EditableLineItem): number {
  return item.quantity * item.unitPrice
}

/**
 * InvoiceLineItems - Editable line items table
 *
 * Allows adding, editing, and removing line items with real-time total calculation.
 */
export function InvoiceLineItems({
  items,
  onChange,
  disabled = false,
  errors,
  className,
}: InvoiceLineItemsProps) {
  // Add a new empty line item
  const handleAddItem = () => {
    onChange([...items, createEmptyItem()])
  }

  // Remove a line item
  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  // Update a line item field
  const handleUpdateItem = (
    id: string,
    field: keyof EditableLineItem,
    value: string | number
  ) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + calculateTotal(item), 0)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Line Items */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No line items yet</p>
          <p className="text-xs mt-1">Click "Add Item" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              disabled={disabled}
              error={errors?.[item.id]}
              onUpdate={(field, value) => handleUpdateItem(item.id, field, value)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add Button */}
      {!disabled && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddItem}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add Item
        </Button>
      )}

      {/* Subtotal */}
      {items.length > 0 && (
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Subtotal:</span>
            <span className="text-base font-semibold text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Sub-components ---

interface LineItemRowProps {
  item: EditableLineItem
  disabled: boolean
  error?: string
  onUpdate: (field: keyof EditableLineItem, value: string | number) => void
  onRemove: () => void
}

function LineItemRow({
  item,
  disabled,
  error,
  onUpdate,
  onRemove,
}: LineItemRowProps) {
  const total = calculateTotal(item)

  // Handle numeric input change
  const handleNumericChange = (
    field: 'quantity' | 'unitPrice',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0
    onUpdate(field, numValue)
  }

  return (
    <div
      className={cn(
        'p-3 rounded-lg border bg-white',
        error ? 'border-red-300 bg-red-50' : 'border-gray-200',
        'sm:p-2'
      )}
    >
      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="Item description"
              value={item.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              disabled={disabled}
              inputSize="sm"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-gray-400 hover:text-red-600 rounded"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Qty</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={item.quantity}
              onChange={(e) => handleNumericChange('quantity', e.target.value)}
              disabled={disabled}
              inputSize="sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => handleNumericChange('unitPrice', e.target.value)}
              disabled={disabled}
              inputSize="sm"
              leftIcon={<span className="text-gray-400">$</span>}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total</label>
            <div className="h-9 flex items-center text-sm font-medium text-gray-900">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
        <div className="col-span-5">
          <Input
            placeholder="Item description"
            value={item.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            disabled={disabled}
            inputSize="sm"
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            min="0"
            step="1"
            value={item.quantity}
            onChange={(e) => handleNumericChange('quantity', e.target.value)}
            disabled={disabled}
            inputSize="sm"
            className="text-right"
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => handleNumericChange('unitPrice', e.target.value)}
            disabled={disabled}
            inputSize="sm"
            className="text-right"
          />
        </div>
        <div className="col-span-2 text-right">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="col-span-1 flex justify-end">
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

// --- Utility functions ---

/**
 * Convert EditableLineItem array to CreateLineItemData array for API
 */
export function toCreateLineItemData(
  items: EditableLineItem[]
): CreateLineItemData[] {
  return items.map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    order: index,
  }))
}

/**
 * Convert InvoiceLineItem array (from API) to EditableLineItem array
 */
export function toEditableLineItems(
  items: InvoiceLineItem[]
): EditableLineItem[] {
  return items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    isNew: false,
  }))
}

/**
 * Calculate subtotal from line items
 */
export function calculateSubtotal(items: EditableLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export default InvoiceLineItems
