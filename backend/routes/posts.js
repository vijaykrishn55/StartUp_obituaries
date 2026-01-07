const express = require('express');
const router = express.Router();
const {
  getPosts,
  getTrendingPosts,
  getBookmarkedPosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  sharePost,
  getPostComments,
  addComment,
  votePoll
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/bookmarked', protect, getBookmarkedPosts); // MUST be before /:id
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPostById);
router.get('/:id/comments', getPostComments);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/share', protect, sharePost);
router.post('/:id/comments', protect, addComment);
router.post('/:id/poll/vote', protect, votePoll);

module.exports = router;
