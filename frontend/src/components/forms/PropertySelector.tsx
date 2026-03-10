/**
 * PropertySelector Component
 * 
 * Property dropdown filtered by selected contact with "Add New Property" capability.
 */

import * as React from 'react'
import { Plus, MapPin } from 'lucide-react'
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

export interface PropertyFromAPI {
  id: string
  contactId: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  fullAddress: string
  isPrimary: boolean
  propertyType: string
}

export interface PropertySelectorProps {
  /** Currently selected property ID */
  value: string | null
  /** Callback when property changes */
  onChange: (propertyId: string | null, property?: PropertyFromAPI) => void
  /** Contact ID to filter properties by */
  contactId: string | null
  /** Pre-loaded properties (from contact selection) */
  properties?: PropertyFromAPI[]
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
  /** Callback when a new property is created */
  onPropertyCreated?: (property: PropertyFromAPI) => void
}

export function PropertySelector({
  value,
  onChange,
  contactId,
  properties: propProperties,
  label = 'Property',
  placeholder = 'Select a property...',
  error,
  required,
  disabled,
  className,
  onPropertyCreated,
}: PropertySelectorProps) {
  const [properties, setProperties] = React.useState<PropertyFromAPI[]>(
    propProperties || []
  )
  const [loading, setLoading] = React.useState(false)
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  // Update properties when propProperties changes (from contact selection)
  React.useEffect(() => {
    if (propProperties) {
      setProperties(propProperties)
    }
  }, [propProperties])

  // Load properties when contactId changes (if not provided via props)
  React.useEffect(() => {
    if (contactId && !propProperties) {
      loadProperties()
    } else if (!contactId) {
      setProperties([])
    }
  }, [contactId, propProperties])

  const loadProperties = async () => {
    if (!contactId) return
    
    try {
      setLoading(true)
      // Properties are nested in contact response
      const response = await apiClient.get<unknown>(`/contacts/${contactId}`)
      const contact = toCamelCase(response) as { properties: PropertyFromAPI[] }
      setProperties(contact.properties || [])
    } catch (err) {
      console.error('Failed to load properties:', err)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  // Convert properties to combobox options
  const options: ComboboxOption[] = properties.map((property) => ({
    value: property.id,
    label: property.addressLine1,
    description: `${property.city}, ${property.state} ${property.zipCode}`,
  }))

  const handleChange = (propertyId: string | null) => {
    const property = properties.find((p) => p.id === propertyId)
    onChange(propertyId, property)
  }

  const handlePropertyCreated = (newProperty: PropertyFromAPI) => {
    setProperties((prev) => [newProperty, ...prev])
    onChange(newProperty.id, newProperty)
    onPropertyCreated?.(newProperty)
    setShowCreateModal(false)
  }

  const isDisabled = disabled || !contactId

  return (
    <>
      <Combobox
        value={value}
        onChange={handleChange}
        options={options}
        label={label}
        placeholder={contactId ? placeholder : 'Select a contact first'}
        searchPlaceholder="Search addresses..."
        error={error}
        required={required}
        disabled={isDisabled}
        loading={loading}
        emptyMessage={contactId ? 'No properties found' : 'Select a contact first'}
        className={className}
        footer={
          contactId ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Property
            </button>
          ) : null
        }
      />

      {contactId && (
        <QuickCreatePropertyModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePropertyCreated}
          contactId={contactId}
        />
      )}
    </>
  )
}

// =============================================================================
// Quick Create Property Modal
// =============================================================================

interface QuickCreatePropertyModalProps {
  open: boolean
  onClose: () => void
  onCreated: (property: PropertyFromAPI) => void
  contactId: string
}

function QuickCreatePropertyModal({
  open,
  onClose,
  onCreated,
  contactId,
}: QuickCreatePropertyModalProps) {
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
  })

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
      })
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.addressLine1.trim() || !formData.city.trim() || 
        !formData.state.trim() || !formData.zipCode.trim()) {
      setError('Address, city, state, and ZIP code are required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = toSnakeCase({
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        propertyType: 'residential',
        isPrimary: true,
      })

      const response = await apiClient.post<unknown>(
        `/contacts/${contactId}/properties`,
        payload
      )
      const newProperty = toCamelCase(response) as PropertyFromAPI
      onCreated(newProperty)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // US States for dropdown
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Property
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Street Address"
            required
            value={formData.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            placeholder="123 Main St"
            autoFocus
          />

          <Input
            label="Address Line 2"
            value={formData.addressLine2}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            placeholder="Apt, Suite, Unit, etc."
          />

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <Input
                label="City"
                required
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <option value="">--</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label="ZIP Code"
                required
                value={formData.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>

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
              Add Property
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
