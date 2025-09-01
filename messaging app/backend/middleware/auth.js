const jwt = require('jsonwebtoken');
const db = require('../database/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details from database
    const user = await db.get(
      'SELECT id, username, email, display_name, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

module.exports = {
  authenticateToken
};