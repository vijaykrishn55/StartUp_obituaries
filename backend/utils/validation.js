const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('is_recruiter')
    .optional()
    .isBoolean()
    .withMessage('is_recruiter must be a boolean'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),
  
  body('github_url')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be valid'),
  
  body('open_to_work')
    .optional()
    .isBoolean()
    .withMessage('open_to_work must be a boolean'),
  
  body('open_to_co_founding')
    .optional()
    .isBoolean()
    .withMessage('open_to_co_founding must be a boolean'),
  
  handleValidationErrors
];

// Startup creation validation
const validateStartupCreation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Startup name is required and must be less than 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('industry')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Industry must be less than 100 characters'),
  
  body('primary_failure_reason')
    .isIn([
      'Ran out of funding',
      'No Product-Market Fit',
      'Poor Unit Economics',
      'Co-founder Conflict',
      'Technical Debt',
      'Got outcompeted',
      'Bad Timing',
      'Legal/Regulatory Issues',
      'Pivot Fatigue',
      'Other'
    ])
    .withMessage('Invalid failure reason'),
  
  body('founded_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Founded year must be a valid year'),
  
  body('died_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Died year must be a valid year'),
  
  body('stage_at_death')
    .optional()
    .isIn(['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'])
    .withMessage('Invalid stage at death'),
  
  body('funding_amount_usd')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Funding amount must be a positive number'),
  
  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content is required and must be less than 1000 characters'),
  
  handleValidationErrors
];

// Team member validation
const validateTeamMember = [
  body('role_title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Role title is required and must be less than 255 characters'),
  
  body('tenure_start_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Start year must be a valid year'),
  
  body('tenure_end_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('End year must be a valid year'),
  
  handleValidationErrors
];

// Connection request validation
const validateConnectionRequest = [
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('connection_id')
    .isInt({ min: 1 })
    .withMessage('Valid connection ID is required'),
  
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateStartupCreation,
  validateComment,
  validateTeamMember,
  validateConnectionRequest,
  validateMessage,
  handleValidationErrors
};
