import api from './api'

const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.structuredError) {
    // Use the structured error from the interceptor
    throw new Error(error.structuredError.message)
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  } else if (error.response?.data?.error) {
    throw new Error(error.response.data.error)
  } else if (error.message) {
    throw new Error(error.message)
  } else {
    throw new Error('An unexpected error occurred')
  }
}

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message)
      if (error.response?.data?.details) {
        // Handle validation errors
        const errorMessages = error.response.data.details.map(detail => detail.message)
        throw new Error(errorMessages.join(', '))
      } else {
        handleApiError(error)
      }
    }
  },

  connectWallet: async (walletAddress) => {
    try {
      const response = await api.post('/auth/connect-wallet', { walletAddress })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
} 