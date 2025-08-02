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
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details
      });
    }

    const { email, password, firstName, lastName, walletAddress } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists. Please use a different email or try logging in.'
      });
    }

    // Check if wallet address is already in use
    if (walletAddress) {
      const existingWallet = await User.findOne({ where: { walletAddress } });
      if (existingWallet) {
        return res.status(409).json({
          error: 'WALLET_ALREADY_REGISTERED',
          message: 'This wallet address is already connected to another account. Please use a different wallet or disconnect it from the other account first.'
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
    console.error('Registration error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.fields.email) {
        return res.status(409).json({
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists. Please use a different email or try logging in.'
        });
      }
      if (error.fields.walletAddress) {
        return res.status(409).json({
          error: 'WALLET_ALREADY_REGISTERED',
          message: 'This wallet address is already connected to another account. Please use a different wallet or disconnect it from the other account first.'
        });
      }
    }
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred during registration. Please try again.'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'EMAIL_NOT_FOUND',
        message: 'No account found with this email address. Please check your email or sign up for a new account.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'ACCOUNT_DEACTIVATED',
        message: 'Your account has been deactivated. Please contact support for assistance.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please check your password and try again.'
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
    console.error('Login error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred during login. Please try again.'
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
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
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
        return res.status(409).json({
          error: 'WALLET_ALREADY_CONNECTED',
          message: 'This wallet address is already connected to another user account. Please use a different wallet address.'
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
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.fields.email) {
        return res.status(409).json({
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'This email address is already in use by another account. Please use a different email address.'
        });
      }
      if (error.fields.walletAddress) {
        return res.status(409).json({
          error: 'WALLET_ALREADY_CONNECTED',
          message: 'This wallet address is already connected to another user account. Please use a different wallet address.'
        });
      }
    }
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred while updating your profile. Please try again.'
    });
  }
});

// Connect wallet
router.post('/connect-wallet', auth, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        error: 'INVALID_WALLET_ADDRESS',
        message: 'Please provide a valid MetaMask wallet address (42 characters starting with 0x).'
      });
    }

    // Check if user already has this wallet connected
    if (req.user.walletAddress === walletAddress) {
      return res.status(200).json({
        message: 'Wallet is already connected to your account',
        user: req.user.toJSON()
      });
    }

    // Check if wallet is already in use by another user
    const existingWallet = await User.findOne({ 
      where: { 
        walletAddress,
        id: { [require('sequelize').Op.ne]: req.user.id }
      }
    });
    
    if (existingWallet) {
      return res.status(409).json({
        error: 'WALLET_ALREADY_CONNECTED',
        message: 'This MetaMask wallet is already connected to another user account. Please disconnect it from the other account first or use a different wallet.',
        details: {
          walletAddress: walletAddress,
          connectedToUser: existingWallet.email ? existingWallet.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'another account'
        }
      });
    }

    // If user already has a different wallet, ask for confirmation
    if (req.user.walletAddress && req.user.walletAddress !== walletAddress) {
      // For now, we'll update it directly, but you could add a confirmation step
      console.log(`User ${req.user.email} changing wallet from ${req.user.walletAddress} to ${walletAddress}`);
    }

    await req.user.update({ walletAddress });

    res.json({
      message: 'Wallet connected successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'WALLET_ALREADY_CONNECTED',
        message: 'This MetaMask wallet is already connected to another user account. Please disconnect it from the other account first or use a different wallet.'
      });
    }
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred while connecting your wallet. Please try again.'
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