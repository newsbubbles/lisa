/**
 * Auth Store - Authentication state management
 *
 * Manages user authentication, tokens, and session state.
 * 
 * Flow:
 * 1. Login/Register -> Get access_token
 * 2. Set token in state and axios headers
 * 3. Fetch user profile from /auth/me
 * 4. Set user in state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

// Backend user response shape
interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'manager' | 'sales' | 'crew' | 'viewer'
  organization_id: string
  organization: {
    id: string
    name: string
    slug: string
  }
}

// Frontend user shape
export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  phone: string | null
  avatar: string | null
  role: 'owner' | 'admin' | 'manager' | 'sales' | 'crew' | 'viewer'
  organizationId: string
  organizationName: string
}

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current authenticated user
 * @property {string|null} accessToken - JWT access token
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} isLoading - Whether auth operation is in progress
 * @property {boolean} isInitialized - Whether auth state has been initialized
 * @property {string|null} error - Auth error message
 * @property {(email: string, password: string) => Promise<void>} login - Login with credentials
 * @property {() => void} logout - Clear auth state and logout
 * @property {(data: RegisterData) => Promise<void>} register - Register new user
 * @property {() => Promise<void>} fetchUser - Fetch current user profile
 * @property {() => Promise<void>} refreshAuth - Re-validate token and refresh user data
 * @property {() => Promise<void>} initialize - Initialize auth state on app load
 * @property {(user: User) => void} setUser - Update user in state
 * @property {() => void} clearError - Clear error message
 */
export interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  fetchUser: () => Promise<void>
  refreshAuth: () => Promise<void>
  initialize: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export interface RegisterData {
  email: string
  password: string
  name: string
  organizationName: string
}

/**
 * Transform backend user response to frontend User shape
 */
function transformUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: `${backendUser.first_name} ${backendUser.last_name}`.trim(),
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    phone: backendUser.phone,
    avatar: backendUser.avatar_url,
    role: backendUser.role,
    organizationId: backendUser.organization_id,
    organizationName: backendUser.organization?.name || '',
  }
}

/**
 * Set axios default Authorization header
 */
function setAuthHeader(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize - called on app load to validate stored token
      initialize: async () => {
        const { accessToken } = get()
        
        if (!accessToken) {
          set({ isInitialized: true })
          return
        }

        // Set header and try to fetch user
        setAuthHeader(accessToken)
        
        try {
          await get().fetchUser()
          set({ isInitialized: true })
        } catch (error) {
          // Token is invalid, clear auth state
          get().logout()
          set({ isInitialized: true })
        }
      },

      // Fetch current user profile
      fetchUser: async () => {
        const response = await api.get('/auth/me')
        const user = transformUser(response.data)
        set({ user, isAuthenticated: true })
      },

      /**
       * Re-validate token and refresh user data.
       * Called by API interceptor on 401 errors to attempt token refresh.
       * 
       * Note: Current backend doesn't support refresh tokens, so this
       * re-validates by fetching user profile. If that fails, the token
       * is invalid and user should be logged out.
       * 
       * @throws {Error} If token is invalid or expired
       */
      refreshAuth: async () => {
        const { accessToken } = get()
        
        if (!accessToken) {
          throw new Error('No access token available')
        }

        // Ensure header is set (might have been cleared)
        setAuthHeader(accessToken)
        
        // Validate token by fetching user profile
        // If this fails, the token is invalid
        await get().fetchUser()
      },

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Step 1: Get token
          const tokenResponse = await api.post('/auth/login', { email, password })
          const { access_token } = tokenResponse.data
          
          // Step 2: Set token
          setAuthHeader(access_token)
          set({ accessToken: access_token })
          
          // Step 3: Fetch user profile
          await get().fetchUser()
          
          set({ isLoading: false })
        } catch (error: any) {
          setAuthHeader(null)
          const message = error.response?.data?.detail || 'Login failed'
          set({ 
            error: message, 
            isLoading: false,
            accessToken: null,
            user: null,
            isAuthenticated: false,
          })
          throw new Error(message)
        }
      },

      // Logout
      logout: () => {
        setAuthHeader(null)
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          // Split name into first/last for backend
          const nameParts = data.name.trim().split(/\s+/)
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || firstName // Use first name if no last name
          
          // Step 1: Register and get token
          const tokenResponse = await api.post('/auth/register', {
            email: data.email,
            password: data.password,
            first_name: firstName,
            last_name: lastName,
            organization_name: data.organizationName,
          })
          const { access_token } = tokenResponse.data
          
          // Step 2: Set token
          setAuthHeader(access_token)
          set({ accessToken: access_token })
          
          // Step 3: Fetch user profile
          await get().fetchUser()
          
          set({ isLoading: false })
        } catch (error: any) {
          setAuthHeader(null)
          const message = error.response?.data?.detail || 'Registration failed'
          set({ 
            error: message, 
            isLoading: false,
            accessToken: null,
            user: null,
            isAuthenticated: false,
          })
          throw new Error(message)
        }
      },

      // Set user (for profile updates)
      setUser: (user: User) => set({ user }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'lisa-auth-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        // Don't persist user - always fetch fresh on init
      }),
      onRehydrate: () => {
        // After rehydration, set the auth header if we have a token
        return (state) => {
          if (state?.accessToken) {
            setAuthHeader(state.accessToken)
          }
        }
      },
    }
  )
)
