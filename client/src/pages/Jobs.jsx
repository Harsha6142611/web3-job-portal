import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { jobService } from '../services/jobService'
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock, Eye, User, CheckCircle } from 'lucide-react'

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    location: '',
    isRemote: ''
  })

  const fetchJobs = async (page = 1, searchQuery = '', jobFilters = {}) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        ...jobFilters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await jobService.getJobs(params)
      setJobs(response.jobs)
      setTotalPages(response.totalPages)
      setCurrentPage(response.page)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchJobs(1, searchTerm, filters)
  }

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    fetchJobs(1, searchTerm, newFilters)
  }

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>
        <p className="text-gray-600">Find your next Web3 opportunity</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Search size={16} />
              Search
            </button>
          </div>
          
          {/* Filter options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="input"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
            
            <select
              value={filters.experienceLevel}
              onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              className="input"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
              <option value="expert">Expert</option>
            </select>
            
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input"
            />
            
            <select
              value={filters.isRemote}
              onChange={(e) => handleFilterChange('isRemote', e.target.value)}
              className="input"
            >
              <option value="">All Locations</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading jobs...</span>
        </div>
      )}

      {/* Job Listings */}
      {!loading && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card card-hover p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    {job.paymentVerified && (
                      <CheckCircle size={18} className="text-green-500" title="Payment Verified" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600">
                      {job.user?.firstName} {job.user?.lastName}
                      {job.user?.isVerified && (
                        <CheckCircle size={14} className="inline ml-1 text-blue-500" />
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                      <Eye size={16} />
                      {job.views} views
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <Clock size={16} />
                    {formatDate(job.createdAt)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.experienceLevel === 'entry' ? 'bg-green-100 text-green-700' :
                    job.experienceLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    job.experienceLevel === 'senior' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {job.experienceLevel}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {job.description}
              </p>
              
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {job.deadline && (
                    <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
                  )}
                </div>
                <Link
                  to={`/jobs/${job.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => fetchJobs(currentPage - 1, searchTerm, filters)}
            disabled={currentPage === 1}
            className="btn btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchJobs(currentPage + 1, searchTerm, filters)}
            disabled={currentPage === totalPages}
            className="btn btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* No Jobs Found */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search criteria or filters'
              : 'Be the first to post a job!'}
          </p>
          <Link to="/post-job" className="btn btn-primary">
            Post a Job
          </Link>
        </div>
      )}
    </div>
  )
}

export default Jobs 