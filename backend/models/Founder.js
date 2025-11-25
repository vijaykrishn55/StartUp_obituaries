const mongoose = require('mongoose');

const founderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  bio: String,
  location: String,
  previousStartup: String,
  skills: [String],
  openToConnect: {
    type: Boolean,
    default: true
  },
  
  // Additional info
  avatar: String,
  linkedIn: String,
  twitter: String
}, {
  timestamps: true
});

// Indexes
founderSchema.index({ location: 1 });
founderSchema.index({ openToConnect: 1 });
founderSchema.index({ name: 'text', bio: 'text' });

module.exports = mongoose.model('Founder', founderSchema);
