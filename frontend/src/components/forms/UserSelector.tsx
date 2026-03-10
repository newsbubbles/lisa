/**
 * UserSelector Component
 * 
 * Searchable user dropdown for assigning jobs/tasks.
 */

import * as React from 'react'
import { Combobox, ComboboxOption } from './Combobox'
import { apiClient } from '@/lib/api'
import { toCamelCase } from '@/lib/transforms'
import { User, getUserFullName, USER_ROLE_CONFIG } from '@/types/user'

export interface UserSelectorProps {
  /** Currently selected user ID */
  value: string | null
  /** Callback when user changes */
  onChange: (userId: string | null, user?: User) => void
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
  /** Filter users by role(s) */
  roles?: string[]
  /** Show "Unassigned" option */
  allowUnassigned?: boolean
}

export function UserSelector({
  value,
  onChange,
  label = 'Assigned To',
  placeholder = 'Select a user...',
  error,
  required,
  disabled,
  className,
  roles,
  allowUnassigned = true,
}: UserSelectorProps) {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)

  // Load users on mount
  React.useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<unknown[]>('/users')
      let transformed = toCamelCase(response) as User[]
      
      // Filter by roles if specified
      if (roles && roles.length > 0) {
        transformed = transformed.filter((u) => roles.includes(u.role))
      }
      
      // Only show active users
      transformed = transformed.filter((u) => u.isActive)
      
      setUsers(transformed)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Convert users to combobox options
  const options: ComboboxOption[] = React.useMemo(() => {
    const userOptions = users.map((user) => ({
      value: user.id,
      label: getUserFullName(user),
      description: USER_ROLE_CONFIG[user.role]?.label || user.role,
    }))
    
    return userOptions
  }, [users])

  const handleChange = (userId: string | null) => {
    const user = users.find((u) => u.id === userId)
    onChange(userId, user)
  }

  return (
    <Combobox
      value={value}
      onChange={handleChange}
      options={options}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search users..."
      error={error}
      required={required}
      disabled={disabled}
      loading={loading}
      emptyMessage="No users found"
      className={className}
      clearable={allowUnassigned}
    />
  )
}
