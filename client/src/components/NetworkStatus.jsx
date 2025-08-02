import { useState, useEffect } from 'react'
import { metaMaskPayment } from '../services/paymentService'
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'

const NetworkStatus = () => {
  const [currentNetwork, setCurrentNetwork] = useState(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [loading, setLoading] = useState(true)

  const SEPOLIA_CHAIN_ID = '0xaa36a7'

  useEffect(() => {
    checkNetwork()
    
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged)
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleChainChanged = (chainId) => {
    setCurrentNetwork(chainId)
    setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID)
  }

  const checkNetwork = async () => {
    try {
      setLoading(true)
      const chainId = await metaMaskPayment.getCurrentNetwork()
      setCurrentNetwork(chainId)
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID)
    } catch (error) {
      console.error('Error checking network:', error)
      setCurrentNetwork(null)
      setIsCorrectNetwork(false)
    } finally {
      setLoading(false)
    }
  }

  const switchToSepolia = async () => {
    try {
      await metaMaskPayment.switchToSepolia()
    } catch (error) {
      console.error('Error switching network:', error)
    }
  }

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet'
      case '0xaa36a7':
        return 'Sepolia Testnet'
      case '0x89':
        return 'Polygon'
      case '0xa86a':
        return 'Avalanche'
      default:
        return `Unknown Network (${chainId})`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
        <Wifi size={16} className="animate-pulse" />
        <span>Checking network...</span>
      </div>
    )
  }

  if (!currentNetwork) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600">
        <WifiOff size={16} />
        <span>No network detected</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
      isCorrectNetwork 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {isCorrectNetwork ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      
      <div className="flex-1">
        <span className="font-medium">
          {getNetworkName(currentNetwork)}
        </span>
        {!isCorrectNetwork && (
          <div className="text-xs mt-1">
            Switch to Sepolia for payments
          </div>
        )}
      </div>
      
      {!isCorrectNetwork && (
        <button
          onClick={switchToSepolia}
          className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
        >
          Switch
        </button>
      )}
    </div>
  )
}

export default NetworkStatus