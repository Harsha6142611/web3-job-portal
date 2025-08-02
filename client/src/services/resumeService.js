import api from './api'

export const resumeService = {
  // Upload resume file
  uploadResume: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('resume', file)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }

    const response = await api.post('/resumes/upload', formData, config)
    return response.data
  },

  // Get all user resumes
  getResumes: async () => {
    const response = await api.get('/resumes')
    return response.data
  },

  // Get active resume with full analysis
  getActiveResume: async () => {
    const response = await api.get('/resumes/active')
    return response.data
  },

  // Get specific resume by ID
  getResume: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`)
    return response.data
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`)
    return response.data
  },

  // Reprocess resume analysis
  reprocessResume: async (resumeId) => {
    const response = await api.post(`/resumes/${resumeId}/reprocess`)
    return response.data
  },

  // Helper function to validate file before upload
  validateFile: (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.')
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    return true
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file icon based on mime type
  getFileIcon: (mimeType) => {
    switch (mimeType) {
      case 'application/pdf':
        return '📄'
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝'
      default:
        return '📎'
    }
  }
}