const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations - Get all conversations for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`Fetching conversations for userId: ${req.user.id}`);

    // Get conversations based on user participation
    const [conversations] = await pool.execute(
      `SELECT c.id as conversation_id, c.created_at as conversation_created,
              c.last_message_at, c.user1_id, c.user2_id,
              -- Get other user details
              CASE 
                WHEN c.user1_id = ? THEN c.user2_id
                ELSE c.user1_id
              END as other_user_id,
              CASE 
                WHEN c.user1_id = ? THEN CONCAT(u2.first_name, ' ', u2.last_name)
                ELSE CONCAT(u1.first_name, ' ', u1.last_name)
              END as other_user_name,
              CASE 
                WHEN c.user1_id = ? THEN u2.username
                ELSE u1.username
              END as other_username,
              CASE 
                WHEN c.user1_id = ? THEN u2.status
                ELSE u1.status
              END as other_user_status,
              -- Get last message
              (SELECT content FROM Messages m 
               WHERE m.conversation_id = c.id AND m.deleted_at IS NULL 
               ORDER BY m.created_at DESC LIMIT 1) as last_message,
              -- Get unread count
              (SELECT COUNT(*) FROM Messages m
               LEFT JOIN MessageReadStatus mrs ON m.id = mrs.message_id AND mrs.user_id = ?
               WHERE m.conversation_id = c.id AND m.sender_id != ? 
               AND m.deleted_at IS NULL AND mrs.id IS NULL) as unread_count
       FROM Conversations c
       JOIN Users u1 ON c.user1_id = u1.id
       JOIN Users u2 ON c.user2_id = u2.id
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    console.log(`Found ${conversations.length} conversations`);

    // Format conversations for frontend
    const formattedconversations = conversations.map(conv => ({
      id: conv.conversation_id,
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
      `SELECT c.id, c.user1_id, c.user2_id, c.created_at, c.last_message_at
       FROM Conversations c
       WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)`,
      [id, req.user.id, req.user.id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    const conversation = conversations[0];

    // Get other user details
    const otherUserId = conversation.user1_id === req.user.id 
      ? conversation.user2_id 
      : conversation.user1_id;

    const [users] = await pool.execute(
      'SELECT id, username, first_name, last_name, status, last_seen FROM Users WHERE id = ?',
      [otherUserId]
    );

    const otherUser = users[0];

    res.json({
      conversation: {
        id: conversation.id,
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

// POST /api/conversations - Create or get conversation between two users
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    if (parseInt(otherUserId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Verify the other user exists
    const [otherUsers] = await pool.execute(
      'SELECT id FROM Users WHERE id = ?',
      [otherUserId]
    );

    if (otherUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user1_id < user2_id for consistency
    const user1Id = Math.min(req.user.id, parseInt(otherUserId));
    const user2Id = Math.max(req.user.id, parseInt(otherUserId));

    // Check if conversation already exists
    const [existingconversations] = await pool.execute(
      'SELECT id FROM Conversations WHERE user1_id = ? AND user2_id = ?',
      [user1Id, user2Id]
    );

    let conversationId;

    if (existingconversations.length > 0) {
      // Return existing conversation
      conversationId = existingconversations[0].id;
    } else {
      // Create new conversation
      const [result] = await pool.execute(
        'INSERT INTO Conversations (user1_id, user2_id, type) VALUES (?, ?, ?)',
        [user1Id, user2Id, 'direct']
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