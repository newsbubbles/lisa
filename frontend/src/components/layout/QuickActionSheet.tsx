import * as React from 'react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import {
  X,
  Briefcase,
  FileText,
  Users,
  Camera,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react'

// Quick action items
const quickActions = [
  {
    id: 'job',
    label: 'New Job',
    description: 'Create a new roofing job',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'estimate',
    label: 'New Estimate',
    description: 'Build a new estimate',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'contact',
    label: 'New Contact',
    description: 'Add a customer or lead',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'photo',
    label: 'Take Photo',
    description: 'Capture a job site photo',
    icon: Camera,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'checkin',
    label: 'Check In',
    description: 'Log arrival at job site',
    icon: MapPin,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'call',
    label: 'Log Call',
    description: 'Record a phone call',
    icon: Phone,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'appointment',
    label: 'Schedule',
    description: 'Create an appointment',
    icon: Calendar,
    color: 'bg-yellow-100 text-yellow-600',
  },
]

export interface QuickActionSheetProps {
  /** Callback when an action is selected */
  onAction?: (actionId: string) => void
}

export function QuickActionSheet({ onAction }: QuickActionSheetProps) {
  const { quickActionSheetOpen, setQuickActionSheetOpen } = useUIStore()
  const sheetRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickActionSheetOpen) {
        setQuickActionSheetOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [quickActionSheetOpen, setQuickActionSheetOpen])

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (quickActionSheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [quickActionSheetOpen])

  const handleAction = (actionId: string) => {
    setQuickActionSheetOpen(false)
    onAction?.(actionId)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setQuickActionSheetOpen(false)
    }
  }

  if (!quickActionSheetOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 lg:hidden',
          'transform transition-transform duration-300 ease-out',
          'safe-area-bottom',
          quickActionSheetOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <button
            onClick={() => setQuickActionSheetOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="px-4 pb-6 grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-2', action.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Cancel Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setQuickActionSheetOpen(false)}
            className="w-full py-3 text-center text-gray-600 font-medium rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
