const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Get all jobs with filters and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      location,
      isRemote,
      tags,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'active' };

    // Filters
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (isRemote !== undefined) query.isRemote = isRemote === 'true';
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('postedBy', 'name avatar company')
      .sort({ [sort]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name avatar company email website')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job posting
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name avatar company');

    res.status(201).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this job' }
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name avatar company');

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this job' }
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: req.params.id });

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to job
// @route   POST /api/jobs/:id/apply
// @access  Private
exports.applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'JOB_CLOSED', message: 'This job is no longer accepting applications' }
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: req.params.id,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_APPLIED', message: 'You have already applied to this job' }
      });
    }

    const application = await Application.create({
      job: req.params.id,
      applicant: req.user.id,
      ...req.body
    });

    // Update job applicants count
    job.applicants += 1;
    job.applications.push(application._id);
    await job.save();

    // Create notification for job poster
    await Notification.create({
      recipient: job.postedBy,
      type: 'job_application',
      actor: req.user.id,
      relatedEntity: { type: 'job', id: job._id },
      message: 'applied to your job posting'
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a job (recruiter only)
// @route   GET /api/jobs/:id/applications
// @access  Private
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to view these applications' }
      });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('applicant', 'name avatar email company bio')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's job applications
// @route   GET /api/jobs/my-applications
// @access  Private
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name avatar company' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by user
// @route   GET /api/jobs/my-postings
// @access  Private
exports.getMyPostings = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};
