const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:userId/stats - Get user statistics
router.get('/users/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get total reactions received on user's startups
    const [reactionStats] = await pool.execute(
      `SELECT COUNT(*) as total_reactions_received
       FROM Reactions r
       JOIN Startups s ON r.startup_id = s.id
       WHERE s.user_id = ?`,
      [userId]
    );

    // Get total reactions given by user
    const [reactionsGiven] = await pool.execute(
      `SELECT COUNT(*) as reactions_given
       FROM Reactions r
       WHERE r.user_id = ?`,
      [userId]
    );

    // Get total comments made by user
    const [commentStats] = await pool.execute(
      `SELECT COUNT(*) as comments_made
       FROM Comments
       WHERE user_id = ?`,
      [userId]
    );

    // Get total connections count (accepted only)
    const [connectionStats] = await pool.execute(
      `SELECT COUNT(*) as connections_count
       FROM Connections
       WHERE (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'`,
      [userId, userId]
    );

    // Get startup count
    const [startupStats] = await pool.execute(
      `SELECT COUNT(*) as startups_count
       FROM Startups
       WHERE user_id = ?`,
      [userId]
    );

    // Get reaction breakdown by type
    const [reactionBreakdown] = await pool.execute(
      `SELECT r.reaction_type, COUNT(*) as count
       FROM Reactions r
       JOIN Startups s ON r.startup_id = s.id
       WHERE s.user_id = ?
       GROUP BY r.reaction_type`,
      [userId]
    );

    // Get most popular startup by reactions
    const [popularStartup] = await pool.execute(
      `SELECT s.id, s.name, COUNT(r.id) as reaction_count
       FROM Startups s
       LEFT JOIN Reactions r ON s.id = r.startup_id
       WHERE s.user_id = ?
       GROUP BY s.id, s.name
       ORDER BY reaction_count DESC
       LIMIT 1`,
      [userId]
    );

    // Get recent activity count (last 30 days)
    const [recentActivity] = await pool.execute(
      `SELECT 
         COUNT(CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_comments,
         COUNT(CASE WHEN r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_reactions
       FROM Comments c
       LEFT JOIN Reactions r ON r.user_id = c.user_id
       WHERE c.user_id = ?`,
      [userId]
    );

    const stats = {
      total_reactions_received: reactionStats[0].total_reactions_received || 0,
      reactions_given: reactionsGiven[0].reactions_given || 0,
      comments_made: commentStats[0].comments_made || 0,
      connections_count: connectionStats[0].connections_count || 0,
      startups_count: startupStats[0].startups_count || 0,
      reaction_breakdown: reactionBreakdown.reduce((acc, item) => {
        acc[item.reaction_type] = item.count;
        return acc;
      }, {}),
      most_popular_startup: popularStartup[0] || null,
      recent_activity: {
        comments: recentActivity[0]?.recent_comments || 0,
        reactions: recentActivity[0]?.recent_reactions || 0
      }
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/leaderboard - Get platform-wide statistics
router.get('/stats/leaderboard', async (req, res) => {
  try {
    // Top contributors by startup count
    const [topContributors] = await pool.execute(
      `SELECT u.id, u.username, u.first_name, u.last_name, COUNT(s.id) as startup_count
       FROM Users u
       LEFT JOIN Startups s ON u.id = s.user_id
       GROUP BY u.id, u.username, u.first_name, u.last_name
       ORDER BY startup_count DESC
       LIMIT 10`
    );

    // Most active commenters
    const [topCommenters] = await pool.execute(
      `SELECT u.id, u.username, u.first_name, u.last_name, COUNT(c.id) as comment_count
       FROM Users u
       LEFT JOIN Comments c ON u.id = c.user_id
       GROUP BY u.id, u.username, u.first_name, u.last_name
       ORDER BY comment_count DESC
       LIMIT 10`
    );

    // Most connected users
    const [mostConnected] = await pool.execute(
      `SELECT u.id, u.username, u.first_name, u.last_name, COUNT(conn.id) as connection_count
       FROM Users u
       LEFT JOIN Connections conn ON (u.id = conn.sender_user_id OR u.id = conn.receiver_user_id) AND conn.status = 'accepted'
       GROUP BY u.id, u.username, u.first_name, u.last_name
       ORDER BY connection_count DESC
       LIMIT 10`
    );

    // Platform statistics
    const [platformStats] = await pool.execute(
      `SELECT 
         (SELECT COUNT(*) FROM Users) as total_users,
         (SELECT COUNT(*) FROM Startups) as total_startups,
         (SELECT COUNT(*) FROM Comments) as total_comments,
         (SELECT COUNT(*) FROM Reactions) as total_reactions,
         (SELECT COUNT(*) FROM Connections WHERE status = 'accepted') as total_connections`
    );

    res.json({
      leaderboard: {
        top_contributors: topContributors,
        top_commenters: topCommenters,
        most_connected: mostConnected
      },
      platform_stats: platformStats[0]
    });

  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
