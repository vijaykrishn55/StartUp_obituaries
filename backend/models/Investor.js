const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Venture Capital', 'Angel Group', 'Angel Network', 'Micro VC', 'Growth Equity'],
    required: true
  },
  focus: String,
  stage: String,
  checkSize: String,
  location: String,
  description: String,
  
  // Contact
  website: String,
  email: String,
  
  // Portfolio
  investments: [{
    company: String,
    amount: String,
    year: String
  }]
}, {
  timestamps: true
});

// Indexes
investorSchema.index({ type: 1 });
investorSchema.index({ stage: 1 });
investorSchema.index({ location: 1 });
investorSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Investor', investorSchema);
