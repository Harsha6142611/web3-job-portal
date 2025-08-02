const express = require('express');
const Joi = require('joi');
const { auth, optionalAuth } = require('../middleware/auth');
// Import from models/index to ensure associations are loaded
const { Job, User, Payment } = require('../models/index');

const router = express.Router();

// Validation schemas
const createJobSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(10).required(),
  requirements: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  budget: Joi.number().positive().optional(),
  budgetType: Joi.string().valid('hourly', 'fixed', 'negotiable').optional(),
  location: Joi.string().optional(),
  isRemote: Joi.boolean().optional(),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance').optional(),
  experienceLevel: Joi.string().valid('entry', 'intermediate', 'senior', 'expert').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  deadline: Joi.date().optional()
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().min(10).optional(),
  requirements: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  budget: Joi.number().positive().optional(),
  budgetType: Joi.string().valid('hourly', 'fixed', 'negotiable').optional(),
  location: Joi.string().optional(),
  isRemote: Joi.boolean().optional(),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance').optional(),
  experienceLevel: Joi.string().valid('entry', 'intermediate', 'senior', 'expert').optional(),
  status: Joi.string().valid('active', 'inactive', 'completed', 'cancelled').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  deadline: Joi.date().optional()
});

// Create new job (requires payment verification)
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    // Check if user has verified payment for job posting
    const recentPayment = await Payment.findOne({
      where: {
        userId: req.user.id,
        paymentType: 'job_posting',
        status: 'confirmed',
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (!recentPayment) {
      return res.status(402).json({
        error: 'Payment required for job posting',
        message: 'Please complete blockchain payment before posting a job'
      });
    }

    // Create job
    const job = await Job.create({
      ...value,
      userId: req.user.id,
      paymentVerified: true,
      transactionHash: recentPayment.transactionHash,
      blockchainNetwork: recentPayment.network
    });

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      error: 'Failed to create job',
      details: error.message
    });
  }
});

// Get all jobs with filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      experienceLevel,
      isRemote,
      skills,
      minBudget,
      maxBudget,
      status = 'active'
    } = req.query;

    console.log('Jobs query params:', req.query);

    const offset = (page - 1) * limit;
    const whereClause = { status };

    // Search filter
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    // Location filter
    if (location) {
      whereClause.location = { [require('sequelize').Op.iLike]: `%${location}%` };
    }

    // Job type filter
    if (jobType) {
      whereClause.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    // Remote filter
    if (isRemote !== undefined) {
      whereClause.isRemote = isRemote === 'true';
    }

    // Budget filter
    if (minBudget || maxBudget) {
      whereClause.budget = {};
      if (minBudget) whereClause.budget[require('sequelize').Op.gte] = parseFloat(minBudget);
      if (maxBudget) whereClause.budget[require('sequelize').Op.lte] = parseFloat(maxBudget);
    }

    // Skills filter
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      whereClause.skills = { [require('sequelize').Op.overlap]: skillArray };
    }

    console.log('Where clause:', whereClause);

    // Try a simple query first to check if table exists
    const jobCount = await Job.count();
    console.log('Total jobs in database:', jobCount);

    // Try without include first to isolate the issue
    let jobs;
    try {
      jobs = await Job.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      console.log('Jobs query without include successful, count:', jobs.count);
    } catch (includeError) {
      console.error('Jobs query without include failed:', includeError);
      throw includeError;
    }

    // Now try with include
    try {
      jobs = await Job.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      console.log('Jobs query with include successful, count:', jobs.count);
    } catch (includeError) {
      console.error('Jobs query with include failed:', includeError);
      console.log('Falling back to query without user include...');
      
      // If include fails, just return jobs without user data
      jobs = await Job.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
    }

    res.json({
      jobs: jobs.rows,
      total: jobs.count,
      page: parseInt(page),
      totalPages: Math.ceil(jobs.count / limit)
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get jobs',
      details: error.message
    });
  }
});

// Get job by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'bio', 'linkedinUrl', 'profileImage', 'isVerified']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    // Increment views
    await job.increment('views');

    res.json({
      job
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get job'
    });
  }
});

// Update job (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = updateJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    if (job.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to update this job'
      });
    }

    await job.update(value);

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update job'
    });
  }
});

// Delete job (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    if (job.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete this job'
      });
    }

    await job.destroy();

    res.json({
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete job'
    });
  }
});

// Get user's jobs
router.get('/user/me', auth, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user jobs'
    });
  }
});

module.exports = router; 