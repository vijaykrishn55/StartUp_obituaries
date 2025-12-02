const mongoose = require('mongoose');

const warRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startupName: {
    type: String,
    required: true
  },
  situation: {
    type: String,
    required: true,
    enum: [
      'Running out of cash',
      'Losing key team members',
      'Product failure',
      'Legal issues',
      'Investor problems',
      'Market collapse',
      'Competition crisis',
      'Operational breakdown',
      'Customer churn',
      'Pivot decision',
      'Other crisis'
    ]
  },
  description: {
    type: String,
    required: true,
    minlength: 100
  },
  urgencyLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium'],
    default: 'High'
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Closed', 'Archived'],
    default: 'Active'
  },
  isLive: {
    type: Boolean,
    default: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['Mentor', 'Investor', 'Founder', 'Expert', 'Supporter'],
      default: 'Supporter'
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  maxParticipants: {
    type: Number,
    default: 50
  },
  messages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    type: {
      type: String,
      enum: ['chat', 'advice', 'question', 'resource', 'action'],
      default: 'chat'
    },
    isPinned: { type: Boolean, default: false },
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: String
    }],
    timestamp: { type: Date, default: Date.now }
  }],
  actionItems: [{
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  resources: [{
    title: String,
    url: String,
    type: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  polls: [{
    question: String,
    options: [String],
    votes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      option: Number
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  outcome: {
    decision: String,
    result: String,
    followUp: String
  },
  tags: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String
  },
  summary: {
    type: String
  },
  mentorNotes: [{
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    isPrivate: Boolean,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

warRoomSchema.index({ status: 1, scheduledTime: -1 });
warRoomSchema.index({ host: 1 });
warRoomSchema.index({ isLive: 1 });

module.exports = mongoose.model('WarRoom', warRoomSchema);
