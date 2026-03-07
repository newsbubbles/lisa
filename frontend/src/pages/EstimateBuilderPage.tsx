import * as React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EstimateBuilder } from '@/components/estimates'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/uiStore'
import { ArrowLeft, Save, Send, Eye } from 'lucide-react'
import type { Estimate } from '@/types/estimate'

export interface EstimateBuilderPageProps {
  onNavigate?: (path: string) => void
}

export function EstimateBuilderPage({ onNavigate }: EstimateBuilderPageProps) {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { setPageTitle } = useUIStore()
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)

  const isEditing = !!id
  const jobId = searchParams.get('jobId') || undefined

  React.useEffect(() => {
    setPageTitle(isEditing ? 'Edit Estimate' : 'New Estimate')
  }, [setPageTitle, isEditing])

  // Mock initial estimate for editing
  const initialEstimate: Partial<Estimate> | undefined = isEditing
    ? {
        id,
        estimateNumber: 'EST-2024-0089',
        title: 'Full Roof Replacement',
        jobId: 'job-1',
        sections: [
          {
            id: 'sec-1',
            label: 'Labor',
            category: 'labor',
            items: [
              {
                id: 'item-1',
                description: 'Remove existing shingles',
                category: 'labor',
                quantity: 28,
                unit: 'sq',
                costPerUnit: 45,
                pricePerUnit: 75,
                totalCost: 1260,
                totalPrice: 2100,
                marginAmount: 840,
                marginPercent: 40,
                sortOrder: 0,
              },
              {
                id: 'item-2',
                description: 'Dumpster rental & disposal fees',
                category: 'labor',
                quantity: 1,
                unit: 'flat',
                costPerUnit: 450,
                pricePerUnit: 600,
                totalCost: 450,
                totalPrice: 600,
                marginAmount: 150,
                marginPercent: 25,
                sortOrder: 1,
              },
            ],
            totalCost: 1710,
            totalPrice: 2700,
            marginAmount: 990,
            marginPercent: 36.67,
          },
          {
            id: 'sec-2',
            label: 'Materials',
            category: 'materials',
            items: [
              {
                id: 'item-3',
                description: 'GAF Timberline HDZ Architectural Shingles',
                category: 'materials',
                quantity: 30,
                unit: 'sq',
                costPerUnit: 95,
                pricePerUnit: 145,
                totalCost: 2850,
                totalPrice: 4350,
                marginAmount: 1500,
                marginPercent: 34.48,
                sortOrder: 0,
              },
              {
                id: 'item-4',
                description: 'Synthetic underlayment',
                category: 'materials',
                quantity: 30,
                unit: 'sq',
                costPerUnit: 15,
                pricePerUnit: 25,
                totalCost: 450,
                totalPrice: 750,
                marginAmount: 300,
                marginPercent: 40,
                sortOrder: 1,
              },
            ],
            totalCost: 3300,
            totalPrice: 5100,
            marginAmount: 1800,
            marginPercent: 35.29,
          },
        ],
        discounts: [],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
      }
    : undefined

  const handleSave = async (estimate: Estimate) => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLastSaved(new Date())
      console.log('Saved estimate:', estimate)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (estimate: Estimate) => {
    console.log('Sending estimate:', estimate)
    // Would open send dialog or navigate to preview
  }

  const handleBack = () => {
    onNavigate?.('/estimates')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isEditing ? `Edit Estimate #${initialEstimate?.estimateNumber}` : 'New Estimate'}
            </h1>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                Last saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave({} as Estimate)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button size="sm" onClick={() => handleSend({} as Estimate)}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <EstimateBuilder
          initialEstimate={initialEstimate}
          onSave={handleSave}
          onSend={handleSend}
          showMargin={true}
          jobId={jobId}
        />
      </div>
    </div>
  )
}

export default EstimateBuilderPage
