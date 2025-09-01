const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/database');

const router = express.Router();

// Send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', replyToId } = req.body;

    // Validate input
    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    // Check if user is participant in this conversation
    const participant = await db.get(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
      [conversationId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Validate reply-to message if provided
    if (replyToId) {
      const replyToMessage = await db.get(
        'SELECT id FROM messages WHERE id = ? AND conversation_id = ?',
        [replyToId, conversationId]
      );

      if (!replyToMessage) {
        return res.status(400).json({ error: 'Reply-to message not found in this conversation' });
      }
    }

    // Insert the message
    const result = await db.run(
      'INSERT INTO messages (conversation_id, sender_id, content, message_type, reply_to_id) VALUES (?, ?, ?, ?, ?)',
      [conversationId, req.user.id, content, messageType, replyToId]
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

    res.status(201).json({ 
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Edit a message
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if user owns this message
    const message = await db.get(
      'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      [messageId, req.user.id]
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Update the message
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

    res.json({ 
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;

    // Check if user owns this message
    const message = await db.get(
      'SELECT * FROM messages WHERE id = ? AND sender_id = ? AND deleted_at IS NULL',
      [messageId, req.user.id]
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Soft delete the message
    await db.run(
      'UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [messageId]
    );

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add reaction to a message
router.post('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reaction } = req.body;

    if (!reaction) {
      return res.status(400).json({ error: 'Reaction is required' });
    }

    // Check if message exists and user has access
    const message = await db.get(`
      SELECT m.* FROM messages m
      INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = ? AND cp.user_id = ? AND cp.is_active = 1 AND m.deleted_at IS NULL
    `, [messageId, req.user.id]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Insert or update reaction
    await db.run(
      'INSERT OR REPLACE INTO message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)',
      [messageId, req.user.id, reaction]
    );

    // Get reaction counts for this message
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

    res.json({ 
      message: 'Reaction added successfully',
      reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction from a message
router.delete('/:id/reactions/:reaction', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const reaction = req.params.reaction;

    // Remove reaction
    const result = await db.run(
      'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND reaction = ?',
      [messageId, req.user.id, reaction]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    // Get updated reaction counts
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

    res.json({ 
      message: 'Reaction removed successfully',
      reactions
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Mark messages as read
router.post('/read', authenticateToken, async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    // Insert read status for each message
    const placeholders = messageIds.map(() => '(?, ?)').join(',');
    const values = messageIds.flatMap(id => [id, req.user.id]);

    await db.run(`
      INSERT OR IGNORE INTO message_read_status (message_id, user_id)
      VALUES ${placeholders}
    `, values);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, conversationId, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let sql = `
      SELECT 
        m.*,
        u.username,
        u.display_name,
        u.avatar_url,
        c.title as conversation_title,
        c.type as conversation_type
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      INNER JOIN conversations c ON m.conversation_id = c.id
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ? AND cp.is_active = 1 
        AND m.deleted_at IS NULL
        AND m.content LIKE ?
    `;
    
    const params = [req.user.id, `%${query}%`];

    if (conversationId) {
      sql += ' AND m.conversation_id = ?';
      params.push(conversationId);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const messages = await db.all(sql, params);

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

module.exports = router;