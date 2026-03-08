import * as React from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  JobsPage,
  EstimatesPage,
  EstimateBuilderPage,
  InvoicesPage,
  ContactsPage,
  CalendarPage,
  ReportsPage,
  SettingsPage,
  ForgotPasswordPage,
  ProfilePage,
  HelpPage,
  NewJobPage,
} from '@/pages'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/uiStore'
import { Spinner } from '@/components/ui'

// Route to page ID mapping
const routeToPageId: Record<string, string> = {
  '/': 'dashboard',
  '/jobs': 'jobs',
  '/jobs/new': 'jobs',
  '/estimates': 'estimates',
  '/estimates/new': 'estimates',
  '/invoices': 'invoices',
  '/contacts': 'contacts',
  '/calendar': 'calendar',
  '/reports': 'reports',
  '/settings': 'settings',
  '/profile': 'settings',
  '/help': 'settings',
}

/**
 * Main authenticated app routes wrapped in layout
 */
function AuthenticatedApp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { setUnreadNotificationsCount } = useUIStore()

  // Set mock notification count on mount
  React.useEffect(() => {
    setUnreadNotificationsCount(3)
  }, [setUnreadNotificationsCount])

  // Get current page ID from route
  const activePage = React.useMemo(() => {
    // Check exact matches first
    if (routeToPageId[location.pathname]) {
      return routeToPageId[location.pathname]
    }
    // Check prefix matches for dynamic routes
    if (location.pathname.startsWith('/estimates/')) return 'estimates'
    if (location.pathname.startsWith('/jobs/')) return 'jobs'
    if (location.pathname.startsWith('/invoices/')) return 'invoices'
    if (location.pathname.startsWith('/contacts/')) return 'contacts'
    return 'dashboard'
  }, [location.pathname])

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'job':
        navigate('/jobs/new')
        break
      case 'estimate':
        navigate('/estimates/new')
        break
      case 'contact':
        navigate('/contacts')
        break
      case 'photo':
        // Would open camera/photo picker
        console.log('Take photo')
        break
      case 'checkin':
        // Would open check-in flow
        console.log('Check in')
        break
      case 'call':
        // Would open call log
        console.log('Log call')
        break
      case 'appointment':
        navigate('/calendar')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (query: string) => {
    console.log('Search:', query)
    // Would perform global search
  }

  const handleNotificationsClick = () => {
    console.log('Open notifications')
    // Would open notifications panel
  }

  // User info for layout
  const userInfo = user ? {
    name: user.name,
    email: user.email,
    organizationName: user.organizationName,
  } : {
    name: '',
    email: '',
    organizationName: '',
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onQuickAction={handleQuickAction}
      user={userInfo}
      onLogout={handleLogout}
      onSearch={handleSearch}
      onNotificationsClick={handleNotificationsClick}
    >
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage onNavigate={handleNavigate} />} />
        
        {/* Jobs */}
        <Route path="/jobs" element={<JobsPage onNavigate={handleNavigate} />} />
        <Route path="/jobs/new" element={<NewJobPage onNavigate={handleNavigate} />} />
        <Route path="/jobs/:id" element={<JobsPage onNavigate={handleNavigate} />} />
        
        {/* Estimates */}
        <Route path="/estimates" element={<EstimatesPage onNavigate={handleNavigate} />} />
        <Route path="/estimates/new" element={<EstimateBuilderPage onNavigate={handleNavigate} />} />
        <Route path="/estimates/:id" element={<EstimatesPage onNavigate={handleNavigate} />} />
        <Route path="/estimates/:id/edit" element={<EstimateBuilderPage onNavigate={handleNavigate} />} />
        
        {/* Placeholder pages */}
        <Route path="/invoices" element={<InvoicesPage onNavigate={handleNavigate} />} />
        <Route path="/contacts" element={<ContactsPage onNavigate={handleNavigate} />} />
        <Route path="/calendar" element={<CalendarPage onNavigate={handleNavigate} />} />
        <Route path="/reports" element={<ReportsPage onNavigate={handleNavigate} />} />
        <Route path="/settings" element={<SettingsPage onNavigate={handleNavigate} />} />
        <Route path="/profile" element={<ProfilePage onNavigate={handleNavigate} />} />
        <Route path="/help" element={<HelpPage onNavigate={handleNavigate} />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<DashboardPage onNavigate={handleNavigate} />} />
      </Routes>
    </AppLayout>
  )
}

/**
 * App with auth initialization
 */
function AppRoutes() {
  const { isInitialized, isAuthenticated, initialize } = useAuthStore()

  // Initialize auth on mount
  React.useEffect(() => {
    initialize()
  }, [initialize])

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading Lisa...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />
        } 
      />
      
      {/* Protected routes - all wrapped in ProtectedRoute */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
