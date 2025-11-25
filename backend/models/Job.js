const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    minlength: 5,
    maxlength: 100
  },
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  companyLogo: String,
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Co-founder', 'Internship'],
    required: true
  },
  salary: String,
  equity: String,
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: 100
  },
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    minlength: 50
  },
  tags: [String],
  isRemote: {
    type: Boolean,
    default: false
  },
  
  // Company info
  companyInfo: {
    size: String,
    founded: String,
    funding: String,
    website: String,
    about: String
  },
  benefits: [String],
  
  // Posted by
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: {
    type: Number,
    default: 0
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ isRemote: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
