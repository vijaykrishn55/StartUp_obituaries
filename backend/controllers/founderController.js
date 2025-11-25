const Founder = require('../models/Founder');

// @desc    Get all founders
// @route   GET /api/founders
// @access  Public
exports.getFounders = async (req, res, next) => {
  try {
    const { search, location, skills, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { previousStartup: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) query.skills = { $in: skills.split(',') };

    const skip = (page - 1) * limit;
    const founders = await Founder.find(query)
      .populate('user', 'name avatar email verified')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Founder.countDocuments(query);

    res.json({
      success: true,
      data: founders,
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

// @desc    Get founder by ID
// @route   GET /api/founders/:id
// @access  Public
exports.getFounderById = async (req, res, next) => {
  try {
    const founder = await Founder.findById(req.params.id)
      .populate('user', 'name avatar email bio company verified');
    
    if (!founder) {
      return res.status(404).json({
        success: false,
        error: { code: 'FOUNDER_NOT_FOUND', message: 'Founder not found' }
      });
    }

    res.json({
      success: true,
      data: founder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create founder profile
// @route   POST /api/founders
// @access  Private
exports.createFounderProfile = async (req, res, next) => {
  try {
    // Check if founder profile already exists
    const existingFounder = await Founder.findOne({ user: req.user.id });
    if (existingFounder) {
      return res.status(400).json({
        success: false,
        error: { code: 'PROFILE_EXISTS', message: 'Founder profile already exists' }
      });
    }

    const founderData = {
      ...req.body,
      user: req.user.id,
      name: req.user.name
    };

    const founder = await Founder.create(founderData);
    const populatedFounder = await Founder.findById(founder._id)
      .populate('user', 'name avatar email');

    res.status(201).json({
      success: true,
      data: populatedFounder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update founder profile
// @route   PUT /api/founders/:id
// @access  Private
exports.updateFounderProfile = async (req, res, next) => {
  try {
    let founder = await Founder.findById(req.params.id);
    
    if (!founder) {
      return res.status(404).json({
        success: false,
        error: { code: 'FOUNDER_NOT_FOUND', message: 'Founder not found' }
      });
    }

    if (founder.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this profile' }
      });
    }

    founder = await Founder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar email');

    res.json({
      success: true,
      data: founder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete founder profile
// @route   DELETE /api/founders/:id
// @access  Private
exports.deleteFounderProfile = async (req, res, next) => {
  try {
    const founder = await Founder.findById(req.params.id);
    
    if (!founder) {
      return res.status(404).json({
        success: false,
        error: { code: 'FOUNDER_NOT_FOUND', message: 'Founder not found' }
      });
    }

    if (founder.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    await founder.deleteOne();

    res.json({
      success: true,
      message: 'Founder profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
