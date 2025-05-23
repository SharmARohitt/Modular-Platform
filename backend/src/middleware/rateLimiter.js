// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Basic rate limiter
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
  };
  
  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// Authentication endpoints limiter
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // max 10 requests per hour
  message: 'Too many login attempts, please try again after an hour'
});

// API endpoints limiter
const apiLimiter = createRateLimiter();

// Course creation limiter (admin only)
const courseCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // max 50 course operations per hour
});

module.exports = {
  authLimiter,
  apiLimiter,
  courseCreationLimiter
};
