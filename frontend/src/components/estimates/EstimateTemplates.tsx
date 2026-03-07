import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Home,
  Wrench,
  Droplets,
  Layers,
  ClipboardCheck,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react'
import type { EstimateTemplate } from '@/types/estimate'
import { createLineItem } from '@/types/estimate'

// Icon mapping
const templateIcons: Record<string, React.ReactNode> = {
  'roof-replacement': <Home className="h-6 w-6" />,
  'roof-repair': <Wrench className="h-6 w-6" />,
  'gutters': <Droplets className="h-6 w-6" />,
  'siding': <Layers className="h-6 w-6" />,
  'inspection': <ClipboardCheck className="h-6 w-6" />,
  'custom': <FileText className="h-6 w-6" />,
}

// Pre-built templates
const TEMPLATES: EstimateTemplate[] = [
  {
    id: 'roof-replacement-asphalt',
    name: 'Roof Replacement - Asphalt Shingles',
    description: 'Complete tear-off and replacement with architectural shingles',
    category: 'roof-replacement',
    icon: 'roof-replacement',
    estimatedTime: '2-3 min',
    sections: [
      {
        category: 'labor',
        label: 'Labor',
        items: [
          createLineItem('labor', 0, {
            description: 'Tear-off existing roofing',
            quantity: 1,
            unit: 'sq',
            costPerUnit: 45,
            pricePerUnit: 75,
          }),
          createLineItem('labor', 1, {
            description: 'Install new roofing system',
            quantity: 1,
            unit: 'sq',
            costPerUnit: 85,
            pricePerUnit: 150,
          }),
          createLineItem('labor', 2, {
            description: 'Install drip edge',
            quantity: 1,
            unit: 'lf',
            costPerUnit: 1.5,
            pricePerUnit: 3,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
      {
        category: 'materials',
        label: 'Materials',
        items: [
          createLineItem('materials', 0, {
            description: 'Architectural shingles (30-year)',
            quantity: 1,
            unit: 'sq',
            costPerUnit: 95,
            pricePerUnit: 145,
          }),
          createLineItem('materials', 1, {
            description: 'Synthetic underlayment',
            quantity: 1,
            unit: 'sq',
            costPerUnit: 18,
            pricePerUnit: 35,
          }),
          createLineItem('materials', 2, {
            description: 'Ice & water shield',
            quantity: 1,
            unit: 'roll',
            costPerUnit: 85,
            pricePerUnit: 125,
          }),
          createLineItem('materials', 3, {
            description: 'Ridge cap shingles',
            quantity: 1,
            unit: 'bundle',
            costPerUnit: 55,
            pricePerUnit: 85,
          }),
          createLineItem('materials', 4, {
            description: 'Roofing nails',
            quantity: 1,
            unit: 'each',
            costPerUnit: 45,
            pricePerUnit: 65,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
      {
        category: 'disposal',
        label: 'Disposal & Cleanup',
        items: [
          createLineItem('disposal', 0, {
            description: 'Dumpster rental',
            quantity: 1,
            unit: 'each',
            costPerUnit: 350,
            pricePerUnit: 450,
          }),
          createLineItem('disposal', 1, {
            description: 'Dump fees',
            quantity: 1,
            unit: 'flat',
            costPerUnit: 150,
            pricePerUnit: 200,
          }),
          createLineItem('disposal', 2, {
            description: 'Final cleanup & magnet sweep',
            quantity: 1,
            unit: 'flat',
            costPerUnit: 0,
            pricePerUnit: 150,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
    ],
    defaultTaxConfig: {
      rate: 0.0825,
      label: 'Sales Tax (8.25%)',
      applyToLabor: false,
      applyToMaterials: true,
    },
  },
  {
    id: 'roof-repair',
    name: 'Roof Repair',
    description: 'Targeted repair for leaks, damaged shingles, or flashing',
    category: 'roof-repair',
    icon: 'roof-repair',
    estimatedTime: '1-2 min',
    sections: [
      {
        category: 'labor',
        label: 'Labor',
        items: [
          createLineItem('labor', 0, {
            description: 'Diagnose and locate leak source',
            quantity: 1,
            unit: 'hour',
            costPerUnit: 45,
            pricePerUnit: 95,
          }),
          createLineItem('labor', 1, {
            description: 'Repair damaged area',
            quantity: 1,
            unit: 'hour',
            costPerUnit: 45,
            pricePerUnit: 95,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
      {
        category: 'materials',
        label: 'Materials',
        items: [
          createLineItem('materials', 0, {
            description: 'Replacement shingles',
            quantity: 1,
            unit: 'bundle',
            costPerUnit: 35,
            pricePerUnit: 55,
          }),
          createLineItem('materials', 1, {
            description: 'Roofing cement/sealant',
            quantity: 1,
            unit: 'each',
            costPerUnit: 12,
            pricePerUnit: 25,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
    ],
  },
  {
    id: 'gutter-install',
    name: 'Gutter Installation',
    description: 'New seamless aluminum gutters with downspouts',
    category: 'gutters',
    icon: 'gutters',
    estimatedTime: '1-2 min',
    sections: [
      {
        category: 'labor',
        label: 'Labor',
        items: [
          createLineItem('labor', 0, {
            description: 'Remove existing gutters',
            quantity: 1,
            unit: 'lf',
            costPerUnit: 1,
            pricePerUnit: 2,
          }),
          createLineItem('labor', 1, {
            description: 'Install seamless gutters',
            quantity: 1,
            unit: 'lf',
            costPerUnit: 4,
            pricePerUnit: 8,
          }),
          createLineItem('labor', 2, {
            description: 'Install downspouts',
            quantity: 1,
            unit: 'each',
            costPerUnit: 25,
            pricePerUnit: 50,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
      {
        category: 'materials',
        label: 'Materials',
        items: [
          createLineItem('materials', 0, {
            description: '5" seamless aluminum gutters',
            quantity: 1,
            unit: 'lf',
            costPerUnit: 3,
            pricePerUnit: 6,
          }),
          createLineItem('materials', 1, {
            description: 'Downspout (10ft section)',
            quantity: 1,
            unit: 'each',
            costPerUnit: 18,
            pricePerUnit: 35,
          }),
          createLineItem('materials', 2, {
            description: 'Gutter hangers',
            quantity: 1,
            unit: 'each',
            costPerUnit: 1.5,
            pricePerUnit: 3,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
    ],
  },
  {
    id: 'roof-inspection',
    name: 'Roof Inspection',
    description: 'Comprehensive roof inspection with detailed report',
    category: 'inspection',
    icon: 'inspection',
    estimatedTime: '< 1 min',
    sections: [
      {
        category: 'labor',
        label: 'Services',
        items: [
          createLineItem('labor', 0, {
            description: 'Comprehensive roof inspection',
            quantity: 1,
            unit: 'flat',
            costPerUnit: 50,
            pricePerUnit: 150,
          }),
          createLineItem('labor', 1, {
            description: 'Detailed inspection report with photos',
            quantity: 1,
            unit: 'flat',
            costPerUnit: 0,
            pricePerUnit: 0,
          }),
        ],
        totalCost: 0,
        totalPrice: 0,
        marginAmount: 0,
        marginPercent: 0,
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Estimate',
    description: 'Start from scratch with an empty estimate',
    category: 'custom',
    icon: 'custom',
    estimatedTime: '5+ min',
    sections: [],
  },
]

export interface EstimateTemplatesProps {
  /** Called when a template is selected */
  onSelect: (template: EstimateTemplate) => void
  /** Show as grid (default) or list */
  layout?: 'grid' | 'list'
  /** Show only specific categories */
  categories?: EstimateTemplate['category'][]
}

export function EstimateTemplates({
  onSelect,
  layout = 'grid',
  categories,
}: EstimateTemplatesProps) {
  const filteredTemplates = categories
    ? TEMPLATES.filter((t) => categories.includes(t.category))
    : TEMPLATES

  if (layout === 'list') {
    return (
      <div className="space-y-2">
        {filteredTemplates.map((template) => (
          <TemplateListItem
            key={template.id}
            template={template}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// --- Template Card (Grid View) ---

interface TemplateCardProps {
  template: EstimateTemplate
  onSelect: (template: EstimateTemplate) => void
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const icon = templateIcons[template.icon] || templateIcons.custom
  const itemCount = template.sections.reduce(
    (sum, section) => sum + section.items.length,
    0
  )

  return (
    <Card
      clickable
      onClick={() => onSelect(template)}
      className="flex flex-col h-full"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            template.category === 'roof-replacement' && 'bg-blue-100 text-blue-600',
            template.category === 'roof-repair' && 'bg-orange-100 text-orange-600',
            template.category === 'gutters' && 'bg-cyan-100 text-cyan-600',
            template.category === 'siding' && 'bg-purple-100 text-purple-600',
            template.category === 'inspection' && 'bg-green-100 text-green-600',
            template.category === 'custom' && 'bg-gray-100 text-gray-600'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {template.estimatedTime}
          </span>
          {itemCount > 0 && (
            <span>{itemCount} items</span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Card>
  )
}

// --- Template List Item ---

function TemplateListItem({ template, onSelect }: TemplateCardProps) {
  const icon = templateIcons[template.icon] || templateIcons.custom

  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
    >
      <div
        className={cn(
          'p-2 rounded-lg flex-shrink-0',
          template.category === 'roof-replacement' && 'bg-blue-100 text-blue-600',
          template.category === 'roof-repair' && 'bg-orange-100 text-orange-600',
          template.category === 'gutters' && 'bg-cyan-100 text-cyan-600',
          template.category === 'siding' && 'bg-purple-100 text-purple-600',
          template.category === 'inspection' && 'bg-green-100 text-green-600',
          template.category === 'custom' && 'bg-gray-100 text-gray-600'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{template.name}</p>
        <p className="text-sm text-gray-500 truncate">{template.description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="default" size="sm">
          <Clock className="h-3 w-3 mr-1" />
          {template.estimatedTime}
        </Badge>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </button>
  )
}

// --- Quick Template Picker (Compact) ---

export interface QuickTemplatePickerProps {
  onSelect: (template: EstimateTemplate) => void
}

export function QuickTemplatePicker({ onSelect }: QuickTemplatePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.filter((t) => t.category !== 'custom').map((template) => {
        const icon = templateIcons[template.icon]
        return (
          <Button
            key={template.id}
            variant="secondary"
            size="sm"
            onClick={() => onSelect(template)}
            leftIcon={icon}
          >
            {template.name.split(' - ')[0]}
          </Button>
        )
      })}
    </div>
  )
}

export { TEMPLATES }
