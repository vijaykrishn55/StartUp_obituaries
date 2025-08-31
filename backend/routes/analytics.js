const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/overview - Platform overview stats
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM Users');
    const [totalStartups] = await pool.execute('SELECT COUNT(*) as count FROM Startups');
    const [totalReactions] = await pool.execute('SELECT COUNT(*) as count FROM Reactions');
    const [totalComments] = await pool.execute('SELECT COUNT(*) as count FROM Comments');
    
    // Active users (users who have logged in within last 30 days)
    const [activeUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM Users WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // New users this month
    const [newUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM Users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // New startups this month
    const [newStartups] = await pool.execute(
      'SELECT COUNT(*) as count FROM Startups WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    res.json({
      totalUsers: totalUsers[0].count,
      totalStartups: totalStartups[0].count,
      totalReactions: totalReactions[0].count,
      totalComments: totalComments[0].count,
      activeUsers: activeUsers[0].count,
      newUsers: newUsers[0].count,
      newStartups: newStartups[0].count
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/user-growth - User growth over time
router.get('/user-growth', authenticateToken, async (req, res) => {
  try {
    const [growth] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
      FROM Users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json(growth);

  } catch (error) {
    console.error('User growth analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/startup-trends - Startup creation trends
router.get('/startup-trends', authenticateToken, async (req, res) => {
  try {
    const [trends] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_startups
      FROM Startups 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json(trends);

  } catch (error) {
    console.error('Startup trends analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/failure-reasons - Failure reason distribution
router.get('/failure-reasons', authenticateToken, async (req, res) => {
  try {
    const [reasons] = await pool.execute(`
      SELECT 
        primary_failure_reason as reason,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Startups WHERE primary_failure_reason IS NOT NULL), 2) as percentage
      FROM Startups 
      WHERE primary_failure_reason IS NOT NULL
      GROUP BY primary_failure_reason
      ORDER BY count DESC
    `);

    res.json(reasons);

  } catch (error) {
    console.error('Failure reasons analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/industry-breakdown - Industry distribution
router.get('/industry-breakdown', authenticateToken, async (req, res) => {
  try {
    const [industries] = await pool.execute(`
      SELECT 
        industry,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Startups WHERE industry IS NOT NULL), 2) as percentage
      FROM Startups 
      WHERE industry IS NOT NULL
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json(industries);

  } catch (error) {
    console.error('Industry breakdown analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/engagement - User engagement metrics
router.get('/engagement', authenticateToken, async (req, res) => {
  try {
    // Reaction distribution
    const [reactionStats] = await pool.execute(`
      SELECT 
        type,
        COUNT(*) as count
      FROM Reactions
      GROUP BY type
    `);

    // Most active users
    const [activeUsers] = await pool.execute(`
      SELECT 
        u.username,
        COUNT(DISTINCT s.id) as startups_created,
        COUNT(DISTINCT r.id) as reactions_given,
        COUNT(DISTINCT c.id) as comments_made
      FROM Users u
      LEFT JOIN Startups s ON u.id = s.created_by_user_id
      LEFT JOIN Reactions r ON u.id = r.user_id
      LEFT JOIN Comments c ON u.id = c.user_id
      GROUP BY u.id, u.username
      HAVING (startups_created + reactions_given + comments_made) > 0
      ORDER BY (startups_created + reactions_given + comments_made) DESC
      LIMIT 10
    `);

    // Average reactions per startup
    const [avgReactions] = await pool.execute(`
      SELECT AVG(reaction_count) as avg_reactions
      FROM (
        SELECT COUNT(*) as reaction_count
        FROM Reactions
        GROUP BY startup_id
      ) as startup_reactions
    `);

    res.json({
      reactionStats,
      activeUsers,
      avgReactions: avgReactions[0]?.avg_reactions || 0
    });

  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/funding - Funding analytics
router.get('/funding', authenticateToken, async (req, res) => {
  try {
    // Total funding by stage
    const [fundingByStage] = await pool.execute(`
      SELECT 
        stage_at_death as stage,
        COUNT(*) as startup_count,
        SUM(funding_amount_usd) as total_funding,
        AVG(funding_amount_usd) as avg_funding
      FROM Startups 
      WHERE funding_amount_usd IS NOT NULL AND stage_at_death IS NOT NULL
      GROUP BY stage_at_death
      ORDER BY total_funding DESC
    `);

    // Funding distribution
    const [fundingRanges] = await pool.execute(`
      SELECT 
        CASE 
          WHEN funding_amount_usd < 100000 THEN 'Under $100K'
          WHEN funding_amount_usd < 1000000 THEN '$100K - $1M'
          WHEN funding_amount_usd < 10000000 THEN '$1M - $10M'
          WHEN funding_amount_usd < 100000000 THEN '$10M - $100M'
          ELSE 'Over $100M'
        END as funding_range,
        COUNT(*) as count
      FROM Startups 
      WHERE funding_amount_usd IS NOT NULL
      GROUP BY funding_range
      ORDER BY MIN(funding_amount_usd)
    `);

    res.json({
      fundingByStage,
      fundingRanges
    });

  } catch (error) {
    console.error('Funding analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/user-roles - User role distribution
router.get('/user-roles', authenticateToken, async (req, res) => {
  try {
    const [roles] = await pool.execute(`
      SELECT 
        user_role as role,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Users), 2) as percentage
      FROM Users
      GROUP BY user_role
      ORDER BY count DESC
    `);

    res.json(roles);

  } catch (error) {
    console.error('User roles analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
