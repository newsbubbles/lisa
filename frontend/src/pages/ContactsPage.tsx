import * as React from 'react'
import { ContactList } from '@/components/contacts'
import { Button, Spinner, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'
import { useUIStore } from '@/stores/uiStore'
import { useContactsStore, type Contact } from '@/stores/contacts'
import type { ContactFilters, ContactType } from '@/types/contact'
import { Plus, Users, RefreshCw } from 'lucide-react'

export interface ContactsPageProps {
  onNavigate?: (path: string) => void
}

export function ContactsPage({ onNavigate }: ContactsPageProps) {
  const { setPageTitle } = useUIStore()
  const {
    contacts,
    isLoading,
    error,
    totalCount,
    fetchContacts,
    createContact,
    clearError,
  } = useContactsStore()

  const [filters, setFilters] = React.useState<ContactFilters>({})
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    type: 'customer' as ContactType,
  })
  const [isCreating, setIsCreating] = React.useState(false)

  // Set page title
  React.useEffect(() => {
    setPageTitle('Contacts')
  }, [setPageTitle])

  // Fetch contacts on mount
  React.useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleFiltersChange = (newFilters: ContactFilters) => {
    setFilters(newFilters)
    // The store handles fetching with filters
  }

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    // Could open a detail drawer/modal here
    onNavigate?.(`/contacts/${contact.id}`)
  }

  const handleRefresh = () => {
    clearError()
    fetchContacts()
  }

  const handleCreateContact = async () => {
    if (!createForm.firstName.trim()) return

    setIsCreating(true)
    try {
      await createContact({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email || undefined,
        phone: createForm.phone || undefined,
        company: createForm.company || undefined,
        type: createForm.type as any,
        tags: [],
        properties: [],
      } as any)
      setIsCreateDialogOpen(false)
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        type: 'customer',
      })
    } catch (err) {
      // Error handled by store
    } finally {
      setIsCreating(false)
    }
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleText = (phone: string) => {
    window.location.href = `sms:${phone}`
  }

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  // Transform store contacts to component format
  const transformedContacts = React.useMemo(() => {
    return contacts.map((c) => ({
      ...c,
      type: (c.type || 'customer') as ContactType,
      status: 'active' as const,
      tags: c.tags || [],
      properties: c.properties || [],
    }))
  }, [contacts])

  // Loading state (initial load)
  if (isLoading && contacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      </div>
    )
  }

  // Error state (no data)
  if (error && contacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Failed to load contacts"
          description={error}
          action={
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Contact list with built-in header */}
      <ContactList
        contacts={transformedContacts}
        selectedId={selectedContact?.id}
        onSelect={handleSelectContact}
        onAddContact={() => setIsCreateDialogOpen(true)}
        onFiltersChange={handleFiltersChange}
        filters={filters}
        isLoading={isLoading}
        totalCount={totalCount}
        onCall={handleCall}
        onText={handleText}
        onEmail={handleEmail}
        variant="cards"
        className="flex-1"
      />

      {/* Create Contact Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="firstName" required>
                <Input
                  id="firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="John"
                />
              </FormField>
              <FormField label="Last Name" htmlFor="lastName">
                <Input
                  id="lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Smith"
                />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </FormField>

            <FormField label="Company" htmlFor="company">
              <Input
                id="company"
                value={createForm.company}
                onChange={(e) => setCreateForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Company name (optional)"
              />
            </FormField>

            <FormField label="Type" htmlFor="type">
              <Select
                value={createForm.type}
                onValueChange={(value) => setCreateForm((f) => ({ ...f, type: value as ContactType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateContact}
              loading={isCreating}
              disabled={!createForm.firstName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContactsPage
