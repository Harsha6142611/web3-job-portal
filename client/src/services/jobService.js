import api from './api'

export const jobService = {
  // Create a new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData)
    return response.data
  },

  // Get all jobs with optional filters
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params })
    return response.data
  },

  // Get a specific job by ID
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  },

  // Get current user's jobs
  getUserJobs: async () => {
    const response = await api.get('/jobs/user/me')
    return response.data
  },

  // Update a job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData)
    return response.data
  },

  // Delete a job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`)
    return response.data
  },

  // Search jobs
  searchJobs: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    }
    const response = await api.get('/jobs', { params })
    return response.data
  }
}