const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user by ID (public profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user'
    });
  }
});

// Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.rows.map(user => user.toJSON()),
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get users'
    });
  }
});

// Update user (admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { isActive, isVerified, role } = req.body;
    
    await user.update({
      isActive: isActive !== undefined ? isActive : user.isActive,
      isVerified: isVerified !== undefined ? isVerified : user.isVerified,
      role: role || user.role
    });

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete user'
    });
  }
});

module.exports = router; 