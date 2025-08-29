const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/startups/:startupId/reactions - Get all reactions for a startup
router.get('/:startupId/reactions', async (req, res) => {
  try {
    const { startupId } = req.params;

    // Check if startup exists
    const [startups] = await pool.execute(
      'SELECT id FROM Startups WHERE id = ?',
      [startupId]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Get reaction counts
    const [reactions] = await pool.execute(
      `SELECT type, COUNT(*) as count
       FROM Reactions 
       WHERE startup_id = ?
       GROUP BY type`,
      [startupId]
    );

    // Calculate reaction counts
    let upvotes = 0;
    let downvotes = 0;
    let pivot = 0;
    
    reactions.forEach(reaction => {
      if (reaction.type === 'upvote') upvotes = reaction.count;
      if (reaction.type === 'downvote') downvotes = reaction.count;
      if (reaction.type === 'pivot') pivot = reaction.count;
    });

    res.json({
      upvotes,
      downvotes,
      pivot
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/startups/:startupId/reaction - Add a reaction
router.post('/:startupId/reaction', authenticateToken, async (req, res) => {
  try {
    const { startupId } = req.params;
    const { type } = req.body;

    // Validate reaction type
    const validTypes = ['upvote', 'downvote', 'pivot'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type. Must be upvote, downvote, or pivot' });
    }

    // Check if startup exists
    const [startups] = await pool.execute(
      'SELECT id FROM Startups WHERE id = ?',
      [startupId]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Check if user already has any reaction (upvote or downvote)
    const [existingReaction] = await pool.execute(
      'SELECT id, type FROM Reactions WHERE user_id = ? AND startup_id = ?',
      [req.user.id, startupId]
    );

    if (existingReaction.length > 0) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction[0].type === type) {
        await pool.execute(
          'DELETE FROM Reactions WHERE user_id = ? AND startup_id = ?',
          [req.user.id, startupId]
        );
      } else {
        // If different reaction type, update it (switch vote)
        await pool.execute(
          'UPDATE Reactions SET type = ? WHERE user_id = ? AND startup_id = ?',
          [type, req.user.id, startupId]
        );
      }
    } else {
      // Add new reaction
      await pool.execute(
        'INSERT INTO Reactions (user_id, startup_id, type) VALUES (?, ?, ?)',
        [req.user.id, startupId, type]
      );
    }

    // Get updated reaction counts
    const [reactions] = await pool.execute(
      `SELECT type, COUNT(*) as count
       FROM Reactions 
       WHERE startup_id = ?
       GROUP BY type`,
      [startupId]
    );

    let upvotes = 0;
    let downvotes = 0;
    let pivot = 0;
    
    reactions.forEach(reaction => {
      if (reaction.type === 'upvote') upvotes = reaction.count;
      if (reaction.type === 'downvote') downvotes = reaction.count;
      if (reaction.type === 'pivot') pivot = reaction.count;
    });

    res.status(201).json({
      message: 'Reaction updated successfully',
      upvotes,
      downvotes,
      pivot
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already given this reaction to this startup' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/startups/:startupId/reaction - Remove your reaction
router.delete('/:startupId/reaction', authenticateToken, async (req, res) => {
  try {
    const { startupId } = req.params;
    const { type } = req.body;

    // Validate reaction type
    const validTypes = ['upvote', 'downvote', 'pivot'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type. Must be upvote, downvote, or pivot' });
    }

    // Remove reaction
    const [result] = await pool.execute(
      'DELETE FROM Reactions WHERE user_id = ? AND startup_id = ? AND type = ?',
      [req.user.id, startupId, type]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    // Get updated reaction counts
    const [reactions] = await pool.execute(
      `SELECT type, COUNT(*) as count
       FROM Reactions 
       WHERE startup_id = ?
       GROUP BY type`,
      [startupId]
    );

    let upvotes = 0;
    let downvotes = 0;
    let pivot = 0;
    
    reactions.forEach(reaction => {
      if (reaction.type === 'upvote') upvotes = reaction.count;
      if (reaction.type === 'downvote') downvotes = reaction.count;
      if (reaction.type === 'pivot') pivot = reaction.count;
    });

    res.json({
      message: 'Reaction removed successfully',
      upvotes,
      downvotes,
      pivot
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
