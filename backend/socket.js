const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/database');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user info from database
      const [users] = await pool.execute(
        'SELECT id, username, first_name, last_name, user_role FROM Users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = users[0];
      
      // Update user status to online
      await pool.execute(
        'UPDATE Users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
        ['online', socket.userId]
      );
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Get user's conversations and join conversation rooms
    try {
      const [conversations] = await pool.execute(
        `SELECT DISTINCT c.id 
         FROM Conversations c
         WHERE c.user1_id = ? OR c.user2_id = ?`,
        [socket.userId, socket.userId]
      );

      // Join conversation rooms
      conversations.forEach(conversation => {
        socket.join(`conversation_${conversation.id}`);
      });

      console.log(`User ${socket.user.username} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      console.error('Error setting up conversation rooms:', error);
    }

    // Handle joining a specific conversation
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify user has access to this conversation
        const [conversations] = await pool.execute(
          `SELECT c.id FROM Conversations c
           WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)`,
          [conversationId, socket.userId, socket.userId]
        );

        if (conversations.length > 0) {
          socket.join(`conversation_${conversationId}`);
          console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
          
          // Notify others in conversation about user joining
          socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
            userId: socket.userId,
            username: socket.user.username,
            conversationId
          });
        } else {
          socket.emit('error', { message: 'Access denied to conversation' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', replyToId } = data;

        if (!conversationId || !content?.trim()) {
          socket.emit('error', { message: 'Conversation ID and content are required' });
          return;
        }

        // Verify user has access to this conversation
        const [conversations] = await pool.execute(
          `SELECT c.id, c.user1_id, c.user2_id FROM Conversations c
           WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)`,
          [conversationId, socket.userId, socket.userId]
        );

        if (conversations.length === 0) {
          socket.emit('error', { message: 'Access denied to conversation' });
          return;
        }

        // Validate reply-to message if provided
        if (replyToId) {
          const [replymessages] = await pool.execute(
            'SELECT id FROM Messages WHERE id = ? AND conversation_id = ? AND deleted_at IS NULL',
            [replyToId, conversationId]
          );

          if (replymessages.length === 0) {
            socket.emit('error', { message: 'Reply-to message not found' });
            return;
          }
        }

        // Insert message into database
        const [result] = await pool.execute(
          'INSERT INTO Messages (conversation_id, sender_id, content, message_type, reply_to_id) VALUES (?, ?, ?, ?, ?)',
          [conversationId, socket.userId, content.trim(), messageType, replyToId]
        );

        // Update conversation last_message_at
        await pool.execute(
          'UPDATE Conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );

        // Get the created message with sender info
        const [messages] = await pool.execute(
          `SELECT m.id, m.content, m.message_type, m.reply_to_id, m.created_at, m.sender_id,
                  u.username, u.first_name, u.last_name,
                  rm.content as reply_content, ru.first_name as reply_sender_name
           FROM Messages m
           JOIN Users u ON m.sender_id = u.id
           LEFT JOIN Messages rm ON m.reply_to_id = rm.id
           LEFT JOIN Users ru ON rm.sender_id = ru.id
           WHERE m.id = ?`,
          [result.insertId]
        );

        const message = messages[0];

        // Emit to all users in the conversation
        io.to(`conversation_${conversationId}`).emit('new_message', {
          message,
          conversationId
        });

        // Send notification to other user(s) not currently in the conversation
        const conversation = conversations[0];
        const otherUserId = conversation.user1_id === socket.userId 
          ? conversation.user2_id 
          : conversation.user1_id;

        io.to(`user_${otherUserId}`).emit('message_notification', {
          conversationId,
          sender: `${socket.user.first_name} ${socket.user.last_name}`,
          preview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          messageId: message.id
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message editing
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, content } = data;

        if (!content?.trim()) {
          socket.emit('error', { message: 'Content is required' });
          return;
        }

        // Check if user owns the message
        const [messages] = await pool.execute(
          'SELECT conversation_id FROM Messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
          [messageId, socket.userId]
        );

        if (messages.length === 0) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Update message
        await pool.execute(
          'UPDATE Messages SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
          [content.trim(), messageId]
        );

        // Emit to conversation
        io.to(`conversation_${messages[0].conversation_id}`).emit('message_edited', {
          messageId,
          content: content.trim(),
          editedAt: new Date()
        });

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;

        // Check if user owns the message
        const [messages] = await pool.execute(
          'SELECT conversation_id FROM Messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
          [messageId, socket.userId]
        );

        if (messages.length === 0) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Soft delete message
        await pool.execute(
          'UPDATE Messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
          [messageId]
        );

        // Emit to conversation
        io.to(`conversation_${messages[0].conversation_id}`).emit('message_deleted', {
          messageId
        });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: `${socket.user.first_name} ${socket.user.last_name}`,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: `${socket.user.first_name} ${socket.user.last_name}`,
        conversationId,
        isTyping: false
      });
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId } = data;

        // Get unread messages in this conversation sent by others
        const [unreadmessages] = await pool.execute(
          `SELECT m.id FROM Messages m
           LEFT JOIN MessageReadStatus mrs ON m.id = mrs.message_id AND mrs.user_id = ?
           WHERE m.conversation_id = ? AND m.sender_id != ? AND m.deleted_at IS NULL AND mrs.id IS NULL`,
          [socket.userId, conversationId, socket.userId]
        );

        if (unreadmessages.length > 0) {
          const messageIds = unreadmessages.map(msg => msg.id);
          const placeholders = messageIds.map(() => '(?, ?)').join(',');
          const values = messageIds.flatMap(id => [id, socket.userId]);

          await pool.execute(
            `INSERT IGNORE INTO MessageReadStatus (message_id, user_id) VALUES ${placeholders}`,
            values
          );

          socket.to(`conversation_${conversationId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId,
            messageIds
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, reaction } = data;

        // Check if message exists and user has access
        const [messages] = await pool.execute(
          `SELECT m.conversation_id, m.sender_id FROM Messages m
           JOIN Conversations c ON m.conversation_id = c.id
           WHERE m.id = ? AND (c.user1_id = ? OR c.user2_id = ?) 
           AND m.deleted_at IS NULL`,
          [messageId, socket.userId, socket.userId]
        );

        if (messages.length === 0) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        // Check if user is trying to react to their own message
        if (messages[0].sender_id === socket.userId) {
          socket.emit('error', { message: 'You cannot react to your own messages' });
          return;
        }

        // Check if user already reacted with this emoji
        const [existingReactions] = await pool.execute(
          'SELECT id FROM MessageReactions WHERE message_id = ? AND user_id = ? AND reaction = ?',
          [messageId, socket.userId, reaction]
        );

        if (existingReactions.length > 0) {
          socket.emit('error', { message: 'You have already reacted with this emoji' });
          return;
        }

        // Add reaction (no duplicate update)
        await pool.execute(
          'INSERT INTO MessageReactions (message_id, user_id, reaction) VALUES (?, ?, ?)',
          [messageId, socket.userId, reaction]
        );

        // Get updated reactions
        const [reactions] = await pool.execute(
          `SELECT reaction, COUNT(*) as count,
                  GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as users
           FROM MessageReactions mr
           JOIN Users u ON mr.user_id = u.id
           WHERE mr.message_id = ?
           GROUP BY reaction`,
          [messageId]
        );

        // Emit to conversation
        io.to(`conversation_${messages[0].conversation_id}`).emit('message_reaction_updated', {
          messageId,
          reactions
        });

      } catch (error) {
        console.error('Error adding reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Update user status to offline
      try {
        await pool.execute(
          'UPDATE Users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
          ['offline', socket.userId]
        );
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
