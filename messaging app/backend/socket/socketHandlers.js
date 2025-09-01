const jwt = require('jsonwebtoken');
const db = require('../database/database');

// Store connected users
const connectedUsers = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await db.get(
      'SELECT id, username, email, display_name, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Main socket handler
const handleConnection = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected (${socket.id})`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Update user status to online
    await db.run(
      'UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
      ['online', socket.userId]
    );

    // Get user's conversations and join rooms
    try {
      const conversations = await db.all(`
        SELECT DISTINCT c.id 
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ? AND cp.is_active = 1
      `, [socket.userId]);

      // Join conversation rooms
      conversations.forEach(conversation => {
        socket.join(`conversation_${conversation.id}`);
      });

      // Notify others about user coming online
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        username: socket.user.username,
        status: 'online'
      });
    } catch (error) {
      console.error('Error setting up user connections:', error);
    }

    // Handle joining a specific conversation
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;

        // Verify user is participant
        const participant = await db.get(
          'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
          [conversationId, socket.userId]
        );

        if (participant) {
          socket.join(`conversation_${conversationId}`);
          
          // Notify others in conversation
          socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
            userId: socket.userId,
            username: socket.user.username,
            conversationId
          });

          socket.emit('joined_conversation', { conversationId });
        } else {
          socket.emit('error', { message: 'Access denied to conversation' });
        }
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving a conversation
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);
      
      // Notify others in conversation
      socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
        userId: socket.userId,
        username: socket.user.username,
        conversationId
      });
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', replyToId } = data;

        // Verify user is participant
        const participant = await db.get(
          'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
          [conversationId, socket.userId]
        );

        if (!participant) {
          socket.emit('error', { message: 'Access denied to conversation' });
          return;
        }

        // Validate reply-to message if provided
        if (replyToId) {
          const replyToMessage = await db.get(
            'SELECT id FROM messages WHERE id = ? AND conversation_id = ?',
            [replyToId, conversationId]
          );

          if (!replyToMessage) {
            socket.emit('error', { message: 'Reply-to message not found' });
            return;
          }
        }

        // Insert message into database
        const result = await db.run(
          'INSERT INTO messages (conversation_id, sender_id, content, message_type, reply_to_id) VALUES (?, ?, ?, ?, ?)',
          [conversationId, socket.userId, content, messageType, replyToId]
        );

        // Get the created message with sender info
        const message = await db.get(`
          SELECT 
            m.*,
            u.username,
            u.display_name,
            u.avatar_url
          FROM messages m
          INNER JOIN users u ON m.sender_id = u.id
          WHERE m.id = ?
        `, [result.id]);

        // Get reply-to message info if applicable
        if (replyToId) {
          const replyToMessage = await db.get(`
            SELECT 
              m.content,
              u.display_name as sender_name
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
          `, [replyToId]);
          
          message.reply_to = replyToMessage;
        }

        // Emit to all users in the conversation
        io.to(`conversation_${conversationId}`).emit('new_message', {
          message,
          conversationId
        });

        // Update conversation's last message timestamp
        await db.run(
          'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        conversationId,
        isTyping: false
      });
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, reaction } = data;

        // Check if message exists and user has access
        const message = await db.get(`
          SELECT m.*, c.id as conversation_id FROM messages m
          INNER JOIN conversations c ON m.conversation_id = c.id
          INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
          WHERE m.id = ? AND cp.user_id = ? AND cp.is_active = 1 AND m.deleted_at IS NULL
        `, [messageId, socket.userId]);

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Add reaction
        await db.run(
          'INSERT OR REPLACE INTO message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)',
          [messageId, socket.userId, reaction]
        );

        // Get updated reactions
        const reactions = await db.all(`
          SELECT 
            reaction,
            COUNT(*) as count,
            GROUP_CONCAT(u.display_name) as users
          FROM message_reactions mr
          INNER JOIN users u ON mr.user_id = u.id
          WHERE mr.message_id = ?
          GROUP BY reaction
        `, [messageId]);

        // Emit to conversation
        io.to(`conversation_${message.conversation_id}`).emit('message_reaction_updated', {
          messageId,
          reactions
        });

      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle message editing
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, content } = data;

        // Check if user owns the message
        const message = await db.get(
          'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
          [messageId, socket.userId]
        );

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Update message
        await db.run(
          'UPDATE messages SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
          [content, messageId]
        );

        // Get updated message
        const updatedMessage = await db.get(`
          SELECT 
            m.*,
            u.username,
            u.display_name,
            u.avatar_url
          FROM messages m
          INNER JOIN users u ON m.sender_id = u.id
          WHERE m.id = ?
        `, [messageId]);

        // Emit to conversation
        io.to(`conversation_${message.conversation_id}`).emit('message_edited', {
          message: updatedMessage
        });

      } catch (error) {
        console.error('Edit message error:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;

        // Check if user owns the message
        const message = await db.get(
          'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
          [messageId, socket.userId]
        );

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Soft delete message
        await db.run(
          'UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
          [messageId]
        );

        // Emit to conversation
        io.to(`conversation_${message.conversation_id}`).emit('message_deleted', {
          messageId
        });

      } catch (error) {
        console.error('Delete message error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected (${socket.id})`);

      // Remove from connected users
      connectedUsers.delete(socket.userId);
      socketUsers.delete(socket.id);

      // Update user status to offline
      try {
        await db.run(
          'UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
          ['offline', socket.userId]
        );

        // Notify others about user going offline
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          username: socket.user.username,
          status: 'offline'
        });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });
  });
};

module.exports = handleConnection;