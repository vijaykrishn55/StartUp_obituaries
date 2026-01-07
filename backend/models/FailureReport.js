const mongoose = require('mongoose');

const failureReportSchema = new mongoose.Schema({
  startupName: {
    type: String,
    required: true,
    trim: true
  },
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Food & Beverage', 'Real Estate', 'Manufacturing', 'Entertainment', 'Other']
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  fundingRaised: {
    type: Number,
    default: 0
  },
  teamSize: {
    type: Number,
    required: true
  },
  operationalMonths: {
    type: Number,
    required: true
  },
  failureDate: {
    type: Date,
    required: true
  },
  primaryReason: {
    type: String,
    required: true,
    enum: [
      'Ran out of cash',
      'No market need',
      'Got outcompeted',
      'Pricing/Cost issues',
      'Poor product',
      'Business model failure',
      'Poor marketing',
      'Ignored customers',
      'Product mis-timed',
      'Lost focus',
      'Team/Investor issues',
      'Pivot gone wrong',
      'Legal challenges',
      'Other'
    ]
  },
  detailedAnalysis: {
    type: String,
    required: true,
    minlength: 100
  },
  lessonsLearned: [{
    type: String
  }],
  mistakes: [{
    type: String
  }],
  adviceForOthers: {
    type: String
  },
  burnRate: {
    type: Number // Monthly burn rate in USD
  },
  revenueAtClosure: {
    type: Number,
    default: 0
  },
  customerCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  anonymousPost: {
    type: Boolean,
    default: false
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
failureReportSchema.index({ 'location.coordinates': '2dsphere' });
failureReportSchema.index({ industry: 1, failureDate: -1 });
failureReportSchema.index({ primaryReason: 1 });

module.exports = mongoose.model('FailureReport', failureReportSchema);
