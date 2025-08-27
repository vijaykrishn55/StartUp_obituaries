const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateTeamMember } = require('../utils/validation');

const router = express.Router();

// GET /api/startups/:startupId/team - Get all team members for a startup
router.get('/startups/:startupId/team', async (req, res) => {
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

    const [teamMembers] = await pool.execute(
      `SELECT tm.id, tm.role_title, tm.tenure_start_year, tm.tenure_end_year,
              u.id as user_id, u.username, u.first_name, u.last_name, 
              u.linkedin_url, u.github_url
       FROM TeamMembers tm
       JOIN Users u ON tm.user_id = u.id
       WHERE tm.startup_id = ?
       ORDER BY tm.tenure_start_year DESC`,
      [startupId]
    );

    res.json({ teamMembers });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/startups/:startupId/team - Add yourself to a startup's team
router.post('/startups/:startupId/team', authenticateToken, validateTeamMember, async (req, res) => {
  try {
    const { startupId } = req.params;
    const { role_title, tenure_start_year, tenure_end_year } = req.body;

    // Check if startup exists
    const [startups] = await pool.execute(
      'SELECT id FROM Startups WHERE id = ?',
      [startupId]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Check if user is already a team member
    const [existingMember] = await pool.execute(
      'SELECT id FROM TeamMembers WHERE user_id = ? AND startup_id = ?',
      [req.user.id, startupId]
    );

    if (existingMember.length > 0) {
      return res.status(409).json({ error: 'You are already a member of this startup team' });
    }

    // Add team member
    const [result] = await pool.execute(
      'INSERT INTO TeamMembers (user_id, startup_id, role_title, tenure_start_year, tenure_end_year) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, startupId, role_title, tenure_start_year, tenure_end_year]
    );

    // Get the created team member with user info
    const [newMember] = await pool.execute(
      `SELECT tm.id, tm.role_title, tm.tenure_start_year, tm.tenure_end_year,
              u.id as user_id, u.username, u.first_name, u.last_name,
              u.linkedin_url, u.github_url
       FROM TeamMembers tm
       JOIN Users u ON tm.user_id = u.id
       WHERE tm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Successfully added to team',
      teamMember: newMember[0]
    });

  } catch (error) {
    console.error('Add team member error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You are already a member of this startup team' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/team/:memberId - Remove a member from team
router.delete('/team/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get team member info
    const [members] = await pool.execute(
      `SELECT tm.*, s.created_by_user_id
       FROM TeamMembers tm
       JOIN Startups s ON tm.startup_id = s.id
       WHERE tm.id = ?`,
      [memberId]
    );

    if (members.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const member = members[0];

    // Check if user can remove this member (either the member themselves or the startup creator)
    if (member.user_id !== req.user.id && member.created_by_user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only remove yourself or members from your own startup' });
    }

    await pool.execute('DELETE FROM TeamMembers WHERE id = ?', [memberId]);

    res.json({ message: 'Team member removed successfully' });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/join-requests/:requestId - Approve or reject a join request (startup creator only)
router.put('/join-requests/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const userId = req.user.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    // Get the join request with startup info
    const [requests] = await pool.execute(
      `SELECT tjr.*, s.created_by_user_id
       FROM TeamJoinRequests tjr
       JOIN Startups s ON tjr.startup_id = s.id
       WHERE tjr.id = ? AND tjr.status = 'pending'`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Join request not found or already processed' });
    }

    const request = requests[0];

    // Check if user is the startup creator
    if (request.created_by_user_id !== userId) {
      return res.status(403).json({ error: 'Only the startup creator can approve or reject join requests' });
    }

    // Update the request status
    await pool.execute(
      'UPDATE TeamJoinRequests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, requestId]
    );

    // If approved, add the user to the team
    if (status === 'approved') {
      // Check if user is already a team member (safety check)
      const [existingMember] = await pool.execute(
        'SELECT id FROM TeamMembers WHERE user_id = ? AND startup_id = ?',
        [request.user_id, request.startup_id]
      );

      if (existingMember.length === 0) {
        await pool.execute(
          'INSERT INTO TeamMembers (user_id, startup_id, role_title, tenure_start_year, tenure_end_year) VALUES (?, ?, ?, ?, ?)',
          [request.user_id, request.startup_id, request.role_title, request.tenure_start_year, request.tenure_end_year]
        );
      }
    }

    // Get updated request with user info
    const [updatedRequest] = await pool.execute(
      `SELECT tjr.*, u.username, u.first_name, u.last_name, u.email
       FROM TeamJoinRequests tjr
       JOIN Users u ON tjr.user_id = u.id
       WHERE tjr.id = ?`,
      [requestId]
    );

    res.json({
      message: `Join request ${status} successfully`,
      request: updatedRequest[0]
    });

  } catch (error) {
    console.error('Update join request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
