import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
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
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      } else {
        throw new Error('Failed to update profile')
      }
    }
  },

  connectWallet: async (walletAddress) => {
    const response = await api.post('/auth/connect-wallet', { walletAddress })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  }
} 