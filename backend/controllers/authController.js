const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      userType
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    // Return user data and token
    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        verified: user.verified
      },
      token,
      refreshToken
    }, 'User registered successfully', 201);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        verified: user.verified
      },
      token,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    successResponse(res, { user }, 'User retrieved successfully');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Remove refresh token
    req.user.refreshToken = undefined;
    await req.user.save();

    successResponse(res, null, 'Logout successful');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    successResponse(res, { token: newToken }, 'Token refreshed successfully');

  } catch (error) {
    errorResponse(res, 'Invalid refresh token', 401);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Send email
    await sendPasswordResetEmail(user, resetToken);

    successResponse(res, null, 'Password reset email sent');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired token', 400);
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token
    const newToken = generateToken(user._id);

    successResponse(res, { token: newToken }, 'Password reset successful');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    successResponse(res, null, 'Password changed successfully');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
