// routes/startups.js
const express = require("express");
const { pool } = require('../config/database');
const { optionalAuth, authenticateToken } = require("../middleware/auth");
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { validateStartupCreation } = require("../utils/validation");

const router = express.Router();

// ✅ Get all startups (with reactions + comments count + pagination)
router.get("/", optionalAuth, async (req, res) => {
  try {
    // safely parse query params
    let limit = parseInt(req.query.limit, 10);
    let offset = parseInt(req.query.offset, 10);

    if (isNaN(limit) || limit <= 0) limit = 10;
    if (isNaN(offset) || offset < 0) offset = 0;

    // Get startups first
    const [startups] = await pool.query(
      `SELECT s.*, u.username as creator_username
      FROM Startups s
      JOIN Users u ON s.created_by_user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`
    );

    // Get reaction counts for each startup
    const startupIds = startups.map(s => s.id);
    let rows = startups;

    if (startupIds.length > 0) {
      const placeholders = startupIds.map(() => '?').join(',');
      
      const [reactions] = await pool.query(
        `SELECT startup_id, type, COUNT(*) as count
         FROM Reactions 
         WHERE startup_id IN (${startupIds.join(',')})
         GROUP BY startup_id, type`
      );

      const [comments] = await pool.query(
        `SELECT startup_id, COUNT(*) as count
         FROM Comments 
         WHERE startup_id IN (${startupIds.join(',')})
         GROUP BY startup_id`
      );

      // Add counts to startups
      rows = startups.map(startup => {
        const startupReactions = reactions.filter(r => r.startup_id === startup.id);
        const startupComments = comments.find(c => c.startup_id === startup.id);
        
        return {
          ...startup,
          upvotes: startupReactions.find(r => r.type === 'upvote')?.count || 0,
          downvotes: startupReactions.find(r => r.type === 'downvote')?.count || 0,
          pivot: startupReactions.find(r => r.type === 'pivot')?.count || 0,
          comment_count: startupComments?.count || 0
        };
      });
    } else {
      rows = startups.map(startup => ({
        ...startup,
        upvotes: 0,
        downvotes: 0,
        pivot: 0,
        comment_count: 0
      }));
    }

    res.json(rows);
  } catch (err) {
    console.error("Get startups error:", err);
    res.status(500).json({ error: "Failed to fetch startups" });
  }
});

// ✅ Get featured startups (MUST be before /:id route)
router.get("/featured", optionalAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'upvote'), 0) as upvotes,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'downvote'), 0) as downvotes,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'pivot'), 0) as pivot,
             COALESCE((SELECT COUNT(*) FROM Comments c WHERE c.startup_id = s.id), 0) as comment_count
      FROM Startups s
      JOIN Users u ON s.created_by_user_id = u.id
      WHERE s.funding_amount_usd >= 100000 OR 
            (SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id) > 5
      ORDER BY s.created_at DESC
      LIMIT 10`
    );

    res.json(rows);
  } catch (err) {
    console.error("Get featured startups error:", err);
    res.status(500).json({ error: "Failed to fetch featured startups" });
  }
});

// ✅ Get single startup by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT s.*, u.username as creator_username,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'upvote'), 0) as upvotes,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'downvote'), 0) as downvotes,
             COALESCE((SELECT COUNT(*) FROM Reactions r WHERE r.startup_id = s.id AND r.type = 'pivot'), 0) as pivot,
             COALESCE((SELECT COUNT(*) FROM Comments c WHERE c.startup_id = s.id), 0) as comment_count
      FROM Startups s
      JOIN Users u ON s.created_by_user_id = u.id
      WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get startup by ID error:", err);
    res.status(500).json({ error: "Failed to fetch startup" });
  }
});

// ✅ Create a new startup
router.post("/", authenticateToken, validateStartupCreation, async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      vision,
      autopsy_report,
      primary_failure_reason,
      lessons_learned,
      founded_year,
      died_year,
      stage_at_death,
      funding_amount_usd,
      key_investors,
      peak_metrics,
      links,
      is_anonymous = false
    } = req.body;
    const userId = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO Startups (
        name, description, industry, vision, autopsy_report, primary_failure_reason,
        lessons_learned, founded_year, died_year, stage_at_death, funding_amount_usd,
        key_investors, peak_metrics, links, is_anonymous, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, industry, vision, autopsy_report, primary_failure_reason,
        lessons_learned, founded_year, died_year, stage_at_death, funding_amount_usd,
        JSON.stringify(key_investors), JSON.stringify(peak_metrics), JSON.stringify(links),
        is_anonymous, userId
      ]
    );

    // Get the created startup with user info
    const [newStartup] = await pool.execute(
      `SELECT s.*, u.username as creator_username
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newStartup[0]);
  } catch (err) {
    console.error("Create startup error:", err);
    res.status(500).json({ error: "Failed to create startup" });
  }
});

// ✅ Update a startup (only by creator)
router.put("/:id", authenticateToken, validateStartupCreation, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if startup exists and user is the creator
    const [existing] = await pool.execute(
      "SELECT created_by_user_id FROM Startups WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    if (existing[0].created_by_user_id !== userId) {
      return res.status(403).json({ error: "You can only update your own startups" });
    }

    const {
      name, description, industry, vision, autopsy_report, primary_failure_reason,
      lessons_learned, founded_year, died_year, stage_at_death, funding_amount_usd,
      key_investors, peak_metrics, links, is_anonymous
    } = req.body;

    await pool.execute(
      `UPDATE Startups SET
        name = ?, description = ?, industry = ?, vision = ?, autopsy_report = ?,
        primary_failure_reason = ?, lessons_learned = ?, founded_year = ?, died_year = ?,
        stage_at_death = ?, funding_amount_usd = ?, key_investors = ?, peak_metrics = ?,
        links = ?, is_anonymous = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, description, industry, vision, autopsy_report, primary_failure_reason,
        lessons_learned, founded_year, died_year, stage_at_death, funding_amount_usd,
        JSON.stringify(key_investors), JSON.stringify(peak_metrics), JSON.stringify(links),
        is_anonymous, id
      ]
    );

    // Get updated startup
    const [updated] = await pool.execute(
      `SELECT s.*, u.username as creator_username
       FROM Startups s
       JOIN Users u ON s.created_by_user_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error("Update startup error:", err);
    res.status(500).json({ error: "Failed to update startup" });
  }
});

// ✅ Delete a startup (only by creator)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if startup exists and user is the creator
    const [existing] = await pool.execute(
      "SELECT created_by_user_id FROM Startups WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    if (existing[0].created_by_user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own startups" });
    }

    await pool.execute("DELETE FROM Startups WHERE id = ?", [id]);

    res.json({ message: "Startup deleted successfully" });
  } catch (err) {
    console.error("Delete startup error:", err);
    res.status(500).json({ error: "Failed to delete startup" });
  }
});

// ✅ Request to join a startup team
router.post("/:startupId/join-requests", authenticateToken, async (req, res) => {
  try {
    const { startupId } = req.params;
    const userId = req.user.id;
    const { role_title, tenure_start_year, tenure_end_year, message } = req.body;

    // Validate required fields
    if (!role_title) {
      return res.status(400).json({ error: "Role title is required" });
    }

    // Check if startup exists
    const [startup] = await pool.execute(
      "SELECT id, created_by_user_id FROM Startups WHERE id = ?",
      [startupId]
    );

    if (startup.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    // Check if user is trying to join their own startup
    if (startup[0].created_by_user_id === userId) {
      return res.status(400).json({ error: "You cannot request to join your own startup" });
    }

    // Check if user is already a team member
    const [existingMember] = await pool.execute(
      "SELECT id FROM TeamMembers WHERE user_id = ? AND startup_id = ?",
      [userId, startupId]
    );

    if (existingMember.length > 0) {
      return res.status(400).json({ error: "You are already a member of this startup team" });
    }

    // Check if there's already a pending request
    const [existingRequest] = await pool.execute(
      "SELECT id FROM TeamJoinRequests WHERE user_id = ? AND startup_id = ? AND status = 'pending'",
      [userId, startupId]
    );

    if (existingRequest.length > 0) {
      return res.status(400).json({ error: "You already have a pending request for this startup" });
    }

    // Create the join request
    const [result] = await pool.execute(
      `INSERT INTO TeamJoinRequests (user_id, startup_id, role_title, tenure_start_year, tenure_end_year, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, startupId, role_title, tenure_start_year, tenure_end_year, message]
    );

    // Get the created request with user info
    const [newRequest] = await pool.execute(
      `SELECT tjr.*, u.username, u.first_name, u.last_name, u.email
       FROM TeamJoinRequests tjr
       JOIN Users u ON tjr.user_id = u.id
       WHERE tjr.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (err) {
    console.error("Create join request error:", err);
    res.status(500).json({ error: "Failed to create join request" });
  }
});

// ✅ Get pending join requests for a startup (creator only)
router.get("/:startupId/join-requests", authenticateToken, async (req, res) => {
  try {
    const { startupId } = req.params;
    const userId = req.user.id;

    // Check if startup exists and user is the creator
    const [startup] = await pool.execute(
      "SELECT created_by_user_id FROM Startups WHERE id = ?",
      [startupId]
    );

    if (startup.length === 0) {
      return res.status(404).json({ error: "Startup not found" });
    }

    if (startup[0].created_by_user_id !== userId) {
      return res.status(403).json({ error: "Only the startup creator can view join requests" });
    }

    // Get all pending requests with user information
    const [requests] = await pool.execute(
      `SELECT tjr.*, u.username, u.first_name, u.last_name, u.email, u.bio, u.skills, u.linkedin_url, u.github_url
       FROM TeamJoinRequests tjr
       JOIN Users u ON tjr.user_id = u.id
       WHERE tjr.startup_id = ? AND tjr.status = 'pending'
       ORDER BY tjr.created_at DESC`,
      [startupId]
    );

    res.json(requests);
  } catch (err) {
    console.error("Get join requests error:", err);
    res.status(500).json({ error: "Failed to fetch join requests" });
  }
});

// POST /api/startups/:id/logo - Upload startup logo
router.post('/:id/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if startup exists and user owns it
    const [startups] = await pool.execute(
      'SELECT user_id, logo_url FROM Startups WHERE id = ?',
      [id]
    );

    if (startups.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Startup not found' });
    }

    if (startups[0].user_id !== req.user.id) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Not authorized to update this startup' });
    }

    // Delete old logo if exists
    if (startups[0].logo_url) {
      const oldLogoPath = path.join(__dirname, '..', 'uploads', path.basename(startups[0].logo_url));
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Update startup with new logo URL
    const logoUrl = `/uploads/${req.file.filename}`;
    await pool.execute(
      'UPDATE Startups SET logo_url = ? WHERE id = ?',
      [logoUrl, id]
    );

    res.json({
      message: 'Logo uploaded successfully',
      logo_url: logoUrl
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/startups/:id/logo - Delete startup logo
router.delete('/:id/logo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if startup exists and user owns it
    const [startups] = await pool.execute(
      'SELECT user_id, logo_url FROM Startups WHERE id = ?',
      [id]
    );

    if (startups.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    if (startups[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this startup' });
    }

    // Delete logo file if exists
    if (startups[0].logo_url) {
      const logoPath = path.join(__dirname, '..', 'uploads', path.basename(startups[0].logo_url));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Update startup to remove logo URL
    await pool.execute(
      'UPDATE Startups SET logo_url = NULL WHERE id = ?',
      [id]
    );

    res.json({ message: 'Logo deleted successfully' });

  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
