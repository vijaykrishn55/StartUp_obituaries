// Input sanitization utilities for XSS prevention

// Simple HTML escape function
const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
};

// Sanitize HTML content (simple approach)
const sanitizeHTML = (input) => {
  if (!input || typeof input !== 'string') return input;
  // Remove script tags and event handlers
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
};

// Sanitize plain text (remove HTML tags and escape)
const sanitizeText = (input) => {
  if (!input || typeof input !== 'string') return input;
  // Remove HTML tags and escape
  return escapeHtml(input.replace(/<[^>]*>/g, ''));
};

// Basic URL validation and sanitization
const sanitizeURL = (input) => {
  if (!input || typeof input !== 'string') return input;
  const trimmed = input.trim();
  
  // Basic URL validation
  const urlRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-@?^=%&\/~\+#])?$/;
  
  if (urlRegex.test(trimmed)) {
    return trimmed;
  }
  return '';
};

// Sanitize object recursively
const sanitizeObject = (obj, textFields = [], htmlFields = [], urlFields = []) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  // Sanitize text fields
  textFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeText(sanitized[field]);
    }
  });
  
  // Sanitize HTML fields (allow some basic formatting)
  htmlFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeHTML(sanitized[field]);
    }
  });
  
  // Sanitize URL fields
  urlFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeURL(sanitized[field]);
    }
  });
  
  return sanitized;
};

// Sanitization middleware for request body
const sanitizeRequestBody = (textFields = [], htmlFields = [], urlFields = []) => {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body, textFields, htmlFields, urlFields);
    }
    next();
  };
};

module.exports = {
  escapeHtml,
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeObject,
  sanitizeRequestBody
};