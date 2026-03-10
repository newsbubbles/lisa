/**
 * ContactSelector Component
 * 
 * Searchable contact dropdown with "Add New Contact" capability.
 * Loads contacts from API and allows inline creation.
 */

import * as React from 'react'
import { Plus, User } from 'lucide-react'
import { Combobox, ComboboxOption } from './Combobox'
import { apiClient, getErrorMessage } from '@/lib/api'
import { toCamelCase, toSnakeCase } from '@/lib/transforms'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ContactFromAPI {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  companyName?: string
  fullName: string
  displayName: string
  properties: Array<{
    id: string
    addressLine1: string
    city: string
    state: string
    zipCode: string
    fullAddress: string
  }>
}

export interface ContactSelectorProps {
  /** Currently selected contact ID */
  value: string | null
  /** Callback when contact changes */
  onChange: (contactId: string | null, contact?: ContactFromAPI) => void
  /** Label for the field */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Error message */
  error?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
  /** Callback when a new contact is created (receives the new contact) */
  onContactCreated?: (contact: ContactFromAPI) => void
}

export function ContactSelector({
  value,
  onChange,
  label = 'Contact',
  placeholder = 'Select a contact...',
  error,
  required,
  disabled,
  className,
  onContactCreated,
}: ContactSelectorProps) {
  const [contacts, setContacts] = React.useState<ContactFromAPI[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  // Load contacts on mount
  React.useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ items: unknown[] }>(
        '/contacts?page_size=100'
      )
      const transformed = toCamelCase(response.items) as ContactFromAPI[]
      setContacts(transformed)
    } catch (err) {
      console.error('Failed to load contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Convert contacts to combobox options
  const options: ComboboxOption[] = contacts.map((contact) => ({
    value: contact.id,
    label: contact.displayName || contact.fullName,
    description: contact.email || contact.phone || undefined,
  }))

  const handleChange = (contactId: string | null) => {
    const contact = contacts.find((c) => c.id === contactId)
    onChange(contactId, contact)
  }

  const handleContactCreated = (newContact: ContactFromAPI) => {
    setContacts((prev) => [newContact, ...prev])
    onChange(newContact.id, newContact)
    onContactCreated?.(newContact)
    setShowCreateModal(false)
  }

  return (
    <>
      <Combobox
        value={value}
        onChange={handleChange}
        options={options}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search contacts..."
        error={error}
        required={required}
        disabled={disabled}
        loading={loading}
        emptyMessage="No contacts found"
        className={className}
        footer={
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Contact
          </button>
        }
      />

      <QuickCreateContactModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleContactCreated}
      />
    </>
  )
}

// =============================================================================
// Quick Create Contact Modal
// =============================================================================

interface QuickCreateContactModalProps {
  open: boolean
  onClose: () => void
  onCreated: (contact: ContactFromAPI) => void
}

function QuickCreateContactModal({
  open,
  onClose,
  onCreated,
}: QuickCreateContactModalProps) {
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
  })

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
      })
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = toSnakeCase({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        companyName: formData.companyName.trim() || null,
        contactType: 'residential',
      })

      const response = await apiClient.post<unknown>('/contacts', payload)
      const newContact = toCamelCase(response) as ContactFromAPI
      onCreated(newContact)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Quick Add Contact
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="John"
              autoFocus
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Smith"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="john@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />

          <Input
            label="Company (Optional)"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="ABC Company"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
