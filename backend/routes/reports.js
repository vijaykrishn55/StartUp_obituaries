const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports - Create a new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      reported_startup_id,
      reported_comment_id,
      reported_user_id,
      report_type,
      reason
    } = req.body;

    // Validate that exactly one target is specified
    const targets = [reported_startup_id, reported_comment_id, reported_user_id].filter(Boolean);
    if (targets.length !== 1) {
      return res.status(400).json({ 
        error: 'Must specify exactly one target to report (startup, comment, or user)' 
      });
    }

    // Validate report type
    const validTypes = ['spam', 'inappropriate', 'fake', 'harassment', 'copyright', 'other'];
    if (!validTypes.includes(report_type)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // Check if user has already reported this content
    let existingReportQuery = 'SELECT id FROM Reports WHERE reporter_user_id = ?';
    const queryParams = [req.user.id];

    if (reported_startup_id) {
      existingReportQuery += ' AND reported_startup_id = ?';
      queryParams.push(reported_startup_id);
    } else if (reported_comment_id) {
      existingReportQuery += ' AND reported_comment_id = ?';
      queryParams.push(reported_comment_id);
    } else if (reported_user_id) {
      existingReportQuery += ' AND reported_user_id = ?';
      queryParams.push(reported_user_id);
    }

    const [existingReports] = await pool.execute(existingReportQuery, queryParams);
    if (existingReports.length > 0) {
      return res.status(400).json({ error: 'You have already reported this content' });
    }

    // Create the report
    const [result] = await pool.execute(
      `INSERT INTO Reports (
        reporter_user_id, reported_startup_id, reported_comment_id, 
        reported_user_id, report_type, reason
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        reported_startup_id || null,
        reported_comment_id || null,
        reported_user_id || null,
        report_type,
        reason || null
      ]
    );

    res.status(201).json({
      message: 'Report submitted successfully',
      report_id: result.insertId
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports - Get reports for admin (requires admin role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin/recruiter
    if (req.user.user_role !== 'recruiter' && !req.user.is_recruiter) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status = 'pending', limit = 20, offset = 0 } = req.query;

    const [reports] = await pool.execute(
      `SELECT 
        r.*,
        reporter.username as reporter_username,
        reviewer.username as reviewer_username,
        s.name as startup_name,
        c.content as comment_content,
        reported_user.username as reported_username
      FROM Reports r
      LEFT JOIN Users reporter ON r.reporter_user_id = reporter.id
      LEFT JOIN Users reviewer ON r.reviewed_by_user_id = reviewer.id
      LEFT JOIN Startups s ON r.reported_startup_id = s.id
      LEFT JOIN Comments c ON r.reported_comment_id = c.id
      LEFT JOIN Users reported_user ON r.reported_user_id = reported_user.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [status, parseInt(limit), parseInt(offset)]
    );

    res.json({ reports });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reports/:id/status - Update report status (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin/recruiter
    if (req.user.user_role !== 'recruiter' && !req.user.is_recruiter) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, action } = req.body;

    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update report status
    await pool.execute(
      `UPDATE Reports 
       SET status = ?, reviewed_by_user_id = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, req.user.id, id]
    );

    // If resolving, take action on the reported content
    if (status === 'resolved' && action) {
      const [reportData] = await pool.execute(
        'SELECT * FROM Reports WHERE id = ?',
        [id]
      );

      if (reportData.length > 0) {
        const report = reportData[0];

        if (action === 'delete_content') {
          if (report.reported_startup_id) {
            await pool.execute('DELETE FROM Startups WHERE id = ?', [report.reported_startup_id]);
          } else if (report.reported_comment_id) {
            await pool.execute('DELETE FROM Comments WHERE id = ?', [report.reported_comment_id]);
          }
        } else if (action === 'suspend_user' && report.reported_user_id) {
          // Add suspension logic here if needed
          await pool.execute(
            'UPDATE Users SET is_suspended = TRUE WHERE id = ?',
            [report.reported_user_id]
          );
        }
      }
    }

    res.json({ message: 'Report status updated successfully' });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
