const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const failureReportController = require('../controllers/failureReportController');

// Create failure report
router.post('/', protect, failureReportController.createFailureReport);

// Get all failure reports
router.get('/', failureReportController.getFailureReports);

// Get heatmap data
router.get('/heatmap', failureReportController.getHeatmapData);

// Get analytics
router.get('/analytics', failureReportController.getAnalytics);

// Get nearby failures
router.get('/nearby', failureReportController.getNearbyFailures);

// Get single failure report
router.get('/:id', failureReportController.getFailureReportById);

// Update failure report
router.put('/:id', protect, failureReportController.updateFailureReport);

// Add comment
router.post('/:id/comments', protect, failureReportController.addComment);

// Mark as helpful
router.post('/:id/helpful', protect, failureReportController.markHelpful);

module.exports = router;
