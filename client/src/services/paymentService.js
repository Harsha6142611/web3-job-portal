import api from './api'

export const paymentService = {
  // Create a payment record
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData)
    return response.data
  },

  // Get user's payments
  getUserPayments: async () => {
    const response = await api.get('/payments/user/me')
    return response.data
  },

  // Verify payment
  verifyPayment: async (transactionHash) => {
    const response = await api.post('/payments/verify', { transactionHash })
    return response.data
  }
}

// Network configurations
const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in decimal
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    // Update this with your actual Sepolia testnet wallet address
    platformWallet: import.meta.env.VITE_SEPOLIA_PLATFORM_WALLET || '0x742d35Cc6634C0532925a3b8D5C8a1A5b9Ef1234'
  },
  ETHEREUM: {
    chainId: '0x1', // 1 in decimal
    chainName: 'Ethereum Mainnet',
    // Update this with your actual Ethereum mainnet wallet address
    platformWallet: import.meta.env.VITE_ETHEREUM_PLATFORM_WALLET || '0x742d35Cc6634C0532925a3b8D5C8a1A5b9Ef1234'
  }
}

// MetaMask payment utilities
export const metaMaskPayment = {
  // Check current network
  getCurrentNetwork: async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      return chainId
    } catch (error) {
      console.error('Error getting network:', error)
      throw new Error('Failed to get current network')
    }
  },

  // Switch to Sepolia testnet
  switchToSepolia: async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS.SEPOLIA.chainId }],
      })
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS.SEPOLIA],
          })
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask')
        }
      } else {
        throw new Error('Failed to switch to Sepolia network')
      }
    }
  },

  // Ensure we're on the correct network (Sepolia)
  ensureCorrectNetwork: async () => {
    const currentChainId = await metaMaskPayment.getCurrentNetwork()
    
    if (currentChainId !== NETWORKS.SEPOLIA.chainId) {
      throw new Error('WRONG_NETWORK')
    }
  },

  // Send ETH payment for job posting on Sepolia testnet
  sendJobPostingPayment: async (amount = '0.001') => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      // Ensure we're on Sepolia testnet
      await metaMaskPayment.ensureCorrectNetwork()

      // Get current account
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      })
      
      if (accounts.length === 0) {
        throw new Error('No MetaMask account connected')
      }

      const fromAddress = accounts[0]
      
      // Convert amount to wei (1 ETH = 10^18 wei)
      const amountInWei = `0x${(parseFloat(amount) * Math.pow(10, 18)).toString(16)}`

      // Platform wallet address for Sepolia testnet
      const toAddress = NETWORKS.SEPOLIA.platformWallet

      // Send transaction on Sepolia
      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: toAddress,
          value: amountInWei,
          gas: '0x5208', // 21000 gas limit for simple transfer
        }],
      })

      return {
        transactionHash,
        fromAddress,
        toAddress,
        amount,
        amountInWei,
        network: 'sepolia'
      }
    } catch (error) {
      console.error('MetaMask payment error:', error)
      
      if (error.message === 'WRONG_NETWORK') {
        throw new Error('Please switch to Sepolia testnet to make payments')
      } else if (error.code === 4001) {
        throw new Error('Transaction rejected by user')
      } else if (error.code === -32603) {
        throw new Error('Transaction failed. Please try again.')
      } else if (error.code === -32000) {
        throw new Error('Insufficient funds for transaction')
      } else {
        throw new Error(error.message || 'Payment failed')
      }
    }
  },

  // Get transaction receipt
  getTransactionReceipt: async (transactionHash) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [transactionHash],
      })
      
      return receipt
    } catch (error) {
      console.error('Error getting transaction receipt:', error)
      throw new Error('Failed to get transaction receipt')
    }
  }
}