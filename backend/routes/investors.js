const express = require('express');
const router = express.Router();
const {
  getInvestors,
  getInvestorById,
  createInvestorProfile,
  updateInvestorProfile,
  deleteInvestorProfile
} = require('../controllers/investorController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getInvestors);
router.get('/:id', getInvestorById);

// Protected routes
router.post('/', protect, createInvestorProfile);
router.put('/:id', protect, updateInvestorProfile);
router.delete('/:id', protect, deleteInvestorProfile);

module.exports = router;
