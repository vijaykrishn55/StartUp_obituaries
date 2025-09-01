const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations - Get all conversations for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`Fetching conversations for userId: ${req.user.id}`);

    // Get conversations based on accepted connections
    const [conversations] = await pool.execute(
      `SELECT c.id as conversation_id, c.created_at as conversation_created,
              c.last_message_at, conn.id as connection_id,
              conn.sender_user_id, conn.receiver_user_id,
              -- Get other user details
              CASE 
                WHEN conn.sender_user_id = ? THEN conn.receiver_user_id
                ELSE conn.sender_user_id
              END as other_user_id,
              CASE 
                WHEN conn.sender_user_id = ? THEN CONCAT(ru.first_name, ' ', ru.last_name)
                ELSE CONCAT(su.first_name, ' ', su.last_name)
              END as other_user_name,
              CASE 
                WHEN conn.sender_user_id = ? THEN ru.username
                ELSE su.username
              END as other_username,
              CASE 
                WHEN conn.sender_user_id = ? THEN ru.status
                ELSE su.status
              END as other_user_status,
              -- Get last message
              (SELECT content FROM messages m 
               WHERE m.conversation_id = c.id AND m.deleted_at IS NULL 
               ORDER BY m.created_at DESC LIMIT 1) as last_message,
              -- Get unread count
              (SELECT COUNT(*) FROM messages m
               LEFT JOIN MessageReadStatus mrs ON m.id = mrs.message_id AND mrs.user_id = ?
               WHERE m.conversation_id = c.id AND m.sender_id != ? 
               AND m.deleted_at IS NULL AND mrs.id IS NULL) as unread_count
       FROM conversations c
       JOIN connections conn ON c.connection_id = conn.id
       JOIN users su ON conn.sender_user_id = su.id
       JOIN users ru ON conn.receiver_user_id = ru.id
       WHERE (conn.sender_user_id = ? OR conn.receiver_user_id = ?) 
       AND conn.status = 'accepted'
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    console.log(`Found ${conversations.length} conversations`);

    // Format conversations for frontend
    const formattedconversations = conversations.map(conv => ({
      id: conv.conversation_id,
      connection_id: conv.connection_id,
      type: 'direct',
      title: conv.other_user_name,
      other_user: {
        id: conv.other_user_id,
        name: conv.other_user_name,
        username: conv.other_username,
        status: conv.other_user_status
      },
      last_message: conv.last_message || 'No messages yet',
      last_message_at: conv.last_message_at,
      unread_count: parseInt(conv.unread_count) || 0,
      created_at: conv.conversation_created
    }));

    res.json({ conversations: formattedconversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id - Get specific conversation details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if conversation exists and user has access
    const [conversations] = await pool.execute(
      `SELECT c.id, c.connection_id, c.created_at, c.last_message_at,
              conn.sender_user_id, conn.receiver_user_id, conn.status
       FROM conversations c
       JOIN connections conn ON c.connection_id = conn.id
       WHERE c.id = ? AND (conn.sender_user_id = ? OR conn.receiver_user_id = ?) 
       AND conn.status = 'accepted'`,
      [id, req.user.id, req.user.id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    const conversation = conversations[0];

    // Get other user details
    const otherUserId = conversation.sender_user_id === req.user.id 
      ? conversation.receiver_user_id 
      : conversation.sender_user_id;

    const [users] = await pool.execute(
      'SELECT id, username, first_name, last_name, status, last_seen FROM users WHERE id = ?',
      [otherUserId]
    );

    const otherUser = users[0];

    res.json({
      conversation: {
        id: conversation.id,
        connection_id: conversation.connection_id,
        type: 'direct',
        title: `${otherUser.first_name} ${otherUser.last_name}`,
        other_user: {
          id: otherUser.id,
          username: otherUser.username,
          name: `${otherUser.first_name} ${otherUser.last_name}`,
          status: otherUser.status,
          last_seen: otherUser.last_seen
        },
        created_at: conversation.created_at,
        last_message_at: conversation.last_message_at
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST /api/conversations - Create or get conversation for a connection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }

    // Verify the connection exists and user is part of it
    const [connections] = await pool.execute(
      `SELECT id, sender_user_id, receiver_user_id, status 
       FROM connections 
       WHERE id = ? AND (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
      [connectionId, req.user.id, req.user.id]
    );

    if (connections.length === 0) {
      return res.status(404).json({ error: 'Connection not found or not accepted' });
    }

    // Check if conversation already exists for this connection
    const [existingconversations] = await pool.execute(
      'SELECT id FROM conversations WHERE connection_id = ?',
      [connectionId]
    );

    let conversationId;

    if (existingconversations.length > 0) {
      // Return existing conversation
      conversationId = existingconversations[0].id;
    } else {
      // Create new conversation
      const [result] = await pool.execute(
        'INSERT INTO conversations (connection_id, type) VALUES (?, ?)',
        [connectionId, 'direct']
      );
      conversationId = result.insertId;
    }

    // Get the conversation details for response
    const conversationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/conversations/${conversationId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    if (conversationResponse.ok) {
      const conversationData = await conversationResponse.json();
      res.status(201).json(conversationData);
    } else {
      // Fallback response
      res.status(201).json({
        conversation: {
          id: conversationId,
          connection_id: connectionId,
          type: 'direct'
        }
      });
    }

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

module.exports = router;