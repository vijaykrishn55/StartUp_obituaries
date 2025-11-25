const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' }
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar userType');

    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' }
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' }
      });
    }

    const likeIndex = comment.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: comment.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reply to comment
// @route   POST /api/comments/:id/reply
// @access  Private
router.post('/:id/reply', protect, async (req, res, next) => {
  try {
    const parentComment = await Comment.findById(req.params.id);

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' }
      });
    }

    const reply = await Comment.create({
      post: parentComment.post,
      author: req.user.id,
      content: req.body.content
    });

    parentComment.replies.push(reply._id);
    await parentComment.save();

    const populatedReply = await Comment.findById(reply._id)
      .populate('author', 'name avatar userType');

    res.status(201).json({ success: true, data: populatedReply });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
