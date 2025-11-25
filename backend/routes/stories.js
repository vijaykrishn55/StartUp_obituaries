const express = require('express');
const router = express.Router();
const {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  likeStory
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getStories);
router.get('/:id', getStoryById);

// Protected routes
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);
router.post('/:id/like', protect, likeStory);

module.exports = router;
