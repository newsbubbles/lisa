/**
 * Page Components
 * 
 * Route-level page components for Lisa CRM
 */

// Auth pages
export { LoginPage } from './Login'
export { RegisterPage } from './Register'

// Main pages
export { DashboardPage } from './DashboardPage'
export type { DashboardPageProps } from './DashboardPage'

export { JobsPage } from './JobsPage'
export type { JobsPageProps } from './JobsPage'

export { EstimatesPage } from './EstimatesPage'
export type { EstimatesPageProps } from './EstimatesPage'

export { EstimateBuilderPage } from './EstimateBuilderPage'
export type { EstimateBuilderPageProps } from './EstimateBuilderPage'

export { ContactsPage } from './ContactsPage'
export type { ContactsPageProps } from './ContactsPage'

export { 
  PlaceholderPage,
  InvoicesPage,
  CalendarPage,
  ReportsPage,
  SettingsPage,
  ForgotPasswordPage,
  ProfilePage,
  HelpPage,
  NewJobPage,
} from './PlaceholderPage'
export type { PlaceholderPageProps } from './PlaceholderPage'
