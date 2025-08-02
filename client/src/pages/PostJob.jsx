import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { jobService } from '../services/jobService'
import { metaMaskPayment, paymentService } from '../services/paymentService'
import NetworkStatus from '../components/NetworkStatus'
import { Briefcase, MapPin, DollarSign, Calendar, Wallet, CheckCircle, AlertCircle } from 'lucide-react'

const PostJob = () => {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [isPosting, setIsPosting] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form') // form, payment, processing, success
  const [transactionHash, setTransactionHash] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      jobType: 'contract',
      experienceLevel: 'intermediate',
      budgetType: 'negotiable',
      isRemote: false
    }
  })

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  // Check if user has wallet connected
  const hasWallet = user?.walletAddress

  const processPayment = async () => {
    if (!hasWallet) {
      toast.error('Please connect your MetaMask wallet first')
      return false
    }

    try {
      setPaymentStep('payment')
      toast.loading('Checking network...')

      // First check if we're on the correct network
      try {
        await metaMaskPayment.ensureCorrectNetwork()
      } catch (networkError) {
        if (networkError.message === 'WRONG_NETWORK') {
          toast.dismiss()
          
          // Ask user to switch to Sepolia
          const switchNetwork = window.confirm(
            'You need to be on Sepolia testnet to make payments. Switch to Sepolia now?'
          )
          
          if (switchNetwork) {
            toast.loading('Switching to Sepolia testnet...')
            try {
              await metaMaskPayment.switchToSepolia()
              toast.dismiss()
              toast.success('Switched to Sepolia testnet!')
            } catch (switchError) {
              toast.dismiss()
              toast.error('Failed to switch network. Please switch to Sepolia manually in MetaMask.')
              setPaymentStep('form')
              return false
            }
          } else {
            setPaymentStep('form')
            return false
          }
        } else {
          throw networkError
        }
      }

      toast.loading('Processing payment on Sepolia testnet...')

      // Send payment via MetaMask on Sepolia
      const paymentResult = await metaMaskPayment.sendJobPostingPayment('0.001')
      
      setTransactionHash(paymentResult.transactionHash)
      toast.dismiss()
      toast.success('Payment sent! Waiting for confirmation...')
      
      // Create payment record in backend
      await paymentService.createPayment({
        transactionHash: paymentResult.transactionHash,
        fromAddress: paymentResult.fromAddress,
        toAddress: paymentResult.toAddress,
        amount: paymentResult.amount,
        paymentType: 'job_posting',
        network: 'sepolia'
      })

      setPaymentStep('processing')
      return true
    } catch (error) {
      console.error('Payment error:', error)
      toast.dismiss()
      
      if (error.message.includes('Sepolia')) {
        toast.error('Please switch to Sepolia testnet and try again')
      } else if (error.message.includes('funds')) {
        toast.error('Insufficient Sepolia ETH. Get testnet ETH from a faucet.')
      } else {
        toast.error(error.message || 'Payment failed')
      }
      
      setPaymentStep('form')
      return false
    }
  }

  const onSubmit = async (data) => {
    if (!hasWallet) {
      toast.error('Please connect your MetaMask wallet before posting a job')
      return
    }

    setIsPosting(true)

    try {
      // First, process payment
      const paymentSuccess = await processPayment()
      if (!paymentSuccess) {
        setIsPosting(false)
        return
      }

      // Prepare job data
      const jobData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        budget: data.budget ? parseFloat(data.budget.replace(/[^0-9.]/g, '')) : null,
        deadline: data.deadline || null,
        isRemote: data.location?.toLowerCase().includes('remote') || data.isRemote
      }

      // Wait a bit for transaction to be processed
      toast.loading('Creating job listing...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Create job
      const result = await jobService.createJob(jobData)
      
      toast.dismiss()
      toast.success('Job posted successfully!')
      setPaymentStep('success')
      
      // Reset form and redirect after success
      setTimeout(() => {
        reset()
        navigate('/jobs')
      }, 2000)

    } catch (error) {
      console.error('Job posting error:', error)
      toast.dismiss()
      
      if (error.response?.status === 402) {
        toast.error('Payment verification failed. Please try again or contact support.')
      } else {
        toast.error(error.response?.data?.error || 'Failed to post job')
      }
      setPaymentStep('form')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a Job</h1>
        <p className="text-gray-600">Create a new job listing for Web3 professionals</p>
      </div>

      <div className="card p-8">
        {/* Wallet Status Warning */}
        {!hasWallet && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div>
                <h3 className="font-medium text-yellow-800">Wallet Required</h3>
                <p className="text-sm text-yellow-700">
                  Please connect your MetaMask wallet to post jobs. 
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="ml-1 text-yellow-800 underline hover:no-underline"
                  >
                    Go to Profile
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Network Status */}
        {hasWallet && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Network Status</h3>
            <NetworkStatus />
          </div>
        )}

        {/* Payment Step Indicator */}
        {paymentStep !== 'form' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              {paymentStep === 'payment' && <Wallet className="text-blue-600 animate-pulse" size={20} />}
              {paymentStep === 'processing' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
              {paymentStep === 'success' && <CheckCircle className="text-green-600" size={20} />}
              <div>
                <h3 className="font-medium text-blue-800">
                  {paymentStep === 'payment' && 'Processing Payment...'}
                  {paymentStep === 'processing' && 'Creating Job Listing...'}
                  {paymentStep === 'success' && 'Job Posted Successfully!'}
                </h3>
                {transactionHash && (
                  <p className="text-sm text-blue-700 font-mono">
                    TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                {...register('title', { 
                  required: 'Job title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                })}
                className="input pl-10"
                placeholder="e.g., Senior Solidity Developer"
                disabled={isPosting}
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              {...register('description', { 
                required: 'Job description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
              rows={6}
              className="input"
              placeholder="Describe the role, responsibilities, and requirements..."
              disabled={isPosting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  {...register('location', {
                    required: 'Location is required'
                  })}
                  className="input pl-10"
                  placeholder="e.g., Remote, San Francisco, CA"
                  disabled={isPosting}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select {...register('jobType', { required: 'Job type is required' })} className="input" disabled={isPosting}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget/Salary *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  {...register('budget', {
                    required: 'Budget is required',
                    pattern: {
                      value: /[\d$,k-]/,
                      message: 'Please enter a valid budget (e.g., $50k, $80k-$120k)'
                    }
                  })}
                  className="input pl-10"
                  placeholder="e.g., $80k - $120k, $50/hour"
                  disabled={isPosting}
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select {...register('experienceLevel', { required: 'Experience level is required' })} className="input" disabled={isPosting}>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="senior">Senior</option>
                <option value="expert">Expert</option>
              </select>
              {errors.experienceLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills *
            </label>
            <input
              type="text"
              {...register('skills', {
                required: 'At least one skill is required'
              })}
              className="input"
              placeholder="e.g., Solidity, React, TypeScript (comma separated)"
              disabled={isPosting}
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Separate skills with commas for better matching
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                {...register('deadline')}
                className="input pl-10"
                min={new Date().toISOString().split('T')[0]}
                disabled={isPosting}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Optional - Leave empty for ongoing applications
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Wallet className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Payment Required (Sepolia Testnet)</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  To post a job, you'll need to pay <strong>0.001 SepoliaETH</strong> on the Sepolia testnet via MetaMask. 
                  This helps maintain quality and prevent spam.
                </p>
                <div className="text-xs text-yellow-600 mb-3 space-y-1">
                  <p>📍 <strong>Network:</strong> Sepolia Testnet (will auto-switch if needed)</p>
                  <p>💰 <strong>Need testnet ETH?</strong> Get free SepoliaETH from:</p>
                  <div className="ml-4 space-y-1">
                    <p>• <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">sepoliafaucet.com</a></p>
                    <p>• <a href="https://faucets.chain.link/sepolia" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Chainlink Faucet</a></p>
                  </div>
                </div>
                {hasWallet ? (
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    Wallet connected and ready for payment
                  </p>
                ) : (
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    Please connect your wallet first
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/jobs')}
              disabled={isPosting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary flex items-center gap-2"
              disabled={!hasWallet || isPosting || paymentStep !== 'form'}
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  Post Job (0.001 SepoliaETH)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostJob 