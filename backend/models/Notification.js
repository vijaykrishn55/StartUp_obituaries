const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'message',
      'post_like',
      'post_comment',
      'job_application',
      'mention'
    ],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['post', 'comment', 'job', 'message', 'connection']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  message: String,
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
