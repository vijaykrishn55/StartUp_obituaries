const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const startupRoutes = require('./routes/startups');
const teamRoutes = require('./routes/team');
const reactionRoutes = require('./routes/reactions');
const commentRoutes = require('./routes/comments');
const connectionRoutes = require('./routes/connections');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const leaderboardRoutes = require('./routes/leaderboards');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api', teamRoutes); // Team routes include both /startups/:id/team and /team/:id
app.use('/api/startups', reactionRoutes); // Reaction routes for /startups/:id/reactions
app.use('/api/comments', commentRoutes); // Comment routes for /startups/:id/comments and /comments/:id
app.use('/api/connections', connectionRoutes); // Connection routes
app.use('/api/conversations', conversationRoutes); // Conversation routes
app.use('/api/messages', messageRoutes); // Message routes
app.use('/api/leaderboards', leaderboardRoutes); // Leaderboard routes
app.use('/api', require('./routes/stats')); // Stats routes - mount at /api to match /users/:userId/stats
app.use('/api/admin', require('./routes/admin')); // Admin routes
app.use('/api/reports', require('./routes/reports')); // Reports routes
app.use('/api/analytics', require('./routes/analytics')); // Analytics routes

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message,
      stack: err.stack
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize Socket.IO
    const io = initializeSocket(server);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO server initialized`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
