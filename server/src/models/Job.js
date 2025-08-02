const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  budgetType: {
    type: DataTypes.ENUM('hourly', 'fixed', 'negotiable'),
    defaultValue: 'negotiable'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRemote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance'),
    defaultValue: 'contract'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'intermediate', 'senior', 'expert'),
    defaultValue: 'intermediate'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  paymentVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  transactionHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  blockchainNetwork: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['jobType']
    },
    {
      fields: ['location']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Job; 