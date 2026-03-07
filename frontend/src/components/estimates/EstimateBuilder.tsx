import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EstimateLineItem } from './EstimateLineItem'
import { EstimateSummary } from './EstimateSummary'
import { EstimateTemplates } from './EstimateTemplates'
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Save,
  Send,
  Eye,
} from 'lucide-react'
import type {
  Estimate,
  EstimateSection,
  EstimateLineItem as LineItemType,
  EstimateTemplate,
  LineItemCategory,
  DiscountConfig,
  TaxConfig,
} from '@/types/estimate'
import {
  createSection,
  createLineItem,
  calculateSectionTotals,
  calculateEstimateTotals,
  categoryLabels,
} from '@/types/estimate'

export interface EstimateBuilderProps {
  /** Initial estimate data (for editing) */
  initialEstimate?: Partial<Estimate>
  /** Called when estimate is saved */
  onSave?: (estimate: Estimate) => void
  /** Called when estimate is sent to customer */
  onSend?: (estimate: Estimate) => void
  /** Show margin info (contractor view) */
  showMargin?: boolean
  /** Job ID to link estimate to */
  jobId?: string
}

export function EstimateBuilder({
  initialEstimate,
  onSave,
  onSend,
  showMargin = true,
  jobId,
}: EstimateBuilderProps) {
  // State
  const [sections, setSections] = React.useState<EstimateSection[]>(
    initialEstimate?.sections || []
  )
  const [discounts, setDiscounts] = React.useState<DiscountConfig[]>(
    initialEstimate?.discounts || []
  )
  const [taxConfig, setTaxConfig] = React.useState<TaxConfig | undefined>(
    initialEstimate?.taxConfig
  )
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set()
  )
  const [showTemplates, setShowTemplates] = React.useState(sections.length === 0)
  const [activeItem, setActiveItem] = React.useState<LineItemType | null>(null)
  const [summaryCollapsed, setSummaryCollapsed] = React.useState(true)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Calculate totals whenever sections, discounts, or tax changes
  const totals = React.useMemo(
    () => calculateEstimateTotals(sections, taxConfig, discounts),
    [sections, taxConfig, discounts]
  )

  // --- Section Management ---

  const addSection = (category: LineItemCategory) => {
    const newSection = createSection(category, [])
    setSections([...sections, newSection])
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId))
  }

  // --- Line Item Management ---

  const addLineItem = (sectionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section
        const newItem = createLineItem(
          section.category,
          section.items.length
        )
        const items = [...section.items, newItem]
        return { ...section, items, ...calculateSectionTotals(items) }
      })
    )
  }

  const updateLineItem = (sectionId: string, updatedItem: LineItemType) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section
        const items = section.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
        return { ...section, items, ...calculateSectionTotals(items) }
      })
    )
  }

  const deleteLineItem = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section
        const items = section.items.filter((item) => item.id !== itemId)
        return { ...section, items, ...calculateSectionTotals(items) }
      })
    )
  }

  // --- Drag and Drop ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // Find the item being dragged
    for (const section of sections) {
      const item = section.items.find((i) => i.id === active.id)
      if (item) {
        setActiveItem(item)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || active.id === over.id) return

    // Find source and destination sections
    let sourceSection: EstimateSection | undefined
    let destSection: EstimateSection | undefined
    let sourceIndex = -1
    let destIndex = -1

    for (const section of sections) {
      const activeIdx = section.items.findIndex((i) => i.id === active.id)
      const overIdx = section.items.findIndex((i) => i.id === over.id)

      if (activeIdx !== -1) {
        sourceSection = section
        sourceIndex = activeIdx
      }
      if (overIdx !== -1) {
        destSection = section
        destIndex = overIdx
      }
    }

    if (!sourceSection || sourceIndex === -1) return

    // Same section reorder
    if (sourceSection.id === destSection?.id && destIndex !== -1) {
      setSections(
        sections.map((section) => {
          if (section.id !== sourceSection!.id) return section
          const items = arrayMove(section.items, sourceIndex, destIndex)
          // Update sort orders
          items.forEach((item, idx) => (item.sortOrder = idx))
          return { ...section, items }
        })
      )
    }
    // Cross-section move would go here (more complex)
  }

  // --- Template Selection ---

  const handleTemplateSelect = (template: EstimateTemplate) => {
    // Convert template sections to full sections with IDs
    const newSections = template.sections.map((templateSection) => {
      const items = templateSection.items.map((item, idx) => ({
        ...item,
        id: crypto.randomUUID(),
        sortOrder: idx,
      }))
      return {
        ...createSection(templateSection.category, items),
        label: templateSection.label,
      }
    })

    setSections(newSections)
    if (template.defaultTaxConfig) {
      setTaxConfig(template.defaultTaxConfig)
    }
    setShowTemplates(false)
  }

  // --- Build Estimate Object ---

  const buildEstimate = (): Estimate => {
    return {
      id: initialEstimate?.id || crypto.randomUUID(),
      estimateNumber: initialEstimate?.estimateNumber || `E-${Date.now()}`,
      jobId,
      title: initialEstimate?.title || 'New Estimate',
      sections,
      taxConfig,
      discounts,
      ...totals,
      status: 'draft',
      showLineItemPrices: true,
      showQuantities: true,
      createdAt: initialEstimate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // Would come from auth context
    }
  }

  const handleSave = () => {
    onSave?.(buildEstimate())
  }

  const handleSend = () => {
    onSend?.(buildEstimate())
  }

  // --- Render ---

  // Template selection view
  if (showTemplates) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Estimate
          </h2>
          <p className="text-gray-500">
            Choose a template to get started quickly, or start from scratch
          </p>
        </div>

        <EstimateTemplates onSelect={handleTemplateSelect} />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {initialEstimate?.title || 'New Estimate'}
              </h1>
              <p className="text-sm text-gray-500">
                {initialEstimate?.estimateNumber || 'Draft'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(true)}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Templates
              </Button>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isCollapsed={collapsedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              onDelete={() => deleteSection(section.id)}
              onAddItem={() => addLineItem(section.id)}
              onUpdateItem={(item) => updateLineItem(section.id, item)}
              onDeleteItem={(itemId) => deleteLineItem(section.id, itemId)}
              showMargin={showMargin}
            />
          ))}

          {/* Add Section */}
          <Card className="border-dashed">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-2">Add section:</span>
              {Object.entries(categoryLabels).map(([category, label]) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  onClick={() => addSection(category as LineItemCategory)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Actions (mobile) */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleSave}
              leftIcon={<Save className="h-4 w-4" />}
              fullWidth
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              leftIcon={<Send className="h-4 w-4" />}
              fullWidth
            >
              Send
            </Button>
          </div>
        </div>

        {/* Summary Sidebar (Desktop) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            <EstimateSummary
              subtotal={totals.subtotal}
              totalCost={totals.totalCost}
              discounts={discounts}
              taxConfig={taxConfig}
              discountAmount={totals.discountAmount}
              taxAmount={totals.taxAmount}
              grandTotal={totals.grandTotal}
              totalMargin={totals.totalMargin}
              marginPercent={totals.marginPercent}
              showMargin={showMargin}
              onDiscountsChange={setDiscounts}
              onTaxConfigChange={setTaxConfig}
            />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={handleSave}
                leftIcon={<Save className="h-4 w-4" />}
                fullWidth
              >
                Save Draft
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Eye className="h-4 w-4" />}
                fullWidth
              >
                Preview
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                leftIcon={<Send className="h-4 w-4" />}
                fullWidth
              >
                Send to Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Footer (Mobile) */}
        <div className="lg:hidden">
          <EstimateSummary
            subtotal={totals.subtotal}
            totalCost={totals.totalCost}
            discounts={discounts}
            taxConfig={taxConfig}
            discountAmount={totals.discountAmount}
            taxAmount={totals.taxAmount}
            grandTotal={totals.grandTotal}
            totalMargin={totals.totalMargin}
            marginPercent={totals.marginPercent}
            showMargin={showMargin}
            onDiscountsChange={setDiscounts}
            onTaxConfigChange={setTaxConfig}
            isCollapsed={summaryCollapsed}
            onToggleCollapsed={() => setSummaryCollapsed(!summaryCollapsed)}
          />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className="opacity-90 rotate-2">
            <EstimateLineItem
              item={activeItem}
              onUpdate={() => {}}
              onDelete={() => {}}
              showMargin={showMargin}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// --- Section Card Component ---

interface SectionCardProps {
  section: EstimateSection
  isCollapsed: boolean
  onToggle: () => void
  onDelete: () => void
  onAddItem: () => void
  onUpdateItem: (item: LineItemType) => void
  onDeleteItem: (itemId: string) => void
  showMargin?: boolean
}

function SectionCard({
  section,
  isCollapsed,
  onToggle,
  onDelete: _onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  showMargin,
}: SectionCardProps) {
  // Note: _onDelete available for future section deletion feature
  const itemIds = section.items.map((i) => i.id)

  return (
    <Card noPadding>
      {/* Section Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="font-medium text-gray-900">{section.label}</h3>
          <span className="text-sm text-gray-500">
            ({section.items.length} item{section.items.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-4">
          {showMargin && (
            <span
              className={cn(
                'text-sm font-medium',
                section.marginPercent > 25 && 'text-green-600',
                section.marginPercent < 15 && 'text-red-600',
                section.marginPercent >= 15 &&
                  section.marginPercent <= 25 &&
                  'text-yellow-600'
              )}
            >
              {section.marginPercent.toFixed(1)}%
            </span>
          )}
          <span className="font-medium text-gray-900">
            ${section.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2">
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {section.items.map((item) => (
              <EstimateLineItem
                key={item.id}
                item={item}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                showMargin={showMargin}
              />
            ))}
          </SortableContext>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddItem()
            }}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full justify-center border border-dashed border-gray-300 hover:border-gray-400"
          >
            Add Line Item
          </Button>
        </div>
      )}
    </Card>
  )
}
