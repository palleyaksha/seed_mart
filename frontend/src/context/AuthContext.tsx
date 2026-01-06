import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: number
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to decode JWT token
const decodeToken = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) {
      return null
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('Token has expired')
      return null
    }

    return {
      id: parseInt(payload.sub) || 0,
      email: payload.email || '',
      role: payload.role || 'user',
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      console.log('🔍 Checking auth on mount. Token exists:', !!token)
      if (token) {
        const decodedUser = decodeToken(token)
        if (decodedUser) {
          console.log('✅ User authenticated:', decodedUser.email)
          setUser(decodedUser)
        } else {
          // Invalid or expired token, remove it
          console.warn('❌ Invalid or expired token, clearing...')
          localStorage.removeItem('token')
          setUser(null)
        }
      } else {
        console.log('⚠️ No token found in localStorage')
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('📝 Attempting login for:', email)
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      console.log('✅ Login successful, token received')

      // Store token first
      localStorage.setItem('token', access_token)
      console.log('💾 Token stored in localStorage')
      console.log('🔍 Verify token in localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...')

      // Decode and set user
      const decodedUser = decodeToken(access_token)
      if (decodedUser) {
        console.log('👤 User decoded:', decodedUser.email)
        setUser(decodedUser)
      } else {
        console.warn('⚠️ Could not decode token, using fallback user')
        setUser({ id: 0, email, role: 'user' })
      }

      // Verify token is stored
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        throw new Error('Failed to store authentication token')
      }
      console.log('✨ Login complete, user state set')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
      console.error('❌ Login error:', errorMessage, error.response?.data)
      // Clear any partial state
      localStorage.removeItem('token')
      setUser(null)
      throw new Error(errorMessage)
    }
  }

  const register = async (email: string, password: string) => {
    try {
      console.log('Attempting registration for:', email)
      const response = await api.post('/auth/register', { email, password })
      const { access_token } = response.data
      console.log('Registration successful, token received')

      // Store token first
      localStorage.setItem('token', access_token)
      console.log('Token stored in localStorage')

      // Decode and set user
      const decodedUser = decodeToken(access_token)
      if (decodedUser) {
        console.log('User decoded:', decodedUser.email)
        setUser(decodedUser)
      } else {
        console.warn('Could not decode token, using fallback user')
        setUser({ id: 0, email, role: 'user' })
      }

      // Verify token is stored
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        throw new Error('Failed to store authentication token')
      }
      console.log('Registration complete, user state set')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
      console.error('Registration error:', errorMessage, error.response?.data)
      // Clear any partial state
      localStorage.removeItem('token')
      setUser(null)
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

