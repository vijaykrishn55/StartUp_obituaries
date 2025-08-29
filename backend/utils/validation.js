// Simple validation functions without express-validator dependency

// Basic validation helpers
const isEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isLength = (str, min, max) => str && str.length >= min && (!max || str.length <= max);
const isIn = (value, array) => array.includes(value);
const isInt = (value, options = {}) => {
  const num = parseInt(value);
  if (isNaN(num)) return false;
  if (options.min && num < options.min) return false;
  if (options.max && num > options.max) return false;
  return true;
};
const isFloat = (value, options = {}) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (options.min && num < options.min) return false;
  if (options.max && num > options.max) return false;
  return true;
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  next();
};

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const { username, email, password, is_recruiter } = req.body;
  
  if (!isLength(username, 3, 50)) {
    return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }
  
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Must be a valid email address' });
  }
  
  if (!isLength(password, 6)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  if (is_recruiter !== undefined && typeof is_recruiter !== 'boolean') {
    return res.status(400).json({ error: 'is_recruiter must be a boolean' });
  }
  
  next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Must be a valid email address' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  next();
};

// Profile update validation
const validateProfileUpdate = (req, res, next) => {
  const { bio, skills, linkedin_url, github_url, open_to_work, open_to_co_founding } = req.body;
  
  if (bio && bio.length > 1000) {
    return res.status(400).json({ error: 'Bio must be less than 1000 characters' });
  }
  
  if (skills && !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills must be an array' });
  }
  
  if (linkedin_url && !/^https?:\/\/.+/.test(linkedin_url)) {
    return res.status(400).json({ error: 'LinkedIn URL must be valid' });
  }
  
  if (github_url && !/^https?:\/\/.+/.test(github_url)) {
    return res.status(400).json({ error: 'GitHub URL must be valid' });
  }
  
  if (open_to_work !== undefined && typeof open_to_work !== 'boolean') {
    return res.status(400).json({ error: 'open_to_work must be a boolean' });
  }
  
  if (open_to_co_founding !== undefined && typeof open_to_co_founding !== 'boolean') {
    return res.status(400).json({ error: 'open_to_co_founding must be a boolean' });
  }
  
  next();
};

// Startup creation validation
const validateStartupCreation = (req, res, next) => {
  const { name, description, industry, primary_failure_reason, founded_year, died_year, stage_at_death, funding_amount_usd } = req.body;
  
  if (!isLength(name, 1, 255)) {
    return res.status(400).json({ error: 'Startup name is required and must be less than 255 characters' });
  }
  
  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description must be less than 1000 characters' });
  }
  
  if (industry && industry.length > 100) {
    return res.status(400).json({ error: 'Industry must be less than 100 characters' });
  }
  
  const validFailureReasons = [
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
  ];
  
  if (!isIn(primary_failure_reason, validFailureReasons)) {
    return res.status(400).json({ error: 'Invalid failure reason' });
  }
  
  if (founded_year && !isInt(founded_year, { min: 1900, max: new Date().getFullYear() })) {
    return res.status(400).json({ error: 'Founded year must be a valid year' });
  }
  
  if (died_year && !isInt(died_year, { min: 1900, max: new Date().getFullYear() })) {
    return res.status(400).json({ error: 'Died year must be a valid year' });
  }
  
  if (stage_at_death && !isIn(stage_at_death, ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'])) {
    return res.status(400).json({ error: 'Invalid stage at death' });
  }
  
  if (funding_amount_usd && !isFloat(funding_amount_usd, { min: 0 })) {
    return res.status(400).json({ error: 'Funding amount must be a positive number' });
  }
  
  next();
};

// Comment validation
const validateComment = (req, res, next) => {
  const { content } = req.body;
  
  if (!isLength(content, 1, 1000)) {
    return res.status(400).json({ error: 'Comment content is required and must be less than 1000 characters' });
  }
  
  next();
};

// Team member validation
const validateTeamMember = (req, res, next) => {
  const { role_title, tenure_start_year, tenure_end_year } = req.body;
  
  if (!isLength(role_title, 1, 255)) {
    return res.status(400).json({ error: 'Role title is required and must be less than 255 characters' });
  }
  
  if (tenure_start_year && !isInt(tenure_start_year, { min: 1900, max: new Date().getFullYear() })) {
    return res.status(400).json({ error: 'Start year must be a valid year' });
  }
  
  if (tenure_end_year && !isInt(tenure_end_year, { min: 1900, max: new Date().getFullYear() })) {
    return res.status(400).json({ error: 'End year must be a valid year' });
  }
  
  next();
};

// Connection request validation
const validateConnectionRequest = (req, res, next) => {
  const { message } = req.body;
  
  if (message && message.length > 500) {
    return res.status(400).json({ error: 'Message must be less than 500 characters' });
  }
  
  next();
};

// Message validation
const validateMessage = (req, res, next) => {
  const { connection_id, content } = req.body;
  
  if (!isInt(connection_id, { min: 1 })) {
    return res.status(400).json({ error: 'Valid connection ID is required' });
  }
  
  if (!isLength(content, 1, 1000)) {
    return res.status(400).json({ error: 'Message content is required and must be less than 1000 characters' });
  }
  
  next();
};

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
