const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/database');

const router = express.Router();

// Test endpoint to verify API is working
router.get('/test-users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, display_name FROM users LIMIT 10');
    res.json({ users, message: 'Test endpoint working' });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

// Search users for creating conversations
router.get('/search-users', authenticateToken, async (req, res) => {
  try {
    console.log('Search users endpoint called');
    console.log('User ID:', req.user?.id);
    console.log('Query:', req.query.query);
    
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      console.log('Search query missing or too short');
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log('Searching for users with query:', query);
    
    // Search users by username or display name (excluding current user)
    const users = await db.all(`
      SELECT 
        id,
        username,
        display_name,
        avatar_url,
        status
      FROM users
      WHERE (username LIKE ? OR display_name LIKE ?)
        AND id != ?
      LIMIT 20
    `, [`%${query}%`, `%${query}%`, req.user.id]);

    console.log('Found users:', users);
    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get all conversations for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const conversations = await db.all(`
      SELECT 
        c.id,
        c.type,
        c.title,
        c.description,
        c.created_at,
        c.last_message_at,
        (
          SELECT content 
          FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*) 
          FROM messages m
          LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = ?
          WHERE m.conversation_id = c.id AND m.sender_id != ? AND mrs.id IS NULL
        ) as unread_count
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ? AND cp.is_active = 1
      ORDER BY c.last_message_at DESC
    `, [req.user.id, req.user.id, req.user.id]);

    // Get participants for each conversation
    for (let conversation of conversations) {
      const participants = await db.all(`
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.status,
          cp.role
        FROM users u
        INNER JOIN conversation_participants cp ON u.id = cp.user_id
        WHERE cp.conversation_id = ? AND cp.is_active = 1
      `, [conversation.id]);
      
      conversation.participants = participants;
      
      // For direct conversations, set title to other participant's name
      if (conversation.type === 'direct' && participants.length === 2) {
        const otherParticipant = participants.find(p => p.id !== req.user.id);
        conversation.title = otherParticipant ? otherParticipant.display_name : 'Unknown User';
      }
    }

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a specific conversation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Check if user is participant in this conversation
    const participant = await db.get(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
      [conversationId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Get conversation details
    const conversation = await db.get(`
      SELECT 
        c.*,
        u.display_name as created_by_name
      FROM conversations c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [conversationId]);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get participants
    const participants = await db.all(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.status,
        cp.role,
        cp.joined_at
      FROM users u
      INNER JOIN conversation_participants cp ON u.id = cp.user_id
      WHERE cp.conversation_id = ? AND cp.is_active = 1
    `, [conversationId]);

    conversation.participants = participants;

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create a new conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, description, participantIds } = req.body;

    // Validate input
    if (!type || !['direct', 'group'].includes(type)) {
      return res.status(400).json({ error: 'Valid conversation type (direct/group) is required' });
    }

    if (type === 'direct' && (!participantIds || participantIds.length !== 1)) {
      return res.status(400).json({ error: 'Direct conversations require exactly one other participant' });
    }

    if (type === 'group' && (!title || !participantIds || participantIds.length < 1)) {
      return res.status(400).json({ error: 'Group conversations require a title and at least one participant' });
    }

    // For direct conversations, check if conversation already exists
    if (type === 'direct') {
      const existingConversation = await db.get(`
        SELECT c.id
        FROM conversations c
        INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.type = 'direct' 
          AND cp1.user_id = ? AND cp1.is_active = 1
          AND cp2.user_id = ? AND cp2.is_active = 1
      `, [req.user.id, participantIds[0]]);

      if (existingConversation) {
        return res.status(409).json({ 
          error: 'Direct conversation already exists',
          conversationId: existingConversation.id
        });
      }
    }

    // Create conversation
    const result = await db.run(
      'INSERT INTO conversations (type, title, description, created_by) VALUES (?, ?, ?, ?)',
      [type, title, description, req.user.id]
    );

    const conversationId = result.id;

    // Add creator as participant
    await db.run(
      'INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)',
      [conversationId, req.user.id, 'admin']
    );

    // Add other participants
    for (const participantId of participantIds) {
      await db.run(
        'INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, ?)',
        [conversationId, participantId, 'member']
      );
    }

    // Get the created conversation with participants
    const conversation = await db.get(`
      SELECT * FROM conversations WHERE id = ?
    `, [conversationId]);

    const participants = await db.all(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.status,
        cp.role
      FROM users u
      INNER JOIN conversation_participants cp ON u.id = cp.user_id
      WHERE cp.conversation_id = ? AND cp.is_active = 1
    `, [conversationId]);

    conversation.participants = participants;

    res.status(201).json({ 
      message: 'Conversation created successfully',
      conversation 
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Check if user is participant in this conversation
    const participant = await db.get(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
      [conversationId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Get messages
    const messages = await db.all(`
      SELECT 
        m.*,
        u.username,
        u.display_name,
        u.avatar_url,
        (
          SELECT COUNT(*) 
          FROM message_read_status mrs 
          WHERE mrs.message_id = m.id
        ) as read_count,
        (
          SELECT COUNT(*) 
          FROM message_reactions mr 
          WHERE mr.message_id = m.id
        ) as reaction_count
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ? AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [conversationId, limit, offset]);

    // Mark messages as read for current user
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      const placeholders = messageIds.map(() => '?').join(',');
      
      await db.run(`
        INSERT OR IGNORE INTO message_read_status (message_id, user_id)
        SELECT m.id, ? FROM messages m 
        WHERE m.id IN (${placeholders}) AND m.sender_id != ?
      `, [req.user.id, ...messageIds, req.user.id]);
    }

    res.json({ 
      messages: messages.reverse(), // Return in chronological order
      page,
      limit,
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Leave a conversation
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Check if user is participant
    const participant = await db.get(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND is_active = 1',
      [conversationId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    // Update participant status
    await db.run(
      'UPDATE conversation_participants SET is_active = 0, left_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?',
      [conversationId, req.user.id]
    );

    res.json({ message: 'Left conversation successfully' });
  } catch (error) {
    console.error('Leave conversation error:', error);
    res.status(500).json({ error: 'Failed to leave conversation' });
  }
});

module.exports = router;