const Joi = require('joi');
const { errorResponse } = require('../utils/helpers');

// Validate request body
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return errorResponse(res, 'Validation error', 400, errors);
    }

    next();
  };
};

// User registration validation
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required().messages({
    'string.pattern.base': 'Name must contain only letters and spaces'
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  userType: Joi.string().valid('founder', 'investor', 'job-seeker', 'mentor', 'other').required()
});

// User login validation
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Post creation validation
exports.postSchema = Joi.object({
  type: Joi.string().valid('postmortem', 'funding', 'job', 'insight', 'question', 'pitch').required(),
  title: Joi.string().min(10).max(200).required(),
  subtitle: Joi.string().max(300).allow(''),
  content: Joi.string().min(50).required(),
  coverImage: Joi.string().uri().allow(''),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  companyName: Joi.string().allow(''),
  fundingAmount: Joi.string().allow(''),
  fundingStage: Joi.string().allow(''),
  investors: Joi.string().allow('')
});

// Job posting validation
exports.jobSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  company: Joi.string().min(2).required(),
  location: Joi.string().required(),
  type: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Co-founder', 'Internship').required(),
  salary: Joi.string().allow(''),
  equity: Joi.string().allow(''),
  description: Joi.string().min(100).required(),
  requirements: Joi.string().min(50).required(),
  tags: Joi.array().items(Joi.string()),
  isRemote: Joi.boolean(),
  companyInfo: Joi.object(),
  benefits: Joi.array().items(Joi.string())
});

// Job application validation
exports.applicationSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(''),
  linkedIn: Joi.string().uri().allow(''),
  portfolio: Joi.string().uri().allow(''),
  coverLetter: Joi.string().min(100).required()
});

// Comment validation
exports.commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required()
});

// Connection request validation
exports.connectionSchema = Joi.object({
  recipient: Joi.string().required(),
  message: Joi.string().max(300).allow('')
});

// Message validation
exports.messageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
});

// Pitch submission validation
exports.pitchSchema = Joi.object({
  companyName: Joi.string().required(),
  founderName: Joi.string().required(),
  email: Joi.string().email().required(),
  website: Joi.string().uri().allow(''),
  industry: Joi.string().valid('fintech', 'healthtech', 'edtech', 'saas', 'ecommerce', 'ai-ml', 'blockchain', 'other').required(),
  stage: Joi.string().valid('idea', 'mvp', 'pre-seed', 'seed', 'series-a', 'series-b').required(),
  fundingGoal: Joi.string().required(),
  pitch: Joi.string().min(100).required(),
  deckUrl: Joi.string().uri().allow('')
});

// Middleware exports for routes
exports.validateRegister = exports.validate(exports.registerSchema);
exports.validateLogin = exports.validate(exports.loginSchema);
exports.validatePost = exports.validate(exports.postSchema);
exports.validateJob = exports.validate(exports.jobSchema);
exports.validateApplication = exports.validate(exports.applicationSchema);
exports.validateComment = exports.validate(exports.commentSchema);
exports.validateConnection = exports.validate(exports.connectionSchema);
exports.validateMessage = exports.validate(exports.messageSchema);
exports.validatePitch = exports.validate(exports.pitchSchema);
