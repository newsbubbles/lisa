import * as React from 'react'
import {
  Briefcase,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '@/components/ui'
import { StatusBadge, type JobStatus } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useJobsStore } from '@/stores/jobs'
import { useContactsStore } from '@/stores/contacts'

// Stat card component
interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  onClick?: () => void
  isLoading?: boolean
}

function StatCard({ title, value, change, changeType = 'neutral', icon, onClick, isLoading }: StatCardProps) {
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <div className="h-8 flex items-center">
                <Spinner size="sm" />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            )}
            {change && (
              <p
                className={`text-sm mt-1 ${
                  changeType === 'positive'
                    ? 'text-green-600'
                    : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity item component
interface ActivityItemProps {
  title: string
  description: string
  time: string
  icon: React.ReactNode
}

export function ActivityItem({ title, description, time, icon }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  )
}

// Task item component
interface TaskItemProps {
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  onToggle?: () => void
}

export function TaskItem({ title, dueDate, priority, onToggle }: TaskItemProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-900">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[priority]}`}>
          {priority}
        </span>
        <span className="text-xs text-gray-500">{dueDate}</span>
      </div>
    </div>
  )
}

// Upcoming job card
interface UpcomingJobProps {
  title: string
  customerName: string
  address: string
  time: string
  status: JobStatus
  onClick?: () => void
}

function UpcomingJob({ title, customerName, address, time, status, onClick }: UpcomingJobProps) {
  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{customerName}</p>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {time}
        </span>
        <span className="flex items-center gap-1 truncate">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </span>
      </div>
    </div>
  )
}

export interface DashboardPageProps {
  onNavigate?: (path: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { setPageTitle } = useUIStore()
  const { boardColumns, isLoading: jobsLoading, fetchBoardData } = useJobsStore()
  const { contacts: _contacts, totalCount: _contactsCount, isLoading: contactsLoading, fetchContacts } = useContactsStore()

  React.useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  // Fetch data on mount
  React.useEffect(() => {
    fetchBoardData()
    fetchContacts()
  }, [fetchBoardData, fetchContacts])

  // Compute stats from store data
  const stats = React.useMemo(() => {
    // Count jobs by status
    const jobCounts: Record<string, number> = {}
    let totalValue = 0
    let scheduledJobs: Array<{ title: string; customerName: string; address: string; status: JobStatus }> = []

    boardColumns.forEach((column) => {
      jobCounts[column.status] = column.jobs.length
      totalValue += column.totalValue || 0
      
      // Collect scheduled/in-progress jobs for "today's schedule"
      if (column.status === 'scheduled' || column.status === 'in-progress') {
        column.jobs.forEach((job) => {
          scheduledJobs.push({
            title: job.title,
            customerName: job.customerName,
            address: job.address,
            status: job.status,
          })
        })
      }
    })

    const activeJobs = (jobCounts['in-progress'] || 0) + (jobCounts['scheduled'] || 0)
    const leads = jobCounts['lead'] || 0
    const pendingEstimates = jobCounts['quoted'] || 0

    return {
      activeJobs,
      pendingEstimates,
      totalValue,
      leads,
      scheduledJobs: scheduledJobs.slice(0, 3), // Top 3
    }
  }, [boardColumns])

  const handleRefresh = () => {
    fetchBoardData()
    fetchContacts()
  }

  const isLoading = jobsLoading || contactsLoading

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" onClick={() => onNavigate?.('/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button onClick={() => onNavigate?.('/jobs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          change="Scheduled + In Progress"
          changeType="neutral"
          icon={<Briefcase className="h-6 w-6 text-primary-600" />}
          onClick={() => onNavigate?.('/jobs')}
          isLoading={jobsLoading && boardColumns.length === 0}
        />
        <StatCard
          title="Pending Estimates"
          value={stats.pendingEstimates}
          change="Awaiting response"
          changeType="neutral"
          icon={<FileText className="h-6 w-6 text-primary-600" />}
          onClick={() => onNavigate?.('/estimates')}
          isLoading={jobsLoading && boardColumns.length === 0}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.totalValue)}
          change="Total estimated"
          changeType="positive"
          icon={<DollarSign className="h-6 w-6 text-primary-600" />}
          onClick={() => onNavigate?.('/reports')}
          isLoading={jobsLoading && boardColumns.length === 0}
        />
        <StatCard
          title="New Leads"
          value={stats.leads}
          change="In pipeline"
          changeType="neutral"
          icon={<Users className="h-6 w-6 text-primary-600" />}
          onClick={() => onNavigate?.('/contacts')}
          isLoading={jobsLoading && boardColumns.length === 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('/calendar')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {jobsLoading && stats.scheduledJobs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : stats.scheduledJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No jobs scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.scheduledJobs.map((job, index) => (
                  <UpcomingJob
                    key={index}
                    title={job.title}
                    customerName={job.customerName}
                    address={job.address}
                    time="Today"
                    status={job.status}
                    onClick={() => onNavigate?.('/jobs')}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Task management coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Activity feed coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate?.('/estimates/new')}
            >
              <FileText className="h-4 w-4 mr-3" />
              Create Estimate
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate?.('/jobs/new')}
            >
              <Briefcase className="h-4 w-4 mr-3" />
              New Job
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate?.('/contacts')}
            >
              <Users className="h-4 w-4 mr-3" />
              Add Contact
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start"
              onClick={() => onNavigate?.('/calendar')}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts/Notifications */}
      {stats.pendingEstimates > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {stats.pendingEstimates} estimate{stats.pendingEstimates !== 1 ? 's' : ''} awaiting customer response
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider following up with these customers to close the deals.
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 mt-2 text-yellow-800 hover:text-yellow-900"
                  onClick={() => onNavigate?.('/estimates')}
                >
                  View estimates →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
