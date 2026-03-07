import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Contact, ContactType } from '@/types/contact'
import {
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Building2,
  User,
  MapPin,
  MoreVertical,
  ChevronRight,
  Briefcase,
  Wrench,
  Truck,
} from 'lucide-react'

// Contact type config
const contactTypeConfig: Record<ContactType, { label: string; color: string; icon: React.ElementType }> = {
  customer: { label: 'Customer', color: 'bg-green-100 text-green-700', icon: User },
  lead: { label: 'Lead', color: 'bg-blue-100 text-blue-700', icon: Briefcase },
  vendor: { label: 'Vendor', color: 'bg-purple-100 text-purple-700', icon: Truck },
  subcontractor: { label: 'Subcontractor', color: 'bg-orange-100 text-orange-700', icon: Wrench },
}

export interface ContactCardProps {
  /** Contact data */
  contact: Contact
  /** Whether this card is selected */
  selected?: boolean
  /** Callback when card is clicked */
  onClick?: () => void
  /** Callback when call button is clicked */
  onCall?: (phone: string) => void
  /** Callback when text button is clicked */
  onText?: (phone: string) => void
  /** Callback when email button is clicked */
  onEmail?: (email: string) => void
  /** Callback when more options is clicked */
  onMoreClick?: (event: React.MouseEvent) => void
  /** Display variant */
  variant?: 'default' | 'compact'
  /** Additional class names */
  className?: string
}

export function ContactCard({
  contact,
  selected,
  onClick,
  onCall,
  onText,
  onEmail,
  onMoreClick,
  variant = 'default',
  className,
}: ContactCardProps) {
  const [copiedField, setCopiedField] = React.useState<'phone' | 'email' | null>(null)

  const displayName = contact.displayName || `${contact.firstName} ${contact.lastName}`.trim()
  const primaryPhone = contact.mobilePhone || contact.phone
  const primaryProperty = contact.properties?.find((p) => p.isPrimary) || contact.properties?.[0]
  const typeConfig = contactTypeConfig[contact.type]
  const TypeIcon = typeConfig.icon

  const handleCopy = async (text: string, field: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
          selected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
          className
        )}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {contact.company ? (
            <Building2 className="h-5 w-5 text-gray-500" />
          ) : (
            <span className="text-sm font-medium text-gray-600">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{displayName}</p>
          {contact.company && (
            <p className="text-sm text-gray-500 truncate">{contact.company}</p>
          )}
        </div>

        {/* Type badge */}
        <Badge variant="secondary" className={cn('text-xs', typeConfig.color)}>
          {typeConfig.label}
        </Badge>

        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border transition-all cursor-pointer',
        selected
          ? 'border-primary-500 bg-primary-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            {contact.company ? (
              <Building2 className="h-6 w-6 text-gray-500" />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {contact.firstName?.[0]}{contact.lastName?.[0]}
              </span>
            )}
          </div>

          {/* Name & Company */}
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            {contact.company && (
              <p className="text-sm text-gray-500">{contact.company}</p>
            )}
          </div>
        </div>

        {/* Type badge & more */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-xs', typeConfig.color)}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {typeConfig.label}
          </Badge>
          {onMoreClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoreClick(e)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {/* Phone */}
        {primaryPhone && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{primaryPhone}</span>
            </div>
            <button
              onClick={(e) => handleQuickAction(e, () => handleCopy(primaryPhone, 'phone'))}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Copy phone number"
            >
              {copiedField === 'phone' ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 min-w-0">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
            <button
              onClick={(e) => handleQuickAction(e, () => handleCopy(contact.email!, 'email'))}
              className="p-1 text-gray-400 hover:text-gray-600 rounded flex-shrink-0"
              title="Copy email"
            >
              {copiedField === 'email' ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Address */}
        {primaryProperty && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {primaryProperty.street}, {primaryProperty.city}, {primaryProperty.state}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {contact.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              +{contact.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {primaryPhone && onCall && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleQuickAction(e, () => onCall(primaryPhone))}
            leftIcon={<Phone className="h-4 w-4" />}
            className="flex-1"
          >
            Call
          </Button>
        )}
        {primaryPhone && onText && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleQuickAction(e, () => onText(primaryPhone))}
            leftIcon={<MessageSquare className="h-4 w-4" />}
            className="flex-1"
          >
            Text
          </Button>
        )}
        {contact.email && onEmail && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleQuickAction(e, () => onEmail(contact.email!))}
            leftIcon={<Mail className="h-4 w-4" />}
            className="flex-1"
          >
            Email
          </Button>
        )}
      </div>
    </div>
  )
}
