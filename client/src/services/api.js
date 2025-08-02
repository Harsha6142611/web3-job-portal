import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    
    // Transform error to include structured error information
    if (error.response?.data) {
      const { error: errorCode, message, details } = error.response.data
      error.structuredError = {
        code: errorCode,
        message: message || error.response.data.error || 'An error occurred',
        details: details,
        status: error.response.status
      }
    } else {
      error.structuredError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        details: null,
        status: null
      }
    }
    
    return Promise.reject(error)
  }
)

export default api 