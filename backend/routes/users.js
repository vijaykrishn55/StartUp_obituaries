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

// Public routes
router.get('/', searchUsers);
router.get('/:id', getUserById);

// Protected routes
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/avatar', protect, uploadAvatar);

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

module.exports = router;
