const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateConnectionRequest } = require('../utils/validation');

const router = express.Router();

// GET /api/connections - Get all connections (accepted and pending)
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
          c.id,
          c.status,
          c.sender_user_id,
          c.receiver_user_id,
          c.created_at,
          CASE WHEN c.sender_user_id = ? THEN receiver.id ELSE sender.id END AS user_id,
          CASE WHEN c.sender_user_id = ? THEN receiver.username ELSE sender.username END AS user_name,
          CASE WHEN c.sender_user_id = ? THEN receiver.bio ELSE sender.bio END AS user_bio,
          CASE WHEN c.sender_user_id = ? THEN receiver.open_to_work ELSE sender.open_to_work END AS user_open_to_work
       FROM Connections c
       JOIN Users sender ON c.sender_user_id = sender.id
       JOIN Users receiver ON c.receiver_user_id = receiver.id
       WHERE (c.sender_user_id = ? OR c.receiver_user_id = ?)
       ORDER BY c.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({ connections: rows });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/connections/requests - Get pending connection requests (incoming and outgoing)
router.get('/connections/requests', authenticateToken, async (req, res) => {
  try {
    const [incomingRequests] = await pool.execute(
      `SELECT 
          c.id,
          c.message,
          c.created_at,
          u.username AS sender_name,
          u.bio AS sender_bio
       FROM Connections c
       JOIN Users u ON c.sender_user_id = u.id
       WHERE c.receiver_user_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const [outgoingRequests] = await pool.execute(
      `SELECT 
          c.id,
          c.message,
          c.created_at,
          u.username AS receiver_name,
          u.bio AS receiver_bio
       FROM Connections c
       JOIN Users u ON c.receiver_user_id = u.id
       WHERE c.sender_user_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({ 
      requests: incomingRequests, // backward-compatible for current frontend
      incoming: incomingRequests,
      outgoing: outgoingRequests
    });

  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connections/connect/:userId - Send connection request
router.post('/connections/connect/:userId', authenticateToken, validateConnectionRequest, async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    // Can't connect to yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Check if target user exists
    const [targetUser] = await pool.execute(
      'SELECT id, username FROM Users WHERE id = ?',
      [userId]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists
    const [existingConnection] = await pool.execute(
      `SELECT id, status FROM Connections 
       WHERE (sender_user_id = ? AND receiver_user_id = ?) 
          OR (sender_user_id = ? AND receiver_user_id = ?)`,
      [req.user.id, userId, userId, req.user.id]
    );

    if (existingConnection.length > 0) {
      const status = existingConnection[0].status;
      if (status === 'accepted') {
        return res.status(409).json({ error: 'You are already connected to this user' });
      } else if (status === 'pending') {
        return res.status(409).json({ error: 'Connection request already pending' });
      } else if (status === 'rejected') {
        return res.status(409).json({ error: 'Connection request was previously rejected' });
      }
    }

    // Create connection request
    const [result] = await pool.execute(
      'INSERT INTO Connections (sender_user_id, receiver_user_id, message, status) VALUES (?, ?, ?, ?)',
      [req.user.id, userId, message, 'pending']
    );

    res.status(201).json({
      message: 'Connection request sent successfully',
      connectionId: result.insertId
    });

  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/connections/:requestId - Accept or reject connection request
router.put('/connections/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
    }

    // Check if request exists and is for this user
    const [requests] = await pool.execute(
      'SELECT id, sender_user_id, receiver_user_id, status FROM Connections WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    const request = requests[0];

    if (request.receiver_user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only respond to requests sent to you' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been responded to' });
    }

    // Update request status
    await pool.execute(
      'UPDATE Connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, requestId]
    );

    res.json({
      message: `Connection request ${status} successfully`,
      status
    });

  } catch (error) {
    console.error('Update connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
