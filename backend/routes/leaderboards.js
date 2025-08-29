const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET /api/leaderboards/most-downvoted - Get startups ranked by most downvotes
router.get('/most-downvoted', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.id, s.name, s.description,
              u.username as creator_username,
              COUNT(r.id) as downvote_count
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       LEFT JOIN Reactions r ON s.id = r.startup_id AND r.type = 'downvote'
       GROUP BY s.id, s.name, s.description, u.username
       ORDER BY downvote_count DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Most Downvoted',
      description: 'Startups ranked by downvotes',
      startups
    });

  } catch (error) {
    console.error('Get most tragic leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboards/most-upvoted - Get startups ranked by most upvotes
router.get('/most-upvoted', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
              COUNT(r.id) as upvote_count
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       LEFT JOIN Reactions r ON s.id = r.startup_id AND r.type = 'upvote'
       GROUP BY s.id
       ORDER BY upvote_count DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Most Upvoted',
      description: 'Startups ranked by upvotes',
      startups
    });

  } catch (error) {
    console.error('Get most upvoted leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboards/most-tragic - Get most tragic startup failures
router.get('/most-tragic', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
              COUNT(r.id) as reaction_count
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       LEFT JOIN Reactions r ON s.id = r.startup_id AND r.type = 'downvote'
       GROUP BY s.id
       ORDER BY reaction_count DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Most Tragic',
      description: 'The most heartbreaking startup failures',
      startups
    });

  } catch (error) {
    console.error('Get most tragic leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboards/deserved-pivot - Get startups that deserved to pivot
router.get('/deserved-pivot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
              COUNT(r.id) as pivot_count
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       LEFT JOIN Reactions r ON s.id = r.startup_id AND r.type = 'pivot'
       GROUP BY s.id
       HAVING pivot_count > 0
       ORDER BY pivot_count DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Deserved Pivot',
      description: 'Startups that should have pivoted sooner',
      startups
    });

  } catch (error) {
    console.error('Get deserved pivot leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboards/brilliant-mistakes - Get brilliant mistakes
router.get('/brilliant-mistakes', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
              COUNT(r.id) as reaction_count
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       LEFT JOIN Reactions r ON s.id = r.startup_id AND r.type = 'upvote'
       GROUP BY s.id
       ORDER BY reaction_count DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Brilliant Mistakes',
      description: 'Failures that taught valuable lessons',
      startups
    });

  } catch (error) {
    console.error('Get brilliant mistakes leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboards/most-funded-failures - Get most funded failures
router.get('/most-funded-failures', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const [startups] = await pool.execute(
      `SELECT s.*, u.username as creator_username
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       WHERE s.funding_amount_usd > 0
       ORDER BY s.funding_amount_usd DESC, s.created_at DESC
       LIMIT ${limitInt}`
    );

    res.json({
      title: 'Most Funded Failures',
      description: 'Biggest money burns in startup history',
      startups
    });

  } catch (error) {
    console.error('Get most funded failures leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
