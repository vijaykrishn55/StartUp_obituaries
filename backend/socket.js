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
        'SELECT id, username, user_role FROM Users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = users[0];
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining connection rooms for messaging
    socket.on('join_connection', async (connectionId) => {
      try {
        // Verify user is part of this connection
        const [connections] = await pool.execute(
          `SELECT id FROM Connections 
           WHERE id = ? AND (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
          [connectionId, socket.userId, socket.userId]
        );

        if (connections.length > 0) {
          socket.join(`connection_${connectionId}`);
          console.log(`User ${socket.user.username} joined connection ${connectionId}`);
        }
      } catch (error) {
        console.error('Error joining connection:', error);
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { connectionId, content } = data;

        // Verify user is part of this connection
        const [connections] = await pool.execute(
          `SELECT sender_user_id, receiver_user_id FROM Connections 
           WHERE id = ? AND (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
          [connectionId, socket.userId, socket.userId]
        );

        if (connections.length === 0) {
          socket.emit('error', { message: 'Unauthorized to send message in this connection' });
          return;
        }

        // Save message to database
        const [result] = await pool.execute(
          'INSERT INTO Messages (connection_id, sender_user_id, content) VALUES (?, ?, ?)',
          [connectionId, socket.userId, content]
        );

        // Get the saved message with user info
        const [messages] = await pool.execute(
          `SELECT m.id, m.content, m.created_at, m.is_read,
                  u.username, u.first_name, u.last_name
           FROM Messages m
           JOIN Users u ON m.sender_user_id = u.id
           WHERE m.id = ?`,
          [result.insertId]
        );

        const message = {
          ...messages[0],
          sender_user_id: socket.userId
        };

        // Emit to all users in the connection room
        io.to(`connection_${connectionId}`).emit('new_message', message);

        // Send notification to the other user
        const connection = connections[0];
        const otherUserId = connection.sender_user_id === socket.userId 
          ? connection.receiver_user_id 
          : connection.sender_user_id;

        io.to(`user_${otherUserId}`).emit('message_notification', {
          connectionId,
          sender: socket.user.username,
          preview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (connectionId) => {
      socket.to(`connection_${connectionId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', (connectionId) => {
      socket.to(`connection_${connectionId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (connectionId) => {
      try {
        await pool.execute(
          `UPDATE Messages SET is_read = TRUE 
           WHERE connection_id = ? AND sender_user_id != ? AND is_read = FALSE`,
          [connectionId, socket.userId]
        );

        socket.to(`connection_${connectionId}`).emit('messages_read', {
          connectionId,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
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
