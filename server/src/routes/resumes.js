const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Resume } = require('../models/index');
const { auth } = require('../middleware/auth');
const resumeAnalysisService = require('../services/resumeAnalysisService');

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'resumes');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${req.user.id}_${uniqueSuffix}_${sanitizedName}`);
  }
});

// File filter for resumes
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1
  }
});

// Upload and analyze resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    console.log(`📁 Resume uploaded: ${req.file.filename} (${req.file.size} bytes)`);

    // Deactivate previous resumes for this user
    await Resume.update(
      { isActive: false },
      { where: { userId: req.user.id } }
    );

    // Create initial resume record
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      processingStatus: 'processing'
    });

    console.log(`📝 Created resume record: ${resume.id}`);

    // Process resume in background (don't await to respond quickly)
    processResumeAsync(resume.id, req.file.path, req.file.mimetype);

    res.status(201).json({
      message: 'Resume uploaded successfully. Processing...',
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        processingStatus: resume.processingStatus,
        createdAt: resume.createdAt
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }

    res.status(500).json({
      error: 'Failed to upload resume',
      details: error.message
    });
  }
});

// Get user's resumes
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.findByUserId(req.user.id);
    
    res.json({
      resumes: resumes.map(resume => ({
        id: resume.id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        processingStatus: resume.processingStatus,
        analysisScore: resume.analysisScore,
        experienceLevel: resume.experienceLevel,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      error: 'Failed to fetch resumes'
    });
  }
});

// Get active resume with full analysis
router.get('/active', auth, async (req, res) => {
  try {
    const resume = await Resume.findActiveByUserId(req.user.id);
    
    if (!resume) {
      return res.status(404).json({
        error: 'No active resume found'
      });
    }

    res.json({
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        processingStatus: resume.processingStatus,
        processingError: resume.processingError,
        summary: resume.summary,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        contactInfo: resume.contactInfo,
        keywords: resume.keywords,
        industryTags: resume.industryTags,
        experienceLevel: resume.experienceLevel,
        analysisScore: resume.analysisScore,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching active resume:', error);
    res.status(500).json({
      error: 'Failed to fetch active resume'
    });
  }
});

// Get specific resume analysis
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      error: 'Failed to fetch resume'
    });
  }
});

// Delete resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.filePath);
      console.log(`🗑️ Deleted resume file: ${resume.filePath}`);
    } catch (fileError) {
      console.warn('Failed to delete resume file:', fileError.message);
    }

    // Delete from database
    await resume.destroy();

    res.json({
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      error: 'Failed to delete resume'
    });
  }
});

// Reprocess resume analysis
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Reset processing status
    await resume.update({
      processingStatus: 'processing',
      processingError: null
    });

    // Reprocess in background
    processResumeAsync(resume.id, resume.filePath, resume.mimeType);

    res.json({
      message: 'Resume reprocessing started',
      resume: {
        id: resume.id,
        processingStatus: 'processing'
      }
    });
  } catch (error) {
    console.error('Error reprocessing resume:', error);
    res.status(500).json({
      error: 'Failed to reprocess resume'
    });
  }
});

// Background processing function
async function processResumeAsync(resumeId, filePath, mimeType) {
  try {
    console.log(`🔄 Processing resume: ${resumeId}`);
    
    const result = await resumeAnalysisService.processResume(filePath, mimeType);
    
    await Resume.update({
      extractedText: result.extractedText,
      analyzedData: result.analysisData,
      summary: result.analysisData.summary,
      skills: result.analysisData.skills,
      experience: result.analysisData.experience,
      education: result.analysisData.education,
      contactInfo: result.analysisData.contactInfo,
      keywords: result.analysisData.keywords,
      industryTags: result.analysisData.industryTags,
      experienceLevel: result.analysisData.experienceLevel,
      analysisScore: result.analysisData.analysisScore,
      processingStatus: result.processingStatus,
      processingError: result.processingError
    }, {
      where: { id: resumeId }
    });

    console.log(`✅ Resume processing completed: ${resumeId}`);
  } catch (error) {
    console.error(`❌ Resume processing failed: ${resumeId}`, error);
    
    await Resume.update({
      processingStatus: 'failed',
      processingError: error.message
    }, {
      where: { id: resumeId }
    });
  }
}

module.exports = router;