/**
 * Report Types for Lisa Roofing CRM
 *
 * Data models for the 4 MVP reports:
 * - Revenue Report
 * - Pipeline Report
 * - AR Aging Report
 * - Jobs Summary Report
 */

// ============ Common Types ============

/**
 * Date range for filtering reports.
 */
export interface DateRange {
  startDate: string
  endDate: string
}

/**
 * Time period groupings for revenue report.
 */
export type GroupByPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

/**
 * Group by period options for UI display.
 */
export const GROUP_BY_OPTIONS: { value: GroupByPeriod; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
]

// ============ Revenue Report ============

export interface RevenueByPeriod {
  period: string
  amount: number
}

export interface RevenueByJobType {
  jobType: string
  amount: number
}

export interface RevenueReport {
  totalRevenue: number
  revenueByPeriod: RevenueByPeriod[]
  revenueByJobType: RevenueByJobType[]
  averageJobValue: number
  outstandingReceivables: number
  startDate: string
  endDate: string
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

// ============ Pipeline Report ============

export interface JobsByStage {
  stage: string
  count: number
  totalValue: number
}

export interface ConversionRate {
  fromStage: string
  toStage: string
  rate: number
}

export interface PipelineReport {
  jobsByStage: JobsByStage[]
  totalPipelineValue: number
  conversionRates: ConversionRate[]
}

// ============ AR Aging Report ============

export interface AgingInvoice {
  id: string
  invoiceNumber: string
  customerName: string | null
  invoiceDate: string
  dueDate: string | null
  balanceDue: number
  daysOutstanding: number
}

export interface AgingBucket {
  invoiceCount: number
  totalAmount: number
  invoices: AgingInvoice[]
}

export interface ARAgingReport {
  current: AgingBucket
  days31_60: AgingBucket
  days61_90: AgingBucket
  days90Plus: AgingBucket
  totalOutstanding: number
}

// ============ Jobs Summary Report ============

export interface JobsByStatus {
  status: string
  count: number
}

export interface JobsByType {
  jobType: string
  count: number
}

export interface JobsSummaryReport {
  jobsCreated: number
  jobsCompleted: number
  jobsByStatus: JobsByStatus[]
  jobsByType: JobsByType[]
  avgDaysToCompletion: number | null
  startDate: string
  endDate: string
}

// ============ Report Type Enum ============

export type ReportType = 'revenue' | 'pipeline' | 'ar-aging' | 'jobs-summary'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  revenue: 'Revenue Report',
  pipeline: 'Pipeline Report',
  'ar-aging': 'AR Aging Report',
  'jobs-summary': 'Jobs Summary',
}

// ============ Display Helpers ============

export const JOB_TYPE_LABELS: Record<string, string> = {
  full_replacement: 'Full Replacement',
  repair: 'Repair',
  inspection: 'Inspection',
  maintenance: 'Maintenance',
  gutter: 'Gutter',
  siding: 'Siding',
  insurance_claim: 'Insurance Claim',
  commercial: 'Commercial',
  other: 'Other',
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  approved: 'Approved',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
}

export const STAGE_COLORS: Record<string, string> = {
  lead: '#3B82F6',      // blue
  prospect: '#F59E0B',  // amber
  approved: '#10B981',  // emerald
  scheduled: '#6366F1', // indigo
  in_progress: '#EF4444', // red
  completed: '#22C55E', // green
  invoiced: '#8B5CF6',  // violet
  paid: '#059669',      // emerald dark
}

/**
 * Format a job type for display.
 */
export function formatJobType(jobType: string): string {
  return JOB_TYPE_LABELS[jobType] || jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format a job status for display.
 */
export function formatJobStatus(status: string): string {
  return JOB_STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Get color for a pipeline stage.
 */
export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || '#6B7280'
}

/**
 * Format period label based on groupBy.
 */
export function formatPeriodLabel(period: string, groupBy: string): string {
  if (groupBy === 'month') {
    const [year, month] = period.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  if (groupBy === 'quarter') {
    return period.replace('-Q', ' Q')
  }
  return period
}

/**
 * Format currency value.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage value.
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Get default date range (last 30 days).
 */
export function getDefaultDateRange(): DateRange {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

/**
 * Get date range presets for quick selection.
 */
export function getDateRangePresets(): { label: string; range: DateRange }[] {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const last90Days = new Date()
  last90Days.setDate(last90Days.getDate() - 90)

  const lastYear = new Date()
  lastYear.setFullYear(lastYear.getFullYear() - 1)

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  const thisYearStart = new Date(today.getFullYear(), 0, 1)
  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

  return [
    {
      label: 'Last 7 Days',
      range: { startDate: last7Days.toISOString().split('T')[0], endDate: todayStr },
    },
    {
      label: 'Last 30 Days',
      range: { startDate: last30Days.toISOString().split('T')[0], endDate: todayStr },
    },
    {
      label: 'Last 90 Days',
      range: { startDate: last90Days.toISOString().split('T')[0], endDate: todayStr },
    },
    {
      label: 'This Month',
      range: { startDate: thisMonthStart.toISOString().split('T')[0], endDate: todayStr },
    },
    {
      label: 'Last Month',
      range: {
        startDate: lastMonthStart.toISOString().split('T')[0],
        endDate: lastMonthEnd.toISOString().split('T')[0],
      },
    },
    {
      label: 'This Year',
      range: { startDate: thisYearStart.toISOString().split('T')[0], endDate: todayStr },
    },
    {
      label: 'Last Year',
      range: {
        startDate: lastYearStart.toISOString().split('T')[0],
        endDate: lastYearEnd.toISOString().split('T')[0],
      },
    },
    {
      label: 'Last 12 Months',
      range: { startDate: lastYear.toISOString().split('T')[0], endDate: todayStr },
    },
  ]
}

/**
 * AR aging bucket colors for charts.
 */
export const AGING_BUCKET_COLORS = {
  current: '#22c55e',
  days31_60: '#fbbf24',
  days61_90: '#f97316',
  days90Plus: '#ef4444',
}
