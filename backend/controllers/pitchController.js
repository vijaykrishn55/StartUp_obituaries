const Pitch = require('../models/Pitch');
const Notification = require('../models/Notification');

// @desc    Submit pitch
// @route   POST /api/pitches
// @access  Private
exports.submitPitch = async (req, res, next) => {
  try {
    const pitchData = {
      ...req.body,
      submittedBy: req.user.id
    };

    const pitch = await Pitch.create(pitchData);
    const populatedPitch = await Pitch.findById(pitch._id)
      .populate('submittedBy', 'name avatar email');

    res.status(201).json({
      success: true,
      data: populatedPitch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pitches
// @route   GET /api/pitches
// @access  Private (investors/admins)
exports.getPitches = async (req, res, next) => {
  try {
    const { status, industry, stage, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (stage) query.stage = stage;

    const skip = (page - 1) * limit;
    const pitches = await Pitch.find(query)
      .populate('submittedBy', 'name avatar email company')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Pitch.countDocuments(query);

    res.json({
      success: true,
      data: pitches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pitch by ID
// @route   GET /api/pitches/:id
// @access  Private
exports.getPitchById = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .populate('submittedBy', 'name avatar email bio company');
    
    if (!pitch) {
      return res.status(404).json({
        success: false,
        error: { code: 'PITCH_NOT_FOUND', message: 'Pitch not found' }
      });
    }

    res.json({
      success: true,
      data: pitch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pitch
// @route   PUT /api/pitches/:id
// @access  Private
exports.updatePitch = async (req, res, next) => {
  try {
    let pitch = await Pitch.findById(req.params.id);
    
    if (!pitch) {
      return res.status(404).json({
        success: false,
        error: { code: 'PITCH_NOT_FOUND', message: 'Pitch not found' }
      });
    }

    if (pitch.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this pitch' }
      });
    }

    pitch = await Pitch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name avatar email');

    res.json({
      success: true,
      data: pitch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pitch status
// @route   PUT /api/pitches/:id/status
// @access  Private (investors only)
exports.updatePitchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const pitch = await Pitch.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name avatar email');

    if (!pitch) {
      return res.status(404).json({
        success: false,
        error: { code: 'PITCH_NOT_FOUND', message: 'Pitch not found' }
      });
    }

    // Create notification for pitch submitter
    await Notification.create({
      recipient: pitch.submittedBy._id,
      type: 'pitch_status',
      actor: req.user.id,
      relatedEntity: { type: 'pitch', id: pitch._id },
      message: `updated your pitch status to ${status}`
    });

    res.json({
      success: true,
      data: pitch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pitch
// @route   DELETE /api/pitches/:id
// @access  Private
exports.deletePitch = async (req, res, next) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    
    if (!pitch) {
      return res.status(404).json({
        success: false,
        error: { code: 'PITCH_NOT_FOUND', message: 'Pitch not found' }
      });
    }

    if (pitch.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    await pitch.deleteOne();

    res.json({
      success: true,
      message: 'Pitch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
