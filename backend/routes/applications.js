const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name avatar email company bio')
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name company' }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' }
      });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isRecruiter = application.job.postedBy._id.toString() === req.user.id;

    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter only)
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' }
      });
    }

    // Check if user is the job poster
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    application.status = req.body.status;
    application.notes = req.body.notes || application.notes;
    await application.save();

    // Create notification for applicant
    await Notification.create({
      recipient: application.applicant,
      type: 'job_application',
      actor: req.user.id,
      relatedEntity: { type: 'job', id: application.job._id },
      message: `updated your application status to ${req.body.status}`
    });

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' }
      });
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    await application.deleteOne();

    // Update job applicants count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicants: -1 },
      $pull: { applications: application._id }
    });

    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
