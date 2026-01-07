const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addSkill,
  deleteSkill,
  addVenture,
  deleteVenture
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadService');

// Public routes
router.get('/', searchUsers);

// Protected routes - MUST come before /:id to prevent route shadowing
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

// Experience
router.post('/me/experience', protect, addExperience);
router.put('/me/experience/:id', protect, updateExperience);
router.delete('/me/experience/:id', protect, deleteExperience);

// Education
router.post('/me/education', protect, addEducation);
router.delete('/me/education/:id', protect, deleteEducation);

// Skills
router.post('/me/skills', protect, addSkill);
router.delete('/me/skills/:id', protect, deleteSkill);

// Ventures
router.post('/me/ventures', protect, addVenture);
router.delete('/me/ventures/:id', protect, deleteVenture);

// Connections count
router.get('/me/connections-count', protect, async (req, res, next) => {
  try {
    const Connection = require('../models/Connection');
    const count = await Connection.countDocuments({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Profile Analytics endpoint
router.get('/me/analytics', protect, async (req, res, next) => {
  try {
    const Connection = require('../models/Connection');
    const Post = require('../models/Post');
    const User = require('../models/User');
    
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get the user's current profile views
    const user = await User.findById(userId);
    
    // Get connections count (new connections in last 30 days)
    const newConnections = await Connection.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ],
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    // Total connections
    const totalConnections = await Connection.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    // Get user's posts and calculate impressions/engagement
    const userPosts = await Post.find({ 
      author: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    let totalLikes = 0;
    let totalComments = 0;
    let postImpressions = 0;
    
    userPosts.forEach(post => {
      totalLikes += post.likes?.length || 0;
      totalComments += post.comments?.length || 0;
      // Estimate impressions as likes * 10 + comments * 5 + base views
      postImpressions += (post.likes?.length || 0) * 10 + (post.comments?.length || 0) * 5 + 50;
    });
    
    // Calculate engagement rate
    const totalEngagements = totalLikes + totalComments;
    const engagementRate = postImpressions > 0 
      ? ((totalEngagements / postImpressions) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      data: {
        profileViews: user.profileViews || 0,
        postImpressions,
        newConnections,
        totalConnections,
        engagementRate: parseFloat(engagementRate),
        postsCount: userPosts.length,
        totalLikes,
        totalComments
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    next(error);
  }
});

router.get('/:id/connections-count', async (req, res, next) => {
  try {
    const Connection = require('../models/Connection');
    const count = await Connection.countDocuments({
      $or: [
        { requester: req.params.id, status: 'accepted' },
        { recipient: req.params.id, status: 'accepted' }
      ]
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Dynamic route - MUST come last
router.get('/:id', getUserById);

module.exports = router;
