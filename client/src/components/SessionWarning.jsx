import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { sessionManager } from '../utils/sessionManager'
import { Clock, X, LogOut, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

const SessionWarning = () => {
  const { 
    isAuthenticated, 
    isSessionNearExpiry, 
    getSessionTimeRemaining, 
    sessionWarningShown,
    setSessionWarningShown,
    logout,
    checkAuth
  } = useAuthStore()
  
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false)
      return
    }

    const checkSession = () => {
      const remaining = getSessionTimeRemaining()
      setTimeRemaining(remaining)

      // Show warning if session is near expiry and warning hasn't been shown yet
      if (isSessionNearExpiry() && !sessionWarningShown) {
        setShowWarning(true)
        setSessionWarningShown(true)
        
        // Show toast notification
        toast((t) => (
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium">Session Expiring Soon</p>
              <p className="text-sm text-gray-600">
                Your session will expire in {sessionManager.formatTimeRemaining(remaining)}
              </p>
            </div>
          </div>
        ), {
          duration: 10000,
          icon: '⚠️'
        })
      }

      // Auto-logout if session expired
      if (remaining === 0 && isAuthenticated) {
        toast.error('Session expired. Please log in again.')
        logout()
      }
    }

    // Check immediately
    checkSession()

    // Check every minute
    const interval = setInterval(checkSession, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, isSessionNearExpiry, sessionWarningShown, getSessionTimeRemaining, setSessionWarningShown, logout])

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      const success = await checkAuth()
      if (success) {
        // Reset warning state to allow new warnings
        setSessionWarningShown(false)
        setShowWarning(false)
        toast.success('Session refreshed successfully!')
      } else {
        toast.error('Failed to refresh session. Please log in again.')
        logout()
      }
    } catch (error) {
      toast.error('Failed to refresh session. Please log in again.')
      logout()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowWarning(false)
    toast.success('Logged out successfully')
  }

  const handleDismiss = () => {
    setShowWarning(false)
  }

  // Don't render if not authenticated or no warning needed
  if (!isAuthenticated || !showWarning) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                Session Expiring Soon
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Your session will expire in{' '}
                <span className="font-medium text-amber-600">
                  {sessionManager.formatTimeRemaining(timeRemaining)}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Refresh your session to continue or log out to secure your account.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleRefreshSession}
            disabled={isRefreshing}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Session'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            <LogOut className="h-3 w-3" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Progress bar showing time remaining */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-red-500 to-amber-500 h-1.5 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, Math.min(100, (timeRemaining / (30 * 60 * 1000)) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionWarning