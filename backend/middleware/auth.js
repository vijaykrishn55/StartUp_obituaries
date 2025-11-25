const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/helpers');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, 'User not found', 404);
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }
};

// Check if user is owner of resource
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return errorResponse(
        res,
        `User type ${req.user.userType} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

// Check if user owns the resource
exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return errorResponse(res, 'Resource not found', 404);
      }

      // Check if user is the owner (resource has author, postedBy, or user field)
      const ownerField = resource.author || resource.postedBy || resource.user || resource.submittedBy;

      if (ownerField.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Not authorized to access this resource', 403);
      }

      req.resource = resource;
      next();
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  };
};
