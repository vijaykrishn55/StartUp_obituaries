const Story = require('../models/Story');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    
    const query = { published: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const stories = await Story.find(query)
      .populate('author.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get story by ID
// @route   GET /api/stories/:id
// @access  Public
exports.getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author.userId', 'name avatar bio');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    // Increment views
    await Story.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res, next) => {
  try {
    const storyData = {
      ...req.body,
      author: {
        userId: req.user.id,
        name: req.user.name,
        role: req.user.userType
      }
    };

    const story = await Story.create(storyData);
    const populatedStory = await Story.findById(story._id)
      .populate('author.userId', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedStory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
exports.updateStory = async (req, res, next) => {
  try {
    let story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    if (story.author.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this story' }
      });
    }

    story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author.userId', 'name avatar');

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    if (story.author.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this story' }
      });
    }

    await story.deleteOne();

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike story
// @route   POST /api/stories/:id/like
// @access  Private
exports.likeStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    const likeIndex = story.likes.indexOf(req.user.id);
    
    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push(req.user.id);
    }

    await story.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: story.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
};
