const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  getMyApplications,
  getMyPostings
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);

// Protected routes - specific paths MUST come before /:id
router.get('/my-applications', protect, getMyApplications);
router.get('/my-postings', protect, getMyPostings);
router.post('/', protect, createJob);

// Parameterized routes
router.get('/:id', getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, applyToJob);
router.get('/:id/applications', protect, getJobApplications);

module.exports = router;
