const express = require('express');
const router = express.Router();
const {
  getFounders,
  getFounderById,
  createFounderProfile,
  updateFounderProfile,
  deleteFounderProfile
} = require('../controllers/founderController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getFounders);
router.get('/:id', getFounderById);

// Protected routes
router.post('/', protect, createFounderProfile);
router.put('/:id', protect, updateFounderProfile);
router.delete('/:id', protect, deleteFounderProfile);

module.exports = router;
