const User = require('./User');
const Job = require('./Job');
const Payment = require('./Payment');
const Resume = require('./Resume');

// User associations
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });

// Job associations
Job.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Job.hasOne(Payment, { foreignKey: 'jobId', as: 'payment' });

// Payment associations
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Resume associations
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Job,
  Payment,
  Resume
}; 