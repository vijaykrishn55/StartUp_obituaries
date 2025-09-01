const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage } = require('../utils/validation');

const router = express.Router();

// GET /api/messages/:conversationId - Get message history for a conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    console.log(`Fetching messages for conversationId: ${conversationId}, userId: ${req.user.id}`);

    // Check if conversation exists and user has access through connection
    const [conversations] = await pool.execute(
      `SELECT c.id, c.connection_id, conn.sender_user_id, conn.receiver_user_id, conn.status 
       FROM conversations c
       JOIN connections conn ON c.connection_id = conn.id
       WHERE c.id = ? AND (conn.sender_user_id = ? OR conn.receiver_user_id = ?) AND conn.status = 'accepted'`,
      [conversationId, req.user.id, req.user.id]
    );

    console.log(`Found conversations:`, conversations);

    if (conversations.length === 0) {
      console.log(`No accessible conversation found for conversationId: ${conversationId}, userId: ${req.user.id}`);
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Get messages with sender info and read status
    const [messages] = await pool.execute(
      `SELECT m.id, m.content, m.message_type, m.reply_to_id, m.created_at, m.edited_at, 
              m.sender_id as sender_user_id, m.sender_id,
              u.id as sender_id_user, u.username, u.first_name, u.last_name,
              (SELECT COUNT(*) FROM messagereadstatus mrs WHERE mrs.message_id = m.id AND mrs.user_id = ?) as is_read_by_user,
              rm.content as reply_content, ru.first_name as reply_sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN messages rm ON m.reply_to_id = rm.id
       LEFT JOIN users ru ON rm.sender_id = ru.id
       WHERE m.conversation_id = ? AND m.deleted_at IS NULL
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [req.user.id, conversationId, parseInt(limit), parseInt(offset)]
    );

    // Mark unread messages as read for current user
    const unreadMessageIds = messages
      .filter(msg => msg.sender_id !== req.user.id && !msg.is_read_by_user)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      const placeholders = unreadMessageIds.map(() => '(?, ?)').join(',');
      const values = unreadMessageIds.flatMap(id => [id, req.user.id]);
      
      await pool.execute(
        `INSERT IGNORE INTO messagereadstatus (message_id, user_id) VALUES ${placeholders}`,
        values
      );
    }

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ? AND deleted_at IS NULL',
      [conversationId]
    );

    // Get message reactions for each message
    for (let message of messages) {
      const [reactions] = await pool.execute(
        `SELECT reaction, COUNT(*) as count,
                GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as users
         FROM messagereactions mr
         JOIN users u ON mr.user_id = u.id
         WHERE mr.message_id = ?
         GROUP BY reaction`,
        [message.id]
      );
      message.reactions = reactions;
    }

    res.json({
      messages: messages, // Keep chronological order
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

// PUT /api/messages/:messageId - Edit a message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if user owns this message
    const [messages] = await pool.execute(
      'SELECT id, conversation_id FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      [messageId, req.user.id]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Update the message
    await pool.execute(
      'UPDATE messages SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content.trim(), messageId]
    );

    res.json({ message: 'Message updated successfully' });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// DELETE /api/messages/:messageId - Soft delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Check if user owns this message
    const [messages] = await pool.execute(
      'SELECT id, conversation_id FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      [messageId, req.user.id]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Soft delete the message
    await pool.execute(
      'UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [messageId]
    );

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/messages/:messageId/reactions - Add reaction to message
router.post('/:messageId/reactions', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;

    if (!reaction) {
      return res.status(400).json({ error: 'Reaction is required' });
    }

    // Check if message exists and user has access
    const [messages] = await pool.execute(
      `SELECT m.id, m.sender_id FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       JOIN connections conn ON c.connection_id = conn.id
       WHERE m.id = ? AND (conn.sender_user_id = ? OR conn.receiver_user_id = ?) 
       AND conn.status = 'accepted' AND m.deleted_at IS NULL`,
      [messageId, req.user.id, req.user.id]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Check if user is trying to react to their own message
    if (messages[0].sender_id === req.user.id) {
      return res.status(403).json({ error: 'You cannot react to your own messages' });
    }

    // Check if user already reacted with this emoji
    const [existingReactions] = await pool.execute(
      'SELECT id FROM messagereactions WHERE message_id = ? AND user_id = ? AND reaction = ?',
      [messageId, req.user.id, reaction]
    );

    if (existingReactions.length > 0) {
      return res.status(409).json({ error: 'You have already reacted with this emoji' });
    }

    // Add reaction (no ON DUPLICATE KEY UPDATE - prevent overriding)
    await pool.execute(
      'INSERT INTO messagereactions (message_id, user_id, reaction) VALUES (?, ?, ?)',
      [messageId, req.user.id, reaction]
    );

    // Get updated reactions for this message
    const [reactions] = await pool.execute(
      `SELECT reaction, COUNT(*) as count,
              GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as users
       FROM messagereactions mr
       JOIN users u ON mr.user_id = u.id
       WHERE mr.message_id = ?
       GROUP BY reaction`,
      [messageId]
    );

    res.json({ 
      message: 'Reaction added successfully',
      reactions
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// DELETE /api/messages/:messageId/reactions/:reaction - Remove reaction
router.delete('/:messageId/reactions/:reaction', authenticateToken, async (req, res) => {
  try {
    const { messageId, reaction } = req.params;

    // Remove reaction
    const [result] = await pool.execute(
      'DELETE FROM messagereactions WHERE message_id = ? AND user_id = ? AND reaction = ?',
      [messageId, req.user.id, reaction]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    res.json({ message: 'Reaction removed successfully' });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// POST /api/messages - Deprecated: Use Socket.IO for sending messages
router.post('/', authenticateToken, (req, res) => {
  res.status(400).json({ 
    error: 'Message sending via REST API is deprecated. Use Socket.IO real-time messaging instead.',
    socketEvent: 'send_message',
    socketData: { conversationId: 'number', content: 'string' }
  });
});

module.exports = router;
