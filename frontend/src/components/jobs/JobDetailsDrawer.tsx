import * as React from 'react'
import {
  Drawer,
  DrawerSection,
  DrawerField,
} from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { StatusBadge, type JobStatus } from '@/components/ui/Badge'
import { Badge } from '@/components/ui/Badge'
import {
  Phone,
  MessageSquare,
  Mail,
  Navigation,
  Copy,
  Check,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  CheckSquare,
  Square,
  ChevronRight,
  Plus,
} from 'lucide-react'
import type { Job, JobTask, JobNote, JobDocument, JobPhoto } from '@/types/job'
import { getDaysInStatus, formatAddress, getDirectionsUrl } from '@/types/job'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface JobDetailsDrawerProps {
  /** The job to display */
  job: Job | null
  /** Whether the drawer is open */
  open: boolean
  /** Callback when drawer should close */
  onClose: () => void
  /** Callback when status changes */
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void
  /** Callback when task is toggled */
  onTaskToggle?: (jobId: string, taskId: string, completed: boolean) => void
  /** Callback to add a note */
  onAddNote?: (jobId: string) => void
  /** Callback to add a photo */
  onAddPhoto?: (jobId: string) => void
}

export function JobDetailsDrawer({
  job,
  open,
  onClose,
  onStatusChange,
  onTaskToggle,
  onAddNote,
  onAddPhoto,
}: JobDetailsDrawerProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  if (!job) return null

  const daysInStatus = getDaysInStatus(job.statusChangedAt)
  const fullAddress = formatAddress(job.address)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleCall = () => {
    window.location.href = `tel:${job.customer.phone}`
  }

  const handleText = () => {
    window.location.href = `sms:${job.customer.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${job.customer.email}`
  }

  const handleDirections = () => {
    window.open(getDirectionsUrl(job.address), '_blank')
  }

  // Footer with quick actions
  const footer = (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={handleCall}
        leftIcon={<Phone className="h-4 w-4" />}
        className="flex-1"
      >
        Call
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleText}
        leftIcon={<MessageSquare className="h-4 w-4" />}
        className="flex-1"
      >
        Text
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleEmail}
        leftIcon={<Mail className="h-4 w-4" />}
        className="flex-1"
      >
        Email
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDirections}
        title="Get directions"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={job.customer.firstName + ' ' + job.customer.lastName}
      description={job.jobNumber}
      footer={footer}
      width="lg"
    >
      {/* Status Section */}
      <DrawerSection title="Status">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} size="lg" />
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {daysInStatus} day{daysInStatus !== 1 ? 's' : ''} in {job.status.replace('-', ' ')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange?.(job.id, job.status)}
          >
            Change
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DrawerSection>

      {/* Customer Info */}
      <DrawerSection title="Customer">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <DrawerField label="Name">
            {job.customer.firstName} {job.customer.lastName}
          </DrawerField>
          
          <DrawerField label="Phone">
            <button
              onClick={() => handleCopy(job.customer.phone, 'phone')}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              {formatPhone(job.customer.phone)}
              {copiedField === 'phone' ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </DrawerField>
          
          <DrawerField label="Email">
            <button
              onClick={() => handleCopy(job.customer.email, 'email')}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 truncate max-w-full"
            >
              <span className="truncate">{job.customer.email}</span>
              {copiedField === 'email' ? (
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 flex-shrink-0" />
              )}
            </button>
          </DrawerField>

          {job.customer.secondaryPhone && (
            <DrawerField label="Secondary Phone">
              {formatPhone(job.customer.secondaryPhone)}
            </DrawerField>
          )}
        </div>
      </DrawerSection>

      {/* Address */}
      <DrawerSection title="Property Address">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm text-gray-900">
            <p>{job.address.street}</p>
            <p>{job.address.city}, {job.address.state} {job.address.zip}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(fullAddress, 'address')}
              title="Copy address"
            >
              {copiedField === 'address' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDirections}
              title="Get directions"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DrawerSection>

      {/* Scheduling & Financials */}
      <DrawerSection title="Details">
        <div className="grid grid-cols-2 gap-x-4">
          {job.scheduledDate && (
            <DrawerField label="Scheduled">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(job.scheduledDate)}
                {job.scheduledTime && ` at ${job.scheduledTime}`}
              </span>
            </DrawerField>
          )}
          
          {job.estimateAmount && (
            <DrawerField label="Estimate">
              <span className="inline-flex items-center gap-1 font-medium">
                <DollarSign className="h-4 w-4 text-gray-400" />
                {formatCurrency(job.estimateAmount)}
              </span>
            </DrawerField>
          )}

          {job.contractAmount && (
            <DrawerField label="Contract">
              {formatCurrency(job.contractAmount)}
            </DrawerField>
          )}

          {job.source && (
            <DrawerField label="Source">
              <Badge variant="default" size="sm">
                {job.source.replace('-', ' ')}
              </Badge>
            </DrawerField>
          )}
        </div>
      </DrawerSection>

      {/* Tasks */}
      <DrawerSection title="Tasks">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {job.tasks.filter(t => t.completed).length} of {job.tasks.length} complete
          </span>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add
          </Button>
        </div>
        
        {job.tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tasks yet</p>
        ) : (
          <ul className="space-y-2">
            {job.tasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={(completed) => onTaskToggle?.(job.id, task.id, completed)}
              />
            ))}
            {job.tasks.length > 5 && (
              <li className="text-sm text-primary-600 cursor-pointer hover:underline">
                View all {job.tasks.length} tasks
              </li>
            )}
          </ul>
        )}
      </DrawerSection>

      {/* Notes */}
      <DrawerSection title="Notes">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {job.notes.length} note{job.notes.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => onAddNote?.(job.id)}
          >
            Add
          </Button>
        </div>
        
        {job.notes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No notes yet</p>
        ) : (
          <ul className="space-y-3">
            {job.notes.slice(0, 3).map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
            {job.notes.length > 3 && (
              <li className="text-sm text-primary-600 cursor-pointer hover:underline">
                View all {job.notes.length} notes
              </li>
            )}
          </ul>
        )}
      </DrawerSection>

      {/* Documents */}
      <DrawerSection title="Documents">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {job.documents.length} document{job.documents.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Upload
          </Button>
        </div>
        
        {job.documents.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No documents yet</p>
        ) : (
          <ul className="space-y-2">
            {job.documents.slice(0, 4).map((doc) => (
              <DocumentItem key={doc.id} document={doc} />
            ))}
            {job.documents.length > 4 && (
              <li className="text-sm text-primary-600 cursor-pointer hover:underline">
                View all {job.documents.length} documents
              </li>
            )}
          </ul>
        )}
      </DrawerSection>

      {/* Photos */}
      <DrawerSection title="Photos">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {job.photos.length} photo{job.photos.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Camera className="h-4 w-4" />}
            onClick={() => onAddPhoto?.(job.id)}
          >
            Add
          </Button>
        </div>
        
        {job.photos.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No photos yet</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {job.photos.slice(0, 8).map((photo) => (
              <PhotoThumbnail key={photo.id} photo={photo} />
            ))}
            {job.photos.length > 8 && (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 cursor-pointer hover:bg-gray-200">
                +{job.photos.length - 8}
              </div>
            )}
          </div>
        )}
      </DrawerSection>
    </Drawer>
  )
}

// --- Sub-components ---

interface TaskItemProps {
  task: JobTask
  onToggle?: (completed: boolean) => void
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <li className="flex items-start gap-2">
      <button
        onClick={() => onToggle?.(!task.completed)}
        className="mt-0.5 text-gray-400 hover:text-primary-600"
      >
        {task.completed ? (
          <CheckSquare className="h-4 w-4 text-green-600" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>
      <span
        className={cn(
          'text-sm',
          task.completed && 'text-gray-400 line-through'
        )}
      >
        {task.title}
      </span>
    </li>
  )
}

interface NoteItemProps {
  note: JobNote
}

function NoteItem({ note }: NoteItemProps) {
  return (
    <li className="text-sm">
      <p className="text-gray-900">{note.content}</p>
      <p className="text-xs text-gray-400 mt-1">
        {note.createdBy} • {formatDate(note.createdAt)}
      </p>
    </li>
  )
}

interface DocumentItemProps {
  document: JobDocument
}

function DocumentItem({ document }: DocumentItemProps) {
  return (
    <li>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-gray-900 hover:text-primary-600"
      >
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="flex-1 truncate">{document.name}</span>
        <Badge variant="default" size="sm">
          {document.type}
        </Badge>
      </a>
    </li>
  )
}

interface PhotoThumbnailProps {
  photo: JobPhoto
}

function PhotoThumbnail({ photo }: PhotoThumbnailProps) {
  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90">
      <img
        src={photo.thumbnailUrl}
        alt={photo.caption || 'Job photo'}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
