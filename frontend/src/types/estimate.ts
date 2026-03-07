/**
 * Estimate Types for Lisa Roofing CRM
 * 
 * Core data models for the estimate builder
 * Supports real-time margin visibility and drag-and-drop
 */

/**
 * Line item category/section
 */
export type LineItemCategory = 
  | 'labor'
  | 'materials'
  | 'disposal'
  | 'permits'
  | 'equipment'
  | 'subcontractor'
  | 'other'

/**
 * Unit of measurement for line items
 */
export type UnitType = 
  | 'sq'      // Roofing square (100 sq ft)
  | 'lf'      // Linear feet
  | 'sf'      // Square feet
  | 'each'    // Each/unit
  | 'hour'    // Labor hour
  | 'day'     // Day rate
  | 'flat'    // Flat rate
  | 'bundle'  // Bundle (shingles)
  | 'roll'    // Roll (underlayment)

/**
 * Individual line item in an estimate
 */
export interface EstimateLineItem {
  id: string
  
  // Content
  description: string
  category: LineItemCategory
  
  // Quantities
  quantity: number
  unit: UnitType
  
  // Pricing (contractor view)
  costPerUnit: number      // What it costs contractor
  pricePerUnit: number     // What customer pays
  
  // Calculated (derived)
  totalCost: number        // quantity * costPerUnit
  totalPrice: number       // quantity * pricePerUnit
  marginAmount: number     // totalPrice - totalCost
  marginPercent: number    // (marginAmount / totalPrice) * 100
  
  // Display
  isOptional?: boolean     // Optional add-on item
  notes?: string           // Internal notes (not shown to customer)
  sortOrder: number        // For drag-and-drop ordering
}

/**
 * Section grouping for line items
 */
export interface EstimateSection {
  id: string
  category: LineItemCategory
  label: string
  items: EstimateLineItem[]
  isCollapsed?: boolean
  
  // Section totals
  totalCost: number
  totalPrice: number
  marginAmount: number
  marginPercent: number
}

/**
 * Tax configuration
 */
export interface TaxConfig {
  rate: number           // e.g., 0.0825 for 8.25%
  label: string          // e.g., "Sales Tax (8.25%)"
  applyToLabor: boolean  // Some states don't tax labor
  applyToMaterials: boolean
}

/**
 * Discount configuration
 */
export interface DiscountConfig {
  type: 'percentage' | 'fixed'
  value: number          // Percentage (0-100) or fixed dollar amount
  label: string          // e.g., "Senior Discount", "Cash Discount"
  reason?: string
}

/**
 * Complete estimate
 */
export interface Estimate {
  id: string
  
  // Reference
  estimateNumber: string  // e.g., "E-2024-0042"
  jobId?: string          // Linked job (optional)
  
  // Content
  title: string
  description?: string
  sections: EstimateSection[]
  
  // Pricing configuration
  taxConfig?: TaxConfig
  discounts: DiscountConfig[]
  
  // Calculated totals
  subtotal: number        // Sum of all line item prices
  totalCost: number       // Sum of all line item costs
  discountAmount: number  // Total discount
  taxAmount: number       // Calculated tax
  grandTotal: number      // Final customer-facing total
  
  // Margin summary
  totalMargin: number     // grandTotal - totalCost (simplified)
  marginPercent: number   // (totalMargin / grandTotal) * 100
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
  validUntil?: string     // Expiration date
  
  // Customer presentation
  showLineItemPrices: boolean  // Show individual prices or just total
  showQuantities: boolean      // Show quantities to customer
  customerMessage?: string     // Cover letter/message
  termsAndConditions?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  sentAt?: string
  viewedAt?: string
  respondedAt?: string
}

/**
 * Estimate template for quick-start
 */
export interface EstimateTemplate {
  id: string
  name: string
  description: string
  category: 'roof-replacement' | 'roof-repair' | 'gutters' | 'siding' | 'inspection' | 'custom'
  icon: string  // Lucide icon name
  sections: Omit<EstimateSection, 'id'>[]
  defaultTaxConfig?: TaxConfig
  estimatedTime: string  // e.g., "2-3 minutes"
}

/**
 * Summary for list views
 */
export interface EstimateSummary {
  id: string
  estimateNumber: string
  title: string
  customerName: string
  grandTotal: number
  marginPercent: number
  status: Estimate['status']
  createdAt: string
  validUntil?: string
}

// --- Helper Functions ---

/**
 * Calculate line item totals from quantity and unit prices
 */
export function calculateLineItemTotals(
  item: Pick<EstimateLineItem, 'quantity' | 'costPerUnit' | 'pricePerUnit'>
): Pick<EstimateLineItem, 'totalCost' | 'totalPrice' | 'marginAmount' | 'marginPercent'> {
  const totalCost = item.quantity * item.costPerUnit
  const totalPrice = item.quantity * item.pricePerUnit
  const marginAmount = totalPrice - totalCost
  const marginPercent = totalPrice > 0 ? (marginAmount / totalPrice) * 100 : 0
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    marginAmount: Math.round(marginAmount * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
  }
}

/**
 * Calculate section totals from line items
 */
export function calculateSectionTotals(
  items: EstimateLineItem[]
): Pick<EstimateSection, 'totalCost' | 'totalPrice' | 'marginAmount' | 'marginPercent'> {
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const marginAmount = totalPrice - totalCost
  const marginPercent = totalPrice > 0 ? (marginAmount / totalPrice) * 100 : 0
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    marginAmount: Math.round(marginAmount * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
  }
}

/**
 * Calculate estimate totals
 */
export function calculateEstimateTotals(
  sections: EstimateSection[],
  taxConfig?: TaxConfig,
  discounts: DiscountConfig[] = []
): Pick<Estimate, 'subtotal' | 'totalCost' | 'discountAmount' | 'taxAmount' | 'grandTotal' | 'totalMargin' | 'marginPercent'> {
  // Sum all sections
  const subtotal = sections.reduce((sum, section) => sum + section.totalPrice, 0)
  const totalCost = sections.reduce((sum, section) => sum + section.totalCost, 0)
  
  // Calculate discounts
  let discountAmount = 0
  for (const discount of discounts) {
    if (discount.type === 'percentage') {
      discountAmount += subtotal * (discount.value / 100)
    } else {
      discountAmount += discount.value
    }
  }
  discountAmount = Math.round(discountAmount * 100) / 100
  
  // Calculate tax (after discounts)
  let taxAmount = 0
  if (taxConfig) {
    const taxableAmount = subtotal - discountAmount
    // In a real app, we'd separate labor vs materials for tax calculation
    taxAmount = taxableAmount * taxConfig.rate
  }
  taxAmount = Math.round(taxAmount * 100) / 100
  
  // Grand total
  const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100
  
  // Margin (simplified - doesn't account for tax)
  const totalMargin = Math.round((grandTotal - taxAmount - totalCost) * 100) / 100
  const marginPercent = grandTotal > 0 ? Math.round((totalMargin / (grandTotal - taxAmount)) * 1000) / 10 : 0
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalCost,
    discountAmount,
    taxAmount,
    grandTotal,
    totalMargin,
    marginPercent,
  }
}

/**
 * Category labels for display
 */
export const categoryLabels: Record<LineItemCategory, string> = {
  labor: 'Labor',
  materials: 'Materials',
  disposal: 'Disposal & Cleanup',
  permits: 'Permits & Fees',
  equipment: 'Equipment Rental',
  subcontractor: 'Subcontractor',
  other: 'Other',
}

/**
 * Unit labels for display
 */
export const unitLabels: Record<UnitType, string> = {
  sq: 'sq',
  lf: 'LF',
  sf: 'SF',
  each: 'ea',
  hour: 'hr',
  day: 'day',
  flat: 'flat',
  bundle: 'bdl',
  roll: 'roll',
}

/**
 * Generate a new line item with defaults
 */
export function createLineItem(
  category: LineItemCategory,
  sortOrder: number,
  overrides: Partial<EstimateLineItem> = {}
): EstimateLineItem {
  const base: EstimateLineItem = {
    id: crypto.randomUUID(),
    description: '',
    category,
    quantity: 1,
    unit: 'each',
    costPerUnit: 0,
    pricePerUnit: 0,
    totalCost: 0,
    totalPrice: 0,
    marginAmount: 0,
    marginPercent: 0,
    sortOrder,
    ...overrides,
  }
  
  // Recalculate totals if prices provided
  const totals = calculateLineItemTotals(base)
  return { ...base, ...totals }
}

/**
 * Generate a new section with defaults
 */
export function createSection(
  category: LineItemCategory,
  items: EstimateLineItem[] = []
): EstimateSection {
  const totals = calculateSectionTotals(items)
  return {
    id: crypto.randomUUID(),
    category,
    label: categoryLabels[category],
    items,
    ...totals,
  }
}
