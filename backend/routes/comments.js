const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateComment } = require('../utils/validation');

const router = express.Router();

// GET /api/startups/:startupId/comments - Get all comments for a startup
router.get('/startups/:startupId/comments', async (req, res) => {
  try {
    const { startupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if startup exists
    const [startups] = await pool.execute(
      'SELECT id FROM Startups WHERE id = ?',
      [startupId]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Get comments with user info
    const [comments] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, c.parent_comment_id,
              u.id as user_id, u.username, u.first_name, u.last_name
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.startup_id = ?
       ORDER BY c.created_at DESC`,
      [startupId]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM Comments WHERE startup_id = ?',
      [startupId]
    );

    res.json({
      comments,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < countResult[0].total
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/startups/:startupId/comments - Create a new comment
router.post('/startups/:startupId/comments', authenticateToken, validateComment, async (req, res) => {
  try {
    const { startupId } = req.params;
    const { content, parent_comment_id } = req.body;

    // Check if startup exists
    const [startups] = await pool.execute(
      'SELECT id FROM Startups WHERE id = ?',
      [startupId]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // If replying to a comment, check if parent comment exists
    if (parent_comment_id) {
      const [parentComment] = await pool.execute(
        'SELECT id FROM Comments WHERE id = ? AND startup_id = ?',
        [parent_comment_id, startupId]
      );

      if (parentComment.length === 0) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    // Create comment
    const [result] = await pool.execute(
      'INSERT INTO Comments (content, user_id, startup_id, parent_comment_id) VALUES (?, ?, ?, ?)',
      [content, req.user.id, startupId, parent_comment_id || null]
    );

    // Get the created comment with user info
    const [newComment] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, c.parent_comment_id,
              u.id as user_id, u.username, u.first_name, u.last_name
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment[0]
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/comments/:commentId - Edit your own comment
router.put('/comments/:commentId', authenticateToken, validateComment, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Check if comment exists and belongs to user
    const [comments] = await pool.execute(
      'SELECT id, user_id FROM Comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Update comment
    await pool.execute(
      'UPDATE Comments SET content = ? WHERE id = ?',
      [content, commentId]
    );

    // Get updated comment with user info
    const [updatedComment] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, c.parent_comment_id,
              u.id as user_id, u.username, u.first_name, u.last_name
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment[0]
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/comments/:commentId - Delete your own comment
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists and belongs to user
    const [comments] = await pool.execute(
      'SELECT id, user_id FROM Comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment (cascading will handle replies)
    await pool.execute('DELETE FROM Comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
