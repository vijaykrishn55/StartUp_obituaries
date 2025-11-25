const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Pitch data
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  founderName: {
    type: String,
    required: [true, 'Founder name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  website: String,
  industry: {
    type: String,
    enum: ['fintech', 'healthtech', 'edtech', 'saas', 'ecommerce', 'ai-ml', 'blockchain', 'other'],
    required: true
  },
  stage: {
    type: String,
    enum: ['idea', 'mvp', 'pre-seed', 'seed', 'series-a', 'series-b'],
    required: true
  },
  fundingGoal: {
    type: String,
    required: [true, 'Funding goal is required']
  },
  pitch: {
    type: String,
    required: [true, 'Pitch description is required'],
    minlength: 100
  },
  deckUrl: String,
  
  // Status
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'interested', 'passed'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Indexes
pitchSchema.index({ submittedBy: 1 });
pitchSchema.index({ industry: 1 });
pitchSchema.index({ stage: 1 });
pitchSchema.index({ status: 1 });
pitchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Pitch', pitchSchema);
