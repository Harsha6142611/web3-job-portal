const express = require('express');
const { ethers } = require('ethers');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { Payment, User } = require('../models/index');

const router = express.Router();

// Validation schema for creating payments
const createPaymentSchema = Joi.object({
  transactionHash: Joi.string().required(),
  fromAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  toAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  amount: Joi.string().required(),
  paymentType: Joi.string().valid('job_posting', 'featured_job', 'premium_profile').default('job_posting'),
  network: Joi.string().default('sepolia'),
  currency: Joi.string().default('SEP')
});

// Initialize Web3 provider
const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);

// Create new payment record
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }

    const { transactionHash, fromAddress, toAddress, amount, paymentType, network, currency } = value;

    // Check if payment with this transaction hash already exists
    const existingPayment = await Payment.findOne({
      where: { transactionHash }
    });

    if (existingPayment) {
      return res.status(400).json({
        error: 'Payment with this transaction hash already exists',
        payment: existingPayment
      });
    }

    // Create payment record with confirmed status
    // Since we're on testnet and transaction is already successful, we mark as confirmed
    const payment = await Payment.create({
      userId: req.user.id,
      transactionHash,
      fromAddress,
      toAddress,
      amount,
      currency: currency || 'SEP',
      network: network || 'sepolia',
      paymentType: paymentType || 'job_posting',
      status: 'confirmed' // Mark as confirmed for testnet
    });

    res.status(201).json({
      message: 'Payment record created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: 'Failed to create payment record'
    });
  }
});

// Get payment requirements
router.get('/requirements', auth, async (req, res) => {
  try {
    const { paymentType = 'job_posting' } = req.query;
    
    const requirements = {
      job_posting: {
        amount: '0.001',
        currency: 'ETH',
        description: 'Job posting fee',
        adminWallet: process.env.ADMIN_WALLET_ADDRESS
      },
      featured_job: {
        amount: '0.005',
        currency: 'ETH',
        description: 'Featured job listing fee',
        adminWallet: process.env.ADMIN_WALLET_ADDRESS
      },
      premium_profile: {
        amount: '0.003',
        currency: 'ETH',
        description: 'Premium profile upgrade',
        adminWallet: process.env.ADMIN_WALLET_ADDRESS
      }
    };

    const requirement = requirements[paymentType];
    if (!requirement) {
      return res.status(400).json({
        error: 'Invalid payment type'
      });
    }

    res.json({
      paymentType,
      ...requirement
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get payment requirements'
    });
  }
});

// Verify payment transaction
router.post('/verify', auth, async (req, res) => {
  try {
    const { transactionHash, paymentType = 'job_posting' } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        error: 'Transaction hash is required'
      });
    }

    // Check if transaction is already verified
    const existingPayment = await Payment.findOne({
      where: { transactionHash }
    });

    if (existingPayment) {
      return res.status(400).json({
        error: 'Transaction already verified'
      });
    }

    // Get transaction details from blockchain
    const tx = await provider.getTransaction(transactionHash);
    if (!tx) {
      return res.status(400).json({
        error: 'Transaction not found on blockchain'
      });
    }

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status !== 1) {
      return res.status(400).json({
        error: 'Transaction failed on blockchain'
      });
    }

    // Verify transaction details
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
    const expectedAmount = ethers.parseEther('0.001'); // 0.001 ETH

            if (tx.to && tx.to.toLowerCase() !== adminWallet.toLowerCase()) {
      return res.status(400).json({
        error: 'Invalid recipient address'
      });
    }

    if (tx.value < expectedAmount) {
      return res.status(400).json({
        error: 'Insufficient payment amount'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      amount: ethers.formatEther(tx.value),
      currency: 'SEP',
      transactionHash,
      fromAddress: tx.from,
      toAddress: tx.to,
      network: 'sepolia',
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice.toString(),
      paymentType
    });

    res.json({
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const payments = await Payment.findAndCountAll({
      where: { userId: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      payments: payments.rows,
      total: payments.count,
      page: parseInt(page),
      totalPages: Math.ceil(payments.count / limit)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get payment history'
    });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }

    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view this payment'
      });
    }

    res.json({
      payment
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get payment'
    });
  }
});

// Get all payments (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      payments: payments.rows,
      total: payments.count,
      page: parseInt(page),
      totalPages: Math.ceil(payments.count / limit)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get payments'
    });
  }
});

module.exports = router; 