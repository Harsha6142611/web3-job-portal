import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { sessionManager } from '../utils/sessionManager'
import { Wallet, User, LogOut, Menu, X, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

const Header = () => {
  const { user, isAuthenticated, logout, connectWallet, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const connectMetaMask = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.')
      return
    }

    // Check if MetaMask is available and ready
    if (!window.ethereum.isMetaMask) {
      toast.error('Please use MetaMask to connect your wallet.')
      return
    }

    // Check if wallet session is still valid
    const walletSession = useAuthStore.getState().getWalletSession()
    if (walletSession) {
      toast.success('Wallet already connected and session is valid!')
      return
    }

    setIsConnecting(true)

    try {
      // First, check if we already have access to accounts
      let accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      })

      // If no accounts are accessible, request access
      if (accounts.length === 0) {
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
      }
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked and has at least one account.')
      }

      const selectedAddress = accounts[0]
      
      // Validate the address format
      if (!selectedAddress.startsWith('0x') || selectedAddress.length !== 42) {
        throw new Error('Invalid wallet address format')
      }
      
      // Connect wallet via backend API
      const result = await connectWallet(selectedAddress)
      
      if (result.success) {
        toast.success('Wallet connected successfully! Session valid for 12 hours.')
      } else {
        throw new Error(result.error || 'Failed to connect wallet')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user')
      } else if (error.code === -32002) {
        toast.error('Connection request already pending. Please check MetaMask.')
      } else if (error.code === -32603) {
        toast.error('MetaMask internal error. Please try refreshing the page.')
      } else if (error.message.includes('already registered') || error.message.includes('already connected')) {
        toast.error('This wallet is already connected to another account. Please disconnect it from the other account first or use a different wallet.')
      } else {
        toast.error(error.message || 'Failed to connect wallet. Please try again.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const result = await updateProfile({ walletAddress: null })
      if (result.success) {
        // Clear wallet session from localStorage
        sessionManager.clearWalletSession()
        toast.success('Wallet disconnected successfully!')
      } else {
        throw new Error(result.error || 'Failed to disconnect wallet')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to disconnect wallet')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Web3 Jobs</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Browse Jobs
            </Link>
            {isAuthenticated && (
              <Link to="/post-job" className="text-gray-600 hover:text-gray-900 transition-colors">
                Post Job
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Wallet Connection */}
                <div className="relative group">
                  <button
                    onClick={user?.walletAddress ? null : connectMetaMask}
                    disabled={isConnecting}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      user?.walletAddress 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-600 hover:bg-gray-100'
                    } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={
                      isConnecting 
                        ? 'Connecting...' 
                        : user?.walletAddress 
                          ? `Connected: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` 
                          : 'Click to connect MetaMask'
                    }
                  >
                    <div className="relative">
                      <Wallet size={20} className={user?.walletAddress ? 'text-green-500' : 'text-gray-400'} />
                      {user?.walletAddress && (
                        <Check size={12} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                      )}
                      {isConnecting && (
                        <div className="absolute -top-1 -right-1 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 bg-white"></div>
                      )}
                    </div>
                    {isConnecting && <span className="text-sm">Connecting...</span>}
                  </button>
                  
                  {/* Disconnect option when wallet is connected */}
                  {user?.walletAddress && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-3 min-w-48">
                        <div className="text-xs text-gray-500 mb-2">Wallet Address</div>
                        <div className="text-sm font-mono text-gray-700 mb-3">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </div>
                        <button
                          onClick={disconnectWallet}
                          className="btn btn-sm btn-outline-red w-full flex items-center justify-center gap-2"
                        >
                          <X size={14} />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User size={20} />
                  <span>{user?.firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              {isAuthenticated && (
                <Link
                  to="/post-job"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post Job
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="py-2 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Wallet size={20} className={user?.walletAddress ? 'text-green-500' : 'text-gray-400'} />
                          {user?.walletAddress && (
                            <Check size={12} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                          )}
                          {isConnecting && (
                            <div className="absolute -top-1 -right-1 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 bg-white"></div>
                          )}
                        </div>
                        <span className="text-sm">
                          {isConnecting ? 'Connecting...' : user?.walletAddress ? 'Wallet Connected' : 'No Wallet'}
                        </span>
                      </div>
                      {!user?.walletAddress && !isConnecting && (
                        <button
                          onClick={connectMetaMask}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                    {user?.walletAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-600">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </span>
                        <button
                          onClick={disconnectWallet}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    <span>{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="btn btn-outline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 