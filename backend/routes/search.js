const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');

// @desc    Global search
// @route   GET /api/search
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Search query is required' }
      });
    }

    const searchRegex = { $regex: q, $options: 'i' };

    const [users, posts, jobs] = await Promise.all([
      User.find({
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { bio: searchRegex }
        ]
      })
        .select('name avatar company userType bio')
        .limit(parseInt(limit))
        .lean(),

      Post.find({
        published: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      })
        .populate('author', 'name avatar')
        .limit(parseInt(limit))
        .lean(),

      Job.find({
        status: 'active',
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { description: searchRegex }
        ]
      })
        .populate('postedBy', 'name avatar')
        .limit(parseInt(limit))
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        users,
        posts,
        jobs
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search users
// @route   GET /api/search/users
// @access  Public
router.get('/users', async (req, res, next) => {
  try {
    const { q, userType, location, page = 1, limit = 20 } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (userType) query.userType = userType;
    if (location) query.location = { $regex: location, $options: 'i' };

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('name avatar company userType bio location verified')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
