/**
 * User Types for Lisa Roofing CRM
 *
 * Data models for users and roles.
 */

/**
 * User role values.
 */
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

/**
 * User - Full model.
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  role: UserRole
  isActive: boolean
  isVerified: boolean
  organizationId: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  createdAt: string
  updatedAt: string
}

/**
 * User summary for dropdowns and lists.
 */
export interface UserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
}

/**
 * Get user's full name.
 */
export function getUserFullName(user: User | UserSummary): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

/**
 * Get user's initials for avatar.
 */
export function getUserInitials(user: User | UserSummary): string {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

/**
 * Role display configuration.
 */
export const USER_ROLE_CONFIG: Record<
  UserRole,
  { label: string; description: string; color: string }
> = {
  owner: {
    label: 'Owner',
    description: 'Full access, billing management',
    color: 'text-purple-700',
  },
  admin: {
    label: 'Admin',
    description: 'Full access except billing',
    color: 'text-blue-700',
  },
  manager: {
    label: 'Manager',
    description: 'Manage jobs, users, and reports',
    color: 'text-green-700',
  },
  member: {
    label: 'Member',
    description: 'Create and manage own jobs',
    color: 'text-gray-700',
  },
  viewer: {
    label: 'Viewer',
    description: 'View only access',
    color: 'text-gray-500',
  },
}
