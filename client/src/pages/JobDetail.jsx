import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { jobService } from '../services/jobService'
import { MapPin, Briefcase, DollarSign, Calendar, User, Eye, ArrowLeft, CheckCircle, Clock } from 'lucide-react'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await jobService.getJobById(id)
        setJob(response.job)
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error('Job not found')
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchJob()
    }
  }, [id, navigate])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading job details...</span>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/jobs" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </Link>
      </div>

      <div className="card p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            {job.paymentVerified && (
              <CheckCircle size={24} className="text-green-500" title="Payment Verified" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-gray-400" />
            <span className="text-xl text-gray-600">
              {job.user?.firstName} {job.user?.lastName}
              {job.user?.isVerified && (
                <CheckCircle size={16} className="inline ml-2 text-blue-500" />
              )}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              {job.location || 'Not specified'}
              {job.isRemote && <span className="text-green-600 ml-1">• Remote</span>}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={16} />
              {job.jobType}
            </div>
            {job.budget && (
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                ${job.budget}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={16} />
              Posted {formatDate(job.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              {job.views} views
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              {job.applications} applications
            </div>
          </div>

          {/* Experience level badge */}
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              job.experienceLevel === 'entry' ? 'bg-green-100 text-green-700' :
              job.experienceLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              job.experienceLevel === 'senior' ? 'bg-purple-100 text-purple-700' :
              'bg-red-100 text-red-700'
            }`}>
              {job.experienceLevel} level
            </span>
          </div>

          {/* Deadline */}
          {job.deadline && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="text-yellow-600" size={20} />
                <span className="font-medium text-yellow-800">
                  Application deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {job.requirements && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Job Type:</span>
                <span className="ml-2 font-medium">{job.jobType}</span>
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>
                <span className="ml-2 font-medium">{job.experienceLevel}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 font-medium ${
                  job.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {job.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Posted:</span>
                <span className="ml-2 font-medium">{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Interested in this position?
                </p>
                <p className="text-xs text-gray-400">
                  Contact the employer through their profile
                </p>
              </div>
              <div className="space-x-4">
                <button className="btn btn-outline">
                  Contact Employer
                </button>
                <button className="btn btn-primary px-8 py-3">
                  Apply for this position
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetail 