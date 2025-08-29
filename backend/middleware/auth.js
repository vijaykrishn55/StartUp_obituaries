const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET
    // No expiration - tokens never expire
  );
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = { id: decoded.userId };
    req.userId = decoded.userId; // Keep for backward compatibility
    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }, (err, decoded) => {
      if (!err) {
        req.user = { id: decoded.userId };
        req.userId = decoded.userId; // Keep for backward compatibility
      }
    });
  }
  
  next();
};

// Middleware to require recruiter role
const requireRecruiter = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const [rows] = await pool.execute(
      'SELECT is_recruiter FROM Users WHERE id = ?',
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!rows[0].is_recruiter) {
      return res.status(403).json({ error: 'Recruiter access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking recruiter status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireRecruiter
};
