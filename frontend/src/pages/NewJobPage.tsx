/**
 * NewJobPage - Create a new job/project
 *
 * Multi-section form for creating jobs with all the fields
 * supported by the backend API.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  Clock,
  Building2,
} from 'lucide-react'
import { useJobsStore } from '@/stores/jobs'
import { api } from '@/lib/api'
import { ContactSelector, PropertySelector, UserSelector } from '@/components/forms'
import { toCamelCase } from '@/lib/transforms'
import { toSnakeCase } from '@/lib/transforms'

// Job type options matching backend enum
const JOB_TYPES = [
  { value: 'full_replacement', label: 'Full Replacement' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'gutter', label: 'Gutter' },
  { value: 'siding', label: 'Siding' },
  { value: 'insurance_claim', label: 'Insurance Claim' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
]

// Status options matching backend enum
const JOB_STATUSES = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
]

// Contact type from API (camelCase after transform)
interface ContactFromAPI {
  id: string
  firstName: string
  lastName: string
  companyName?: string
  displayName: string
  fullName: string
  properties: PropertyFromAPI[]
}

// Property type from API (camelCase after transform)
interface PropertyFromAPI {
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

interface FormData {
  // Basic Info
  title: string
  description: string
  jobType: string
  status: string

  // Customer & Property
  contactId: string
  propertyId: string

  // Assignment & Scheduling
  assignedToId: string
  scheduledDate: string
  scheduledTime: string
  estimatedDurationDays: string

  // Financial
  estimatedValue: string

  // Insurance
  isInsuranceJob: boolean
  insuranceCompany: string
  claimNumber: string
  adjusterName: string
  adjusterPhone: string
  adjusterEmail: string
  deductible: string

  // Additional
  crewName: string
  tags: string
}

const initialFormData: FormData = {
  title: '',
  description: '',
  jobType: 'full_replacement',
  status: 'lead',
  contactId: '',
  propertyId: '',
  assignedToId: '',
  scheduledDate: '',
  scheduledTime: '',
  estimatedDurationDays: '',
  estimatedValue: '',
  isInsuranceJob: false,
  insuranceCompany: '',
  claimNumber: '',
  adjusterName: '',
  adjusterPhone: '',
  adjusterEmail: '',
  deductible: '',
  crewName: '',
  tags: '',
}

export function NewJobPage() {
  const navigate = useNavigate()
  const { createJob, isLoading, error: storeError } = useJobsStore()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [selectedContact, setSelectedContact] = useState<ContactFromAPI | null>(null)
  const [showInsurance, setShowInsurance] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Toggle insurance section visibility based on checkbox
  useEffect(() => {
    if (formData.isInsuranceJob) {
      setShowInsurance(true)
    }
  }, [formData.isInsuranceJob])

  // Handle contact selection from ContactSelector
  const handleContactChange = (contactId: string | null, contact?: ContactFromAPI) => {
    setFormData((prev) => ({
      ...prev,
      contactId: contactId || '',
      propertyId: '', // Reset property when contact changes
    }))
    setSelectedContact(contact || null)
    setFormError(null)
  }

  // Handle property selection from PropertySelector
  const handlePropertyChange = (propertyId: string | null) => {
    setFormData((prev) => ({
      ...prev,
      propertyId: propertyId || '',
    }))
    setFormError(null)
  }

  // Handle user selection from UserSelector
  const handleUserChange = (userId: string | null) => {
    setFormData((prev) => ({
      ...prev,
      assignedToId: userId || '',
    }))
    setFormError(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate required fields
    if (!formData.title.trim()) {
      setFormError('Job title is required')
      return
    }

    try {
      setSubmitting(true)

      // Build payload with snake_case keys for backend
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        job_type: formData.jobType,
        status: formData.status,
      }

      // Optional fields - only include if set
      if (formData.contactId) payload.contact_id = formData.contactId
      if (formData.propertyId) payload.property_id = formData.propertyId
      if (formData.assignedToId) payload.assigned_to_id = formData.assignedToId
      if (formData.scheduledDate) payload.scheduled_date = formData.scheduledDate
      if (formData.scheduledTime) payload.scheduled_time = formData.scheduledTime
      if (formData.estimatedDurationDays) {
        payload.estimated_duration_days = parseInt(formData.estimatedDurationDays, 10)
      }
      if (formData.estimatedValue) {
        payload.estimated_value = parseFloat(formData.estimatedValue)
      }

      // Insurance fields
      payload.is_insurance_job = formData.isInsuranceJob
      if (formData.isInsuranceJob) {
        if (formData.insuranceCompany) payload.insurance_company = formData.insuranceCompany
        if (formData.claimNumber) payload.claim_number = formData.claimNumber
        if (formData.adjusterName) payload.adjuster_name = formData.adjusterName
        if (formData.adjusterPhone) payload.adjuster_phone = formData.adjusterPhone
        if (formData.adjusterEmail) payload.adjuster_email = formData.adjusterEmail
        if (formData.deductible) payload.deductible = parseFloat(formData.deductible)
      }

      // Additional fields
      if (formData.crewName) payload.crew_name = formData.crewName
      if (formData.tags.trim()) {
        payload.tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      }

      // Create job via API
      const response = await api.post('/jobs', payload)
      const newJob = response.data

      // Navigate to jobs page or the new job
      navigate('/jobs')
    } catch (err: any) {
      console.error('Failed to create job:', err)
      setFormError(err.response?.data?.detail || 'Failed to create job')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs')}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">New Job</h1>
          </div>
          <button
            type="submit"
            form="job-form"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Job'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form id="job-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Error Display */}
        {(formError || storeError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {formError || storeError}
          </div>
        )}

        {/* Basic Info Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Full Roof Replacement - 123 Main St"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {JOB_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the job scope, special requirements, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Customer & Property Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-gray-900">Customer & Property</h2>
          </div>
          <div className="p-4 space-y-4">
            <ContactSelector
              value={formData.contactId || null}
              onChange={handleContactChange}
              label="Customer"
              placeholder="Search customers..."
            />

            <PropertySelector
              value={formData.propertyId || null}
              onChange={handlePropertyChange}
              contactId={formData.contactId || null}
              properties={selectedContact?.properties}
              label="Property"
              placeholder="Select a property..."
            />
          </div>
        </section>

        {/* Assignment & Scheduling Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-gray-900">Assignment & Scheduling</h2>
          </div>
          <div className="p-4 space-y-4">
            <UserSelector
              value={formData.assignedToId || null}
              onChange={handleUserChange}
              label="Assigned To"
              placeholder="Select a team member..."
              allowUnassigned={true}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time
                </label>
                <select
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Not set</option>
                  <option value="AM">Morning (AM)</option>
                  <option value="PM">Afternoon (PM)</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (days)
              </label>
              <input
                type="number"
                name="estimatedDurationDays"
                value={formData.estimatedDurationDays}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Financial Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-gray-900">Financial</h2>
          </div>
          <div className="p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Section (Collapsible) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInsurance(!showInsurance)}
            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              <h2 className="font-medium text-gray-900">Insurance Information</h2>
              {formData.isInsuranceJob && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Active
                </span>
              )}
            </div>
            {showInsurance ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showInsurance && (
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isInsuranceJob"
                  checked={formData.isInsuranceJob}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">This is an insurance job</span>
              </label>

              {formData.isInsuranceJob && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Company
                      </label>
                      <input
                        type="text"
                        name="insuranceCompany"
                        value={formData.insuranceCompany}
                        onChange={handleChange}
                        placeholder="e.g., State Farm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Claim Number
                      </label>
                      <input
                        type="text"
                        name="claimNumber"
                        value={formData.claimNumber}
                        onChange={handleChange}
                        placeholder="e.g., CLM-2026-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuster Name
                      </label>
                      <input
                        type="text"
                        name="adjusterName"
                        value={formData.adjusterName}
                        onChange={handleChange}
                        placeholder="e.g., John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuster Phone
                      </label>
                      <input
                        type="tel"
                        name="adjusterPhone"
                        value={formData.adjusterPhone}
                        onChange={handleChange}
                        placeholder="e.g., 800-555-1234"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjuster Email
                      </label>
                      <input
                        type="email"
                        name="adjusterEmail"
                        value={formData.adjusterEmail}
                        onChange={handleChange}
                        placeholder="e.g., adjuster@insurance.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deductible ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          name="deductible"
                          value={formData.deductible}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Additional Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-gray-900">Additional Details</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crew/Team</label>
              <input
                type="text"
                name="crewName"
                value={formData.crewName}
                onChange={handleChange}
                placeholder="e.g., Crew Alpha, Team A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., storm, urgent, residential"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
            </div>
          </div>
        </section>

        {/* Submit Button (Mobile) */}
        <div className="pb-6 md:hidden">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Saving...' : 'Save Job'}
          </button>
        </div>
      </form>
    </div>
  )
}
