const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage } = require('../utils/validation');

const router = express.Router();

// GET /api/messages/:connectionId - Get message history for a connection
router.get('/messages/:connectionId', authenticateToken, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if connection exists and user is part of it
    const [connections] = await pool.execute(
      `SELECT id, sender_user_id, receiver_user_id, status 
       FROM Connections 
       WHERE id = ? AND (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
      [connectionId, req.user.id, req.user.id]
    );

    if (connections.length === 0) {
      return res.status(404).json({ error: 'Connection not found or not accepted' });
    }

    // Get messages
    const [messages] = await pool.execute(
      `SELECT m.id, m.content, m.is_read, m.created_at,
              u.id as sender_id, u.username, u.first_name, u.last_name
       FROM Messages m
       JOIN Users u ON m.sender_user_id = u.id
       WHERE m.connection_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [connectionId, parseInt(limit), parseInt(offset)]
    );

    // Mark messages as read if they were sent to the current user
    const connection = connections[0];
    const otherUserId = connection.sender_user_id === req.user.id ? 
                       connection.receiver_user_id : connection.sender_user_id;

    await pool.execute(
      `UPDATE Messages 
       SET is_read = TRUE 
       WHERE connection_id = ? AND sender_user_id = ? AND is_read = FALSE`,
      [connectionId, otherUserId]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM Messages WHERE connection_id = ?',
      [connectionId]
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < countResult[0].total
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/messages - Send a message
router.post('/messages', authenticateToken, validateMessage, async (req, res) => {
  try {
    const { connection_id, content } = req.body;

    // Check if connection exists and user is part of it
    const [connections] = await pool.execute(
      `SELECT id, sender_user_id, receiver_user_id, status 
       FROM Connections 
       WHERE id = ? AND (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
      [connection_id, req.user.id, req.user.id]
    );

    if (connections.length === 0) {
      return res.status(404).json({ error: 'Connection not found or not accepted' });
    }

    // Send message
    const [result] = await pool.execute(
      'INSERT INTO Messages (connection_id, sender_user_id, content) VALUES (?, ?, ?)',
      [connection_id, req.user.id, content]
    );

    // Get the created message with sender info
    const [newMessage] = await pool.execute(
      `SELECT m.id, m.content, m.is_read, m.created_at,
              u.id as sender_id, u.username, u.first_name, u.last_name
       FROM Messages m
       JOIN Users u ON m.sender_user_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: newMessage[0]
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
