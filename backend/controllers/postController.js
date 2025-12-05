const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all posts with filters and pagination
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      tags,
      author,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { published: true };

    // Filters
    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate('author', 'name avatar userType verified company headline role')
      .sort({ [sort]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending posts
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await Post.find({ published: true, trending: true })
      .populate('author', 'name avatar userType verified company headline role')
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked posts
// @route   GET /api/posts/bookmarked
// @access  Private
exports.getBookmarkedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ bookmarkedBy: req.user.id })
      .populate('author', 'name avatar userType verified company headline role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Post.countDocuments({ bookmarkedBy: req.user.id });

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by specific user
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId, published: true })
      .populate('author', 'name avatar userType verified company headline role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Post.countDocuments({ author: req.params.userId, published: true });

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar userType verified company headline role bio')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    console.log('Creating post with data:', JSON.stringify(req.body, null, 2));
    
    const postData = {
      ...req.body,
      author: req.user.id
    };

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar userType verified company headline role');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    console.error('Post creation error:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this post' }
      });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar userType verified company headline role');

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this post' }
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id);

      // Create notification for post author (if not self-like)
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.author,
          type: 'post_like',
          actor: req.user.id,
          relatedEntity: { type: 'post', id: post._id },
          message: 'liked your post'
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: post.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark/Unbookmark post
// @route   POST /api/posts/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    const bookmarkIndex = post.bookmarkedBy.indexOf(req.user.id);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      post.bookmarkedBy.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      post.bookmarkedBy.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        bookmarked: bookmarkIndex === -1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post comments
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name avatar userType verified')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'name avatar userType verified' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
      });
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user.id,
      content: req.body.content
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar userType verified');

    // Add comment reference to post
    post.comments.push(comment._id);
    await post.save();

    // Create notification for post author (if not self-comment)
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        type: 'post_comment',
        actor: req.user.id,
        relatedEntity: { type: 'post', id: post._id },
        message: 'commented on your post'
      });
    }

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on poll
// @route   POST /api/posts/:id/poll/vote
// @access  Private
exports.votePoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || !post.poll) {
      return res.status(404).json({
        success: false,
        error: { code: 'POLL_NOT_FOUND', message: 'Poll not found' }
      });
    }

    if (post.poll.endsAt && new Date() > post.poll.endsAt) {
      return res.status(400).json({
        success: false,
        error: { code: 'POLL_ENDED', message: 'This poll has ended' }
      });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OPTION', message: 'Invalid poll option' }
      });
    }

    // Check if user already voted
    const hasVoted = post.poll.options.some(option => 
      option.votes.includes(req.user.id)
    );

    if (hasVoted && !post.poll.multipleChoice) {
      // Remove previous vote
      post.poll.options.forEach(option => {
        const voteIndex = option.votes.indexOf(req.user.id);
        if (voteIndex > -1) {
          option.votes.splice(voteIndex, 1);
        }
      });
    }

    // Add new vote
    post.poll.options[optionIndex].votes.push(req.user.id);
    await post.save();

    res.json({
      success: true,
      data: {
        poll: post.poll
      }
    });
  } catch (error) {
    next(error);
  }
};
