const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'SEP' // Sepolia ETH
  },
  transactionHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fromAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  toAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  network: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'sepolia'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gasUsed: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gasPrice: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentType: {
    type: DataTypes.ENUM('job_posting', 'featured_job', 'premium_profile'),
    defaultValue: 'job_posting'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      fields: ['transactionHash']
    },
    {
      fields: ['status']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Payment; 