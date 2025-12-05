const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar userType')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Format conversations to show other participant
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user.id
      );
      
      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount[req.user.id] || 0,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation messages
// @route   GET /api/messages/conversations/:id
// @access  Private
exports.getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found' }
      });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to view this conversation' }
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Message.countDocuments({ conversation: req.params.id });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        read: false
      },
      { read: true }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start new conversation or get existing
// @route   POST /api/messages/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (participantId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Cannot create conversation with yourself' }
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] }
    })
      .populate('participants', 'name avatar userType')
      .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [req.user.id, participantId],
        unreadCount: {
          [req.user.id]: 0,
          [participantId]: 0
        }
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar userType');
    }

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message in conversation
// @route   POST /api/messages/conversations/:id
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found' }
      });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to send messages in this conversation' }
      });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content: req.body.content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    
    // Increment unread count for other participant
    const otherParticipantId = conversation.participants.find(
      p => p.toString() !== req.user.id
    ).toString();
    
    const currentUnread = conversation.unreadCount.get(otherParticipantId) || 0;
    conversation.unreadCount.set(otherParticipantId, currentUnread + 1);
    
    await conversation.save();

    // Create notification for other participant
    await Notification.create({
      recipient: otherParticipantId,
      type: 'message',
      actor: req.user.id,
      relatedEntity: { type: 'message', id: message._id },
      message: 'sent you a message'
    });

    // Emit socket event for real-time messaging
    try {
      const io = req.app.get('socketio');
      if (io) {
        io.to(otherParticipantId).emit('new_message', {
          conversationId: conversation._id.toString(),
          message: populatedMessage
        });
      }
    } catch (e) {
      // Non-fatal if socket unavailable
      console.warn('Socket emit failed:', e?.message || e);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markMessageAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' }
      });
    }

    // Check if user is the recipient (not the sender)
    if (message.sender.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Cannot mark own message as read' }
      });
    }

    message.read = true;
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation as read (clear unread for current user)
// @route   PUT /api/messages/conversations/:id/read
// @access  Private
exports.markConversationAsRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found' }
      });
    }

    // User must be a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    // Mark all messages from other participant as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { read: true }
    );

    // Reset unread counter for user
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id or DELETE /api/messages/conversations/:id/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.messageId || req.params.id;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' }
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this message' }
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
