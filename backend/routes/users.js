const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRecruiter } = require('../middleware/auth');
const { validateProfileUpdate } = require('../utils/validation');

const router = express.Router();

// GET /api/users - Get list of users (for all users to browse and connect)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limitNum = parseInt(req.query.limit) || 20;
    const offsetNum = parseInt(req.query.offset) || 0;
    const { skills, openToWork } = req.query;
    
    // Build base query
    let query = `
      SELECT id, username, email, first_name, last_name, bio, skills, 
             linkedin_url, github_url, open_to_work, open_to_co_founding, is_recruiter, created_at
      FROM Users 
      WHERE id != ?
    `;
    
    const queryParams = [req.user.id];
    
    // Add filters
    if (skills) {
      query += ` AND JSON_SEARCH(skills, 'one', ?) IS NOT NULL`;
      queryParams.push(skills);
    }
    
    if (openToWork !== undefined) {
      query += ` AND open_to_work = ?`;
      queryParams.push(openToWork === 'true' ? 1 : 0);
    }
    
    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    console.log('Final Query:', query);
    console.log('Query Params:', queryParams);
    
    const [users] = await pool.execute(query, queryParams);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM Users WHERE id != ?`;
    const countParams = [req.user.id];
    
    if (skills) {
      countQuery += ` AND JSON_SEARCH(skills, 'one', ?) IS NOT NULL`;
      countParams.push(skills);
    }
    
    if (openToWork !== undefined) {
      countQuery += ` AND open_to_work = ?`;
      countParams.push(openToWork === 'true' ? 1 : 0);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      users,
      pagination: {
        total: countResult[0].total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < countResult[0].total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:userId - Get specific user's public profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [users] = await pool.execute(
      `SELECT id, username, email, first_name, last_name, bio, skills, 
              linkedin_url, github_url, open_to_work, open_to_co_founding, created_at
       FROM Users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's startup involvement
    const [startups] = await pool.execute(
      `SELECT s.id, s.name, s.industry, s.primary_failure_reason, s.founded_year, s.died_year,
              tm.role_title, tm.tenure_start_year, tm.tenure_end_year
       FROM Startups s
       JOIN TeamMembers tm ON s.id = tm.startup_id
       WHERE tm.user_id = ?
       ORDER BY s.died_year DESC`,
      [userId]
    );

    res.json({
      user: users[0],
      startups
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile - Update logged-in user's profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      bio,
      skills,
      linkedin_url,
      github_url,
      open_to_work,
      open_to_co_founding
    } = req.body;

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (skills !== undefined) {
      updateFields.push('skills = ?');
      updateValues.push(JSON.stringify(skills));
    }
    if (linkedin_url !== undefined) {
      updateFields.push('linkedin_url = ?');
      updateValues.push(linkedin_url);
    }
    if (github_url !== undefined) {
      updateFields.push('github_url = ?');
      updateValues.push(github_url);
    }
    if (open_to_work !== undefined) {
      updateFields.push('open_to_work = ?');
      updateValues.push(open_to_work);
    }
    if (open_to_co_founding !== undefined) {
      updateFields.push('open_to_co_founding = ?');
      updateValues.push(open_to_co_founding);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(req.user.id);

    const query = `UPDATE Users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await pool.execute(query, updateValues);

    // Get updated user profile
    const [updatedUser] = await pool.execute(
      `SELECT id, username, email, first_name, last_name, bio, skills, 
              linkedin_url, github_url, is_recruiter, open_to_work, open_to_co_founding, 
              created_at, updated_at 
       FROM Users WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
