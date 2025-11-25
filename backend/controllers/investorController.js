const Investor = require('../models/Investor');

// @desc    Get all investors
// @route   GET /api/investors
// @access  Public
exports.getInvestors = async (req, res, next) => {
  try {
    const { search, type, stage, location, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { focus: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (stage) query.stage = { $regex: stage, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    const skip = (page - 1) * limit;
    const investors = await Investor.find(query)
      .populate('user', 'name avatar email verified')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Investor.countDocuments(query);

    res.json({
      success: true,
      data: investors,
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

// @desc    Get investor by ID
// @route   GET /api/investors/:id
// @access  Public
exports.getInvestorById = async (req, res, next) => {
  try {
    const investor = await Investor.findById(req.params.id)
      .populate('user', 'name avatar email bio verified');
    
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVESTOR_NOT_FOUND', message: 'Investor not found' }
      });
    }

    res.json({
      success: true,
      data: investor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create investor profile
// @route   POST /api/investors
// @access  Private
exports.createInvestorProfile = async (req, res, next) => {
  try {
    const existingInvestor = await Investor.findOne({ user: req.user.id });
    if (existingInvestor) {
      return res.status(400).json({
        success: false,
        error: { code: 'PROFILE_EXISTS', message: 'Investor profile already exists' }
      });
    }

    const investorData = {
      ...req.body,
      user: req.user.id,
      name: req.user.name
    };

    const investor = await Investor.create(investorData);
    const populatedInvestor = await Investor.findById(investor._id)
      .populate('user', 'name avatar email');

    res.status(201).json({
      success: true,
      data: populatedInvestor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update investor profile
// @route   PUT /api/investors/:id
// @access  Private
exports.updateInvestorProfile = async (req, res, next) => {
  try {
    let investor = await Investor.findById(req.params.id);
    
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVESTOR_NOT_FOUND', message: 'Investor not found' }
      });
    }

    if (investor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this profile' }
      });
    }

    investor = await Investor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar email');

    res.json({
      success: true,
      data: investor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete investor profile
// @route   DELETE /api/investors/:id
// @access  Private
exports.deleteInvestorProfile = async (req, res, next) => {
  try {
    const investor = await Investor.findById(req.params.id);
    
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVESTOR_NOT_FOUND', message: 'Investor not found' }
      });
    }

    if (investor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    await investor.deleteOne();

    res.json({
      success: true,
      message: 'Investor profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
