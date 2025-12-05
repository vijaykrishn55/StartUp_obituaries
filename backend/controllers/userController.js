const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');
const upload = require('../utils/uploadService');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    successResponse(res, { user }, 'Profile retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating password through this route
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    successResponse(res, { user }, 'Profile updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Increment profile views
    user.profileViews += 1;
    await user.save();

    successResponse(res, { user }, 'User retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Search users
// @route   GET /api/users
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { search, userType, location, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (userType) {
      query.userType = userType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    successResponse(res, {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    }, 'Users retrieved successfully');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/me/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload an image', 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    successResponse(res, { user }, 'Avatar uploaded successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Add experience
// @route   POST /api/users/me/experience
// @access  Private
exports.addExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.experiences.push(req.body);
    await user.save();

    successResponse(res, { user }, 'Experience added successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update experience
// @route   PUT /api/users/me/experience/:id
// @access  Private
exports.updateExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const experience = user.experiences.id(req.params.id);
    
    if (!experience) {
      return errorResponse(res, 'Experience not found', 404);
    }

    Object.assign(experience, req.body);
    await user.save();

    successResponse(res, { user }, 'Experience updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete experience
// @route   DELETE /api/users/me/experience/:id
// @access  Private
exports.deleteExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.experiences.pull(req.params.id);
    await user.save();

    successResponse(res, { user }, 'Experience deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Add education
// @route   POST /api/users/me/education
// @access  Private
exports.addEducation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.education.push(req.body);
    await user.save();

    successResponse(res, { user }, 'Education added successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete education
// @route   DELETE /api/users/me/education/:id
// @access  Private
exports.deleteEducation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.education.pull(req.params.id);
    await user.save();

    successResponse(res, { user }, 'Education deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Add skill
// @route   POST /api/users/me/skills
// @access  Private
exports.addSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skills.push(req.body);
    await user.save();

    successResponse(res, { user }, 'Skill added successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete skill
// @route   DELETE /api/users/me/skills/:id
// @access  Private
exports.deleteSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skills.pull(req.params.id);
    await user.save();

    successResponse(res, { user }, 'Skill deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Add startup venture
// @route   POST /api/users/me/ventures
// @access  Private
exports.addVenture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.startupJourneys.push(req.body);
    await user.save();

    successResponse(res, { user }, 'Venture added successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete venture
// @route   DELETE /api/users/me/ventures/:id
// @access  Private
exports.deleteVenture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.startupJourneys.pull(req.params.id);
    await user.save();

    successResponse(res, { user }, 'Venture deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
