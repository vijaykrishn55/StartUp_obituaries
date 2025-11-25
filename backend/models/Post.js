const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['postmortem', 'funding', 'job', 'insight', 'question', 'pitch'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: 10,
    maxlength: 200
  },
  subtitle: String,
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: 50
  },
  coverImage: String,
  tags: [{
    type: String,
    maxlength: 30
  }],
  
  // Type-specific fields
  // For postmortem
  companyName: String,
  foundedYear: String,
  closedYear: String,
  totalFunding: String,
  
  // For funding
  fundingAmount: String,
  fundingStage: String,
  investors: String,
  
  // For job
  jobTitle: String,
  jobType: String,
  location: String,
  salary: String,
  equity: String,
  
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Poll (optional)
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    multipleChoice: {
      type: Boolean,
      default: false
    },
    endsAt: Date
  },
  
  // Status
  published: {
    type: Boolean,
    default: true
  },
  trending: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ type: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ trending: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Calculate trending score
postSchema.methods.calculateTrendingScore = function() {
  const score = (this.likes.length * 2) + (this.comments.length * 3) + (this.shares * 4) + this.views;
  const hoursOld = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const timeDecay = 1 / (hoursOld + 1);
  return score * timeDecay;
};

module.exports = mongoose.model('Post', postSchema);
