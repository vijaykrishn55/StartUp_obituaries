const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  failureReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FailureReport'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Domain Names',
      'Source Code',
      'Customer Database',
      'Social Media Accounts',
      'Physical Equipment',
      'Intellectual Property',
      'Brand Assets',
      'Marketing Materials',
      'Office Furniture',
      'Inventory',
      'Partnerships/Contracts',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true,
    minlength: 50
  },
  askingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalValue: {
    type: Number
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'As-Is'],
    default: 'Good'
  },
  images: [{
    type: String
  }],
  documents: [{
    name: String,
    url: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Sold', 'Withdrawn'],
    default: 'Available'
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  shippingAvailable: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  interested: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    offer: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldPrice: {
    type: Number
  },
  soldDate: {
    type: Date
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ seller: 1 });
assetSchema.index({ askingPrice: 1 });

module.exports = mongoose.model('Asset', assetSchema);
