const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { User } = require('../models/index');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  bio: Joi.string().max(500).allow('').optional(),
  linkedinUrl: Joi.string().allow('').optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).allow(null).optional()
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    const { email, password, firstName, lastName, walletAddress } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Check if wallet address is already in use
    if (walletAddress) {
      const existingWallet = await User.findOne({ where: { walletAddress } });
      if (existingWallet) {
        return res.status(400).json({
          error: 'Wallet address is already registered'
        });
      }
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      walletAddress
    });

    // Generate JWT token (12 hours expiration for security)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token (12 hours expiration for security)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to login'
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    // Check if wallet address is already in use by another user
    if (value.walletAddress && value.walletAddress !== req.user.walletAddress) {
      const existingWallet = await User.findOne({ 
        where: { 
          walletAddress: value.walletAddress,
          id: { [require('sequelize').Op.ne]: req.user.id }
        }
      });
      if (existingWallet) {
        return res.status(400).json({
          error: 'Wallet address is already registered by another user'
        });
      }
    }

    // Update user profile
    await req.user.update(value);

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

// Connect wallet
router.post('/connect-wallet', auth, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }

    // Check if wallet is already in use
    const existingWallet = await User.findOne({ 
      where: { 
        walletAddress,
        id: { [require('sequelize').Op.ne]: req.user.id }
      }
    });
    
    if (existingWallet) {
      return res.status(400).json({
        error: 'Wallet address is already registered by another user'
      });
    }

    await req.user.update({ walletAddress });

    res.json({
      message: 'Wallet connected successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to connect wallet'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to logout'
    });
  }
});

module.exports = router; 