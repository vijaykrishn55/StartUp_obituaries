const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application data
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: String,
  linkedIn: String,
  portfolio: String,
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    minlength: 100
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['submitted', 'reviewing', 'interview', 'rejected', 'accepted'],
    default: 'submitted'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
