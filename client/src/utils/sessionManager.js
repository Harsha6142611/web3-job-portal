/**
 * Session Manager Utility
 * Handles client-side session expiration for JWT tokens and wallet connections
 */

const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const WARNING_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds

export const sessionManager = {
  /**
   * Check if a session is expired based on timestamp
   * @param {number} timestamp - Session creation timestamp
   * @returns {boolean} True if expired
   */
  isSessionExpired: (timestamp) => {
    if (!timestamp) return true;
    return Date.now() - timestamp > SESSION_DURATION;
  },

  /**
   * Check if session is approaching expiration (within warning threshold)
   * @param {number} timestamp - Session creation timestamp
   * @returns {boolean} True if approaching expiration
   */
  isSessionNearExpiry: (timestamp) => {
    if (!timestamp) return false;
    const timeLeft = SESSION_DURATION - (Date.now() - timestamp);
    return timeLeft <= WARNING_THRESHOLD && timeLeft > 0;
  },

  /**
   * Get time remaining until session expires
   * @param {number} timestamp - Session creation timestamp
   * @returns {number} Time remaining in milliseconds (0 if expired)
   */
  getTimeRemaining: (timestamp) => {
    if (!timestamp) return 0;
    const timeLeft = SESSION_DURATION - (Date.now() - timestamp);
    return Math.max(0, timeLeft);
  },

  /**
   * Format time remaining in human readable format
   * @param {number} timeInMs - Time in milliseconds
   * @returns {string} Formatted time string
   */
  formatTimeRemaining: (timeInMs) => {
    const hours = Math.floor(timeInMs / (60 * 60 * 1000));
    const minutes = Math.floor((timeInMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Create a new session timestamp
   * @returns {number} Current timestamp
   */
  createSessionTimestamp: () => Date.now(),

  /**
   * Clean expired data from localStorage
   */
  cleanExpiredSessions: () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.loginTimestamp && sessionManager.isSessionExpired(parsed.state.loginTimestamp)) {
          localStorage.removeItem('auth-storage');
          console.log('🗑️ Cleaned expired auth session from localStorage');
        }
      }

      // Clean wallet session if expired
      const walletStorage = localStorage.getItem('wallet-session');
      if (walletStorage) {
        const parsed = JSON.parse(walletStorage);
        if (parsed?.timestamp && sessionManager.isSessionExpired(parsed.timestamp)) {
          localStorage.removeItem('wallet-session');
          console.log('🗑️ Cleaned expired wallet session from localStorage');
        }
      }
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  },

  /**
   * Store wallet session with timestamp
   * @param {string} walletAddress - Connected wallet address
   */
  storeWalletSession: (walletAddress) => {
    const walletSession = {
      address: walletAddress,
      timestamp: Date.now()
    };
    localStorage.setItem('wallet-session', JSON.stringify(walletSession));
  },

  /**
   * Get wallet session if valid
   * @returns {object|null} Wallet session or null if expired/invalid
   */
  getWalletSession: () => {
    try {
      const walletStorage = localStorage.getItem('wallet-session');
      if (!walletStorage) return null;

      const parsed = JSON.parse(walletStorage);
      if (sessionManager.isSessionExpired(parsed.timestamp)) {
        localStorage.removeItem('wallet-session');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Error getting wallet session:', error);
      return null;
    }
  },

  /**
   * Clear wallet session
   */
  clearWalletSession: () => {
    localStorage.removeItem('wallet-session');
  }
};