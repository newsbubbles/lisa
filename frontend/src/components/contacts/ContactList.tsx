import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ContactCard } from './ContactCard'
import type { Contact, ContactType, ContactFilters } from '@/types/contact'
import {
  Search,
  Filter,
  X,
  Plus,
  User,
  Briefcase,
  Truck,
  Wrench,
  SortAsc,
  SortDesc,
  Users,
  Loader2,
} from 'lucide-react'

// Filter options
const typeFilters: { value: ContactType; label: string; icon: React.ElementType }[] = [
  { value: 'customer', label: 'Customers', icon: User },
  { value: 'lead', label: 'Leads', icon: Briefcase },
  { value: 'vendor', label: 'Vendors', icon: Truck },
  { value: 'subcontractor', label: 'Subcontractors', icon: Wrench },
]

export interface ContactListProps {
  /** List of contacts to display */
  contacts: Contact[]
  /** Currently selected contact ID */
  selectedId?: string
  /** Callback when contact is selected */
  onSelect?: (contact: Contact) => void
  /** Callback when "Add Contact" is clicked */
  onAddContact?: () => void
  /** Callback when filters change */
  onFiltersChange?: (filters: ContactFilters) => void
  /** Current filters */
  filters?: ContactFilters
  /** Loading state */
  isLoading?: boolean
  /** Total count for display */
  totalCount?: number
  /** Callback when call action is triggered */
  onCall?: (phone: string) => void
  /** Callback when text action is triggered */
  onText?: (phone: string) => void
  /** Callback when email action is triggered */
  onEmail?: (email: string) => void
  /** Display variant */
  variant?: 'cards' | 'compact'
  /** Additional class names */
  className?: string
}

export function ContactList({
  contacts,
  selectedId,
  onSelect,
  onAddContact,
  onFiltersChange,
  filters = {},
  isLoading,
  totalCount,
  onCall,
  onText,
  onEmail,
  variant = 'cards',
  className,
}: ContactListProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || '')
  const [showFilters, setShowFilters] = React.useState(false)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  // Debounced search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange?.({ ...filters, search: searchValue || undefined })
      }
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchValue])

  const handleTypeToggle = (type: ContactType) => {
    const currentTypes = filters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]
    onFiltersChange?.({ ...filters, type: newTypes.length > 0 ? newTypes : undefined })
  }

  const handleClearFilters = () => {
    setSearchValue('')
    onFiltersChange?.({})
  }

  const activeFilterCount = [
    filters.type?.length ? 1 : 0,
    filters.status?.length ? 1 : 0,
    filters.tags?.length ? 1 : 0,
    filters.source?.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  // Sort contacts
  const sortedContacts = React.useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    })
  }, [contacts, sortOrder])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        {/* Title & Add Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
            {totalCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {totalCount}
              </Badge>
            )}
          </div>
          {onAddContact && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAddContact}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Contact
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Search contacts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchValue ? (
                  <button
                    onClick={() => setSearchValue('')}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
              inputSize="sm"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Z-A' : 'A-Z'}`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* Type Filters */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Contact Type
              </label>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map(({ value, label, icon: Icon }) => {
                  const isActive = filters.type?.includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => handleTypeToggle(value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first contact'}
            </p>
            {onAddContact && !filters.search && activeFilterCount === 0 && (
              <Button
                variant="primary"
                onClick={onAddContact}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Contact
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            variant === 'cards' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : 'space-y-2'
          )}>
            {sortedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                selected={contact.id === selectedId}
                onClick={() => onSelect?.(contact)}
                onCall={onCall}
                onText={onText}
                onEmail={onEmail}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
