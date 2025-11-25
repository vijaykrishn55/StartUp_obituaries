const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    minlength: 10,
    maxlength: 150
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: [true, 'Story content is required'],
    minlength: 200
  },
  author: {
    name: String,
    role: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  readTime: {
    type: Number,
    default: 5
  },
  category: {
    type: String,
    enum: ['Product', 'Career', 'Leadership', 'Finance', 'Marketing', 'Other']
  },
  coverImage: String,
  tags: [String],
  trending: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Status
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
storySchema.index({ category: 1 });
storySchema.index({ trending: 1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Story', storySchema);
