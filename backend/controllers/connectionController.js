const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get user's connections
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    })
      .populate('requester', 'name avatar company userType bio')
      .populate('recipient', 'name avatar company userType bio')
      .sort({ updatedAt: -1 })
      .lean();

    // Format to return the other person in connection
    const formattedConnections = connections.map(conn => {
      const isRequester = conn.requester._id.toString() === req.user.id;
      return {
        _id: conn._id,
        user: isRequester ? conn.recipient : conn.requester,
        connectedAt: conn.updatedAt
      };
    });

    res.json({
      success: true,
      data: formattedConnections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending connection requests
// @route   GET /api/connections/requests
// @access  Private
exports.getConnectionRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      recipient: req.user.id,
      status: 'pending'
    })
      .populate('requester', 'name avatar company userType bio')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send connection request
// @route   POST /api/connections/request
// @access  Private
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;

    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Cannot send connection request to yourself' }
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(409).json({
          success: false,
          error: { code: 'ALREADY_CONNECTED', message: 'Already connected with this user' }
        });
      } else if (existingConnection.status === 'pending') {
        return res.status(409).json({
          success: false,
          error: { code: 'REQUEST_PENDING', message: 'Connection request already pending' }
        });
      }
    }

    const connection = await Connection.create({
      requester: req.user.id,
      recipient: recipientId,
      message: message || ''
    });

    // Create notification
    await Notification.create({
      recipient: recipientId,
      type: 'connection_request',
      actor: req.user.id,
      relatedEntity: { type: 'connection', id: connection._id },
      message: 'sent you a connection request'
    });

    const populatedConnection = await Connection.findById(connection._id)
      .populate('recipient', 'name avatar company userType');

    res.status(201).json({
      success: true,
      data: populatedConnection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept connection request
// @route   POST /api/connections/accept/:id
// @access  Private
exports.acceptConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONNECTION_NOT_FOUND', message: 'Connection request not found' }
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to accept this request' }
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'This request has already been processed' }
      });
    }

    connection.status = 'accepted';
    await connection.save();

    // Create notification for requester
    await Notification.create({
      recipient: connection.requester,
      type: 'connection_accepted',
      actor: req.user.id,
      relatedEntity: { type: 'connection', id: connection._id },
      message: 'accepted your connection request'
    });

    const populatedConnection = await Connection.findById(connection._id)
      .populate('requester', 'name avatar company userType')
      .populate('recipient', 'name avatar company userType');

    res.json({
      success: true,
      data: populatedConnection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject connection request
// @route   POST /api/connections/reject/:id
// @access  Private
exports.rejectConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONNECTION_NOT_FOUND', message: 'Connection request not found' }
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to reject this request' }
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'This request has already been processed' }
      });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request rejected'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:id
// @access  Private
exports.removeConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: { code: 'CONNECTION_NOT_FOUND', message: 'Connection not found' }
      });
    }

    // Check if user is part of the connection
    const isRequester = connection.requester.toString() === req.user.id;
    const isRecipient = connection.recipient.toString() === req.user.id;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to remove this connection' }
      });
    }

    await connection.deleteOne();

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get connection suggestions
// @route   GET /api/connections/suggestions
// @access  Private
exports.getConnectionSuggestions = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's existing connections
    const existingConnections = await Connection.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ]
    }).select('requester recipient');

    const connectedUserIds = existingConnections.map(conn => {
      return conn.requester.toString() === req.user.id 
        ? conn.recipient.toString() 
        : conn.requester.toString();
    });

    // Get current user data
    const currentUser = await User.findById(req.user.id);

    // Find suggested users (exclude self and existing connections)
    const suggestions = await User.find({
      _id: { 
        $nin: [...connectedUserIds, req.user.id] 
      }
    })
      .select('name avatar company userType bio location skills')
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mutual connections with another user
// @route   GET /api/connections/mutual/:userId
// @access  Private
exports.getMutualConnections = async (req, res, next) => {
  try {
    // Get current user's connections
    const myConnections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    });

    const myConnectionIds = myConnections.map(conn => {
      return conn.requester.toString() === req.user.id 
        ? conn.recipient.toString() 
        : conn.requester.toString();
    });

    // Get other user's connections
    const theirConnections = await Connection.find({
      $or: [
        { requester: req.params.userId, status: 'accepted' },
        { recipient: req.params.userId, status: 'accepted' }
      ]
    });

    const theirConnectionIds = theirConnections.map(conn => {
      return conn.requester.toString() === req.params.userId 
        ? conn.recipient.toString() 
        : conn.requester.toString();
    });

    // Find mutual connection IDs
    const mutualIds = myConnectionIds.filter(id => theirConnectionIds.includes(id));

    // Get user details
    const mutualConnections = await User.find({
      _id: { $in: mutualIds }
    }).select('name avatar company userType').lean();

    res.json({
      success: true,
      data: mutualConnections,
      count: mutualConnections.length
    });
  } catch (error) {
    next(error);
  }
};
