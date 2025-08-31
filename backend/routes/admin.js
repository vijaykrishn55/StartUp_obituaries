const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Admin middleware - check if user has admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    // For now, check if user is a recruiter or has admin role
    // In production, you'd have a dedicated admin role
    const [users] = await pool.execute(
      'SELECT user_role, is_recruiter FROM Users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    if (user.user_role !== 'recruiter' && !user.is_recruiter) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/users - Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      whereClause += ' AND user_role = ?';
      params.push(role);
    }

    // Get users
    const [users] = await pool.execute(
      `SELECT id, username, email, first_name, last_name, user_role, is_recruiter, 
              open_to_work, open_to_co_founding, created_at, last_login
       FROM Users 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM Users ${whereClause}`,
      params
    );

    // Get user statistics
    const userStats = await Promise.all(users.map(async (user) => {
      const [startupCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM Startups WHERE created_by_user_id = ?',
        [user.id]
      );
      
      const [commentCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM Comments WHERE user_id = ?',
        [user.id]
      );
      
      const [connectionCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM Connections WHERE (sender_user_id = ? OR receiver_user_id = ?) AND status = "accepted"',
        [user.id, user.id]
      );

      return {
        ...user,
        stats: {
          startups: startupCount[0].count,
          comments: commentCount[0].count,
          connections: connectionCount[0].count
        }
      };
    }));

    res.json({
      users: userStats,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId - Update user details
router.put('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { user_role, is_recruiter, open_to_work, open_to_co_founding } = req.body;

    // Validate user_role
    const validRoles = ['student', 'founder', 'investor', 'recruiter'];
    if (user_role && !validRoles.includes(user_role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const updates = [];
    const params = [];

    if (user_role !== undefined) {
      updates.push('user_role = ?');
      params.push(user_role);
    }
    if (is_recruiter !== undefined) {
      updates.push('is_recruiter = ?');
      params.push(is_recruiter);
    }
    if (open_to_work !== undefined) {
      updates.push('open_to_work = ?');
      params.push(open_to_work);
    }
    if (open_to_co_founding !== undefined) {
      updates.push('open_to_co_founding = ?');
      params.push(open_to_co_founding);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(userId);

    await pool.execute(
      `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, user_role, is_recruiter, open_to_work, open_to_co_founding FROM Users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:userId - Delete user (soft delete by deactivating)
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting self
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // For now, we'll actually delete the user and cascade
    // In production, you might want to implement soft delete
    await pool.execute('DELETE FROM Users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/stats - Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Users) as total_users,
        (SELECT COUNT(*) FROM Users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_30d,
        (SELECT COUNT(*) FROM Startups) as total_startups,
        (SELECT COUNT(*) FROM Startups WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_startups_30d,
        (SELECT COUNT(*) FROM Comments) as total_comments,
        (SELECT COUNT(*) FROM Comments WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_comments_30d,
        (SELECT COUNT(*) FROM Reactions) as total_reactions,
        (SELECT COUNT(*) FROM Reactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_reactions_30d,
        (SELECT COUNT(*) FROM Connections WHERE status = 'accepted') as total_connections
    `);

    // Get user role distribution
    const [roleStats] = await pool.execute(`
      SELECT user_role, COUNT(*) as count 
      FROM Users 
      GROUP BY user_role
    `);

    // Get most active users
    const [activeUsers] = await pool.execute(`
      SELECT u.id, u.username, u.first_name, u.last_name,
             COUNT(DISTINCT s.id) as startup_count,
             COUNT(DISTINCT c.id) as comment_count,
             COUNT(DISTINCT r.id) as reaction_count
      FROM Users u
      LEFT JOIN Startups s ON u.id = s.created_by_user_id
      LEFT JOIN Comments c ON u.id = c.user_id
      LEFT JOIN Reactions r ON u.id = r.user_id
      GROUP BY u.id, u.username, u.first_name, u.last_name
      ORDER BY (startup_count + comment_count + reaction_count) DESC
      LIMIT 10
    `);

    res.json({
      platform_stats: stats[0],
      role_distribution: roleStats,
      most_active_users: activeUsers
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/content - Get content for moderation
router.get('/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let results = {};

    if (type === 'all' || type === 'startups') {
      const [startups] = await pool.execute(`
        SELECT s.id, s.name, s.description, s.created_at,
               u.username, u.first_name, u.last_name,
               COUNT(r.id) as reaction_count,
               COUNT(c.id) as comment_count
        FROM Startups s
        JOIN Users u ON s.created_by_user_id = u.id
        LEFT JOIN Reactions r ON s.id = r.startup_id
        LEFT JOIN Comments c ON s.id = c.startup_id
        GROUP BY s.id, s.name, s.description, s.created_at, u.username, u.first_name, u.last_name
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `, [parseInt(limit), parseInt(offset)]);
      
      results.startups = startups;
    }

    if (type === 'all' || type === 'comments') {
      const [comments] = await pool.execute(`
        SELECT c.id, c.content, c.created_at,
               u.username, u.first_name, u.last_name,
               s.name as startup_name
        FROM Comments c
        JOIN Users u ON c.user_id = u.id
        JOIN Startups s ON c.startup_id = s.id
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `, [parseInt(limit), parseInt(offset)]);
      
      results.comments = comments;
    }

    res.json(results);

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
