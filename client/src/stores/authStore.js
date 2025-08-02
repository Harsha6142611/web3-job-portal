import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import { sessionManager } from '../utils/sessionManager'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      loginTimestamp: null,
      sessionWarningShown: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(email, password)
          const loginTimestamp = sessionManager.createSessionTimestamp()
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            loginTimestamp,
            sessionWarningShown: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          const loginTimestamp = sessionManager.createSessionTimestamp()
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            loginTimestamp,
            sessionWarningShown: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      logout: () => {
        // Clear wallet session as well
        sessionManager.clearWalletSession()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          loginTimestamp: null,
          sessionWarningShown: false
        })
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          const response = await authService.updateProfile(profileData)
          set({
            user: response.user,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      connectWallet: async (walletAddress) => {
        set({ isLoading: true })
        try {
          const response = await authService.connectWallet(walletAddress)
          // Store wallet session with timestamp
          sessionManager.storeWalletSession(walletAddress)
          set({
            user: response.user,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      checkAuth: async () => {
        const { token, loginTimestamp } = get()
        if (!token) return false

        // Check if session is expired
        if (loginTimestamp && sessionManager.isSessionExpired(loginTimestamp)) {
          console.log('🕐 Session expired, logging out...')
          get().logout()
          return false
        }

        try {
          const response = await authService.getProfile()
          set({
            user: response.user,
            isAuthenticated: true
          })
          return true
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loginTimestamp: null,
            sessionWarningShown: false
          })
          return false
        }
      },

      // New session management methods
      checkSessionExpiration: () => {
        const { loginTimestamp } = get()
        return loginTimestamp ? sessionManager.isSessionExpired(loginTimestamp) : true
      },

      getSessionTimeRemaining: () => {
        const { loginTimestamp } = get()
        return loginTimestamp ? sessionManager.getTimeRemaining(loginTimestamp) : 0
      },

      isSessionNearExpiry: () => {
        const { loginTimestamp } = get()
        return loginTimestamp ? sessionManager.isSessionNearExpiry(loginTimestamp) : false
      },

      setSessionWarningShown: (shown) => {
        set({ sessionWarningShown: shown })
      },

      getWalletSession: () => {
        return sessionManager.getWalletSession()
      },

      cleanExpiredSessions: () => {
        sessionManager.cleanExpiredSessions()
        // Check if current session is expired
        if (get().checkSessionExpiration()) {
          get().logout()
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        loginTimestamp: state.loginTimestamp,
        sessionWarningShown: state.sessionWarningShown
      })
    }
  )
) 