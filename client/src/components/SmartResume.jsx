import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { resumeService } from '../services/resumeService'
import { toast } from 'react-hot-toast'
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Trash2,
  RefreshCw,
  Award,
  Briefcase,
  GraduationCap,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Tag,
  Star,
  TrendingUp,
  BarChart,
  Search,
  Target
} from 'lucide-react'

// Helper functions
const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'processing':
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
    default:
      return <Clock className="h-5 w-5 text-gray-400" />
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Analysis Complete'
    case 'failed':
      return 'Analysis Failed'
    case 'processing':
      return 'Analyzing...'
    default:
      return 'Pending'
  }
}

const SmartResume = () => {
  const { user } = useAuthStore()
  const [activeResume, setActiveResume] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchActiveResume()
  }, [])

  const fetchActiveResume = async () => {
    try {
      setIsLoading(true)
      const response = await resumeService.getActiveResume()
      setActiveResume(response.resume)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching active resume:', error)
      }
      setActiveResume(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      // Validate file
      resumeService.validateFile(file)
      
      setIsUploading(true)
      setUploadProgress(0)

      const response = await resumeService.uploadResume(file, (progress) => {
        setUploadProgress(progress)
      })

      toast.success('Resume uploaded successfully! AI analysis in progress...')
      
      // Poll for processing completion
      pollForProcessingCompletion(response.resume.id)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.error || error.message || 'Failed to upload resume')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const pollForProcessingCompletion = async (resumeId) => {
    const maxAttempts = 30 // 30 attempts with 2 second intervals = 1 minute max
    let attempts = 0

    const poll = async () => {
      try {
        attempts++
        const response = await resumeService.getActiveResume()
        
        if (response.resume.processingStatus === 'completed') {
          setActiveResume(response.resume)
          setIsUploading(false)
          setUploadProgress(0)
          toast.success('🤖 AI analysis completed!')
          return
        }
        
        if (response.resume.processingStatus === 'failed') {
          setActiveResume(response.resume)
          setIsUploading(false)
          setUploadProgress(0)
          toast.error('AI analysis failed. You can try reprocessing.')
          return
        }

        // Continue polling if still processing
        if (attempts < maxAttempts && response.resume.processingStatus === 'processing') {
          setTimeout(poll, 2000)
        } else {
          // Max attempts reached
          setIsUploading(false)
          setUploadProgress(0)
          fetchActiveResume()
        }
      } catch (error) {
        console.error('Polling error:', error)
        setIsUploading(false)
        setUploadProgress(0)
        fetchActiveResume()
      }
    }

    setTimeout(poll, 2000) // Start polling after 2 seconds
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDelete = async () => {
    if (!activeResume || !confirm('Are you sure you want to delete this resume?')) return

    try {
      await resumeService.deleteResume(activeResume.id)
      setActiveResume(null)
      toast.success('Resume deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete resume')
    }
  }

  const handleReprocess = async () => {
    if (!activeResume) return

    try {
      setIsUploading(true)
      await resumeService.reprocessResume(activeResume.id)
      toast.success('Reprocessing started...')
      pollForProcessingCompletion(activeResume.id)
    } catch (error) {
      console.error('Reprocess error:', error)
      toast.error('Failed to reprocess resume')
      setIsUploading(false)
    }
  }



  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Smart Resume
          </h3>
          <p className="text-gray-600 text-sm">
            Upload your resume for AI-powered analysis and insights
          </p>
        </div>
        
        {activeResume && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReprocess}
              disabled={isUploading}
              className="btn btn-outline btn-sm flex items-center gap-1"
              title="Reprocess with AI"
            >
              <RefreshCw className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
              Reprocess
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-outline btn-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              title="Delete resume"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!activeResume ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Upload Your Resume
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <label
              htmlFor="resume-upload"
              className="btn btn-primary cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, DOC, DOCX • Max 5MB
            </p>
          </div>

          {isUploading && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-gray-700">Uploading and analyzing...</span>
                </div>
                <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <ResumeAnalysis resume={activeResume} isProcessing={isUploading} />
      )}
    </div>
  )
}

const ResumeAnalysis = ({ resume, isProcessing }) => {
  return (
    <div className="space-y-8">
      {/* Resume Info */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-3xl p-3 bg-white rounded-xl shadow-sm">
            {resumeService.getFileIcon(resume.mimeType)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{resume.fileName}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {resumeService.formatFileSize(resume.fileSize)} • 
              Uploaded {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm">
          {getStatusIcon(resume.processingStatus)}
          <span className="text-sm font-semibold">
            {getStatusText(resume.processingStatus)}
          </span>
        </div>
      </div>

      {resume.processingStatus === 'processing' || isProcessing ? (
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Brain className="h-16 w-16 text-purple-400 mx-auto opacity-20" />
            </div>
            <Brain className="h-16 w-16 text-purple-600 mx-auto mb-6 animate-pulse relative z-10" />
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-3">
            AI Analysis in Progress
          </h4>
          <p className="text-gray-600 text-lg">
            Our AI is analyzing your resume to extract key information...
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      ) : resume.processingStatus === 'failed' ? (
        <div className="text-center py-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h4 className="text-2xl font-bold text-gray-900 mb-3">
            Analysis Failed
          </h4>
          <p className="text-gray-600 mb-6 text-lg">
            {resume.processingError || 'Unable to process resume'}
          </p>
        </div>
      ) : (
        <ResumeAnalysisResults resume={resume} />
      )}
    </div>
  )
}

const ResumeAnalysisResults = ({ resume }) => {
  return (
    <div className="space-y-8">
      {/* Analysis Score */}
      {resume.analysisScore && (
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Analysis Quality</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3 w-40 shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${resume.analysisScore * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold text-purple-700 bg-white px-3 py-1 rounded-full shadow-sm">
                {Math.round(resume.analysisScore * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Professional Summary */}
      {resume.summary && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            Professional Summary
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Contact Information */}
      {resume.contactInfo && Object.values(resume.contactInfo).some(val => val && val !== 'Not specified') && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {resume.contactInfo.email && resume.contactInfo.email !== 'Not specified' && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{resume.contactInfo.email}</span>
              </div>
            )}
            {resume.contactInfo.phone && resume.contactInfo.phone !== 'Not specified' && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{resume.contactInfo.phone}</span>
              </div>
            )}
            {resume.contactInfo.location && resume.contactInfo.location !== 'Not specified' && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{resume.contactInfo.location}</span>
              </div>
            )}
            {resume.contactInfo.linkedin && resume.contactInfo.linkedin !== 'Not specified' && (
              <div className="flex items-center gap-2 text-sm">
                <Linkedin className="h-4 w-4 text-gray-400" />
                <a 
                  href={resume.contactInfo.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills && Object.values(resume.skills).some(arr => Array.isArray(arr) && arr.length > 0) && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg shadow-md">
              <Award className="h-5 w-5 text-white" />
            </div>
            Skills Analysis
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            {resume.skills.technical?.length > 0 && (
              <SkillCategory title="Technical Skills" skills={resume.skills.technical} color="blue" />
            )}
            {resume.skills.tools?.length > 0 && (
              <SkillCategory title="Tools & Software" skills={resume.skills.tools} color="green" />
            )}
            {resume.skills.languages?.length > 0 && (
              <SkillCategory title="Programming Languages" skills={resume.skills.languages} color="purple" />
            )}
            {resume.skills.soft?.length > 0 && (
              <SkillCategory title="Soft Skills" skills={resume.skills.soft} color="orange" />
            )}
            {resume.skills.certifications?.length > 0 && (
              <SkillCategory title="Certifications" skills={resume.skills.certifications} color="red" />
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Work Experience
          </h4>
          <div className="space-y-4">
            {resume.experience.map((exp, index) => (
              <ExperienceCard key={index} experience={exp} />
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </h4>
          <div className="space-y-3">
            {resume.education.map((edu, index) => (
              <EducationCard key={index} education={edu} />
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Insights */}
      {resume.strengths && resume.strengths.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 border border-green-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
              <Award className="h-5 w-5 text-white" />
            </div>
            Key Strengths
          </h4>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
            <ul className="space-y-3">
              {resume.strengths.map((strength, index) => (
                <li key={index} className="text-green-700 flex items-start group">
                  <span className="mr-3 text-green-500 font-bold text-lg group-hover:scale-110 transition-transform">✓</span>
                  <span className="text-base leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {resume.improvements && resume.improvements.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-2xl p-6 border border-amber-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Improvement Suggestions
          </h4>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
            <ul className="space-y-3">
              {resume.improvements.map((improvement, index) => (
                <li key={index} className="text-amber-700 flex items-start group">
                  <span className="mr-3 text-amber-500 font-bold text-lg group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-base leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Overall Score */}
      {resume.overallScore && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            Resume Score Analysis
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-blue-700">Overall Score</span>
                <span className="text-3xl font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-xl">{resume.overallScore.score}/100</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-sm" 
                  style={{ width: `${resume.overallScore.score}%` }}
                ></div>
              </div>
            </div>

            {resume.overallScore.breakdown && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(resume.overallScore.breakdown).map(([category, score]) => (
                  <div key={category} className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="capitalize text-blue-700 font-semibold">{category}</span>
                      <span className="font-bold text-blue-800 bg-white px-2 py-1 rounded-lg text-sm">{score}/100</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resume.overallScore.feedback && (
              <p className="text-blue-700 font-medium bg-blue-50 p-4 rounded-xl border border-blue-100">{resume.overallScore.feedback}</p>
            )}
          </div>
        </div>
      )}

      {/* ATS Optimization */}
      {resume.atsOptimization && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl p-6 border border-purple-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
              <Search className="h-5 w-5 text-white" />
            </div>
            ATS Optimization
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-purple-700">ATS Score</span>
              <span className="text-3xl font-bold text-purple-800 bg-purple-100 px-4 py-2 rounded-xl">{resume.atsOptimization.score}/100</span>
            </div>
            
            <div className="w-full bg-purple-200 rounded-full h-4 mb-6 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-sm" 
                style={{ width: `${resume.atsOptimization.score}%` }}
              ></div>
            </div>

            {resume.atsOptimization.suggestions && resume.atsOptimization.suggestions.length > 0 && (
              <div className="mb-4">
                <span className="text-base font-semibold text-purple-700 mb-3 block">ATS Suggestions:</span>
                <ul className="space-y-2">
                  {resume.atsOptimization.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-purple-600 flex items-start bg-purple-50 p-3 rounded-xl">
                      <span className="mr-3 text-purple-500 font-bold">•</span>
                      <span className="text-base">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resume.atsOptimization.missingKeywords && resume.atsOptimization.missingKeywords.length > 0 && (
              <div>
                <span className="text-base font-semibold text-purple-700 mb-3 block">Consider Adding Keywords:</span>
                <div className="flex flex-wrap gap-2">
                  {resume.atsOptimization.missingKeywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-xl border border-purple-200 hover:bg-purple-200 transition-colors">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Career Path Guidance */}
      {resume.careerPath && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50/50 rounded-2xl p-6 border border-indigo-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-md">
              <Target className="h-5 w-5 text-white" />
            </div>
            Career Path Guidance
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 space-y-5">
            
            {resume.careerPath.currentLevel && (
              <div className="bg-indigo-50 p-4 rounded-xl">
                <span className="text-base font-semibold text-indigo-700 mb-2 block">Current Level:</span>
                <p className="text-indigo-600 font-medium">{resume.careerPath.currentLevel}</p>
              </div>
            )}

            {resume.careerPath.nextSteps && resume.careerPath.nextSteps.length > 0 && (
              <div>
                <span className="text-base font-semibold text-indigo-700 mb-3 block">Next Steps:</span>
                <ul className="space-y-2">
                  {resume.careerPath.nextSteps.map((step, index) => (
                    <li key={index} className="text-indigo-600 flex items-start bg-indigo-50 p-3 rounded-xl">
                      <span className="mr-3 font-bold text-indigo-500 text-lg">→</span>
                      <span className="text-base">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resume.careerPath.skillGaps && resume.careerPath.skillGaps.length > 0 && (
              <div>
                <span className="text-base font-semibold text-indigo-700 mb-3 block">Skills to Develop:</span>
                <div className="flex flex-wrap gap-2">
                  {resume.careerPath.skillGaps.map((skill, index) => (
                    <span key={index} className="px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-xl border border-indigo-200 hover:bg-indigo-200 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Recommendations */}
      {resume.recommendations && resume.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50/50 rounded-2xl p-6 border border-orange-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            Priority Action Items
          </h4>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <ul className="space-y-4">
              {resume.recommendations.map((recommendation, index) => (
                <li key={index} className="text-orange-700 flex items-start group">
                  <div className="mr-4 font-bold text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <span className="text-base leading-relaxed pt-1">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Keywords & Tags */}
      {(resume.keywords?.length > 0 || resume.industryTags?.length > 0) && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Keywords & Industry Tags
          </h4>
          <div className="space-y-3">
            {resume.keywords?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {resume.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {resume.industryTags?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Industry Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {resume.industryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SkillCategory = ({ title, skills, color }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-200',
      green: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-200',
      purple: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200',
      orange: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-200',
      red: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-base font-semibold text-gray-700 mb-3">{title}:</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-2 text-sm rounded-xl border font-medium hover:scale-105 transition-transform shadow-sm ${getColorClasses(color)}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

const ExperienceCard = ({ experience }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h5 className="font-medium text-gray-900">{experience.title}</h5>
          <p className="text-purple-600 font-medium">{experience.company}</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>{experience.location}</p>
          <p>{experience.startDate} - {experience.endDate}</p>
          {experience.duration && <p className="text-xs">({experience.duration})</p>}
        </div>
      </div>
      {experience.description && (
        <p className="text-gray-700 text-sm mb-3">{experience.description}</p>
      )}
      {experience.achievements?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {experience.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const EducationCard = ({ education }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-medium text-gray-900">{education.degree}</h5>
          <p className="text-purple-600">{education.field}</p>
          <p className="text-gray-600 text-sm">{education.institution}</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>{education.location}</p>
          <p>{education.graduationDate}</p>
          {education.gpa && <p>GPA: {education.gpa}</p>}
          {education.honors && <p className="text-yellow-600">{education.honors}</p>}
        </div>
      </div>
    </div>
  )
}

export default SmartResume