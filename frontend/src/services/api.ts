/// <reference types="vite/client" />
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token')
  } else {
    console.warn('API Request without token:', config.method?.toUpperCase(), config.url)
  }
  return config
})

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    // Only handle 401 on non-auth endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      // Don't handle 401 on auth endpoints - let them handle the error
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        console.warn('401 Unauthorized - clearing token')
        // Clear token - ProtectedRoute will handle the redirect
        localStorage.removeItem('token')
        // Don't redirect here - let React Router handle it through ProtectedRoute
        // This prevents race conditions and multiple redirects
      }
    }
    return Promise.reject(error)
  }
)

export default api

