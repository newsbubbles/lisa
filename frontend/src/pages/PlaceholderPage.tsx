import * as React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/uiStore'
import { Construction, ArrowLeft } from 'lucide-react'

export interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: React.ReactNode
  onNavigate?: (path: string) => void
}

export function PlaceholderPage({ 
  title, 
  description = 'This feature is coming soon.',
  icon,
  onNavigate 
}: PlaceholderPageProps) {
  const { setPageTitle } = useUIStore()

  React.useEffect(() => {
    setPageTitle(title)
  }, [setPageTitle, title])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
            {icon || <Construction className="h-8 w-8 text-primary-600" />}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{description}</p>
          <Button variant="secondary" onClick={() => onNavigate?.('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Pre-configured placeholder pages
export function InvoicesPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <PlaceholderPage
      title="Invoices"
      description="Invoice management and payment tracking coming soon."
      onNavigate={onNavigate}
    />
  )
}

// ContactsPage moved to ContactsPage.tsx with real implementation

export function CalendarPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <PlaceholderPage
      title="Calendar"
      description="Scheduling and calendar integration coming soon."
      onNavigate={onNavigate}
    />
  )
}

export function ReportsPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <PlaceholderPage
      title="Reports"
      description="Analytics and reporting dashboard coming soon."
      onNavigate={onNavigate}
    />
  )
}

export function SettingsPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <PlaceholderPage
      title="Settings"
      description="Account and application settings coming soon."
      onNavigate={onNavigate}
    />
  )
}

export default PlaceholderPage
