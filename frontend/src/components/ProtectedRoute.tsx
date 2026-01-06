import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode, useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Give auth context time to initialize
    if (!isLoading) {
      setHasChecked(true)
    }
  }, [isLoading])

  // Show loading state while checking authentication
  if (isLoading || !hasChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Check token first (more reliable than state)
  const token = localStorage.getItem('token')
  console.log('ProtectedRoute check:', { 
    hasToken: !!token, 
    isAuthenticated, 
    user: isAuthenticated ? 'yes' : 'no' 
  })

  // If no token, definitely redirect
  if (!token) {
    console.log('No token found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If token exists but not authenticated, might be a state sync issue
  // Give it a moment, but if still not authenticated, redirect
  if (!isAuthenticated) {
    console.warn('Token exists but user not authenticated, redirecting to login')
    // Clear potentially invalid token
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

