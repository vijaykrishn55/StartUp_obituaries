const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  userType: {
    type: String,
    enum: ['founder', 'investor', 'job-seeker', 'mentor', 'other'],
    required: true
  },
  avatar: {
    type: String,
    default: 'https://github.com/shadcn.png'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  company: String,
  location: String,
  verified: {
    type: Boolean,
    default: false
  },
  website: String,
  twitter: String,
  linkedIn: String,
  github: String,
  
  // Profile sections
  skills: [{
    name: String,
    endorsements: {
      type: Number,
      default: 0
    }
  }],
  
  experiences: [{
    title: String,
    company: String,
    period: String,
    description: String
  }],
  
  education: [{
    school: String,
    degree: String,
    period: String,
    details: String
  }],
  
  startupJourneys: [{
    name: String,
    status: {
      type: String,
      enum: ['active', 'acquired', 'closed']
    },
    role: String,
    period: String,
    description: String,
    metrics: mongoose.Schema.Types.Mixed,
    lesson: String,
    color: String
  }],
  
  achievements: [{
    title: String,
    year: String,
    icon: String
  }],
  
  // Analytics
  profileViews: {
    type: Number,
    default: 0
  },
  postImpressions: {
    type: Number,
    default: 0
  },
  
  // Reset password
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Refresh token
  refreshToken: String
}, {
  timestamps: true
});

// Indexes
userSchema.index({ userType: 1 });
userSchema.index({ location: 1 });
userSchema.index({ name: 'text', bio: 'text' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
