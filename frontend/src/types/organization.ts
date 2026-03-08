/**
 * Organization Types for Lisa Roofing CRM
 *
 * Data models for organizations and settings.
 */

/**
 * Subscription plan types.
 */
export type PlanType = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

/**
 * Payment terms options.
 * Configurable per organization.
 */
export type PaymentTerms =
  | 'due_on_receipt'
  | 'net_15'
  | 'net_30'
  | 'net_60'
  | '1_10_net_30'     // 1% discount if paid in 10 days, net 30
  | '1_10th_net_eom'  // 1% discount if paid by 10th, net end of month
  | '2_10_net_30'     // 2% discount if paid in 10 days, net 30
  | '2_10th_net_eom'  // 2% discount if paid by 10th, net end of month
  | 'consignment'
  | 'custom'

/**
 * Payment terms display labels.
 */
export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  due_on_receipt: 'Due on Receipt',
  net_15: 'Net 15',
  net_30: 'Net 30',
  net_60: 'Net 60',
  '1_10_net_30': '1% 10 Net 30',
  '1_10th_net_eom': '1% 10th Net EOM',
  '2_10_net_30': '2% 10 Net 30',
  '2_10th_net_eom': '2% 10th Net EOM',
  consignment: 'Consignment',
  custom: 'Custom',
}

/**
 * Organization settings.
 */
export interface OrganizationSettings {
  defaultTaxRate?: number
  paymentTerms?: PaymentTerms
  customPaymentTerms?: string[]
  invoicePrefix?: string
  estimatePrefix?: string
  defaultInvoiceNotes?: string
  defaultInvoiceTerms?: string
  defaultEstimateNotes?: string
  defaultEstimateTerms?: string
}

/**
 * Organization - Full model.
 */
export interface Organization {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  website: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string
  logoUrl: string | null
  primaryColor: string
  timezone: string
  currency: string
  taxRate: number
  subscriptionTier: PlanType
  maxUsers: number
  isActive: boolean
  settings?: OrganizationSettings
  createdAt: string
  updatedAt: string
}

/**
 * Format organization address as single line.
 */
export function formatOrgAddress(org: Organization): string {
  const parts = [
    org.addressLine1,
    org.addressLine2,
    org.city,
    org.state,
    org.zipCode,
  ].filter(Boolean)
  return parts.join(', ')
}

/**
 * Plan display configuration.
 */
export const PLAN_CONFIG: Record<
  PlanType,
  { label: string; color: string; features: string[] }
> = {
  free: {
    label: 'Free',
    color: 'text-gray-600',
    features: ['1 user', '10 jobs/month', 'Basic features'],
  },
  starter: {
    label: 'Starter',
    color: 'text-blue-600',
    features: ['2 users', '50 jobs/month', 'Email support'],
  },
  professional: {
    label: 'Professional',
    color: 'text-purple-600',
    features: ['5 users', 'Unlimited jobs', 'Priority support'],
  },
  business: {
    label: 'Business',
    color: 'text-orange-600',
    features: ['15 users', 'Unlimited jobs', 'API access'],
  },
  enterprise: {
    label: 'Enterprise',
    color: 'text-red-600',
    features: ['Unlimited users', 'Custom features', 'Dedicated support'],
  },
}
