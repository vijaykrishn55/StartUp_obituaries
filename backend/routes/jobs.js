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
router.get('/:id', getJobById);

// Protected routes
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', protect, applyToJob);
router.get('/:id/applications', protect, getJobApplications);
router.get('/my-applications', protect, getMyApplications);
router.get('/my-postings', protect, getMyPostings);

module.exports = router;
