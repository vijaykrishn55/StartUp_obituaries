const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
// Simple validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password, first_name, last_name } = req.body;
  
  if (!first_name || first_name.trim().length === 0) {
    return res.status(400).json({ error: 'First name is required' });
  }
  
  if (!last_name || last_name.trim().length === 0) {
    return res.status(400).json({ error: 'Last name is required' });
  }
  
  if (!username || username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
  }
  
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  next();
};


const { sendPasswordResetEmail } = require('../utils/email');

// JWT token generation helper
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, user_role = 'student', is_recruiter = false } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM Users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const [result] = await pool.execute(
      `INSERT INTO Users (username, email, password_hash, first_name, last_name, user_role, is_recruiter) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, first_name.trim(), last_name.trim(), user_role, is_recruiter]
    );

    // Generate JWT token
    const token = generateToken(result.insertId);

    // Get the created user (without password)
    const [newUser] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, bio, skills, linkedin_url, github_url, user_role, is_recruiter, open_to_work, open_to_co_founding, created_at FROM Users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, first_name, last_name, bio, skills, linkedin_url, github_url, is_recruiter, open_to_work, open_to_co_founding, created_at FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, bio, skills, linkedin_url, github_url, user_role, is_recruiter, open_to_work, open_to_co_founding, created_at, updated_at FROM Users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/profile - Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, bio, skills, linkedin_url, github_url, open_to_work, open_to_co_founding } = req.body;

    // Update user profile
    await pool.execute(
      `UPDATE Users SET 
         first_name = ?, last_name = ?, bio = ?, skills = ?, 
         linkedin_url = ?, github_url = ?, open_to_work = ?, open_to_co_founding = ?
       WHERE id = ?`,
      [first_name, last_name, bio, JSON.stringify(skills), linkedin_url, github_url, open_to_work, open_to_co_founding, req.user.id]
    );

    // Get updated user data
    const [users] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, bio, skills, linkedin_url, github_url, user_role, is_recruiter, open_to_work, open_to_co_founding, created_at, updated_at FROM Users WHERE id = ?',
      [req.user.id]
    );

    res.json(users[0]);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, username, first_name, last_name FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, we\'ve sent a password reset link.' });
    }

    const user = users[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await pool.execute(
      'INSERT INTO PasswordResetTokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    // Send email
    const userName = user.first_name || user.username;
    const emailResult = await sendPasswordResetEmail(email, resetToken, userName);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    res.json({ message: 'If an account with that email exists, we\'ve sent a password reset link.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find valid token
    const [tokens] = await pool.execute(
      `SELECT prt.id, prt.user_id, u.email 
       FROM PasswordResetTokens prt
       JOIN Users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetRecord = tokens[0];

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and mark token as used
    await pool.execute('BEGIN');
    
    try {
      await pool.execute(
        'UPDATE Users SET password_hash = ? WHERE id = ?',
        [hashedPassword, resetRecord.user_id]
      );

      await pool.execute(
        'UPDATE PasswordResetTokens SET used = TRUE WHERE id = ?',
        [resetRecord.id]
      );

      await pool.execute('COMMIT');

      res.json({ message: 'Password reset successfully' });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
